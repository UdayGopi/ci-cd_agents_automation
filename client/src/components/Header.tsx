import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Bot, Plus, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useLocation } from "wouter";

export default function Header() {
  const [showAIChat, setShowAIChat] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  const handleCreateProject = () => {
    setProjects([...projects, projectName]);
    setProjectName("");
    setShowCreateProjectDialog(false);
    // Here you would typically close the dialog and maybe show a toast notification
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setLocation("/auth");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <>
      <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects:</h3>
          {projects.length > 0 ? (
            projects.map((p, index) => (
              <Button key={index} variant="outline" onClick={() => alert(p)}>
                {p}
              </Button>
            ))
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">No projects created yet.</p>
          )}
        </div>
      </div>
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Dashboard
            </h2>
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
            
            <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Enter a name for your new project. Click create when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Project"
                      className="col-span-3"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateProject}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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

            {/* Logout Button */}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
