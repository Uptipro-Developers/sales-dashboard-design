"use client";

import { Bell, User, Users2, ChevronDown, Briefcase, ChevronRight, Home, Plus, Search } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useUser } from "../contexts/user-context";
import { cn } from "./ui/utils";
import { useLocation, useNavigate } from "react-router-dom";

interface TopBarProps {
  onNavigate?: (view: string) => void;
  activeView?: string;
  onLogout?: () => void;
}

export function TopBar({ onNavigate, activeView = "overview", onLogout }: TopBarProps) {
  const { currentUser, switchRole, markNotificationAsRead, unreadNotificationCount } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const roleLabels = {
    TEAM_LEAD: "Team Lead",
    AGENT: "Agent",
    FREELANCER: "Freelancer",
  };

  const roleColors = {
    TEAM_LEAD: "bg-primary/10 text-primary border-primary/20",
    AGENT: "bg-accent/10 text-accent border-accent/20",
    FREELANCER: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  // Map pathnames to breadcrumb info
  const breadcrumbMap: Record<string, { section: string; page: string }> = {
    "/": { section: "Sales", page: "Dashboard" },
    "/overview": { section: "Sales", page: "Dashboard" },
    "/assets": { section: "Sales", page: "Assets" },
    "/leads": { section: "Sales", page: "Leads" },
    "/deals": { section: "Sales", page: "Deals" },
    "/agents": { section: "Management", page: "My Team" },
    "/freelancers": { section: "Management", page: "Freelancers" },
    "/commission": { section: "Earnings", page: "Commission" },
    "/profile": { section: "Settings", page: "Profile" },
    "/performance": { section: "Analytics", page: "Performance" },
    "/help": { section: "Support", page: "Help & Support" },
  };

  // Find the current breadcrumb based on the path
  const currentBreadcrumb =
    breadcrumbMap[location.pathname] || { section: "Sales", page: "Dashboard" };

  // Quick actions based on current page
  const getQuickActions = () => {
    switch (location.pathname) {
      case "/leads":
        return (
          <Button size="sm" className="gap-2" onClick={() => {/* Lead creation handled in page */}}>
            <Plus className="w-4 h-4" />
            New Lead
          </Button>
        );
      case "/agents":
        return currentUser.role === "TEAM_LEAD" ? (
          <Button size="sm" className="gap-2" onClick={() => {/* Agent creation handled in page */}}>
            <Plus className="w-4 h-4" />
            Add Agent
          </Button>
        ) : null;
      case "/freelancers":
        return currentUser.role !== "FREELANCER" ? (
          <Button size="sm" className="gap-2" onClick={() => {/* Freelancer creation handled in page */}}>
            <Plus className="w-4 h-4" />
            Add Freelancer
          </Button>
        ) : null;
      default:
        return null;
    }
  };

  const performance = currentUser?.performance || { thisMonthCommission: 0, totalCommission: 0 };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-accent transition-colors p-1 rounded hover:bg-accent/10"
            title="Go to Dashboard"
          >
            <Home className="w-4 h-4" />
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className="text-muted-foreground text-xs">{currentBreadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className="font-semibold text-foreground">{currentBreadcrumb.page}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Commission Summary */}
        <div className="flex items-center gap-3 px-3 py-1.5 bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 rounded-lg">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="font-bold text-accent text-sm">
              ₦{performance.thisMonthCommission?.toLocaleString?.() ?? "0"}
            </p>
          </div>
          <div className="w-px h-8 bg-accent/20" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="font-semibold text-foreground text-sm">
              ₦{performance.totalCommission?.toLocaleString?.() ?? "0"}
            </p>
          </div>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-semibold shadow-sm">
                  {unreadNotificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadNotificationCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadNotificationCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currentUser.notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {currentUser.notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={cn(
                      "flex flex-col items-start py-3 cursor-pointer",
                      !notif.read && "bg-accent/5 border-l-2 border-accent"
                    )}
                    onClick={() => markNotificationAsRead(notif.id)}
                  >
                    <p className={cn("font-medium text-sm", !notif.read && "text-accent")}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{notif.timestamp}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-medium">{currentUser.name}</p>
                <Badge variant="outline" className={cn("text-xs", roleColors[currentUser.role])}>
                  {roleLabels[currentUser.role]}
                </Badge>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/performance")}>
              Performance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/help")}>
              Help & Support
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Switch Role (Demo)
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => switchRole("AGENT")}> 
              <User className="w-4 h-4 mr-2" />
              Agent View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole("TEAM_LEAD")}> 
              <Users2 className="w-4 h-4 mr-2" />
              Team Lead View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole("FREELANCER")}> 
              <Briefcase className="w-4 h-4 mr-2" />
              Freelancer View
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}