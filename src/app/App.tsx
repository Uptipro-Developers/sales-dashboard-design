"use client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  UserCog,
  Briefcase,
  Receipt,
  Settings,
  HelpCircle,
} from "lucide-react";

// Import components
import { DashboardOverview } from "./components/dashboard-overview";
import { AssetBrowser } from "./components/asset-browser";
import { LeadManagement } from "./components/lead-management";
import { DealProgress } from "./components/deal-progress";
import { CommissionPreview } from "./components/commission-preview";
import { AgentManagement } from "./components/agent-management";
import { FreelancerManagement } from "./components/freelancer-management";
import { ProfileSettings } from "./components/profile-settings";
import { Performance } from "./components/performance";
import { HelpSupport } from "./components/help-support";
import { PaymentCallback } from "./components/payment-callback";
import { Login } from "./components/login";
import { Signup, SignupData } from "./components/signup";
import { Sidebar } from "./components/sidebar";
import { TopBar } from "./components/top-bar";
import { UserProvider, useUser, User, UserRole } from "./contexts/user-context";
import { ToastProvider } from "./contexts/toast-context";
import { authApi, signupApi } from "./utils/api-service";
import { ThemeProvider } from "./components/theme-provider";
import { NairaSign } from "./components/NairaSign";

type NavItem =
  | "overview"
  | "assets"
  | "leads"
  | "deals"
  | "commission"
  | "agents"
  | "freelancers"
  | "profile"
  | "performance"
  | "help";

export type NavGroup = {
  id: string;
  label: string;
  items: {
    id: NavItem;
    label: string;
    icon: any;
    badge?: string;
  }[];
};

function AppContent({ onLogout }: { onLogout: () => void }) {
  const { currentUser } = useUser();

  // Define navItems for the Sidebar
  const allNavItems: NavGroup[] = [
    {
      id: "main",
      label: "Main",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "assets", label: "Assets", icon: Package },
        { id: "leads", label: "Leads", icon: Users },
        { id: "deals", label: "Deals", icon: TrendingUp },
        { id: "commission", label: "Commission", icon: NairaSign },
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
      id: "settings",
      label: "Settings",
      items: [
        { id: "profile", label: "Profile", icon: Settings },
        { id: "performance", label: "Performance", icon: Receipt },
        { id: "help", label: "Help & Support", icon: HelpCircle },
      ],
    },
  ];

  // Filter navItems based on user role
  const navItems: NavGroup[] = allNavItems
    .map((group) => {
      // Hide entire management group for freelancers (Issue 27)
      if (group.id === "management" && currentUser?.role === "FREELANCER") {
        return null;
      }

      // Filter items within management group
      if (group.id === "management") {
        const filteredItems = group.items.filter((item) => {
          // Hide agents module from agents (Issue 20) - only team leads and admins can create agents
          if (item.id === "agents" && currentUser?.role === "AGENT") {
            return false;
          }
          return true;
        });

        // If no items remain, hide the group
        if (filteredItems.length === 0) {
          return null;
        }

        return { ...group, items: filteredItems };
      }

      return group;
    })
    .filter((group): group is NavGroup => group !== null);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar navItems={navItems ?? []} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="assets" element={<AssetBrowser />} />
            <Route path="leads" element={<LeadManagement />} />
            <Route path="deals" element={<DealProgress />} />
            <Route path="commission" element={<CommissionPreview />} />
            <Route path="agents" element={<AgentManagement />} />
            <Route path="freelancers" element={<FreelancerManagement />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="performance" element={<Performance />} />
            <Route path="help" element={<HelpSupport />} />
            <Route path="payments/callback" element={<PaymentCallback />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("access_token");
  });
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem("access_token", res.access_token);
      if (res.refresh_token) {
        localStorage.setItem("refresh_token", res.refresh_token);
      }
      setIsAuthenticated(true);
      navigate("/", { replace: true });
    } catch (err) {
      throw err;
    }
  };

  const handleSignup = async (userData: SignupData) => {
    try {
      const res = await signupApi.register(userData);
      if (res?.access_token) {
        localStorage.setItem("access_token", res.access_token);
      }
      if (res?.refresh_token) {
        localStorage.setItem("refresh_token", res.refresh_token);
      }
      setIsAuthenticated(true);
      navigate("/", { replace: true });
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("remember_me");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login
              onLogin={handleLogin}
              onSwitchToSignup={() => navigate("/signup")}
            />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Signup
              onSignup={handleSignup}
              onSwitchToLogin={() => navigate("/login")}
            />
          )
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <AppContent onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <ToastProvider>
          <UserProvider>
            <AppRouter />
          </UserProvider>
        </ToastProvider>
      </Router>
    </ThemeProvider>
  );
}
