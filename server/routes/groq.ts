import express from "express";
import { groqService } from "../services/groqService";
import { aiAssistant } from "../agents/ai-assistant";
import { storage } from "../storage";

export const groqRoutes = express.Router();

// Chat endpoint
groqRoutes.post("/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const response = await aiAssistant.processMessage(message, userId);
    res.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Failed to process chat message" });
  }
});

// Pipeline analysis endpoint
groqRoutes.post("/analyze-pipeline", async (req, res) => {
  try {
    const { pipelineId } = req.body;
    
    if (!pipelineId) {
      return res.status(400).json({ message: "Pipeline ID is required" });
    }

    const pipeline = await storage.getPipeline(pipelineId);
    if (!pipeline) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    const analysis = await groqService.analyzePipeline(pipeline);
    res.json({ analysis });
  } catch (error) {
    console.error("Pipeline analysis error:", error);
    res.status(500).json({ message: "Failed to analyze pipeline" });
  }
});

// Build optimization endpoint
groqRoutes.post("/optimize-build", async (req, res) => {
  try {
    const { buildId } = req.body;
    
    if (!buildId) {
      return res.status(400).json({ message: "Build ID is required" });
    }

    const build = await storage.getBuild(buildId);
    if (!build) {
      return res.status(404).json({ message: "Build not found" });
    }

    const optimization = await groqService.optimizeBuildConfiguration(build);
    res.json({ optimization });
  } catch (error) {
    console.error("Build optimization error:", error);
    res.status(500).json({ message: "Failed to optimize build" });
  }
});

// Cost analysis endpoint
groqRoutes.get("/cost-analysis", async (req, res) => {
  try {
    const suggestions = await aiAssistant.generateCostOptimizationSuggestions();
    res.json({ suggestions });
  } catch (error) {
    console.error("Cost analysis error:", error);
    res.status(500).json({ message: "Failed to generate cost analysis" });
  }
});

// Pipeline insights endpoint
groqRoutes.get("/insights", async (req, res) => {
  try {
    const insights = await aiAssistant.generatePipelineInsights();
    res.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    res.status(500).json({ message: "Failed to generate insights" });
  }
});

// Troubleshooting endpoint
groqRoutes.post("/troubleshoot", async (req, res) => {
  try {
    const { errorData } = req.body;
    
    if (!errorData) {
      return res.status(400).json({ message: "Error data is required" });
    }

    const solution = await groqService.troubleshootFailure(errorData);
    res.json({ solution });
  } catch (error) {
    console.error("Troubleshooting error:", error);
    res.status(500).json({ message: "Failed to troubleshoot error" });
  }
});
