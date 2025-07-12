import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Lightbulb, 
  AlertTriangle, 
  Shield, 
  DollarSign,
  TrendingUp,
  Zap,
  Brain,
  Sparkles
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIInsight {
  type: "optimization" | "troubleshooting" | "security" | "cost-optimization";
  title: string;
  content: string;
  severity: "low" | "medium" | "high";
  timestamp: Date;
  pipelineId?: number;
  estimatedSavings?: string;
}

export default function AIInsights() {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["/api/groq/insights"],
    refetchInterval: 30000,
  });

  const { data: costAnalysis = [] } = useQuery({
    queryKey: ["/api/groq/cost-analysis"],
    refetchInterval: 60000,
  });

  // Ensure data is always arrays to prevent filter/slice errors
  const safeInsights = Array.isArray(insights) ? insights : [];
  const safeCostAnalysis = Array.isArray(costAnalysis) ? costAnalysis : [];

  const analyzePipelineMutation = useMutation({
    mutationFn: async (pipelineId: number) => {
      const response = await apiRequest("POST", "/api/groq/analyze-pipeline", { pipelineId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groq/insights"] });
    },
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case "troubleshooting":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "security":
        return <Shield className="w-5 h-5 text-green-500" />;
      case "cost-optimization":
        return <DollarSign className="w-5 h-5 text-purple-500" />;
      default:
        return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "optimization":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "troubleshooting":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "security":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cost-optimization":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const optimizationInsights = safeInsights.filter((insight: AIInsight) => insight.type === "optimization");
  const troubleshootingInsights = safeInsights.filter((insight: AIInsight) => insight.type === "troubleshooting");
  const securityInsights = safeInsights.filter((insight: AIInsight) => insight.type === "security");
  const costInsights = [...safeInsights.filter((insight: AIInsight) => insight.type === "cost-optimization"), ...safeCostAnalysis];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">AI Insights</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Advanced AI analytics for continuous improvement and automated optimization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-indigo-500" />
          <span className="text-sm text-indigo-500 font-medium">Smart AI</span>
        </div>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Insights</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {safeInsights.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Optimizations</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {optimizationInsights.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Security</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {securityInsights.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cost Savings</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  $12.4K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Insights</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {safeInsights.map((insight: AIInsight, index: number) => (
                      <div 
                        key={index}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => setSelectedInsight(insight)}
                      >
                        <div className="flex items-start space-x-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getTypeColor(insight.type)}>
                                {insight.type.replace("-", " ")}
                              </Badge>
                              <Badge variant="outline" className={getSeverityColor(insight.severity)}>
                                {insight.severity}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {insight.content}
                            </p>
                            {insight.estimatedSavings && (
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                Estimated savings: {insight.estimatedSavings}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Insight Detail */}
            <Card>
              <CardHeader>
                <CardTitle>Insight Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedInsight ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getInsightIcon(selectedInsight.type)}
                      <Badge className={getTypeColor(selectedInsight.type)}>
                        {selectedInsight.type.replace("-", " ")}
                      </Badge>
                      <Badge variant="outline" className={getSeverityColor(selectedInsight.severity)}>
                        {selectedInsight.severity}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {selectedInsight.title}
                    </h3>
                    
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-slate-600 dark:text-slate-400">
                        {selectedInsight.content}
                      </p>
                    </div>

                    {selectedInsight.estimatedSavings && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Estimated Savings: {selectedInsight.estimatedSavings}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                        Apply Suggestion
                      </Button>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      Select an insight to view details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <span>Optimization Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationInsights.map((insight: AIInsight, index: number) => (
                  <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {insight.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span>Troubleshooting Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {troubleshootingInsights.map((insight: AIInsight, index: number) => (
                  <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {insight.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Security Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityInsights.map((insight: AIInsight, index: number) => (
                  <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {insight.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
                <span>Cost Optimization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costInsights.map((insight: any, index: number) => (
                  <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <DollarSign className="w-5 h-5 text-purple-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {insight.content}
                        </p>
                        {insight.estimatedSavings && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            Estimated savings: {insight.estimatedSavings}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
