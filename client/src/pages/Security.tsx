import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Lock, Key } from "lucide-react";

export default function Security() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Security</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Security dashboard and vulnerability management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Security Score</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">95/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Vulnerabilities</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Compliance</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Secrets</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Secure</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
