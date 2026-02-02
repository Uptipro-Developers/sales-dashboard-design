import { PaymentPlan, Installment, CommissionInstallment, InstallmentStatus } from "../types/payment";

/**
 * Generate installment schedule based on payment plan configuration
 */
export function generateInstallments(
  totalAmount: number,
  numberOfInstallments: number,
  frequency: "monthly" | "quarterly" | "custom",
  startDate: Date
): Installment[] {
  const installments: Installment[] = [];
  const installmentAmount = Math.round(totalAmount / numberOfInstallments);
  let remainingAmount = totalAmount;

  for (let i = 0; i < numberOfInstallments; i++) {
    const isLastInstallment = i === numberOfInstallments - 1;
    const amount = isLastInstallment ? remainingAmount : installmentAmount;
    
    // Calculate due date based on frequency
    const dueDate = new Date(startDate);
    if (frequency === "monthly") {
      dueDate.setMonth(dueDate.getMonth() + i);
    } else if (frequency === "quarterly") {
      dueDate.setMonth(dueDate.getMonth() + (i * 3));
    }
    // For custom, dates would be set manually

    installments.push({
      id: `inst-${Date.now()}-${i}`,
      installmentNumber: i + 1,
      amount,
      dueDate: dueDate.toISOString().split('T')[0],
      status: i === 0 ? "pending" : "scheduled",
    });

    remainingAmount -= amount;
  }

  return installments;
}

/**
 * Calculate commission breakdown per installment
 */
export function calculateCommissionPerInstallment(
  totalCommission: number,
  leadCommissionRate: number, // e.g., 0.02 for 2%
  closerCommissionRate: number, // e.g., 0.01 for 1%
  installments: Installment[]
): CommissionInstallment[] {
  const totalPropertyValue = installments.reduce((sum, inst) => sum + inst.amount, 0);
  
  return installments.map((installment) => {
    // Calculate proportional commission based on installment amount
    const proportionOfTotal = installment.amount / totalPropertyValue;
    const installmentLeadCommission = Math.round(totalCommission * proportionOfTotal * (leadCommissionRate / (leadCommissionRate + closerCommissionRate)));
    const installmentCloserCommission = Math.round(totalCommission * proportionOfTotal * (closerCommissionRate / (leadCommissionRate + closerCommissionRate)));
    
    return {
      installmentId: installment.id,
      installmentNumber: installment.installmentNumber,
      leadCommission: installmentLeadCommission,
      closerCommission: installmentCloserCommission,
      totalCommission: installmentLeadCommission + installmentCloserCommission,
      status: installment.status === "paid" ? "earned" : "pending",
      earnedDate: installment.paidDate,
    };
  });
}

/**
 * Calculate total earned commission from paid installments
 */
export function calculateEarnedCommission(commissionBreakdown: CommissionInstallment[]): {
  earnedLeadCommission: number;
  earnedCloserCommission: number;
  earnedTotal: number;
  pendingLeadCommission: number;
  pendingCloserCommission: number;
  pendingTotal: number;
} {
  const earned = commissionBreakdown
    .filter(c => c.status === "earned" || c.status === "paid")
    .reduce(
      (sum, c) => ({
        lead: sum.lead + c.leadCommission,
        closer: sum.closer + c.closerCommission,
        total: sum.total + c.totalCommission,
      }),
      { lead: 0, closer: 0, total: 0 }
    );

  const pending = commissionBreakdown
    .filter(c => c.status === "pending")
    .reduce(
      (sum, c) => ({
        lead: sum.lead + c.leadCommission,
        closer: sum.closer + c.closerCommission,
        total: sum.total + c.totalCommission,
      }),
      { lead: 0, closer: 0, total: 0 }
    );

  return {
    earnedLeadCommission: earned.lead,
    earnedCloserCommission: earned.closer,
    earnedTotal: earned.total,
    pendingLeadCommission: pending.lead,
    pendingCloserCommission: pending.closer,
    pendingTotal: pending.total,
  };
}

/**
 * Update installment status based on current date
 */
export function updateInstallmentStatuses(installments: Installment[]): Installment[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return installments.map(installment => {
    if (installment.status === "paid") {
      return installment;
    }

    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return { ...installment, status: "overdue" as InstallmentStatus };
    } else if (dueDate.getTime() === today.getTime() || installment.installmentNumber === 1) {
      return { ...installment, status: "pending" as InstallmentStatus };
    }

    return installment;
  });
}

/**
 * Calculate payment progress percentage
 */
export function calculatePaymentProgress(installments: Installment[]): number {
  if (!installments || installments.length === 0) return 0;
  
  const totalAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
  const paidAmount = installments
    .filter(inst => inst.status === "paid")
    .reduce((sum, inst) => sum + (inst.paidAmount || inst.amount), 0);
  
  return Math.round((paidAmount / totalAmount) * 100);
}

/**
 * Format currency to Naira
 */
export function formatNaira(amount: number | undefined | null): string {
  if (typeof amount !== "number" || isNaN(amount)) return "₦0";
  return `₦${amount.toLocaleString()}`;
}
