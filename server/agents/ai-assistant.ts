import { groqService } from "../services/groqService";
import { storage } from "../storage";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

class AIAssistant {
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  async processMessage(message: string, userId?: string): Promise<string> {
    const sessionId = userId || "anonymous";
    
    // Get or create conversation history
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, [
        {
          role: "system",
          content: "You are an AI assistant for PipelineForge, a CI/CD automation platform. Help users with pipeline optimization, troubleshooting, cost analysis, and DevOps best practices. Be concise, practical, and actionable in your responses.",
          timestamp: new Date()
        }
      ]);
    }

    const history = this.conversationHistory.get(sessionId)!;
    
    // Add user message to history
    history.push({
      role: "user",
      content: message,
      timestamp: new Date()
    });

    try {
      // Generate response using Groq
      const response = await groqService.generateChatResponse(
        history.map(msg => ({ role: msg.role, content: msg.content }))
      );

      // Add assistant response to history
      history.push({
        role: "assistant",
        content: response,
        timestamp: new Date()
      });

      // Keep only last 10 messages to manage memory
      if (history.length > 10) {
        history.splice(1, history.length - 10); // Keep system message
      }

      return response;
    } catch (error) {
      console.error("AI Assistant error:", error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  async generatePipelineInsights(): Promise<any[]> {
    try {
      const pipelines = await storage.getPipelines();
      const builds = await storage.getBuilds();
      const deployments = await storage.getDeployments();

      const insights = [];

      // Analyze recent failures
      const recentFailures = builds.filter(build => 
        build.status === "failed" && 
        new Date(build.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (recentFailures.length > 0) {
        const analysis = await groqService.troubleshootFailure({
          failures: recentFailures,
          context: "Recent build failures in the last 24 hours"
        });

        insights.push({
          type: "troubleshooting",
          title: "Recent Build Failures",
          content: analysis,
          severity: "high",
          timestamp: new Date()
        });
      }

      // Analyze performance trends
      const slowBuilds = builds.filter(build => 
        build.duration && build.duration > 10 * 60 * 1000 // > 10 minutes
      );

      if (slowBuilds.length > 0) {
        const optimization = await groqService.optimizeBuildConfiguration({
          slowBuilds: slowBuilds.slice(0, 5),
          context: "Performance optimization for slow builds"
        });

        insights.push({
          type: "optimization",
          title: "Build Performance Optimization",
          content: optimization,
          severity: "medium",
          timestamp: new Date()
        });
      }

      return insights;
    } catch (error) {
      console.error("Error generating pipeline insights:", error);
      return [];
    }
  }

  async generateCostOptimizationSuggestions(): Promise<any[]> {
    try {
      const stats = await storage.getStats();
      const deployments = await storage.getDeployments();

      const costAnalysis = await groqService.generateCostAnalysis({
        stats,
        deployments: deployments.slice(0, 10),
        context: "Cost optimization analysis for current infrastructure"
      });

      return [{
        type: "cost-optimization",
        title: "Cost Optimization Recommendations",
        content: costAnalysis,
        severity: "medium",
        timestamp: new Date(),
        estimatedSavings: "$500-2000/month"
      }];
    } catch (error) {
      console.error("Error generating cost optimization suggestions:", error);
      return [];
    }
  }

  clearConversationHistory(userId: string) {
    this.conversationHistory.delete(userId);
  }
}

export const aiAssistant = new AIAssistant();
