import { storage } from "../storage";
import { groqService } from "../services/groqService";
import { executePipeline } from "../pipeline-executor";
import { type InsertBuild } from "@shared/schema";

interface BuildConfig {
  pipelineId: number;
  repository: string;
  branch: string;
  buildCommand: string;
  testCommand: string;
  environment: string;
}

interface BuildStatus {
  status: string;
  logs?: string;
  startTime?: Date;
  endTime?: Date;
}

interface BuildPerformance {
  duration: number | null;
  status: string;
  recommendations: string[];
}

class AutoBuildAgent {
  private activeBuilds: Map<number, BuildConfig> = new Map();

  async startAutoBuild(config: BuildConfig): Promise<number> {
    try {
      // Store build config
      this.activeBuilds.set(config.pipelineId, config);

      // Create build record
      const build = await storage.createBuild({
        pipelineId: config.pipelineId,
        status: 'pending',
        buildNumber: 1, // You might want to implement auto-incrementing build numbers
        startTime: new Date(),
        logs: '',
        duration: null
      });

      // Start pipeline execution
      await executePipeline(build.id.toString());

      return build.id;
    } catch (error) {
      console.error('Auto build error:', error);
      throw error;
    }
  }

  async getBuildStatus(buildId: number): Promise<BuildStatus> {
    try {
      const build = await storage.getBuild(buildId);
      if (!build) throw new Error('Build not found');

      return {
        status: build.status,
        logs: build.logs,
        startTime: build.startTime || undefined,
        endTime: build.endTime || undefined
      };
    } catch (error) {
      console.error('Get build status error:', error);
      throw error;
    }
  }

  async analyzeBuildPerformance(buildId: number): Promise<BuildPerformance> {
    try {
      const build = await storage.getBuild(buildId);
      if (!build) throw new Error('Build not found');

      return {
        duration: build.duration,
        status: build.status,
        recommendations: [
          "Consider using build caching to improve performance",
          "Optimize test suite execution",
          "Use parallel job execution where possible"
        ]
      };
    } catch (error) {
      console.error('Build analysis error:', error);
      throw error;
    }
  }

  async getActiveBuildConfigs(): Promise<BuildConfig[]> {
    return Array.from(this.activeBuilds.values());
  }

  async clearBuildConfig(buildId: number): Promise<void> {
    this.activeBuilds.delete(buildId);
  }
}

export const autoBuildAgent = new AutoBuildAgent(); 