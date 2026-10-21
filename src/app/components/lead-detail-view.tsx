"use client";

import { useEffect, useState } from "react";
import { leadsApi } from "../utils/api-service";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Tag,
  FileText,
  Clock,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { NairaSign } from "@/app/components/NairaSign";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useUser } from "../contexts/user-context";
import {
  INVESTMENT_PLATFORMS,
  platformBadgeClass,
  platformLabel,
} from "../utils/platform";

interface LeadDetailViewProps {
  leadId: string;
  onBack: () => void;
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
  { value: "assigned", label: "Assigned", color: "bg-blue-100 text-blue-800" },
  {
    value: "contacted",
    label: "Contacted",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "qualified",
    label: "Qualified",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "available",
    label: "Available",
    color: "bg-cyan-100 text-cyan-800",
  },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
  {
    value: "converted",
    label: "Converted",
    color: "bg-purple-100 text-purple-800",
  },
  { value: "new", label: "New", color: "bg-indigo-100 text-indigo-800" },
];

const sourceOptions = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

export function LeadDetailView({ leadId, onBack }: LeadDetailViewProps) {
  const { currentUser, teamMembers, clusters } = useUser();
  const [leadData, setLeadData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    leadsApi.getById(leadId).then(setLeadData);
  }, [leadId]);

  const handleSave = async () => {
    await leadsApi.update(leadId, leadData);
    setIsEditing(false);
    setLeadData(await leadsApi.getById(leadId));
  };

  if (!leadData) return <div>Loading lead details...</div>;

  const currentStatus = statusOptions.find(
    (s: { value: any }) => s.value === leadData.status,
  );
  const canConvertToInvestor = INVESTMENT_PLATFORMS.includes(leadData.platform);

  const handleConvertToInvestor = () => {
    if (!canConvertToInvestor) return;

    const investorAppUrl =
      import.meta.env.VITE_INVESTOR_APP_URL || "http://localhost:3000";
    const signupUrl = new URL("/auth/signup", investorAppUrl);
    signupUrl.searchParams.set(
      "track",
      leadData.platform === "Urbco Foundry" ? "foundry" : "harbor",
    );
    signupUrl.searchParams.set("leadId", leadData.id);
    signupUrl.searchParams.set("name", leadData.name || "");
    signupUrl.searchParams.set("email", leadData.email || "");
    if (leadData.phone) signupUrl.searchParams.set("phone", leadData.phone);
    window.open(signupUrl.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1>{leadData.name}</h1>
              <Badge variant="outline">
                {leadData.serialId || leadData.id}
              </Badge>
              <Badge
                className={currentStatus?.color || "bg-gray-100 text-gray-800"}
              >
                {currentStatus?.label || leadData.status || "Unknown"}
              </Badge>
              <Badge
                variant="outline"
                className={platformBadgeClass(leadData.platform)}
              >
                {platformLabel(leadData.platform)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created on{" "}
              {new Date(
                leadData.createdAt || leadData.dateReceived,
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              {leadData.status !== "converted" && (
                <Button
                  onClick={handleConvertToInvestor}
                  disabled={!canConvertToInvestor}
                  title={
                    canConvertToInvestor
                      ? "Open investor registration with this lead's details"
                      : "Assign an investment platform before converting this lead"
                  }
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convert to Investor
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Lead
              </Button>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead-name">Full Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="lead-name"
                        value={leadData.name}
                        onChange={(e) =>
                          setLeadData({ ...leadData, name: e.target.value })
                        }
                      />
                    ) : (
                      <span>{leadData.name}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Investment Platform</Label>
                  {isEditing ? (
                    <Select
                      value={leadData.platform || ""}
                      onValueChange={(platform) =>
                        setLeadData({ ...leadData, platform })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTMENT_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant="outline"
                      className={platformBadgeClass(leadData.platform)}
                    >
                      {platformLabel(leadData.platform)}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="lead-email"
                        type="email"
                        value={leadData.email}
                        onChange={(e) =>
                          setLeadData({ ...leadData, email: e.target.value })
                        }
                      />
                    ) : (
                      <span>{leadData.email}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-phone">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="lead-phone"
                        value={leadData.phone}
                        onChange={(e) =>
                          setLeadData({ ...leadData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <span>{leadData.phone}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-company">Company</Label>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        id="lead-company"
                        value={leadData.company}
                        onChange={(e) =>
                          setLeadData({ ...leadData, company: e.target.value })
                        }
                      />
                    ) : (
                      <span>{leadData.company}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Interest */}
          <Card>
            <CardHeader>
              <CardTitle>Property Interest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset of Interest</Label>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {leadData.asset?.name || leadData.assetInterest || "—"}
                    </span>
                  </div>
                  {(leadData.asset || leadData.assetInterest) && (
                    <p className="text-sm text-muted-foreground ml-6">
                      ID:{" "}
                      {leadData.asset?.serialId ||
                        leadData.asset?.id ||
                        leadData.assetInterest}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-budget">Budget</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium text-sm">
                      ₦
                    </span>
                    {isEditing ? (
                      <Input
                        id="lead-budget"
                        type="number"
                        value={leadData.budget}
                        onChange={(e) =>
                          setLeadData({ ...leadData, budget: e.target.value })
                        }
                      />
                    ) : (
                      <span className="text-accent font-semibold">
                        {leadData.budget
                          ? `₦${Number(leadData.budget).toLocaleString()}`
                          : "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lead-notes">Lead Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="lead-notes"
                    rows={4}
                    value={leadData.notes}
                    onChange={(e) =>
                      setLeadData({ ...leadData, notes: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm p-3 bg-muted/30 rounded-lg">
                    {leadData.notes}
                  </p>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3 mt-6">
                <h4 className="font-semibold">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Status updated to "Contacted"
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 days ago • by {leadData.assignedAgent}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Initial contact made via email
                      </p>
                      <p className="text-xs text-muted-foreground">
                        3 days ago • by {leadData.assignedAgent}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lead created</p>
                      <p className="text-xs text-muted-foreground">
                        5 days ago • by {leadData.assignedAgent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NairaSign className="w-4 h-4" />
                Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadData.paymentPlan &&
              leadData.paymentPlan.installments?.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Total Amount
                      </p>
                      <p className="font-semibold">
                        ₦
                        {leadData.paymentPlan.totalAmount?.toLocaleString() ??
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Paid</p>
                      <p className="font-semibold text-accent">
                        ₦
                        {leadData.paymentPlan.paidAmount?.toLocaleString() ??
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Remaining</p>
                      <p className="font-semibold text-destructive">
                        ₦
                        {leadData.paymentPlan.remainingAmount?.toLocaleString() ??
                          "—"}
                      </p>
                    </div>
                  </div>
                  <div className="divide-y divide-border rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-4 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                      <span>#</span>
                      <span>Due Date</span>
                      <span>Amount</span>
                      <span>Status</span>
                    </div>
                    {leadData.paymentPlan.installments.map(
                      (inst: any, idx: number) => (
                        <div
                          key={inst.id ?? idx}
                          className="grid grid-cols-4 px-3 py-2 text-sm items-center"
                        >
                          <span className="text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span>
                            {inst.dueDate
                              ? new Date(inst.dueDate).toLocaleDateString()
                              : "—"}
                          </span>
                          <span>₦{inst.amount?.toLocaleString() ?? "—"}</span>
                          <span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                inst.status === "paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : inst.status === "overdue"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {inst.status ?? "pending"}
                            </span>
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    No payment schedule linked to this lead.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right 1/3 */}
        <div className="space-y-6">
          {/* Lead Status */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lead-status">Status</Label>
                {isEditing ? (
                  <Select
                    value={leadData.status}
                    onValueChange={(value) =>
                      setLeadData({ ...leadData, status: value })
                    }
                  >
                    <SelectTrigger id="lead-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(
                        (option: {
                          value: Key | null | undefined;
                          label:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactPortal
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                        }) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={
                      (currentStatus?.color || "bg-gray-100 text-gray-800") +
                      " w-full justify-center py-2"
                    }
                  >
                    {currentStatus?.label || leadData.status || "Unknown"}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-source">Source</Label>
                {isEditing ? (
                  <Select
                    value={leadData.source}
                    onValueChange={(value) =>
                      setLeadData({ ...leadData, source: value })
                    }
                  >
                    <SelectTrigger id="lead-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map(
                        (option: {
                          value: Key | null | undefined;
                          label:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactPortal
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                        }) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {
                        sourceOptions.find(
                          (s: { value: any }) => s.value === leadData.source,
                        )?.label
                      }
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          {currentUser.role === "team_lead" && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assigned-agent">Assigned Agent</Label>
                  {isEditing ? (
                    <Select value={leadData.assignedAgent}>
                      <SelectTrigger id="assigned-agent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={currentUser.name}>Myself</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.name}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{leadData.assignedAgent}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Created Date</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {leadData.createdAt || leadData.dateReceived
                      ? new Date(
                          leadData.createdAt || leadData.dateReceived,
                        ).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {leadData.updatedAt
                      ? new Date(leadData.updatedAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - hidden for now, will be enabled later */}
        </div>
      </div>
    </div>
  );
}
