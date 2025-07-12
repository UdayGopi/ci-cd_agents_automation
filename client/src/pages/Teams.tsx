import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Crown, Shield } from "lucide-react";

export default function Teams() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Teams</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage team members and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Team Members</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Admins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Developers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
