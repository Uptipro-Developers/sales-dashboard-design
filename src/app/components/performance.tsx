"use client";

import { useEffect, useState } from "react";
import { 
  Target, 
  Users, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Award,
  TrendingUp
} from "lucide-react";
import { NairaSign } from "@/app/components/NairaSign";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useUser } from "../contexts/user-context";
import { cn } from "./ui/utils";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { reportsApi } from "../utils/api-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { INVESTMENT_PLATFORMS } from "../utils/platform";

export function Performance() {
  const { currentUser } = useUser();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");
  const [platform, setPlatform] = useState("all");
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportsApi.getPerformance(timeRange, platform === "all" ? undefined : platform)
      .then(setData)
      .finally(() => setLoading(false));
  }, [timeRange, platform]);

  if (loading) return <div>Loading performance...</div>;

  // Adapted for new API response
  const conversionData = data.conversionMetrics || [];
  const clusterPerformance = data.clusterPerformance || [];

  // Key metrics (example: you can expand as backend grows)
  const performanceMetrics = [
    {
      label: "Total Leads",
      value: conversionData.reduce((sum, stage) => sum + (stage.count || 0), 0),
      icon: Users,
      trend: "up",
      change: "+0",
      bgColor: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      label: "Contacted",
      value: conversionData.find((s) => s.stage === "CONTACTED")?.count || 0,
      icon: Activity,
      trend: "up",
      change: "+0",
      bgColor: "bg-green-100",
      color: "text-green-600",
    },
    {
      label: "New Leads",
      value: conversionData.find((s) => s.stage === "NEW")?.count || 0,
      icon: Target,
      trend: "up",
      change: "+0",
      bgColor: "bg-orange-100",
      color: "text-orange-600",
    },
    {
      label: "Clusters",
      value: clusterPerformance.length,
      icon: NairaSign,
      trend: "up",
      change: "+0",
      bgColor: "bg-purple-100",
      color: "text-purple-600",
    },
  ];

  // Chart data: use conversionData for funnel, clusterPerformance for bar
  const chartData = clusterPerformance.map((c) => ({
    cluster: c.cluster,
    achieved: c.achieved,
    target: c.target,
    performance: Number(c.performance),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-foreground text-2xl">Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your sales performance and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {INVESTMENT_PLATFORMS.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Month
          </Button>
          <Button
            variant={timeRange === "quarter" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("quarter")}
          >
            Quarter
          </Button>
          <Button
            variant={timeRange === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("year")}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => {
          const Icon = metric.icon || NairaSign;
          const isPositive = metric.trend === "up";
          return (
            <Card key={metric.label} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      isPositive ? "text-green-500" : "text-red-500"
                    )}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-lg", metric.bgColor)}>
                  <Icon className={cn("w-5 h-5", metric.color)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cluster Performance Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground">Cluster Performance</h3>
            <p className="text-sm text-muted-foreground mt-1">Targets vs Achieved</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="cluster" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Bar dataKey="target" fill="#e5e7eb" name="Target" />
            <Bar dataKey="achieved" fill="#6366f1" name="Achieved" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Conversion Funnel */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-foreground">Sales Funnel</h3>
          <p className="text-sm text-muted-foreground mt-1">Lead conversion breakdown</p>
        </div>
        <div className="space-y-4">
          {conversionData.map((stage, index) => {
            const percentage = (stage.count / (conversionData[0]?.count || 1)) * 100;
            const nextStage = conversionData[index + 1];
            const conversionRate = nextStage ? ((nextStage.count / stage.count) * 100).toFixed(1) : null;
            return (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{stage.count}</span>
                    {conversionRate && (
                      <Badge variant="outline" className="text-xs">
                        {conversionRate}% →
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
