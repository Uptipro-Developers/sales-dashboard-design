"use client";

import { useEffect, useState } from "react";
import {
  reportsApi,
  transactionCommissionsApi,
  userApi,
  teamApi,
} from "../utils/api-service";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "./ui/dialog";
import {
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Users2,
  CreditCard,
  CircleCheck,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  PieChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Pie,
  Cell,
} from "recharts";
import {
  calculateEarnedCommission,
  formatNaira,
} from "../utils/payment-calculations";
import { InstallmentCommissionTracker } from "./installment-commission-tracker";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { Progress } from "./ui/progress";
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  paid: "bg-accent/10 text-accent",
  estimated: "bg-primary/10 text-primary",
};

export function CommissionPreview() {
  // Fetch current user and team members from backend
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // API state for commissions
  const [commissionSummary, setCommissionSummary] = useState<any>({
    thisMonth: "₦0",
    totalEarned: "₦0",
    pending: "₦0",
    leadCommission: "₦0",
    closerCommission: "₦0",
    conversionRate: "0%",
    teamLeadBonus: "₦0",
    teamTotalCommission: "₦0",
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [commissionBreakdown, setCommissionBreakdown] = useState<any[]>([]);
  const [eligibleCommissions, setEligibleCommissions] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      userApi.getCurrent(),
      reportsApi.getCommissions(),
      transactionCommissionsApi.getPaid(),
      transactionCommissionsApi.getUnpaid(),
    ])
      .then(async ([user, reportData, paid, unpaid]) => {
        setCurrentUser(user);
        // If user is a team lead, fetch team members
        if (user.role === "team_lead" && user.teamId) {
          const team = await teamApi.getById(user.teamId);
          setTeamMembers(team.members || []);
        } else {
          setTeamMembers([]);
        }
        setCommissionSummary(reportData.summary || {});
        setMonthlyData(reportData.monthly || []);
        setCommissionBreakdown(reportData.breakdown || []);
        setEligibleCommissions([...(paid || []), ...(unpaid || [])]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !currentUser) return <div>Loading commissions...</div>;

  // Calculate Team Lead Bonus (5% of total team commission)
  const totalTeamCommission = teamMembers.reduce(
    (sum, m) => sum + (m.performance?.totalCommission || 0),
    0,
  );
  const teamLeadBonus = Math.round(totalTeamCommission * 0.05);

  // Get creator info for freelancers
  const creatorInfo = currentUser.creatorId
    ? teamMembers.find((m) => m.id === currentUser.creatorId)
    : null;

  // Calculate freelancer commission sharing (if applicable)
  const freelancerCommissionData =
    currentUser.role === "freelancer" && currentUser.commissionSharing
      ? {
          totalCommission: currentUser.performance.totalCommission,
          freelancerShare: Math.round(
            currentUser.performance.totalCommission *
              (currentUser.commissionSharing.freelancerPercentage / 100),
          ),
          creatorShare: Math.round(
            currentUser.performance.totalCommission *
              (currentUser.commissionSharing.creatorPercentage / 100),
          ),
        }
      : null;

  if (loading) return <div>Loading commissions...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1>Commission Preview</h1>
        <p className="text-muted-foreground">
          {currentUser.role === "team_lead"
            ? "View team commission performance and your team lead bonus"
            : "Track your earnings and commission breakdown"}
        </p>
      </div>

      {/* Team Lead Bonus Banner */}
      {currentUser.role === "team_lead" && (
        <>
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Award className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Team Lead Bonus (5% of Team Commission)
                    </p>
                    <p className="text-3xl font-semibold text-primary">
                      ₦{teamLeadBonus.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      From ₦{totalTeamCommission.toLocaleString()} total team
                      commission
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30 text-lg px-4 py-2"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Leadership Bonus
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Team Lead Personal Sales Commission */}
          <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      My Personal Sales Commission
                    </p>
                    <p className="text-3xl font-semibold text-accent">
                      {commissionSummary.thisMonth}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      From my direct sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-semibold text-accent">
                    ₦
                    {(
                      parseFloat(
                        commissionSummary.thisMonth.replace(/[₦,]/g, "") || "0",
                      ) + teamLeadBonus
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personal + Team Bonus
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {currentUser.role === "team_lead"
                    ? "Team - This Month"
                    : "This Month"}
                </p>
                <p className="text-3xl font-semibold text-accent">
                  {commissionSummary.thisMonth}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  +32% from last month
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {currentUser.role === "team_lead"
                    ? "Team - Total Earned"
                    : "Total Earned"}
                </p>
                <p className="text-3xl font-semibold">
                  {commissionSummary.totalEarned}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Lifetime earnings
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-semibold text-warning">
                  {commissionSummary.pending}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  From active deals
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
                  {currentUser.role === "team_lead"
                    ? "Your Bonus Rate"
                    : "Conversion Rate"}
                </p>
                <p className="text-3xl font-semibold">
                  {currentUser.role === "team_lead"
                    ? "5%"
                    : commissionSummary.conversionRate}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentUser.role === "team_lead"
                    ? "Of team earnings"
                    : "Leads to deals"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                {currentUser.role === "team_lead" ? (
                  <Award className="w-6 h-6 text-primary" />
                ) : (
                  <Users className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Freelancer Commission Sharing Banner */}
      {currentUser.role === "freelancer" &&
        freelancerCommissionData &&
        creatorInfo && (
          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-1">
                  Commission Sharing Agreement
                </h4>
                <p className="text-sm text-muted-foreground">
                  Partnership with {creatorInfo.name} (
                  {creatorInfo.role === "team_lead"
                    ? "Team Lead"
                    : "Sales Agent"}
                  )
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Your Share (
                    {currentUser.commissionSharing?.freelancerPercentage}%)
                  </p>
                  <p className="text-3xl font-semibold text-orange-500">
                    ₦{freelancerCommissionData.freelancerShare.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You receive
                  </p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Creator's Share (
                    {currentUser.commissionSharing?.creatorPercentage}%)
                  </p>
                  <p className="text-3xl font-semibold text-accent">
                    ₦{freelancerCommissionData.creatorShare.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {creatorInfo.name} receives
                  </p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Commission
                  </p>
                  <p className="text-3xl font-semibold text-primary">
                    ₦{freelancerCommissionData.totalCommission.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    100% split
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Team Lead: Agent Commission Overview */}
      {currentUser.role === "team_lead" && (
        <Card>
          <CardHeader>
            <CardTitle>Team Commission Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Commission breakdown by agent • Your 5% bonus: ₦
              {teamLeadBonus.toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => {
                const memberBonus = Math.round(
                  member.performance.totalCommission * 0.05,
                );
                return (
                  <div
                    key={member.id}
                    className="p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Agent Commission
                        </p>
                        <p className="text-xl font-semibold text-accent">
                          ₦{member.performance.totalCommission.toLocaleString()}
                        </p>
                        <p className="text-xs text-primary">
                          Your bonus: ₦{memberBonus.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 bg-card rounded">
                        <p className="text-muted-foreground text-xs">
                          Deals Completed
                        </p>
                        <p className="font-semibold">
                          {member.performance.dealsCompleted}
                        </p>
                      </div>
                      <div className="p-2 bg-card rounded">
                        <p className="text-muted-foreground text-xs">
                          In Progress
                        </p>
                        <p className="font-semibold">
                          {member.performance.dealsInProgress}
                        </p>
                      </div>
                      <div className="p-2 bg-card rounded">
                        <p className="text-muted-foreground text-xs">
                          Active Leads
                        </p>
                        <p className="font-semibold">
                          {member.performance.leadsAssigned}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Progress</CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your earned and pending commissions
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="font-semibold text-primary cursor-pointer">
                    Earned
                  </span>
                </TooltipTrigger>
                <TooltipContent>Commission you have received</TooltipContent>
              </UITooltip>
              <Progress
                value={
                  Number(
                    commissionSummary.earnedTotal?.replace(/[^\d]/g, ""),
                  ) || 0
                }
                max={
                  Number(
                    commissionSummary.totalEarned?.replace(/[^\d]/g, ""),
                  ) || 1
                }
                className="w-1/2"
              />
              <span className="text-primary font-semibold">
                {commissionSummary.earnedTotal}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <UITooltip>
                <TooltipTrigger asChild>
                  <span className="font-semibold text-warning cursor-pointer">
                    Pending
                  </span>
                </TooltipTrigger>
                <TooltipContent>Commission yet to be paid</TooltipContent>
              </UITooltip>
              <Progress
                value={
                  Number(commissionSummary.pending?.replace(/[^\d]/g, "")) || 0
                }
                max={
                  Number(
                    commissionSummary.totalEarned?.replace(/[^\d]/g, ""),
                  ) || 1
                }
                className="w-1/2"
                color="warning"
              />
              <span className="text-warning font-semibold">
                {commissionSummary.pending}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Commission Trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentUser.role === "team_lead"
                ? "Team performance - Last 6 months"
                : "Last 6 months performance"}
            </p>
          </CardHeader>
          <CardContent>
            {Array.isArray(monthlyData) && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [
                      `₦${value.toLocaleString()}`,
                      "Commission",
                    ]}
                  />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-center py-12">
                No commission data available for the selected period.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commission Type Breakdown */}
        {currentUser.role === "sales_agent" && (
          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Lead vs closer commission split
              </p>
            </CardHeader>
            <CardContent>
              {Array.isArray(commissionBreakdown) &&
              commissionBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={commissionBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name.charAt(0).toUpperCase() + name.slice(1)}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {commissionBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₦${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground text-center py-12">
                  No commission breakdown data available.
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Lead commission
                  </p>
                  <p className="font-semibold text-lg text-primary">
                    {commissionSummary.leadCommission}
                  </p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Closer commission
                  </p>
                  <p className="font-semibold text-lg text-accent">
                    {commissionSummary.closerCommission}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Eligible Commissions - Sales Agent Only */}
      {currentUser.role === "sales_agent" && (
        <>
          {/* Installment-Based Commissions */}
          <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Installment-Based Commission Tracking
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Commission earnings tied to installment payments
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eligibleCommissions
                  .filter((deal) => deal.paymentPlan?.type === "installment")
                  .map((deal) => {
                    const earnings = calculateEarnedCommission(
                      Array.isArray(deal.commissionBreakdown)
                        ? deal.commissionBreakdown
                        : [],
                    );
                    const earnedPercentage =
                      deal.commission > 0
                        ? Math.round(
                            (earnings.earnedTotal / deal.commission) * 100,
                          )
                        : 0;
                    const validBreakdown =
                      Array.isArray(deal.commissionBreakdown) &&
                      deal.commissionBreakdown.length > 0;
                    return (
                      <div
                        key={deal.id}
                        className="p-5 bg-card rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{deal.leadName}</h4>
                              <Badge variant="outline">{deal.id}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {deal.asset}
                            </p>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Breakdown
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Installment Commission Details
                                </DialogTitle>
                                <DialogDescription>
                                  Detailed commission breakdown for{" "}
                                  {deal.leadName}
                                </DialogDescription>
                              </DialogHeader>
                              {validBreakdown ? (
                                <InstallmentCommissionTracker
                                  commissionBreakdown={deal.commissionBreakdown}
                                />
                              ) : (
                                <div className="text-muted-foreground text-center py-8">
                                  No commission breakdown data available.
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                            <p className="text-xs text-muted-foreground mb-1">
                              Earned
                            </p>
                            <p className="text-xl font-semibold text-accent">
                              {formatNaira(earnings.earnedTotal)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {
                                deal.commissionBreakdown.filter(
                                  (c) =>
                                    c.status === "earned" ||
                                    c.status === "paid",
                                ).length
                              }{" "}
                              installments
                            </p>
                          </div>
                          <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
                            <p className="text-xs text-muted-foreground mb-1">
                              Pending
                            </p>
                            <p className="text-xl font-semibold text-warning">
                              {formatNaira(earnings.pendingTotal)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {
                                deal.commissionBreakdown.filter(
                                  (c) => c.status === "pending",
                                ).length
                              }{" "}
                              installments
                            </p>
                          </div>
                          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-1">
                              Total
                            </p>
                            <p className="text-xl font-semibold text-primary">
                              {formatNaira(deal.commission)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {deal.paymentPlan?.numberOfInstallments}{" "}
                              installments
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Commission Progress
                            </span>
                            <span className="font-semibold">
                              {earnedPercentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent transition-all duration-500"
                              style={{ width: `${earnedPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Regular Commission Details */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed breakdown of your commissions
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eligibleCommissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="p-6 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {commission.leadName}
                          </h4>
                          <Badge variant="outline">{commission.id}</Badge>
                          <Badge className={statusColors[commission.status]}>
                            {commission.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {commission.asset}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Property Value: {commission.propertyValue}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">
                          Total Commission
                        </p>
                        <p className="text-2xl font-semibold text-accent">
                          {commission.totalCommission}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            Lead Commission (2%)
                          </span>
                        </div>
                        <p className="font-semibold text-primary">
                          {commission.leadCommission}
                        </p>
                      </div>
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <CircleCheck className="w-4 h-4 text-accent" />
                          <span className="text-xs text-muted-foreground">
                            Closer Commission (1%)
                          </span>
                        </div>
                        <p className="font-semibold text-accent">
                          {commission.closerCommission}
                        </p>
                      </div>
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Payout Date
                          </span>
                        </div>
                        <p className="font-semibold">{commission.payoutDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Eligibility Status
                        </p>
                        <p className="font-medium">{commission.eligibility}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Commission Type:{" "}
                        <span className="font-medium text-foreground">
                          {commission.commissionType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Commission Structure Info - Sales Agent Only */}
      {currentUser.role === "sales_agent" && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">Commission Structure</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Lead Commission (2%)</p>
                  <p className="text-muted-foreground">
                    Earned when you generate and qualify a lead that is assigned
                    to you. Paid regardless of who closes the deal.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <CircleCheck className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium mb-1">Closer Commission (1%)</p>
                  <p className="text-muted-foreground">
                    Additional commission earned when you successfully close a
                    deal from start to finish. Only applicable when you are both
                    lead generator and closer.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
