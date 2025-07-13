import { storage } from "../storage";
import { groqService } from "../services/groqService";
import { executePipeline } from "../pipeline-executor";

interface BuildConfig {
  id: string;
  repository: string;
  branch: string;
  buildCommand: string;
  testCommand: string;
  environment: string;
}

class AutoBuildAgent {
  private activeBuilds: Map<string, BuildConfig> = new Map();

  async startAutoBuild(config: BuildConfig) {
    try {
      // Store build config
      this.activeBuilds.set(config.id, config);

      // Create pipeline execution
      const execution = await storage.createPipelineExecution({
        pipelineId: config.id,
        status: 'pending',
        branch: config.branch,
        environment: config.environment
      });

      // Start pipeline execution
      await executePipeline(execution.id);

      return execution.id;
    } catch (error) {
      console.error('Auto build error:', error);
      throw error;
    }
  }

  async getBuildStatus(buildId: string) {
    try {
      const execution = await storage.getPipelineExecution(buildId);
      return {
        status: execution.status,
        logs: execution.logs,
        startedAt: execution.startedAt,
        endedAt: execution.endedAt
      };
    } catch (error) {
      console.error('Get build status error:', error);
      throw error;
    }
  }

  async analyzeBuildPerformance(buildId: string) {
    try {
      const execution = await storage.getPipelineExecution(buildId);
      const builds = await storage.getBuilds();

      // Get AI recommendations for build optimization
      const analysis = await groqService.optimizeBuildConfiguration({
        currentBuild: execution,
        historicalBuilds: builds.slice(0, 5),
        context: "Build performance optimization"
      });

      return {
        duration: execution.endedAt ? 
          (new Date(execution.endedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000 : 
          null,
        status: execution.status,
        recommendations: analysis
      };
    } catch (error) {
      console.error('Build analysis error:', error);
      throw error;
    }
  }

  async getActiveBuildConfigs() {
    return Array.from(this.activeBuilds.values());
  }

  async clearBuildConfig(buildId: string) {
    this.activeBuilds.delete(buildId);
  }
}

export const autoBuildAgent = new AutoBuildAgent(); 