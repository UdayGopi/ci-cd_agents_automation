import { apiRequest } from "./queryClient";

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    apiRequest("POST", "/api/auth/login", credentials),
  
  register: (userData: { username: string; password: string }) =>
    apiRequest("POST", "/api/auth/register", userData),

  logout: () => apiRequest("POST", "/api/auth/logout"),

  // Pipelines
  getPipelines: () => apiRequest("GET", "/api/pipelines"),
  createPipeline: (pipeline: any) => apiRequest("POST", "/api/pipelines", pipeline),
  getPipeline: (id: number) => apiRequest("GET", `/api/pipelines/${id}`),

  // Agents
  getAgents: () => apiRequest("GET", "/api/agents/status"),

  // Builds
  getBuilds: () => apiRequest("GET", "/api/builds"),
  getBuild: (id: number) => apiRequest("GET", `/api/builds/${id}`),

  // Deployments
  getDeployments: () => apiRequest("GET", "/api/deployments"),

  // Stats
  getStats: () => apiRequest("GET", "/api/stats"),

  // Groq AI
  chat: (message: string, userId?: string) =>
    apiRequest("POST", "/api/groq/chat", { message, userId }),
  
  analyzePipeline: (pipelineId: number) =>
    apiRequest("POST", "/api/groq/analyze-pipeline", { pipelineId }),
  
  optimizeBuild: (buildId: number) =>
    apiRequest("POST", "/api/groq/optimize-build", { buildId }),
  
  getInsights: () => apiRequest("GET", "/api/groq/insights"),
  
  getCostAnalysis: () => apiRequest("GET", "/api/groq/cost-analysis"),
  
  troubleshoot: (errorData: any) =>
    apiRequest("POST", "/api/groq/troubleshoot", { errorData }),
};
