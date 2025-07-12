import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Database, Clock } from "lucide-react";

export default function Monitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Monitoring</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          System health and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">System Health</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Services</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12/12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Database</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Uptime</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">99.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
