"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Clock,
  Target,
  BarChart3,
  Users} from "lucide-react";
import { NairaSign } from "@/app/components/NairaSign";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { teamApi } from "../utils/api-service"; // <-- Add this import

interface TeamDetailViewProps {
  memberId: string;
  onBack: () => void;
}

export function TeamDetailView({ memberId, onBack }: TeamDetailViewProps) {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    teamApi
      .getById(memberId)
      .then(setMember)
      .finally(() => setLoading(false));
  }, [memberId]);

  if (loading) return <div>Loading...</div>;
  if (!member) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Team
        </Button>
        <p>Team member not found</p>
      </div>
    );
  }

  // Use member.monthlyPerformance, member.leadSourceData, member.recentDeals from API
  const teamLeadBonus = Math.round(
    (member.performance?.totalCommission || 0) * 0.05,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1>{member.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {member.role === "sales_agent" ? "Sales Agent" : "Team Lead"}{" "}
                  • {member.email}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-accent/10 text-accent border-accent/20"
          >
            Active
          </Badge>
          <Badge variant="outline">
            {member.clusterId === "cluster-1"
              ? "North Region"
              : member.clusterId === "cluster-2"
                ? "South Region"
                : "East Region"}
          </Badge>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Commission
                </p>
                <p className="text-3xl font-semibold text-accent">
                  ₦{member.performance.totalCommission.toLocaleString()}
                </p>
                <p className="text-sm text-primary mt-2">
                  Your bonus: ₦{teamLeadBonus.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <NairaSign className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Deals Completed
                </p>
                <p className="text-3xl font-semibold">
                  {member.performance.dealsCompleted}
                </p>
                <p className="text-sm text-muted-foreground mt-2">This month</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Deals
                </p>
                <p className="text-3xl font-semibold text-warning">
                  {member.performance.dealsInProgress}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  In pipeline
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Leads
                </p>
                <p className="text-3xl font-semibold">
                  {member.performance.leadsAssigned}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Total assigned
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Last 6 months trend</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={member.monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Commission ($)"
                />
                <Line
                  type="monotone"
                  dataKey="deals"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  name="Deals Closed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution by source
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={member.leadSourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis
                  dataKey="source"
                  type="category"
                  stroke="#64748b"
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deals</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest transactions and active deals
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {member.recentDeals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{deal.leadName}</h4>
                      <Badge variant="outline">
                        {deal.serialId || deal.id}
                      </Badge>
                      <Badge
                        className={
                          deal.status === "completed"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }
                      >
                        {deal.status === "completed"
                          ? "Completed"
                          : "In Progress"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {deal.asset}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Commission</p>
                    <p className="text-xl font-semibold text-accent">
                      {deal.commission}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Property Value: {deal.value}
                  </span>
                  <span className="text-muted-foreground">
                    Closed: {deal.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <p className="text-sm text-muted-foreground">
            Key performance indicators
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
              <p className="text-2xl font-semibold">
                {Math.round(
                  (member.performance.dealsCompleted /
                    member.performance.leadsAssigned) *
                    100,
                )}
                %
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {member.performance.dealsCompleted} of{" "}
                {member.performance.leadsAssigned} leads converted
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <NairaSign className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Avg Commission/Deal
                </p>
              </div>
              <p className="text-2xl font-semibold">
                ₦
                {Math.round(
                  member.performance.totalCommission /
                    member.performance.dealsCompleted,
                ).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Per completed deal
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-warning" />
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
              </div>
              <p className="text-2xl font-semibold">
                ₦{(member.performance.dealsInProgress * 15000).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated from active deals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{member.id.toUpperCase()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Phone className="w-4 h-4 mr-2" />
              Call Agent
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Assign Leads
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
