"use client";

import { useEffect, useState } from "react";
import { agentsApi, clustersApi, userApi } from "../utils/api-service";
import { Plus, Mail, User, Shield, Trash2, Edit, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import { useUser } from "../contexts/user-context";
import { TeamDetailView } from "./team-detail-view";

export function AgentManagement() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isEditAgentModalOpen, setIsEditAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [newAgentData, setNewAgentData] = useState({
    name: "",
    email: "",
    role: "AGENT",
    clusterId: currentUser?.clusterId,
  });
  const [editAgentData, setEditAgentData] = useState({
    name: "",
    email: "",
    role: "AGENT",
    clusterId: "",
  });

  useEffect(() => {
    async function fetchData() {
      const [agents, clusters, user] = await Promise.all([
        agentsApi.getAll(),
        clustersApi.getAll(),
        userApi.getCurrent(),
      ]);
      setTeamMembers(agents);
      setClusters(clusters);
      setCurrentUser(user);
    }
    fetchData();
  }, []);

  const handleAddAgent = async () => {
    await agentsApi.create(newAgentData);
    setIsAddAgentModalOpen(false);
    setNewAgentData({
      name: "",
      email: "",
      role: "AGENT",
      clusterId: currentUser?.clusterId,
    });
    setTeamMembers(await agentsApi.getAll());
  };

  const handleEditAgent = (agent: any) => {
    setEditingAgent(agent);
    setEditAgentData({
      name: agent.name,
      email: agent.email,
      role: agent.role,
      clusterId: agent.clusterId,
    });
    setIsEditAgentModalOpen(true);
  };

  const handleSaveEdit = async () => {
    await agentsApi.update(editingAgent.id, editAgentData);
    setIsEditAgentModalOpen(false);
    setEditingAgent(null);
    setTeamMembers(await agentsApi.getAll());
  };

  const handleRemoveAgent = async (agentId: string) => {
    await agentsApi.remove(agentId);
    setTeamMembers(await agentsApi.getAll());
  };

  const handleViewDetails = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  const handleBackToList = () => {
    setSelectedMemberId(null);
  };

  const currentCluster = clusters.find((c) => c.id === currentUser?.clusterId);

  // If viewing team member details
  if (selectedMemberId) {
    return (
      <TeamDetailView memberId={selectedMemberId} onBack={handleBackToList} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Agent Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles • Default Cluster:{" "}
            {currentCluster?.name}
          </p>
        </div>
        {currentUser?.role === "TEAM_LEAD" && (
          <Dialog
            open={isAddAgentModalOpen}
            onOpenChange={setIsAddAgentModalOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Agent</DialogTitle>
                <DialogDescription>
                  Create a new sales agent account for your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Full Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="John Doe"
                    value={newAgentData.name}
                    onChange={(e) =>
                      setNewAgentData({ ...newAgentData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-email">Email Address</Label>
                  <Input
                    id="agent-email"
                    type="email"
                    placeholder="john.doe@buyops.com"
                    value={newAgentData.email}
                    onChange={(e) =>
                      setNewAgentData({
                        ...newAgentData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agent-role">Role</Label>
                  <Select
                    value={newAgentData.role}
                    onValueChange={(value) =>
                      setNewAgentData({ ...newAgentData, role: value })
                    }
                  >
                    <SelectTrigger id="agent-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AGENT">Sales Agent</SelectItem>
                      <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    <strong>Note:</strong> The agent will receive an invitation
                    email with login credentials and onboarding instructions.
                    Default cluster is set to your cluster (
                    {currentCluster?.name}
                    ).
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddAgentModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAgent}
                    disabled={!newAgentData.name || !newAgentData.email}
                  >
                    Create Agent
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <Badge
                        variant="outline"
                        className="bg-accent/10 text-accent border-accent/20"
                      >
                        {member.user?.role === "TEAM_LEAD"
                          ? "Team Lead"
                          : member.user?.role === "AGENT"
                            ? "Sales Agent"
                            : member.role === "TEAM_LEAD"
                              ? "Team Lead"
                              : "Sales Agent"}
                      </Badge>
                      <Badge variant="outline">
                        {clusters.find((c) => c.id === member.clusterId)?.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAgent(member)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Agent</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.name} from
                          your team? This action cannot be undone and will
                          deactivate their account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveAgent(member.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove Agent
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Leads Assigned
                  </p>
                  <p className="text-xl font-semibold">
                    {(member.activeDeals ?? 0) + (member.closedDeals ?? 0)}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    In Progress
                  </p>
                  <p className="text-xl font-semibold">
                    {member.activeDeals ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Completed
                  </p>
                  <p className="text-xl font-semibold text-accent">
                    {member.closedDeals ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Commission
                  </p>
                  <p className="text-xl font-semibold text-accent">
                    ₦{(member.totalCommission ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(member.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Agent Modal */}
      <Dialog
        open={isEditAgentModalOpen}
        onOpenChange={setIsEditAgentModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-agent-name">Full Name</Label>
              <Input
                id="edit-agent-name"
                value={editAgentData.name}
                onChange={(e) =>
                  setEditAgentData({ ...editAgentData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-agent-email">Email Address</Label>
              <Input
                id="edit-agent-email"
                type="email"
                value={editAgentData.email}
                onChange={(e) =>
                  setEditAgentData({ ...editAgentData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-agent-role">Role</Label>
              <Select
                value={editAgentData.role}
                onValueChange={(value) =>
                  setEditAgentData({ ...editAgentData, role: value })
                }
              >
                <SelectTrigger id="edit-agent-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">Sales Agent</SelectItem>
                  <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-agent-cluster">Cluster</Label>
              <Select
                value={editAgentData.clusterId}
                onValueChange={(value) =>
                  setEditAgentData({ ...editAgentData, clusterId: value })
                }
              >
                <SelectTrigger id="edit-agent-cluster">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clusters.map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.id}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditAgentModalOpen(false);
                  setEditingAgent(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Stats */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Team Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Agents</p>
              <p className="text-2xl font-semibold">{teamMembers.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Deals Completed
              </p>
              <p className="text-2xl font-semibold text-accent">
                {teamMembers.reduce((sum, m) => sum + m.closedDeals, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Team Commission
              </p>
              <p className="text-2xl font-semibold text-accent">
                ₦
                {teamMembers
                  .reduce((sum, m) => sum + (m.totalCommission ?? 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
