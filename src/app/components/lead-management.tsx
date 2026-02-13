"use client";

import { useEffect, useState } from "react";
import { leadsApi, assetsApi } from "../utils/api-service";
import { Plus, Eye, Mail, Phone, Calendar, UserPlus, X } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useUser } from "../contexts/user-context";
import { LeadDetailView } from "./lead-detail-view";

const statusLabels: Record<string, string> = {
  new: "New Lead",
  contacted: "Contacted",
  negotiation: "In Negotiation",
  ready: "Ready to Buy",
};

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  contacted: "bg-warning/10 text-warning border-warning/20",
  negotiation: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ready: "bg-accent/10 text-accent border-accent/20",
};

const sourceColors: Record<string, string> = {
  self: "bg-green-500/10 text-green-500 border-green-500/20",
  website: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  referral: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export function LeadManagement() {
  const { currentUser, teamMembers } = useUser();
  const [leads, setLeads] = useState<any[]>([]);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");
  const [newLeadData, setNewLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "self",
    assetInterests: [] as string[],
    budget: "",
    notes: "",
    followUpDate: "",
    assignTo: "",
  });
  useEffect(() => {
    setLoading(true);
    Promise.all([leadsApi.getAll(), assetsApi.getAll()])
      .then(([leadsData, assetsData]) => {
        setLeads(leadsData);
        setAvailableAssets(assetsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateLead = async () => {
    const assignedToId =
      newLeadData.assignTo === "myself"
        ? currentUser?.id
        : newLeadData.assignTo;
    await leadsApi.create({
      ...newLeadData,
      assignedToId: assignedToId || undefined,
      assetInterest: newLeadData.assetInterests[0] || undefined,
      leadSource: newLeadData.source,
    });
    setIsCreateModalOpen(false);
    setNewLeadData({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "self",
      assetInterests: [],
      budget: "",
      notes: "",
      followUpDate: "",
      assignTo: "",
    });
    setLeads(await leadsApi.getAll());
  };

  const handleAddAsset = (assetId: string) => {
    if (!newLeadData.assetInterests.includes(assetId)) {
      setNewLeadData({
        ...newLeadData,
        assetInterests: [...newLeadData.assetInterests, assetId],
      });
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    setNewLeadData({
      ...newLeadData,
      assetInterests: newLeadData.assetInterests.filter((id) => id !== assetId),
    });
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    await leadsApi.update(leadId, { status: newStatus });
    setLeads(await leadsApi.getAll());
  };

  const handleAssignLead = async (leadId: string, agentId: string) => {
    await leadsApi.assign(leadId, agentId);
    setIsAssignModalOpen(false);
    setSelectedLead(null);
    setSelectedAgent("");
    setLeads(await leadsApi.getAll());
  };

  const handleViewDetails = (leadId: string) => setSelectedLeadId(leadId);
  const handleBackToList = () => setSelectedLeadId(null);

  if (loading) return <div>Loading leads...</div>;
  if (selectedLeadId)
    return <LeadDetailView leadId={selectedLeadId} onBack={handleBackToList} />;

  // Filtering logic
  const visibleLeads = leads ?? [];
  const getFilteredLeads = () => {
    if (!currentUser) return visibleLeads;
    if (currentUser.role === "team_lead") {
      switch (activeTab) {
        case "personal":
          return visibleLeads.filter(
            (lead) => lead.createdBy?.id === currentUser.id,
          );
        case "admin_pool":
          return visibleLeads.filter((lead) => lead.source === "admin");
        case "team_pipeline":
          return visibleLeads.filter(
            (lead) =>
              lead.createdBy?.id !== currentUser.id && lead.source !== "admin",
          );
        case "assigned":
          return visibleLeads.filter(
            (lead) => lead.assignedTo?.id === currentUser.id,
          );
        case "freelancer":
          return visibleLeads.filter((lead) => lead.freelancerId);
        case "all":
        default:
          return visibleLeads;
      }
    } else if (currentUser.role === "sales_agent") {
      const freelancerIds = (teamMembers ?? [])
        .filter(
          (member) =>
            member.role === "freelancer" && member.creatorId === currentUser.id,
        )
        .map((member) => member.id);
      switch (activeTab) {
        case "personal":
          return visibleLeads.filter(
            (lead) => lead.createdBy?.id === currentUser.id,
          );
        case "assigned":
          return visibleLeads.filter(
            (lead) =>
              lead.assignedTo?.id === currentUser.id &&
              lead.createdBy?.id !== currentUser.id,
          );
        case "freelancer":
          return visibleLeads.filter(
            (lead) =>
              lead.freelancerId && freelancerIds.includes(lead.freelancerId),
          );
        case "all":
        default:
          return visibleLeads;
      }
    }
    return visibleLeads;
  };

  const filteredLeads = getFilteredLeads();

  // Tab counts
  const personalCount = visibleLeads.filter(
    (lead) => lead.createdBy?.id === currentUser?.id,
  ).length;
  const adminPoolCount = visibleLeads.filter(
    (lead) => lead.source === "admin",
  ).length;
  const teamPipelineCount = visibleLeads.filter(
    (lead) => lead.createdBy?.id !== currentUser?.id && lead.source !== "admin",
  ).length;
  const assignedCount = visibleLeads.filter(
    (lead) => lead.assignedTo?.id === currentUser?.id,
  ).length;
  const freelancerCount = visibleLeads.filter(
    (lead) => lead.freelancerId,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Lead Management</h1>
          <p className="text-muted-foreground">
            {currentUser?.role === "team_lead"
              ? "Manage personal leads, admin pool, and team pipeline"
              : "Create and manage your sales leads"}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Lead</DialogTitle>
                <DialogDescription>
                  Add a new lead to your pipeline
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={newLeadData.name}
                      onChange={(e) =>
                        setNewLeadData({ ...newLeadData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@email.com"
                      value={newLeadData.email}
                      onChange={(e) =>
                        setNewLeadData({
                          ...newLeadData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={newLeadData.phone}
                      onChange={(e) =>
                        setNewLeadData({
                          ...newLeadData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Lead Source</Label>
                    <Select
                      value={newLeadData.source}
                      onValueChange={(value) =>
                        setNewLeadData({ ...newLeadData, source: value })
                      }
                    >
                      <SelectTrigger id="source">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self Generated</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="admin">Admin Pool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {currentUser?.role === "team_lead" && (
                  <div className="space-y-2">
                    <Label htmlFor="assign-agent">
                      Assign to Agent (Optional)
                    </Label>
                    <Select
                      value={newLeadData.assignTo}
                      onValueChange={(value) =>
                        setNewLeadData({ ...newLeadData, assignTo: value })
                      }
                    >
                      <SelectTrigger id="assign-agent">
                        <SelectValue placeholder="Keep for myself or assign to team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="myself">Myself</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Link to Assets (Multiple Selection)</Label>
                  <Select onValueChange={handleAddAsset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assets to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssets
                        .filter(
                          (asset) =>
                            !newLeadData.assetInterests.includes(asset.id),
                        )
                        .map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.id} - {asset.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {newLeadData.assetInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newLeadData.assetInterests.map((assetId) => {
                        const asset = availableAssets.find(
                          (a) => a.id === assetId,
                        );
                        return (
                          <Badge
                            key={assetId}
                            variant="outline"
                            className="bg-primary/10 text-primary"
                          >
                            {assetId} - {asset?.name}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 h-auto p-0 text-primary hover:text-destructive"
                              onClick={() => handleRemoveAsset(assetId)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow-up-date">Follow-up Date</Label>
                  <Input
                    id="follow-up-date"
                    type="date"
                    value={newLeadData.followUpDate}
                    onChange={(e) =>
                      setNewLeadData({
                        ...newLeadData,
                        followUpDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any relevant information..."
                    rows={3}
                    value={newLeadData.notes}
                    onChange={(e) =>
                      setNewLeadData({ ...newLeadData, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateLead}>Create Lead</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for filtering leads */}
      <Card>
        <CardContent className="p-0">
          <div className="flex overflow-x-auto border-b border-border scrollbar-hide">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-shrink-0 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                <span>All Leads</span>
                <Badge variant="outline" className="bg-muted">
                  {visibleLeads.length}
                </Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex-shrink-0 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors ${
                activeTab === "personal"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                <span className="hidden sm:inline">My Personal Leads</span>
                <span className="sm:hidden">Personal</span>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500"
                >
                  {personalCount}
                </Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("admin_pool")}
              className={`flex-shrink-0 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors ${
                activeTab === "admin_pool"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                <span>Admin Pool</span>
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 text-purple-500"
                >
                  {adminPoolCount}
                </Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("team_pipeline")}
              className={`flex-shrink-0 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors ${
                activeTab === "team_pipeline"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                <span className="hidden sm:inline">Team Pipeline</span>
                <span className="sm:hidden">Team</span>
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-500"
                >
                  {teamPipelineCount}
                </Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("assigned")}
              className={`flex-shrink-0 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors ${
                activeTab === "assigned"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                <span className="hidden sm:inline">Assigned to Me</span>
                <span className="sm:hidden">Assigned</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {assignedCount}
                </Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("freelancer")}
              className={`flex-shrink-0 px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium transition-colors ${
                activeTab === "freelancer"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                <span className="hidden sm:inline">Freelancer Leads</span>
                <span className="sm:hidden">Freelancer</span>
                <Badge
                  variant="outline"
                  className="bg-orange-500/10 text-orange-500"
                >
                  {freelancerCount}
                </Badge>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Lead List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{lead.name}</h3>
                    <Badge variant="outline">{lead.id}</Badge>
                    <Badge className={statusColors[lead.status]}>
                      {statusLabels[lead.status]}
                    </Badge>
                    <Badge
                      className={sourceColors[lead.source]}
                      variant="outline"
                    >
                      {lead.source}
                    </Badge>
                    {lead.freelancerName && (
                      <Badge
                        variant="outline"
                        className="bg-orange-500/10 text-orange-500"
                      >
                        via {lead.freelancerName}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {lead.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Assigned: {lead.assignedDate}
                    </div>
                  </div>
                  {lead.company && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {lead.company}
                    </p>
                  )}
                </div>
                {currentUser?.role === "team_lead" && !lead.assignedTo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsAssignModalOpen(true);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign
                  </Button>
                )}
              </div>

              <div className="bg-muted/30 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Linked Assets
                    </p>
                    {lead.asset?.name && (
                      <p className="font-medium">{lead.asset.name}</p>
                    )}
                    {lead.asset?.id && (
                      <div className="flex gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {lead.asset.id}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold text-lg text-accent">
                      ₦{lead.budget ? lead.budget.toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {lead.notes && (
                  <p className="text-sm text-muted-foreground">{lead.notes}</p>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {currentUser?.role === "team_lead" && lead.assignedToName && (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-500"
                    >
                      Assigned to: {lead.assignedToName}
                    </Badge>
                  )}
                  {lead.createdByName &&
                    lead.createdByName !== currentUser?.name && (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500"
                      >
                        Created by: {lead.createdByName}
                      </Badge>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(lead.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {currentUser?.role === "sales_agent" && (
                    <Select
                      value={lead.status}
                      onValueChange={(value) =>
                        handleStatusChange(lead.id, value)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="ready">Ready to Buy</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {currentUser?.role === "team_lead" && (
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {statusLabels[lead.status]}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Lead Modal (Team Lead Only) */}
      {currentUser?.role === "team_lead" && (
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Lead to Agent</DialogTitle>
              <DialogDescription>
                Select an agent to assign this lead to
              </DialogDescription>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium">{selectedLead.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedLead.asset}
                  </p>
                  <p className="text-sm text-accent font-semibold">
                    {selectedLead.value}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-select">Select Agent</Label>
                  <Select
                    value={selectedAgent}
                    onValueChange={setSelectedAgent}
                  >
                    <SelectTrigger id="agent-select">
                      <SelectValue placeholder="Choose an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {(teamMembers ?? []).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} • {member.performance.leadsAssigned}{" "}
                          leads • {member.performance.dealsInProgress} active
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAssignModalOpen(false);
                      setSelectedLead(null);
                      setSelectedAgent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      selectedLead &&
                      handleAssignLead(selectedLead.id, selectedAgent)
                    }
                    disabled={!selectedAgent}
                  >
                    Assign Lead
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
