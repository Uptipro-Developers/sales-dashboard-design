"use client";

import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { NairaSign } from "@/app/components/NairaSign";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { CommissionInstallment } from "../types/payment";
import { formatNaira, calculateEarnedCommission } from "../utils/payment-calculations";

interface InstallmentCommissionTrackerProps {
  commissionBreakdown: CommissionInstallment[];
  compact?: boolean;
}

export function InstallmentCommissionTracker({
  commissionBreakdown,
  compact = false,
}: InstallmentCommissionTrackerProps) {
  const {
    earnedLeadCommission,
    earnedCloserCommission,
    earnedTotal,
    pendingLeadCommission,
    pendingCloserCommission,
    pendingTotal,
  } = calculateEarnedCommission(commissionBreakdown);

  const totalCommission = earnedTotal + pendingTotal;
  const earnedPercentage = totalCommission > 0 ? Math.round((earnedTotal / totalCommission) * 100) : 0;

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Commission Earned</p>
              <p className="text-2xl font-semibold text-accent">{formatNaira(earnedTotal)}</p>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
              {earnedPercentage}% Earned
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{earnedPercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${earnedPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pending: {formatNaira(pendingTotal)}</span>
              <span className="text-muted-foreground">Total: {formatNaira(totalCommission)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <p className="text-sm text-muted-foreground">Earned Commission</p>
          </div>
          <p className="text-2xl font-semibold text-accent">{formatNaira(earnedTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            From {commissionBreakdown.filter(c => c.status === "earned" || c.status === "paid").length} paid installments
          </p>
        </div>

        <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <p className="text-sm text-muted-foreground">Pending Commission</p>
          </div>
          <p className="text-2xl font-semibold text-warning">{formatNaira(pendingTotal)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            From {commissionBreakdown.filter(c => c.status === "pending").length} pending installments
          </p>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <NairaSign className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground">Total Commission</p>
          </div>
          <p className="text-2xl font-semibold text-primary">{formatNaira(totalCommission)}</p>
          <p className="text-xs text-muted-foreground mt-1">{earnedPercentage}% earned</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Commission Progress</span>
          <span className="font-semibold">{earnedPercentage}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${earnedPercentage}%` }}
          />
        </div>
      </div>

      {/* Commission Breakdown by Type */}
      {(earnedLeadCommission > 0 || earnedCloserCommission > 0) && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium mb-3">Commission Breakdown</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Lead Commission</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Earned:</span>
                  <span className="font-semibold text-accent">{formatNaira(earnedLeadCommission)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending:</span>
                  <span className="font-semibold text-warning">{formatNaira(pendingLeadCommission)}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Closer Commission</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Earned:</span>
                  <span className="font-semibold text-accent">{formatNaira(earnedCloserCommission)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending:</span>
                  <span className="font-semibold text-warning">{formatNaira(pendingCloserCommission)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Installment-by-Installment Breakdown */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Commission per Installment</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {commissionBreakdown.map((commission) => {
            const isEarned = commission.status === "earned" || commission.status === "paid";
            
            return (
              <div
                key={commission.installmentId}
                className={`p-3 rounded-lg border ${
                  isEarned
                    ? "bg-accent/5 border-accent/20"
                    : "bg-muted/50 border-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isEarned ? (
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm">
                      Installment {commission.installmentNumber}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      isEarned
                        ? "bg-accent/10 text-accent border-accent/30"
                        : "bg-muted text-muted-foreground border-muted"
                    }`}
                  >
                    {isEarned ? "Earned" : "Pending"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Lead</p>
                    <p className="font-semibold">{formatNaira(commission.leadCommission)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Closer</p>
                    <p className="font-semibold">{formatNaira(commission.closerCommission)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Total</p>
                    <p className={`font-semibold ${isEarned ? "text-accent" : ""}`}>
                      {formatNaira(commission.totalCommission)}
                    </p>
                  </div>
                </div>

                {commission.earnedDate && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Earned on: {commission.earnedDate}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
