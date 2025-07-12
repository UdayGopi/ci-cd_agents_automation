import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, X, Send, Lightbulb, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIInsight {
  type: "optimization" | "troubleshooting" | "security" | "cost-optimization";
  title: string;
  content: string;
  severity: "low" | "medium" | "high";
  timestamp: Date;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you optimize your pipelines, troubleshoot issues, and provide insights. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch AI insights
  const { data: insights = [] } = useQuery({
    queryKey: ["/api/groq/insights"],
    enabled: isOpen,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/groq/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    chatMutation.mutate(inputMessage);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case "troubleshooting":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "security":
        return <Shield className="w-4 h-4 text-green-500" />;
      case "cost-optimization":
        return <Lightbulb className="w-4 h-4 text-purple-500" />;
      default:
        return <Bot className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg"
        size="lg"
      >
        <Bot className="w-5 h-5 mr-2" />
        AI Assistant
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700">
      <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700 bg-indigo-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Bot className="w-5 h-5" />
            <span>AI Assistant</span>
          </CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-indigo-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-full">
        {/* AI Insights Panel */}
        {insights.length > 0 && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
              Latest AI Insights
            </h4>
            <div className="space-y-2">
              {insights.slice(0, 2).map((insight: AIInsight, index: number) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 rounded-lg border text-xs",
                    getSeverityColor(insight.severity)
                  )}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {getInsightIcon(insight.type)}
                    <span className="font-medium">{insight.title}</span>
                  </div>
                  <p className="text-xs opacity-80 line-clamp-2">{insight.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex space-x-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg text-sm",
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  )}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex space-x-2">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Form */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 text-sm"
              disabled={chatMutation.isPending}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputMessage.trim() || chatMutation.isPending}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
