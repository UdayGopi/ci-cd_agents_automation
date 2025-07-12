import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  GitBranch, 
  Bot, 
  Users, 
  Shield, 
  DollarSign, 
  Settings,
  Activity,
  UserCheck
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Pipelines", href: "/pipelines", icon: GitBranch },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot, badge: "NEW" },
  { name: "Agents", href: "/agents", icon: UserCheck },
  { name: "Monitoring", href: "/monitoring", icon: Activity },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Cost Analytics", href: "/cost-analytics", icon: DollarSign },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">PipelineForge</h1>
            <p className="text-xs text-slate-400">CI/CD Automation</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-500 text-white"
                    : "hover:bg-slate-800 text-slate-300 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-indigo-500 px-2 py-1 text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-slate-400">john@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
