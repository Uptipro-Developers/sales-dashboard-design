export type PaymentPlanType = "full" | "installment";
export type InstallmentStatus = "pending" | "paid" | "overdue" | "scheduled";

export interface Installment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: InstallmentStatus;
  paidDate?: string;
  paidAmount?: number;
  paymentReference?: string;
}

export interface PaymentPlan {
  type: PaymentPlanType;
  totalAmount: number;
  currency: string; // "NGN" for Naira
  installments?: Installment[];
  numberOfInstallments?: number;
  frequency?: "monthly" | "quarterly" | "custom";
  startDate?: string;
}

export interface CommissionInstallment {
  installmentId: string;
  installmentNumber: number;
  leadCommission: number;
  closerCommission: number;
  totalCommission: number;
  status: "pending" | "earned" | "paid";
  earnedDate?: string;
  paidDate?: string;
}

export interface DealWithPaymentPlan {
  id: string;
  leadName: string;
  leadId: string;
  asset: string;
  assetId: string;
  value: number; // Numeric value
  formattedValue: string; // Display value like "₦680,000"
  commission: number; // Total commission numeric value
  formattedCommission: string; // Display commission like "₦20,400"
  status: string;
  progress: number;
  stage: string;
  nextAction: string;
  paymentPlan: PaymentPlan;
  commissionBreakdown: CommissionInstallment[];
  assignedAgent?: string;
  agentId?: string;
  checklist: Array<{ item: string; completed: boolean }>;
}

export interface PaymentHistory {
  id: string;
  dealId: string;
  installmentId: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  reference: string;
  notes?: string;
}
