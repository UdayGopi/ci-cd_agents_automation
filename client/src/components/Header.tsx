import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Bot } from "lucide-react";

export default function Header() {
  const [showAIChat, setShowAIChat] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Monitor your CI/CD pipelines and intelligent agents
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Real-time Status */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">System Online</span>
          </div>
          
          {/* AI Assistant Toggle */}
          <Button
            onClick={() => setShowAIChat(!showAIChat)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
