"use client";

import { useEffect, useState } from "react";
import { Plus, Mail, Briefcase, Trash2, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";
import { cn } from "./ui/utils";
import { freelancersApi, clustersApi, userApi } from "../utils/api-service";
import { useToast } from "../contexts/toast-context";

export function FreelancerManagement() {
  const { success, error } = useToast();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAddFreelancerModalOpen, setIsAddFreelancerModalOpen] =
    useState(false);
  const [newFreelancerData, setNewFreelancerData] = useState({
    name: "",
    email: "",
    password: "",
    clusterId: "",
    freelancerPercentage: 70,
    creatorPercentage: 30,
    role: "FREELANCER",
  });

  useEffect(() => {
    async function fetchData() {
      const [freelancers, clusters, user] = await Promise.all([
        freelancersApi.getAll(),
        clustersApi.getAll(),
        userApi.getCurrent(),
      ]);
      setFreelancers(freelancers);
      setClusters(clusters);
      setCurrentUser(user);
      setNewFreelancerData((prev) => ({
        ...prev,
        clusterId: user?.clusterId || "",
      }));
    }
    fetchData();
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Get freelancers created by the current user
  const myFreelancers = freelancers.filter(
    (m) => m.role === "FREELANCER" && m.creatorId === currentUser?.id,
  );

  // For Agents: get all freelancers in their cluster
  const clusterFreelancers =
    currentUser?.role === "AGENT"
      ? freelancers.filter(
          (m) =>
            m.role === "FREELANCER" && m.clusterId === currentUser.clusterId,
        )
      : [];

  const handleAddFreelancer = async () => {
    try {
      await freelancersApi.create({
        ...newFreelancerData,
        creatorId: currentUser.id,
        // Auto-inherit cluster for agents (Issue 22)
        clusterId:
          currentUser?.role === "AGENT"
            ? currentUser.clusterId
            : newFreelancerData.clusterId,
      });
      setIsAddFreelancerModalOpen(false);
      setNewFreelancerData({
        name: "",
        email: "",
        password: "",
        clusterId: currentUser.clusterId,
        freelancerPercentage: 70,
        creatorPercentage: 30,
      });
      setFreelancers(await freelancersApi.getAll());
      success(
        "Freelancer created successfully",
        `${newFreelancerData.name} has been added to your team`,
      );
    } catch (err: any) {
      error(
        "Failed to create freelancer",
        err.response?.data?.message || err.message || "An error occurred",
      );
    }
  };

  const handleRemoveFreelancer = async (freelancerId: string) => {
    try {
      await freelancersApi.remove(freelancerId);
      setFreelancers(await freelancersApi.getAll());
      success("Freelancer removed successfully");
    } catch (err: any) {
      error(
        "Failed to remove freelancer",
        err.response?.data?.message || err.message || "An error occurred",
      );
    }
  };

  const currentCluster = clusters.find((c) => c.id === currentUser?.clusterId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Freelancer Management</h1>
          <p className="text-muted-foreground">
            Manage freelancers you've created • Default Cluster:{" "}
            {currentCluster?.name}
          </p>
        </div>
        <Dialog
          open={isAddFreelancerModalOpen}
          onOpenChange={setIsAddFreelancerModalOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Freelancer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Freelancer</DialogTitle>
              <DialogDescription>
                Create a new freelancer account with commission sharing
                agreement
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="freelancer-name">Full Name</Label>
                <Input
                  id="freelancer-name"
                  placeholder="John Doe"
                  value={newFreelancerData.name}
                  onChange={(e) =>
                    setNewFreelancerData({
                      ...newFreelancerData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freelancer-email">Email Address</Label>
                <Input
                  id="freelancer-email"
                  type="email"
                  placeholder="john.doe@buyops.com"
                  value={newFreelancerData.email}
                  onChange={(e) =>
                    setNewFreelancerData({
                      ...newFreelancerData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freelancer-password">Password</Label>
                <Input
                  id="freelancer-password"
                  type="password"
                  placeholder="Enter password"
                  value={newFreelancerData.password}
                  onChange={(e) =>
                    setNewFreelancerData({
                      ...newFreelancerData,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              {/* Commission Sharing Configuration */}
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Commission Sharing Agreement
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="freelancer-percentage">
                      Freelancer's Commission Share (%)
                    </Label>
                    <Input
                      id="freelancer-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newFreelancerData.freelancerPercentage}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Allow empty string for editing
                        if (inputValue === "") {
                          setNewFreelancerData({
                            ...newFreelancerData,
                            freelancerPercentage: 0,
                            creatorPercentage: 100,
                          });
                          return;
                        }
                        const value = parseInt(inputValue) || 0;
                        setNewFreelancerData({
                          ...newFreelancerData,
                          freelancerPercentage: Math.min(
                            100,
                            Math.max(0, value),
                          ),
                          creatorPercentage:
                            100 - Math.min(100, Math.max(0, value)),
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creator-percentage">
                      Your Commission Share (%)
                    </Label>
                    <Input
                      id="creator-percentage"
                      type="number"
                      disabled
                      value={newFreelancerData.creatorPercentage}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total must equal 100%. Adjust the freelancer's percentage
                    and yours will auto-calculate.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  <strong>Note:</strong> The freelancer will receive an
                  invitation email with login credentials. They can create leads
                  and close deals, with commissions automatically split based on
                  the agreement above.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddFreelancerModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFreelancer}
                  disabled={
                    !newFreelancerData.name ||
                    !newFreelancerData.email ||
                    newFreelancerData.freelancerPercentage +
                      newFreelancerData.creatorPercentage !==
                      100
                  }
                >
                  Create Freelancer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Freelancers */}
      <Card>
        <CardHeader>
          <CardTitle>My Freelancers ({myFreelancers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {myFreelancers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>You haven't created any freelancers yet.</p>
              <p className="text-sm">Click "Add Freelancer" to get started.</p>
            </div>
          ) : (
            myFreelancers.map((freelancer) => (
              <div
                key={freelancer.id}
                className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{freelancer.name}</h3>
                      <Badge
                        variant="outline"
                        className="bg-orange-500/10 text-orange-500 border-orange-500/20"
                      >
                        Freelancer
                      </Badge>
                      <Badge variant="outline">
                        {clusters.find((c) => c.id === freelancer.clusterId)
                          ?.name ?? "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="w-4 h-4" />
                      {freelancer.email}
                    </div>
                    {freelancer.commissionSharing && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Percent className="w-3 h-3 text-accent" />
                          <span className="text-muted-foreground">
                            Commission Split:
                          </span>
                          <span className="font-medium text-accent">
                            {freelancer.commissionSharing
                              .freelancerPercentage ?? 0}
                            % /{" "}
                            {freelancer.commissionSharing.creatorPercentage ??
                              0}
                            %
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Freelancer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {freelancer.name}?
                          This action cannot be undone and will deactivate their
                          account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => handleRemoveFreelancer(freelancer.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Cluster Freelancers (Team Leads Only) */}
      {currentUser.role === "AGENT" && (
        <Card>
          <CardHeader>
            <CardTitle>
              All Cluster Freelancers ({clusterFreelancers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clusterFreelancers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No freelancers in this cluster yet.</p>
              </div>
            ) : (
              clusterFreelancers.map((freelancer) => {
                const creator = teamMembers.find(
                  (m) => m.id === freelancer.creatorId,
                );
                const isMyFreelancer = freelancer.creatorId === currentUser.id;

                return (
                  <div
                    key={freelancer.id}
                    className={cn(
                      "flex items-start justify-between p-4 border border-border rounded-lg transition-colors",
                      isMyFreelancer && "bg-accent/5 hover:bg-accent/10",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{freelancer.name}</h3>
                          <Badge
                            variant="outline"
                            className="bg-orange-500/10 text-orange-500 border-orange-500/20"
                          >
                            Freelancer
                          </Badge>
                          {isMyFreelancer && (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary"
                            >
                              Created by you
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Mail className="w-4 h-4" />
                          {freelancer.email}
                        </div>
                        {creator && (
                          <div className="text-sm text-muted-foreground mb-1">
                            Created by:{" "}
                            <span className="font-medium">{creator.name}</span>
                          </div>
                        )}
                        {freelancer.commissionSharing && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Percent className="w-3 h-3 text-accent" />
                              <span className="text-muted-foreground">
                                Commission Split:
                              </span>
                              <span className="font-medium text-accent">
                                {freelancer.commissionSharing
                                  .freelancerPercentage ?? 0}
                                % /{" "}
                                {freelancer.commissionSharing
                                  .creatorPercentage ?? 0}
                                %
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Performance Stats */}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Leads:{" "}
                            </span>
                            <span className="font-medium">
                              {freelancer.performance?.leadsAssigned ?? 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              In Progress:{" "}
                            </span>
                            <span className="font-medium">
                              {freelancer.performance?.dealsInProgress ?? 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Completed:{" "}
                            </span>
                            <span className="font-medium">
                              {freelancer.performance?.dealsCompleted ?? 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Commission:{" "}
                            </span>
                            <span className="font-medium text-accent">
                              ₦
                              {freelancer.performance?.totalCommission
                                ? freelancer.performance.totalCommission.toLocaleString()
                                : "0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
