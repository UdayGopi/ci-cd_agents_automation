import Groq from "groq-sdk";

class GroqService {
  private client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    
    this.client = new Groq({ apiKey });
  }

  async generateChatResponse(messages: Array<{ role: string; content: string }>) {
    try {
      const completion = await this.client.chat.completions.create({
        messages: messages as any,
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stop: null,
        stream: false,
      });

      return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Groq API error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async analyzePipeline(pipelineData: any) {
    const prompt = `Analyze this CI/CD pipeline and provide optimization suggestions:
    
Pipeline Data: ${JSON.stringify(pipelineData, null, 2)}

Please provide:
1. Performance optimization recommendations
2. Cost reduction suggestions
3. Security improvements
4. Best practices compliance
5. Potential issues and solutions

Format your response as actionable recommendations.`;

    const messages = [
      { role: "system", content: "You are a DevOps expert specialized in CI/CD pipeline optimization. Provide practical, actionable advice." },
      { role: "user", content: prompt }
    ];

    return await this.generateChatResponse(messages);
  }

  async optimizeBuildConfiguration(buildConfig: any) {
    const prompt = `Optimize this build configuration for better performance and cost efficiency:
    
Build Configuration: ${JSON.stringify(buildConfig, null, 2)}

Focus on:
1. Build speed optimization
2. Resource utilization
3. Docker layer caching
4. Dependency management
5. Build environment optimization

Provide specific configuration changes and explain the benefits.`;

    const messages = [
      { role: "system", content: "You are a build optimization specialist. Provide detailed technical recommendations." },
      { role: "user", content: prompt }
    ];

    return await this.generateChatResponse(messages);
  }

  async generateCostAnalysis(costData: any) {
    const prompt = `Analyze these AWS costs and provide cost optimization strategies:
    
Cost Data: ${JSON.stringify(costData, null, 2)}

Provide:
1. Cost breakdown analysis
2. Highest cost drivers
3. Optimization opportunities
4. Resource rightsizing recommendations
5. Estimated savings potential

Include specific actions to reduce costs.`;

    const messages = [
      { role: "system", content: "You are an AWS cost optimization expert. Provide detailed cost analysis and actionable recommendations." },
      { role: "user", content: prompt }
    ];

    return await this.generateChatResponse(messages);
  }

  async troubleshootFailure(errorData: any) {
    const prompt = `Troubleshoot this CI/CD pipeline failure:
    
Error Data: ${JSON.stringify(errorData, null, 2)}

Provide:
1. Root cause analysis
2. Specific fix recommendations
3. Prevention strategies
4. Related documentation or resources
5. Step-by-step resolution guide

Make the response practical and actionable.`;

    const messages = [
      { role: "system", content: "You are a DevOps troubleshooting expert. Provide clear, step-by-step solutions." },
      { role: "user", content: prompt }
    ];

    return await this.generateChatResponse(messages);
  }
}

export const groqService = new GroqService();
