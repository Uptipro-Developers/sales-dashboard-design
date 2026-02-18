"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  userApi,
  agentsApi,
  clustersApi,
  leadsApi,
} from "../utils/api-service";

export type UserRole = "TEAM_LEAD" | "AGENT" | "FREELANCER";

export interface Cluster {
  id: string;
  name: string;
}

export interface CommissionSharing {
  freelancerPercentage: number; // Percentage freelancer gets (e.g., 70)
  creatorPercentage: number; // Percentage creator gets (e.g., 30)
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clusterId: string;
  creatorId?: string; // ID of the Agent/Team Lead who created this agent/freelancer
  commissionSharing?: CommissionSharing; // Only for freelancers
  performance: {
    leadsAssigned: number;
    dealsInProgress: number;
    dealsCompleted: number;
    totalCommission: number;
  };
}

export interface Notification {
  id: string;
  type:
    | "lead_assigned"
    | "deal_ready"
    | "commission"
    | "status_change"
    | "inspection_scheduled";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type LeadStatus = "new" | "contacted" | "negotiation" | "ready";
export type LeadSource = "self" | "website" | "referral" | "admin";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: LeadStatus;
  source: LeadSource;
  assetIds: string[]; // Multiple assets
  assetNames: string[]; // Asset names for display
  value: number; // Total value in Naira
  notes?: string;
  createdBy: string; // User ID who created the lead (agent, team lead, or freelancer)
  createdByName: string; // Name for display
  createdByRole: UserRole; // Role of creator
  assignedTo?: string; // User ID the lead is assigned to (optional, for team lead distribution)
  assignedToName?: string; // Name for display
  assignedDate: string;
  clusterId: string; // Which cluster this lead belongs to
  freelancerId?: string; // If created by freelancer, their ID
  freelancerName?: string; // If created by freelancer, their name
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clusterId: string;
  clusterName: string;
  avatar?: string;
  creatorId?: string; // For freelancers - ID of the Agent/Team Lead who created them
  commissionSharing?: CommissionSharing; // For freelancers
  performance: {
    leadsAssigned: number;
    dealsInProgress: number;
    dealsCompleted: number;
    thisMonthCommission: number;
    totalCommission: number;
  };
  notifications: Notification[];
}

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  teamMembers: TeamMember[];
  clusters: Cluster[];
  markNotificationAsRead: (notificationId: string) => void;
  unreadNotificationCount: number;
  leads: Lead[];
  getVisibleLeads: () => Lead[];
  assignLeadToAgent: (leadId: string, agentId: string) => void;
  addLead: (
    lead: Omit<
      Lead,
      | "id"
      | "createdBy"
      | "createdByName"
      | "createdByRole"
      | "assignedDate"
      | "clusterId"
    >,
  ) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [user, agents, clustersData, leadsData] = await Promise.all([
        userApi.getCurrent(),
        agentsApi.getAll(),
        clustersApi.getAll(),
        leadsApi.getAll(),
      ]);
      // Ensure notifications is always an array
      if (user && !user.notifications) {
        user.notifications = [];
      }
      setCurrentUser(user);
      setTeamMembers(agents);
      setClusters(clustersData);
      setLeads(leadsData);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const switchRole = async (role: UserRole) => {
    // Optionally call an API to switch role, or refetch user
    const user = await userApi.getCurrent(); // Should reflect new role
    setCurrentUser(user);
  };

  const markNotificationAsRead = (notificationId: string) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      notifications: currentUser.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    });
  };

  const unreadNotificationCount =
    currentUser?.notifications?.filter((notif) => !notif.read).length || 0;

  const getVisibleLeads = () => {
    if (!currentUser) return [];
    if (currentUser.role === "TEAM_LEAD") {
      return leads.filter((lead) => lead.clusterId === currentUser.clusterId);
    } else if (currentUser.role === "AGENT") {
      const freelancerIds = teamMembers
        .filter(
          (member) =>
            member.role === "FREELANCER" && member.creatorId === currentUser.id,
        )
        .map((member) => member.id);
      return leads.filter(
        (lead) =>
          lead.createdBy === currentUser.id ||
          lead.assignedTo === currentUser.id ||
          (lead.freelancerId && freelancerIds.includes(lead.freelancerId)),
      );
    } else if (currentUser.role === "FREELANCER") {
      return leads.filter((lead) => lead.createdBy === currentUser.id);
    }
    return [];
  };

  const assignLeadToAgent = async (leadId: string, agentId: string) => {
    await leadsApi.assign(leadId, agentId);
    setLeads(await leadsApi.getAll());
  };

  const addLead = async (
    lead: Omit<
      Lead,
      | "id"
      | "createdBy"
      | "createdByName"
      | "createdByRole"
      | "assignedDate"
      | "clusterId"
    >,
  ) => {
    await leadsApi.create(lead);
    setLeads(await leadsApi.getAll());
  };

  if (loading || !currentUser) return null;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        teamMembers,
        clusters,
        markNotificationAsRead,
        unreadNotificationCount,
        leads,
        getVisibleLeads,
        assignLeadToAgent,
        addLead,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
