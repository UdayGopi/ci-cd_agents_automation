import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp, Calculator } from "lucide-react";

export default function CostAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Cost Analytics</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Monitor and optimize your infrastructure costs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Monthly Cost</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">$3,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Savings</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">$847</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Growth</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">+8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Forecasted</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">$3,895</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
