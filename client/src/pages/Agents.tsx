import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  GitBranch, 
  Rocket, 
  Shield, 
  BarChart3, 
  Settings 
} from "lucide-react";

export default function Agents() {
  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents/status"],
  });

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "AutoBuild":
        return <GitBranch className="w-6 h-6 text-blue-500" />;
      case "DeployMaster":
        return <Rocket className="w-6 h-6 text-orange-500" />;
      case "SecureGuard":
        return <Shield className="w-6 h-6 text-green-500" />;
      case "CostOptimizer":
        return <BarChart3 className="w-6 h-6 text-green-500" />;
      case "AI Assistant":
        return <Bot className="w-6 h-6 text-indigo-500" />;
      default:
        return <Bot className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "busy":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getAgentProgress = (agent: any) => {
    if (agent.metrics?.progress) {
      return agent.metrics.progress;
    }
    return Math.floor(Math.random() * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Intelligent Agents</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Monitor and manage your AI-powered automation agents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent: any) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getAgentIcon(agent.name)}
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Progress:</span>
                    <span className="font-medium">{getAgentProgress(agent)}%</span>
                  </div>
                  <Progress value={getAgentProgress(agent)} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Last Active:</span>
                    <span className="font-medium">
                      {agent.lastHeartbeat 
                        ? new Date(agent.lastHeartbeat).toLocaleString()
                        : "Never"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Tasks Completed:</span>
                    <span className="font-medium">{agent.metrics?.tasksCompleted || 0}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Current Task:
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {agent.currentTask || "Idle"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
