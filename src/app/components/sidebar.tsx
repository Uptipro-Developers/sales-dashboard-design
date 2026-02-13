"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  Briefcase,
  DollarSign,
  ChevronDown,
  ChevronRight,
  UserCog,
} from "lucide-react";
import { useUser } from "../contexts/user-context";
import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";
import { NavLink } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  navItems?: NavGroup[]; // Not used, we define groups below
}

export function Sidebar() {
  const { currentUser } = useUser();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Role color/label logic (update as needed)
  const roleColors = {
    AGENT: "bg-primary/10 text-primary border-primary/20",
    TEAM_LEAD: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    FREELANCER: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    ADMIN: "bg-accent/10 text-accent border-accent/20",
  };

  const roleLabels = {
    AGENT: "Agent",
    TEAM_LEAD: "Team Lead",
    FREELANCER: "Freelancer",
    ADMIN: "Admin",
  };

  // Sidebar groups as requested
  const navGroups: NavGroup[] = [
    {
      id: "sales",
      label: "Sales",
      items: [
        { id: "overview", label: "Dashboard", icon: LayoutDashboard },
        { id: "assets", label: "Assets", icon: Package },
        { id: "leads", label: "Leads", icon: Users },
        { id: "deals", label: "Deals", icon: TrendingUp },
      ],
    },
    {
      id: "management",
      label: "Management",
      items: [
        { id: "agents", label: "Agents", icon: UserCog },
        { id: "freelancers", label: "Freelancers", icon: Briefcase },
      ],
    },
    {
      id: "earnings",
      label: "Earnings",
      items: [{ id: "commission", label: "Commission", icon: DollarSign }],
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-lg">
              BO
            </span>
          </div>
          <div>
            <h1 className="font-bold text-foreground">BuyOps</h1>
            <p className="text-xs text-muted-foreground">Sales Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group, groupIndex) => {
          const isCollapsed = collapsedGroups.has(group.id);
          return (
            <div
              key={group.id}
              className={cn(
                "mb-6",
                groupIndex === navGroups.length - 1 && "mb-0",
              )}
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider group"
              >
                <span>{group.label}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </button>
              {/* Group Items */}
              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.id === "overview" ? "/" : `/${item.id}`}
                        className={({ isActive }) =>
                          cn(
                            "w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-all group/item",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0 bg-accent/10 text-accent border-accent/20"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
              {currentUser.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {currentUser.name}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs mt-0.5",
                  roleColors[currentUser.role] ||
                    "bg-accent/10 text-accent border-accent/20",
                )}
              >
                {roleLabels[currentUser.role] || currentUser.role}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5 pl-10">
            <p>ID: {currentUser.id}</p>
            <p>
              Cluster:{" "}
              {currentUser.agentProfile?.cluster?.name ||
                currentUser.freelancerProfile?.cluster?.name ||
                "N/A"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
