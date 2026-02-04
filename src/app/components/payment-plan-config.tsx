"use client";

import { useState } from "react";
import { Calendar, DollarSign, Plus, Trash2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { PaymentPlan, Installment } from "../types/payment";
import { generateInstallments, formatNaira } from "../utils/payment-calculations";

interface PaymentPlanConfigProps {
  totalAmount: number;
  onPlanChange: (plan: PaymentPlan) => void;
  initialPlan?: PaymentPlan;
}

export function PaymentPlanConfig({ totalAmount, onPlanChange, initialPlan }: PaymentPlanConfigProps) {
  const [planType, setPlanType] = useState<"full" | "installment">(initialPlan?.type || "full");
  const [numberOfInstallments, setNumberOfInstallments] = useState(
    initialPlan?.numberOfInstallments || 3
  );
  const [frequency, setFrequency] = useState<"monthly" | "quarterly" | "custom">(
    initialPlan?.frequency || "monthly"
  );
  const [startDate, setStartDate] = useState(
    initialPlan?.startDate || new Date().toISOString().split('T')[0]
  );
  const [customInstallments, setCustomInstallments] = useState<Installment[]>(
    initialPlan?.installments || []
  );

  const handlePlanTypeChange = (type: "full" | "installment") => {
    setPlanType(type);
    
    if (type === "full") {
      const plan: PaymentPlan = {
        type: "full",
        totalAmount,
        currency: "NGN",
      };
      onPlanChange(plan);
    } else {
      updateInstallmentPlan();
    }
  };

  const updateInstallmentPlan = () => {
    const installments = frequency === "custom" && customInstallments.length > 0
      ? customInstallments
      : generateInstallments(totalAmount, numberOfInstallments, frequency, new Date(startDate));

    const plan: PaymentPlan = {
      type: "installment",
      totalAmount,
      currency: "NGN",
      numberOfInstallments,
      frequency,
      startDate,
      installments,
    };
    
    onPlanChange(plan);
    if (frequency !== "custom") {
      setCustomInstallments(installments);
    }
  };

  const handleNumberOfInstallmentsChange = (value: string) => {
    const num = parseInt(value) || 3;
    setNumberOfInstallments(num);
  };

  const handleFrequencyChange = (value: "monthly" | "quarterly" | "custom") => {
    setFrequency(value);
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
  };

  const handleCustomInstallmentChange = (index: number, field: "amount" | "dueDate", value: string | number) => {
    const updated = [...customInstallments];
    if (field === "amount") {
      updated[index] = { ...updated[index], amount: Number(value) };
    } else {
      updated[index] = { ...updated[index], dueDate: value as string };
    }
    setCustomInstallments(updated);
  };

  const addCustomInstallment = () => {
    const newInstallment: Installment = {
      id: `inst-custom-${Date.now()}`,
      installmentNumber: customInstallments.length + 1,
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: "pending",
    };
    setCustomInstallments([...customInstallments, newInstallment]);
  };

  const removeCustomInstallment = (index: number) => {
    const updated = customInstallments.filter((_, i) => i !== index);
    setCustomInstallments(updated);
  };

  // Calculate if custom installments total matches
  const customTotal = customInstallments.reduce((sum, inst) => sum + inst.amount, 0);
  const isCustomValid = frequency !== "custom" || customTotal === totalAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Plan Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Type Selection */}
        <div className="space-y-2">
          <Label>Payment Type</Label>
          <Select value={planType} onValueChange={handlePlanTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Payment</SelectItem>
              <SelectItem value="installment">Installment Plan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {planType === "full" && (
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payment</p>
                <p className="text-2xl font-semibold text-accent">{formatNaira(totalAmount)}</p>
              </div>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                Single Payment
              </Badge>
            </div>
          </div>
        )}

        {planType === "installment" && (
          <div className="space-y-4">
            {/* Installment Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Installments</Label>
                <Input
                  type="number"
                  min="2"
                  max="12"
                  value={numberOfInstallments}
                  onChange={(e) => handleNumberOfInstallmentsChange(e.target.value)}
                  onBlur={updateInstallmentPlan}
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={handleFrequencyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {frequency !== "custom" && (
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  onBlur={updateInstallmentPlan}
                />
              </div>
            )}

            <Button
              type="button"
              onClick={updateInstallmentPlan}
              variant="outline"
              className="w-full"
            >
              Generate Installment Schedule
            </Button>

            {/* Installment Preview */}
            {customInstallments.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Installment Schedule</Label>
                  {frequency === "custom" && (
                    <Button
                      type="button"
                      onClick={addCustomInstallment}
                      variant="ghost"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Installment
                    </Button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customInstallments.map((installment, index) => (
                    <div
                      key={installment.id}
                      className="p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Installment {installment.installmentNumber}
                        </Badge>
                        {frequency === "custom" && customInstallments.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeCustomInstallment(index)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      {frequency === "custom" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Amount</Label>
                            <Input
                              type="number"
                              value={installment.amount}
                              onChange={(e) =>
                                handleCustomInstallmentChange(index, "amount", e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Due Date</Label>
                            <Input
                              type="date"
                              value={installment.dueDate}
                              onChange={(e) =>
                                handleCustomInstallmentChange(index, "dueDate", e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {installment.dueDate}
                          </span>
                          <span className="font-semibold">
                            {formatNaira(installment.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Validation for Custom */}
                {frequency === "custom" && (
                  <div className={`p-3 rounded-lg border ${
                    isCustomValid
                      ? "bg-accent/5 border-accent/20"
                      : "bg-destructive/5 border-destructive/20"
                  }`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Installments</span>
                      <span className={`font-semibold ${
                        isCustomValid ? "text-accent" : "text-destructive"
                      }`}>
                        {formatNaira(customTotal)}
                      </span>
                    </div>
                    {!isCustomValid && (
                      <p className="text-xs text-destructive mt-1">
                        Total must equal {formatNaira(totalAmount)}
                      </p>
                    )}
                  </div>
                )}

                {/* Summary */}
                {isCustomValid && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                        <p className="font-semibold">{formatNaira(totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Installments</p>
                        <p className="font-semibold">{customInstallments.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Avg. Payment</p>
                        <p className="font-semibold">
                          {formatNaira(Math.round(totalAmount / customInstallments.length))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
