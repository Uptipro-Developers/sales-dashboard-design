"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useUser } from "../contexts/user-context";
import { InstallmentPaymentTracker } from "./installment-payment-tracker";
import { InstallmentCommissionTracker } from "./installment-commission-tracker";
import { formatNaira } from "../utils/payment-calculations";
import {
  paymentsApi,
  transactionsApi,
  notificationsApi,
} from "../utils/api-service"; // <-- Use the correct API
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "../contexts/toast-context";
import {
  INVESTMENT_PLATFORMS,
  platformBadgeClass,
  platformLabel,
} from "../utils/platform";

const paymentStatusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  completed: "bg-accent/10 text-accent",
  paid: "bg-accent/10 text-accent",
  cancelled: "bg-destructive/10 text-destructive",
};

const commissionStatusColors: Record<string, string> = {
  unpaid: "bg-warning/10 text-warning border-warning/20",
  sent: "bg-primary/10 text-primary border-primary/20",
  paid: "bg-accent/10 text-accent border-accent/20",
};

const paymentStatusLabel = (status: string) => {
  const normalized = String(status || "pending").toLowerCase();
  if (normalized === "completed" || normalized === "paid") return "Paid";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export function DealProgress() {
  const { currentUser, teamMembers } = useUser();
  const { error, success } = useToast();
  const [paymentLinkEmail, setPaymentLinkEmail] = useState("");
  const [paymentLinkProvider, setPaymentLinkProvider] = useState<
    "paystack" | "flutterwave"
  >("paystack");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedDealIdForPayment, setSelectedDealIdForPayment] = useState<
    string | null
  >(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"my" | "team">("my");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedDealForDetails, setSelectedDealForDetails] = useState<
    string | null
  >(null);

  console.log(currentUser);
  // API state
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    transactionsApi
      .getAll()
      .then((allDeals) => {
        setDeals(allDeals);
      })
      .finally(() => setLoading(false));

    // Poll every 20 seconds for real-time updates
    const interval = setInterval(() => {
      transactionsApi.getAll().then((allDeals) => {
        setDeals(allDeals);
      });
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleNotifyAdmin = async (dealId: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return error("Deal not found");
    try {
      await notificationsApi.notifyAdmin({
        title: `Deal Ready for Closing: ${deal.propertyName || deal.serialId || deal.id}`,
        message: `Deal ${deal.serialId || deal.id} is ready for admin review and closing. Please review the transaction details and initiate final paperwork/payment.`,
        type: "deal-closing-request",
      });
      success("Admin notified successfully");
    } catch (e: any) {
      error("Failed to notify admin", e?.message || "Unknown error");
    }
  };

  const handleSendPaymentLink = (dealId: string, email: string) => {
    const deal = deals.find((d) => d.id === dealId);
    const fallbackAmount = Number(
      deal?.amount ||
        String(deal?.propertyValue || "").replace(/[₦,]/g, "") ||
        0,
    );
    const amountToUse = paymentAmount > 0 ? paymentAmount : fallbackAmount;

    if (!email || !email.includes("@") || amountToUse <= 0) {
      error("Invalid payment details", "Provide valid email and amount.");
      return;
    }

    const callbackUrl = `${window.location.origin}/payments/callback?provider=${paymentLinkProvider}&source=sales&dealId=${dealId}`;

    paymentsApi
      .initialize({
        provider: paymentLinkProvider,
        email,
        amount: amountToUse,
        callbackUrl,
        reference: `sales-deal-${dealId}-${Date.now()}`,
        metadata: {
          source: "sales_deal_progress",
          dealId,
        },
        title: "BuyOps Deal Payment",
      })
      .then((res: any) => {
        const url = res?.data?.authorizationUrl || res?.authorizationUrl;
        if (!url) {
          throw new Error("No authorization URL returned by provider");
        }
        setIsPaymentDialogOpen(false);
        setPaymentLinkEmail("");
        setPaymentAmount(0);
        setSelectedDealIdForPayment(null);
        window.location.assign(url);
      })
      .catch((err: any) => {
        error(
          "Payment link generation failed",
          err?.response?.data?.message ||
            err?.message ||
            "Unable to initialize checkout.",
        );
      });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-accent";
    if (progress >= 50) return "bg-warning";
    return "bg-primary";
  };

  // Filter deals for "my" or "team" tab if needed
  const displayDeals =
    selectedPlatform === "all"
      ? deals
      : deals.filter((deal) => deal.platform === selectedPlatform);
  // currentUser.role === "AGENT" && activeTab === "team"
  //   ? deals.filter((d) =>
  //     (typeof d.teamLeadId === "object" ? d.teamLeadId?.id : d.teamLeadId) === currentUser.id
  //   )
  //   : deals.filter((d) =>
  //     (typeof d.assignedTo === "object" ? d.assignedTo?.id : d.assignedTo) === currentUser.id
  //   );

  // For team deals summary
  const teamDeals = deals.filter(
    (d) =>
      (typeof d.teamLeadId === "object" ? d.teamLeadId?.id : d.teamLeadId) ===
      currentUser.id,
  );

  if (loading) return <div>Loading deals...</div>;

  const canManagePayments = (role: string) =>
    role === "AGENT" || role === "TEAM_LEAD" || role === "sales_agent";

  const canOpenPaymentFlow = (paymentStatus: string) => {
    return String(paymentStatus || "pending").toLowerCase() === "pending";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Deal Progress</h1>
          <p className="text-muted-foreground">
            {currentUser.role === "AGENT"
              ? "Track your personal deals and monitor team deal coordination"
              : "Track your deals through the sales pipeline"}
          </p>
        </div>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {INVESTMENT_PLATFORMS.map((platform) => (
              <SelectItem key={platform} value={platform}>{platform}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Lead: Personal vs Team Toggle */}
      {currentUser.role === "AGENT" && (
        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg w-fit">
          <Button
            variant={activeTab === "my" ? "default" : "ghost"}
            size="sm"
            className={activeTab === "my" ? "bg-primary" : ""}
            onClick={() => setActiveTab("my")}
          >
            My Deals
          </Button>
          <Button
            variant={activeTab === "team" ? "default" : "ghost"}
            size="sm"
            className={activeTab === "team" ? "bg-primary" : ""}
            onClick={() => setActiveTab("team")}
          >
            Team Deals
          </Button>
        </div>
      )}

      {/* Team Deals Summary - Only show when on Team tab */}
      {(currentUser.role === "sales_agent" ||
        currentUser.role === "AGENT" ||
        currentUser.role === "SALES_AGENT") &&
        activeTab === "team" && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold">Team Deals Overview</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Active Deals
                  </p>
                  <p className="text-2xl font-semibold">{teamDeals.length}</p>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Ready to Close
                  </p>
                  <p className="text-2xl font-semibold text-accent">
                    {
                      teamDeals.filter(
                        (d) =>
                          String(d.paymentStatus).toLowerCase() === "pending",
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Pipeline Value
                  </p>
                  <p className="text-2xl font-semibold text-primary">
                    ₦
                    {(
                      teamDeals.reduce((sum, d) => sum + d.value, 0) / 1000000
                    ).toFixed(1)}
                    M
                  </p>
                </div>
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Potential Commission
                  </p>
                  <p className="text-2xl font-semibold text-accent">
                    ₦
                    {(
                      teamDeals.reduce((sum, d) => sum + d.commission, 0) / 1000
                    ).toFixed(0)}
                    K
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Deals Grid */}
      <div className="space-y-6">
        {displayDeals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {deal.leadName}
                    <Badge variant="outline">{deal.serialId || deal.id}</Badge>
                    {currentUser.role === "AGENT" && activeTab === "team" && (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        Agent:{" "}
                        {deal.assignedAgent?.name || deal.assignedAgent || "-"}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {typeof deal.asset === "object"
                      ? deal.asset?.name || "-"
                      : deal.asset || "-"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge className={paymentStatusColors[deal.paymentStatus]}>
                    Payment: {paymentStatusLabel(deal.paymentStatus)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      commissionStatusColors[
                        deal.commissionStatus || deal.status
                      ]
                    }
                  >
                    Commission: {deal.commissionStatus || deal.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={platformBadgeClass(deal.platform)}
                  >
                    {platformLabel(deal.platform)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Deal Progress
                  </span>
                  <span className="text-sm font-semibold">
                    {deal.progress}%
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(deal.progress)} transition-all duration-500`}
                    style={{ width: `${deal.progress}%` }}
                  />
                </div>
              </div>

              {/* Deal Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">
                      Property Value
                    </span>
                  </div>
                  <p className="font-semibold text-lg">{deal.propertyValue}</p>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">
                      {currentUser.role === "AGENT"
                        ? "Commission"
                        : "Your Commission"}
                    </span>
                  </div>
                  <p className="font-semibold text-lg text-accent">
                    {deal.totalCommission}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">
                      Payout Date
                    </span>
                  </div>
                  <p className="font-semibold">{deal.payoutDate}</p>
                </div>
              </div>

              {/* Payment Plan Tracker - Compact View */}
              {deal.paymentPlan && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      Payment & Commission Tracking
                    </h4>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Payment & Commission Details
                          </DialogTitle>
                          <DialogDescription>
                            Track installment payments and commission earnings
                            for {deal.leadName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold mb-3">
                              Payment Schedule
                            </h4>
                            <InstallmentPaymentTracker
                              paymentPlan={deal.paymentPlan}
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">
                              Commission Breakdown
                            </h4>
                            <InstallmentCommissionTracker
                              commissionBreakdown={deal.commissionBreakdown}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InstallmentPaymentTracker
                      paymentPlan={deal.paymentPlan}
                      compact
                    />
                    <InstallmentCommissionTracker
                      commissionBreakdown={deal.commissionBreakdown}
                      compact
                    />
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Deal Checklist</h4>
                <div className="space-y-2">
                  {(deal.checklist ?? []).map((item: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        item.completed ? "bg-accent/10" : "bg-muted/30"
                      }`}
                    >
                      {item.completed ? (
                        <span className="text-accent flex-shrink-0">✔</span>
                      ) : (
                        <span className="text-muted-foreground flex-shrink-0">
                          ⏳
                        </span>
                      )}
                      <span
                        className={
                          item.completed
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {canManagePayments(currentUser.role) &&
                  canOpenPaymentFlow(deal.paymentStatus) && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="flex-1">
                            Notify Admin for Transaction
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Notify Admin Team
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will notify the admin team that the deal is
                              ready for closing. The admin will review the
                              transaction details and initiate the final
                              paperwork and payment processing.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleNotifyAdmin(deal.id)}
                            >
                              Send Notification
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Dialog
                        open={isPaymentDialogOpen}
                        onOpenChange={setIsPaymentDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedDealIdForPayment(deal.id);
                              setPaymentAmount(Number(deal.amount || 0));
                            }}
                          >
                            Send Payment Link
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Send Payment Link to Investor
                            </DialogTitle>
                            <DialogDescription>
                              Generate and send a secure payment link to the
                              investor. They will be able to complete the
                              payment online. Admin will be notified
                              immediately.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-muted/30 rounded-lg">
                              <p className="font-medium mb-1">
                                {deal.leadName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {deal.asset}
                              </p>
                              <p className="text-lg font-semibold text-accent mt-2">
                                {deal.value}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="investor-email">
                                Investor Email Address
                              </Label>
                              <Input
                                id="investor-email"
                                type="email"
                                placeholder="investor@email.com"
                                value={paymentLinkEmail}
                                onChange={(e) =>
                                  setPaymentLinkEmail(e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Gateway Provider</Label>
                              <Select
                                value={paymentLinkProvider}
                                onValueChange={(
                                  value: "paystack" | "flutterwave",
                                ) => setPaymentLinkProvider(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="paystack">
                                    Paystack
                                  </SelectItem>
                                  <SelectItem value="flutterwave">
                                    Flutterwave
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="payment-amount">
                                Amount (NGN)
                              </Label>
                              <Input
                                id="payment-amount"
                                type="number"
                                min={1}
                                value={paymentAmount || ""}
                                onChange={(e) =>
                                  setPaymentAmount(Number(e.target.value))
                                }
                              />
                            </div>
                            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-sm">
                              <p className="font-medium mb-1 text-accent">
                                Important:
                              </p>
                              <ul className="space-y-1 text-muted-foreground ml-4 list-disc">
                                <li>Agent does not collect money directly</li>
                                <li>
                                  Secure payment link will be sent to investor
                                </li>
                                <li>Admin receives immediate notification</li>
                                <li>
                                  Commission credited after payment confirmation
                                </li>
                              </ul>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsPaymentDialogOpen(false);
                                  setPaymentLinkEmail("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() =>
                                  handleSendPaymentLink(
                                    selectedDealIdForPayment || deal.id,
                                    paymentLinkEmail,
                                  )
                                }
                                disabled={
                                  !paymentLinkEmail ||
                                  !paymentLinkEmail.includes("@") ||
                                  paymentAmount <= 0
                                }
                              >
                                Send Payment Link
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                {canManagePayments(currentUser.role) &&
                  !canOpenPaymentFlow(deal.paymentStatus) && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedDealForDetails(deal.id)}
                    >
                      View Lead Details
                    </Button>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lead Details Dialog */}
      {selectedDealForDetails && (
        <Dialog
          open={!!selectedDealForDetails}
          onOpenChange={(open: boolean) => {
            if (!open) setSelectedDealForDetails(null);
          }}
        >
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>
                View detailed information about the lead and their deal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {displayDeals.find((d) => d.id === selectedDealForDetails) && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-1">Lead Name</p>
                  <p className="text-sm text-muted-foreground">
                    {
                      displayDeals.find((d) => d.id === selectedDealForDetails)
                        ?.leadName
                    }
                  </p>
                </div>
              )}
              {displayDeals.find((d) => d.id === selectedDealForDetails) && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-1">Asset</p>
                  <p className="text-sm text-muted-foreground">
                    {
                      displayDeals.find((d) => d.id === selectedDealForDetails)
                        ?.asset
                    }
                  </p>
                </div>
              )}
              {displayDeals.find((d) => d.id === selectedDealForDetails) && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-1">Value</p>
                  <p className="text-sm text-muted-foreground">
                    {
                      displayDeals.find((d) => d.id === selectedDealForDetails)
                        ?.propertyValue
                    }
                  </p>
                </div>
              )}
              {displayDeals.find((d) => d.id === selectedDealForDetails) && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-1">Commission</p>
                  <p className="text-sm text-muted-foreground">
                    {
                      displayDeals.find((d) => d.id === selectedDealForDetails)
                        ?.totalCommission
                    }
                  </p>
                </div>
              )}
              {displayDeals.find((d) => d.id === selectedDealForDetails) && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-1">Payment Plan</p>
                  {displayDeals.find((d) => d.id === selectedDealForDetails)
                    ?.paymentPlan ? (
                    <InstallmentPaymentTracker
                      paymentPlan={
                        displayDeals.find(
                          (d) => d.id === selectedDealForDetails,
                        )?.paymentPlan
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground">
                      No payment plan available.
                    </span>
                  )}
                </div>
              )}
              {displayDeals.find((d) => d.id === selectedDealForDetails) && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium mb-1">Commission Tracker</p>
                  <InstallmentCommissionTracker
                    commissionBreakdown={
                      displayDeals.find((d) => d.id === selectedDealForDetails)
                        ?.commissionBreakdown || []
                    }
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
