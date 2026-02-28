"use client";

import { TrendingUp, Users, DollarSign, Clock, Users2, Target, User, CircleCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useUser } from "../contexts/user-context";

const funnelData = [
  { stage: "New", count: 24, color: "#94a3b8" },
  { stage: "Contacted", count: 18, color: "#4f46e5" },
  { stage: "Negotiation", count: 12, color: "#8b5cf6" },
  { stage: "Ready to Buy", count: 8, color: "#10b981" },
];

const recentLeads = [
  {
    id: "L-1001",
    name: "John Smith",
    asset: "Commercial Plaza - Downtown",
    status: "negotiation",
    value: "₦450,000",
    commission: "₦13,500",
  },
  {
    id: "L-1002",
    name: "Emma Wilson",
    asset: "Residential Complex - West Side",
    status: "contacted",
    value: "₦320,000",
    commission: "₦9,600",
  },
  {
    id: "L-1003",
    name: "Michael Brown",
    asset: "Office Building - Tech Park",
    status: "ready",
    value: "₦680,000",
    commission: "₦20,400",
  },
  {
    id: "L-1004",
    name: "Lisa Anderson",
    asset: "Retail Space - Main Street",
    status: "new",
    value: "₦275,000",
    commission: "₦8,250",
  },
];

const statusColors: Record<string, string> = {
  new: "bg-muted text-muted-foreground",
  contacted: "bg-primary/10 text-primary",
  negotiation: "bg-warning/10 text-warning",
  ready: "bg-accent/10 text-accent",
};

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  negotiation: "Negotiation",
  ready: "Ready to Buy",
};

export function DashboardOverview() {
  const { currentUser, teamMembers } = useUser();

  // Team Lead Personal Sales Stats
  const teamLeadPersonalStats = {
    personalLeads: 8,
    personalDealsCompleted: 5,
    personalDealsInProgress: 3,
    personalCommission: 18750,
  };

  // Team-wide stats for Team Leads
  const teamStats = {
    totalLeads: teamMembers.reduce((sum, m) => sum + m.performance.leadsAssigned, 0),
    totalDealsCompleted: teamMembers.reduce((sum, m) => sum + m.performance.dealsCompleted, 0),
    totalDealsInProgress: teamMembers.reduce((sum, m) => sum + m.performance.dealsInProgress, 0),
    totalCommission: teamMembers.reduce((sum, m) => sum + m.performance.totalCommission, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Sales Dashboard</h1>
        <p className="text-muted-foreground">
          {currentUser.role === "team_lead"
            ? "Your personal sales performance and team overview"
            : "Track your performance and sales metrics"}
        </p>
      </div>

      {/* Team Lead: Personal Sales Section */}
      {currentUser.role === "team_lead" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2>My Personal Sales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">My Active Leads</p>
                    <p className="text-3xl font-semibold">{teamLeadPersonalStats.personalLeads}</p>
                    <p className="text-sm text-accent mt-2">
                      +3 this week
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">My Deals Completed</p>
                    <p className="text-3xl font-semibold text-accent">{teamLeadPersonalStats.personalDealsCompleted}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This month
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <CircleCheck className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">My Deals in Progress</p>
                    <p className="text-3xl font-semibold text-warning">{teamLeadPersonalStats.personalDealsInProgress}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Active pipeline
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
                    <p className="text-sm text-muted-foreground mb-1">My Sales Commission</p>
                    <p className="text-3xl font-semibold text-accent">
                      ₦{teamLeadPersonalStats.personalCommission.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Personal earnings
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Team Lead: Team Overview Section */}
      {currentUser.role === "team_lead" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            <h2>Team Performance Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Team Active Leads</p>
                    <p className="text-3xl font-semibold">{teamStats.totalLeads}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Across {teamMembers.length} agents
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Team Deals Completed</p>
                    <p className="text-3xl font-semibold text-accent">{teamStats.totalDealsCompleted}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This month
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <CircleCheck className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Team Deals in Progress</p>
                    <p className="text-3xl font-semibold text-warning">{teamStats.totalDealsInProgress}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Active pipeline
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
                    <p className="text-sm text-muted-foreground mb-1">Team Commission Pool</p>
                    <p className="text-3xl font-semibold text-accent">
                      ₦{teamStats.totalCommission.toLocaleString()}
                    </p>
                    <p className="text-sm text-primary mt-2">
                      +5% Team Lead Bonus
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Sales Agent: Personal Stats */}
      {currentUser.role === "sales_agent" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Leads Assigned</p>
                  <p className="text-3xl font-semibold">{currentUser.performance.leadsAssigned}</p>
                  <p className="text-sm text-accent mt-2">
                    +12% from last month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Deals in Progress</p>
                  <p className="text-3xl font-semibold text-warning">{currentUser.performance.dealsInProgress}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Active pipeline
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
                  <p className="text-sm text-muted-foreground mb-1">Potential Commission</p>
                  <p className="text-3xl font-semibold text-accent">₦28,400</p>
                  <p className="text-sm text-accent mt-2">
                    +18% from last month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Earned Commission</p>
                  <p className="text-3xl font-semibold text-accent">
                    ₦{currentUser.performance.totalCommission.toLocaleString()}
                  </p>
                  <p className="text-sm text-accent mt-2">
                    +₦{currentUser.performance.thisMonthCommission.toLocaleString()} this month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Funnel Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Funnel</CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentUser.role === "team_lead" ? "Team pipeline stages" : "Current pipeline stages"}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="stage" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {funnelData.map((item) => (
                <div key={item.stage} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.stage}: {item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentUser.role === "team_lead" ? "Latest cluster leads" : "Your latest assigned leads"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.asset}</p>
                    </div>
                    <Badge className={statusColors[lead.status]}>
                      {statusLabels[lead.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Value: {lead.value}</span>
                    <span className="font-semibold text-accent">Commission: {lead.commission}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}