import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import ProtectedLayout from "@/components/ProtectedLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Pipelines from "@/pages/Pipelines";
import AIInsights from "@/pages/AIInsights";
import Agents from "@/pages/Agents";
import Monitoring from "@/pages/Monitoring";
import Security from "@/pages/Security";
import CostAnalytics from "@/pages/CostAnalytics";
import Teams from "@/pages/Teams";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      
      {/* Protected Routes */}
      <Route path="/">
        <ProtectedLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/pipelines" component={Pipelines} />
            <Route path="/ai-assistant" component={AIInsights} />
            <Route path="/agents" component={Agents} />
            <Route path="/monitoring" component={Monitoring} />
            <Route path="/security" component={Security} />
            <Route path="/cost-analytics" component={CostAnalytics} />
            <Route path="/teams" component={Teams} />
            <Route path="/settings" component={Settings} />
            <Route component={NotFound} />
          </Switch>
        </ProtectedLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
