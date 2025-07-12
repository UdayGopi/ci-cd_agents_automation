import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  Clock, 
  CheckCircle, 
  X, 
  Play, 
  Pause, 
  Settings 
} from "lucide-react";

export default function Pipelines() {
  const { data: pipelines = [] } = useQuery({
    queryKey: ["/api/pipelines"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "running":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "failed":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Pipelines</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your CI/CD pipelines and view their status
          </p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <GitBranch className="w-4 h-4 mr-2" />
          Create Pipeline
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {pipelines.map((pipeline: any) => (
          <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                <Badge className={getStatusColor(pipeline.status)}>
                  {pipeline.status}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <GitBranch className="w-4 h-4 mr-1" />
                {pipeline.repository}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Branch:</span>
                  <span className="font-medium">{pipeline.branch}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Last Run:</span>
                  <span className="font-medium">
                    {pipeline.lastRun ? new Date(pipeline.lastRun).toLocaleString() : "Never"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Success Rate:</span>
                  <span className="font-medium">{pipeline.successRate || "N/A"}</span>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Play className="w-4 h-4 mr-1" />
                    Run
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
