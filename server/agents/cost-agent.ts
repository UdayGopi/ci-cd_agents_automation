import { storage } from "../storage";
import { groqService } from "../services/groqService";

interface ResourceUsage {
  cpu: number;
  memory: number;
}

interface CostAnalysis {
  totalCost: number;
  buildCosts: number;
  deploymentCosts: number;
  recommendations: string[];
  timestamp: Date;
}

interface ResourceUtilization {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  timestamp: Date;
}

class CostAgent {
  async analyzeCosts(): Promise<CostAnalysis | null> {
    try {
      const builds = await storage.getBuilds();
      const deployments = await storage.getDeployments();
      const stats = await storage.getStats();

      // Analyze build costs
      const buildCosts = builds.reduce((acc, build) => {
        return acc + (build.duration || 0) * 0.0002; // Example cost calculation
      }, 0);

      // Analyze deployment costs
      const deploymentCosts = deployments.reduce((acc, deploy) => {
        const config = deploy.configuration as { resources?: ResourceUsage } | null;
        return acc + (config?.resources?.cpu || 0) * 0.0004 +
               (config?.resources?.memory || 0) * 0.0001;
      }, 0);

      return {
        totalCost: buildCosts + deploymentCosts,
        buildCosts,
        deploymentCosts,
        recommendations: [],
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Cost analysis error:", error);
      return null;
    }
  }

  async getResourceUtilization(): Promise<ResourceUtilization | null> {
    try {
      const stats = await storage.getStats();
      return {
        cpu: stats.averageCpuUsage || 0,
        memory: stats.averageMemoryUsage || 0,
        storage: stats.storageUsage || 0,
        network: stats.networkUsage || 0,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Resource utilization error:", error);
      return null;
    }
  }

  async generateSavingsReport() {
    try {
      const currentCosts = await this.analyzeCosts();
      const historicalData = await storage.getHistoricalCosts();
      
      const savings = historicalData.reduce((acc, data) => {
        // Assuming 20% higher projected costs for demonstration
        const projectedCost = data.cost * 1.2;
        return acc + (projectedCost - data.cost);
      }, 0);

      return {
        totalSavings: savings,
        recommendations: currentCosts?.recommendations || [],
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Savings report error:", error);
      return null;
    }
  }
}

export const costAgent = new CostAgent(); 