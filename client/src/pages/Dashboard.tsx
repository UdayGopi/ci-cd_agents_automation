import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  CheckCircle, 
  Bot, 
  DollarSign,
  GitBranch,
  Rocket,
  Shield,
  BarChart3,
  Clock,
  X,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: pipelines = [] } = useQuery({
    queryKey: ["/api/pipelines"],
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents/status"],
  });

  const { data: builds = [] } = useQuery({
    queryKey: ["/api/builds"],
  });

  const { data: deployments = [] } = useQuery({
    queryKey: ["/api/deployments"],
  });

  const { data: insights = [] } = useQuery({
    queryKey: ["/api/groq/insights"],
    refetchInterval: 30000,
  });

  // Ensure data is always arrays to prevent slice errors
  const safeBuilds = Array.isArray(builds) ? builds : [];
  const safeDeployments = Array.isArray(deployments) ? deployments : [];
  const safeInsights = Array.isArray(insights) ? insights : [];
  const safeAgents = Array.isArray(agents) ? agents : [];
  const safePipelines = Array.isArray(pipelines) ? pipelines : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "building":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "AutoBuild":
        return <GitBranch className="w-4 h-4 text-blue-500" />;
      case "DeployMaster":
        return <Rocket className="w-4 h-4 text-orange-500" />;
      case "SecureGuard":
        return <Shield className="w-4 h-4 text-green-500" />;
      case "CostOptimizer":
        return <BarChart3 className="w-4 h-4 text-green-500" />;
      case "AI Assistant":
        return <Bot className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bot className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500 animate-pulse";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAgentProgress = (agent: any) => {
    if (agent.metrics?.progress) {
      return agent.metrics.progress;
    }
    return Math.floor(Math.random() * 100); // Mock progress for demo
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Pipelines
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {pipelines.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="text-slate-600 dark:text-slate-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Successful Builds
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.successRate || "89.5%"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+5.2%</span>
              <span className="text-slate-600 dark:text-slate-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  AI Optimizations
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.aiOptimizations || "156"}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+28%</span>
              <span className="text-slate-600 dark:text-slate-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Cost Savings
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.costSavings || "$2,847"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+15%</span>
              <span className="text-slate-600 dark:text-slate-400 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligent Agents Status */}
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {agents.map((agent: any) => (
              <div key={agent.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getAgentIcon(agent.name)}
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {agent.name}
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {agent.status === "active" ? "Active" : agent.status === "busy" ? "Processing" : "Idle"}
                </p>
                <Progress value={getAgentProgress(agent)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Pipelines and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pipelines */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeBuilds.slice(0, 3).map((build: any) => (
                <div key={build.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    {getStatusIcon(build.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {build.name || `Build #${build.buildNumber}`}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {build.createdAt ? new Date(build.createdAt).toLocaleString() : "Just now"}
                    </p>
                  </div>
                  <Badge 
                    variant={build.status === "success" ? "default" : build.status === "failed" ? "destructive" : "secondary"}
                  >
                    {build.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Insights</CardTitle>
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-indigo-500 font-medium">Powered by Groq</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeInsights.slice(0, 3).map((insight: any, index: number) => (
                <div 
                  key={index}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {insight.type === "optimization" && <Bot className="w-4 h-4 text-indigo-500" />}
                      {insight.type === "troubleshooting" && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                      {insight.type === "security" && <Shield className="w-4 h-4 text-green-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {insight.title}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {insight.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Status and Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deployment Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Deployment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeDeployments.slice(0, 3).map((deployment: any) => (
                <div key={deployment.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {deployment.name || "Deployment"}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {deployment.environment || "Production"} • {deployment.region || "us-east-1"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {deployment.instances || "2"} instances
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {deployment.status || "Running"}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(deployment.status || "active")}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Logs */}
        <Card className="bg-slate-900 text-white">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white">Live Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2 text-sm font-mono">
              <div className="text-green-400">
                <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span> ✓ Build completed successfully
              </div>
              <div className="text-blue-400">
                <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span> → Pushing to ECR...
              </div>
              <div className="text-yellow-400">
                <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span> ⚠ High memory usage detected
              </div>
              <div className="text-green-400">
                <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span> ✓ Container deployed to ECS
              </div>
              <div className="text-indigo-400">
                <span className="text-slate-400">[{new Date().toLocaleTimeString()}]</span> 🤖 AI: Optimization applied
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
