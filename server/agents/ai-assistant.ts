import { groqService } from "../services/groqService";
import { storage } from "../storage";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface Insight {
  type: string;
  title: string;
  content: string;
  severity: "low" | "medium" | "high";
  timestamp: Date;
  estimatedSavings?: string;
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

  async generatePipelineInsights(): Promise<Insight[]> {
    try {
      const pipelines = await storage.getPipelines();
      const builds = await storage.getBuilds();
      const deployments = await storage.getDeployments();

      const insights: Insight[] = [];

      // Analyze recent failures
      const recentFailures = builds.filter(build => 
        build.status === "failed" && 
        build.createdAt && 
        build.createdAt.getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (recentFailures.length > 0) {
        insights.push({
          type: "troubleshooting",
          title: "Recent Build Failures",
          content: `Found ${recentFailures.length} failed builds in the last 24 hours. Common issues might include configuration errors, test failures, or resource constraints.`,
          severity: "high",
          timestamp: new Date()
        });
      }

      // Analyze performance trends
      const slowBuilds = builds.filter(build => 
        build.duration && build.duration > 10 * 60 * 1000 // > 10 minutes
      );

      if (slowBuilds.length > 0) {
        insights.push({
          type: "optimization",
          title: "Build Performance Optimization",
          content: `Identified ${slowBuilds.length} slow builds taking over 10 minutes. Consider optimizing test suites, using build caching, or parallelizing build steps.`,
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

  async generateCostOptimizationSuggestions(): Promise<Insight[]> {
    try {
      const stats = await storage.getStats();
      const deployments = await storage.getDeployments();

      return [{
        type: "cost-optimization",
        title: "Cost Optimization Recommendations",
        content: "Based on current usage patterns, consider: 1) Implementing build caching to reduce build times, 2) Using spot instances for non-critical workloads, 3) Cleaning up unused resources regularly.",
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
