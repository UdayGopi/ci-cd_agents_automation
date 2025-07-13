import { db } from './db/client';
import { pipelineExecutions, pipelines } from './db/schema';
import { eq } from 'drizzle-orm';
import { spawn, type ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const sleep = promisify(setTimeout);

interface RunningPipeline {
  process: ChildProcess;
  cleanup: () => Promise<void>;
}

// Map to track running pipeline processes
const runningPipelines = new Map<string, RunningPipeline>();

export async function executePipeline(executionId: string) {
  let logs = '';
  try {
    // Validate environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Create temporary workspace
    const workDir = path.join(process.cwd(), 'tmp', executionId);
    await fs.mkdir(workDir, { recursive: true });

    // Get pipeline execution details
    const execution = await db.query.pipelineExecutions.findFirst({
      where: eq(pipelineExecutions.id, executionId),
      with: {
        pipeline: {
          columns: {
            id: true,
            name: true,
            repository: true,
            configuration: true
          }
        }
      }
    });

    if (!execution || !execution.pipeline) {
      throw new Error('Pipeline execution not found');
    }

    // Update status to running
    await db.update(pipelineExecutions)
      .set({ status: 'running' })
      .where(eq(pipelineExecutions.id, executionId));

    // Clone repository
    const cloneProcess = spawn('git', ['clone', execution.pipeline.repository, '.'], {
      cwd: workDir
    });

    cloneProcess.stdout.on('data', (data) => {
      logs += data.toString();
      updateLogs(executionId, logs).catch(console.error);
    });

    cloneProcess.stderr.on('data', (data) => {
      logs += data.toString();
      updateLogs(executionId, logs).catch(console.error);
    });

    // Store process for potential cancellation
    runningPipelines.set(executionId, {
      process: cloneProcess,
      cleanup: async () => {
        await fs.rm(workDir, { recursive: true, force: true });
      }
    });

    // Wait for clone to complete
    await new Promise<void>((resolve, reject) => {
      cloneProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Git clone failed with code ${code}`));
      });
    });

    // Checkout specified branch
    const checkoutProcess = spawn('git', ['checkout', execution.branch || 'main'], {
      cwd: workDir
    });

    checkoutProcess.stdout.on('data', (data) => {
      logs += data.toString();
      updateLogs(executionId, logs).catch(console.error);
    });

    checkoutProcess.stderr.on('data', (data) => {
      logs += data.toString();
      updateLogs(executionId, logs).catch(console.error);
    });

    await new Promise<void>((resolve, reject) => {
      checkoutProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Git checkout failed with code ${code}`));
      });
    });

    // Run build process
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: workDir
    });

    buildProcess.stdout.on('data', (data) => {
      logs += data.toString();
      updateLogs(executionId, logs).catch(console.error);
    });

    buildProcess.stderr.on('data', (data) => {
      logs += data.toString();
      updateLogs(executionId, logs).catch(console.error);
    });

    // Update running process
    runningPipelines.set(executionId, {
      process: buildProcess,
      cleanup: async () => {
        await fs.rm(workDir, { recursive: true, force: true });
      }
    });

    await new Promise<void>((resolve, reject) => {
      buildProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build failed with code ${code}`));
      });
    });

    // Run tests
    const testProcess = spawn('npm', ['test'], {
      cwd: workDir
    });

    testProcess.stdout.on('data', (data) => {
      logs += data.toString();
      updateLogs(executionId, logs).catch(console.error);
    });

    testProcess.stderr.on('data', (data) => {
      logs += data.toString();
      updateLogs(executionId, logs).catch(console.error);
    });

    // Update running process
    runningPipelines.set(executionId, {
      process: testProcess,
      cleanup: async () => {
        await fs.rm(workDir, { recursive: true, force: true });
      }
    });

    await new Promise<void>((resolve, reject) => {
      testProcess.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Tests failed with code ${code}`));
      });
    });

    // Deploy based on environment
    if (execution.environment === 'production') {
      // Run production deployment
      const deployProcess = spawn('npm', ['run', 'deploy:prod'], {
        cwd: workDir
      });

      deployProcess.stdout.on('data', (data) => {
        logs += data.toString();
        updateLogs(executionId, logs).catch(console.error);
      });

      deployProcess.stderr.on('data', (data) => {
        logs += data.toString();
        updateLogs(executionId, logs).catch(console.error);
      });

      // Update running process
      runningPipelines.set(executionId, {
        process: deployProcess,
        cleanup: async () => {
          await fs.rm(workDir, { recursive: true, force: true });
        }
      });

      await new Promise<void>((resolve, reject) => {
        deployProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Deployment failed with code ${code}`));
        });
      });
    }

    // Update status to completed
    await db.update(pipelineExecutions)
      .set({ 
        status: 'completed',
        endedAt: new Date()
      })
      .where(eq(pipelineExecutions.id, executionId));

    // Cleanup
    await fs.rm(workDir, { recursive: true, force: true });
    runningPipelines.delete(executionId);

  } catch (error) {
    console.error('Pipeline execution error:', error);

    // Update status to failed
    await db.update(pipelineExecutions)
      .set({ 
        status: 'failed',
        endedAt: new Date(),
        logs: logs + '\n' + (error instanceof Error ? error.message : String(error))
      })
      .where(eq(pipelineExecutions.id, executionId));

    // Cleanup
    const running = runningPipelines.get(executionId);
    if (running) {
      await running.cleanup();
      runningPipelines.delete(executionId);
    }
  }
}

export async function cancelPipelineExecution(executionId: string) {
  try {
    const running = runningPipelines.get(executionId);
    if (running) {
      // Kill process and wait for it to exit
      running.process.kill();
      await new Promise<void>((resolve) => {
        running.process.on('exit', () => resolve());
        // Timeout after 5 seconds
        setTimeout(() => resolve(), 5000);
      });
      
      await running.cleanup();
      runningPipelines.delete(executionId);
      
      // Update execution status
      await db.update(pipelineExecutions)
        .set({ 
          status: 'cancelled',
          endedAt: new Date()
        })
        .where(eq(pipelineExecutions.id, executionId));
    }
  } catch (error) {
    console.error('Error cancelling pipeline:', error);
    throw error;
  }
}

async function updateLogs(executionId: string, logs: string) {
  try {
    await db.update(pipelineExecutions)
      .set({ logs })
      .where(eq(pipelineExecutions.id, executionId));
  } catch (error) {
    console.error('Error updating logs:', error);
  }
} 