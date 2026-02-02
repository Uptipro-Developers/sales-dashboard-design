"use client";

import { CheckCircle2, Clock, AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PaymentPlan, Installment } from "../types/payment";
import { formatNaira, calculatePaymentProgress, updateInstallmentStatuses } from "../utils/payment-calculations";

interface InstallmentPaymentTrackerProps {
  paymentPlan: PaymentPlan;
  compact?: boolean;
}

const statusConfig = {
  paid: {
    icon: CheckCircle2,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
    label: "Paid",
  },
  pending: {
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    label: "Pending",
  },
  overdue: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    label: "Overdue",
  },
  scheduled: {
    icon: Calendar,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-muted",
    label: "Scheduled",
  },
};

export function InstallmentPaymentTracker({ paymentPlan, compact = false }: InstallmentPaymentTrackerProps) {
  if (paymentPlan.type === "full") {
    return (
      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Payment Plan</p>
            <p className="font-semibold">Full Payment</p>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            Single Payment
          </Badge>
        </div>
      </div>
    );
  }

  const installments = updateInstallmentStatuses(paymentPlan.installments || []);
  const paymentProgress = calculatePaymentProgress(installments);
  const paidInstallments = installments.filter(i => i.status === "paid").length;
  const totalPaid = installments
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Payment Progress</p>
            <p className="font-semibold">
              {paidInstallments} of {installments.length} installments paid
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {paymentProgress}% Complete
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{paymentProgress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Paid: {formatNaira(totalPaid)}</span>
            <span className="text-muted-foreground">Total: {formatNaira(paymentPlan.totalAmount)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
            <p className="font-semibold">{formatNaira(paymentPlan.totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Installments</p>
            <p className="font-semibold">
              {paidInstallments} / {installments.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Progress</p>
            <p className="font-semibold text-accent">{paymentProgress}%</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Payment Progress</span>
          <span className="font-semibold">{paymentProgress}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${paymentProgress}%` }}
          />
        </div>
      </div>

      {/* Installment List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        <p className="text-sm font-medium text-muted-foreground mb-2">Installment Schedule</p>
        {installments.map((installment) => {
          const config = statusConfig[installment.status];
          const Icon = config.icon;

          return (
            <div
              key={installment.id}
              className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="font-medium">
                    Installment {installment.installmentNumber}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`${config.bgColor} ${config.color} border-transparent text-xs`}
                >
                  {config.label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Amount</p>
                  <p className="font-semibold">{formatNaira(installment.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Due Date</p>
                  <p className="font-semibold">{installment.dueDate}</p>
                </div>
                {installment.paidDate && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-1">Paid On</p>
                    <p className="font-semibold text-accent">{installment.paidDate}</p>
                  </div>
                )}
                {installment.paymentReference && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-1">Reference</p>
                    <p className="font-mono text-xs">{installment.paymentReference}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Summary */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
            <p className="text-xl font-semibold text-accent">{formatNaira(totalPaid)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Remaining</p>
            <p className="text-xl font-semibold">{formatNaira(paymentPlan.totalAmount - totalPaid)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
