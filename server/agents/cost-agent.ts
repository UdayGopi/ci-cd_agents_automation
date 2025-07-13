import { storage } from "../storage";
import { groqService } from "../services/groqService";

class CostAgent {
  async analyzeCosts() {
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
        return acc + (deploy.resourceUsage?.cpu || 0) * 0.0004 +
               (deploy.resourceUsage?.memory || 0) * 0.0001;
      }, 0);

      // Get AI recommendations
      const recommendations = await groqService.generateCostAnalysis({
        stats,
        deployments: deployments.slice(0, 10),
        context: "Cost optimization analysis"
      });

      return {
        totalCost: buildCosts + deploymentCosts,
        buildCosts,
        deploymentCosts,
        recommendations,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Cost analysis error:", error);
      return null;
    }
  }

  async getResourceUtilization() {
    try {
      const stats = await storage.getStats();
      return {
        cpu: stats.averageCpuUsage,
        memory: stats.averageMemoryUsage,
        storage: stats.storageUsage,
        network: stats.networkUsage,
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
        return acc + (data.projectedCost - data.actualCost);
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