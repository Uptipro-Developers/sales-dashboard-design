"use client";

import { useState } from "react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  MapPin, 
  Building,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  UserCog,
  Briefcase,
  Users
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";
import { UserRole } from "../contexts/user-context";
import { signupApi } from "../utils/api-service";

interface SignupProps {
  onSignup: (userData: SignupData) => void;
  onSwitchToLogin: () => void;
}

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  cluster: string;
  state: string;
  city: string;
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<SignupData>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "sales_agent",
    cluster: "",
    state: "",
    city: ""
  });
  
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof SignupData | "confirmPassword", string>>>({});

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", 
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", 
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT"
  ];

  const clusters = [
    "Downtown Cluster",
    "West Side Cluster",
    "Tech Park Cluster",
    "Industrial Zone Cluster",
    "Business District Cluster"
  ];

  const roleOptions = [
    {
      value: "team_lead" as UserRole,
      label: "Team Lead",
      description: "Supervise agents and sell personally",
      icon: UserCog,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      value: "sales_agent" as UserRole,
      label: "Sales Agent",
      description: "Generate leads and close deals",
      icon: Briefcase,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      value: "freelancer" as UserRole,
      label: "Freelancer",
      description: "Independent sales partner",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    }
  ];

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof SignupData | "confirmPassword", string>> = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof SignupData, string>> = {};
    
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+234|0)[789]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Invalid Nigerian phone number";
    }
    
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Partial<Record<keyof SignupData, string>> = {};
    
    if (!formData.cluster) {
      newErrors.cluster = "Cluster is required";
    }
    
    if (!formData.state) {
      newErrors.state = "State is required";
    }
    
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep3()) {
      await signupApi.register(formData);
      // Optionally call onSignup or redirect
    }
  };

  const updateFormData = (field: keyof SignupData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
            <span className="text-2xl font-bold text-white">BO</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">
            Join BuyOps Sales Dashboard
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "w-12 h-1 rounded-full transition-all",
                    step > s ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Signup Card */}
        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Account Credentials */}
            {step === 1 && (
              <>
                <div className="text-center mb-6">
                  <h2 className="font-semibold text-foreground text-xl">Account Credentials</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set up your login information
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      className={cn("pl-10", errors.email && "border-red-500")}
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={cn("pl-10 pr-10", errors.password && "border-red-500")}
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className={cn("pl-10 pr-10", errors.confirmPassword && "border-red-500")}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors({ ...errors, confirmPassword: undefined });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Personal Information */}
            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <h2 className="font-semibold text-foreground text-xl">Personal Information</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tell us about yourself
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      className={cn("pl-10", errors.fullName && "border-red-500")}
                      value={formData.fullName}
                      onChange={(e) => updateFormData("fullName", e.target.value)}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+234 8012345678"
                      className={cn("pl-10", errors.phone && "border-red-500")}
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = formData.role === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateFormData("role", option.value)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all text-left",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg w-fit mb-2", option.bgColor)}>
                            <Icon className={cn("w-5 h-5", option.color)} />
                          </div>
                          <p className="font-medium text-foreground text-sm">{option.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.role && (
                    <p className="text-xs text-red-500 mt-1">{errors.role}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Location & Cluster */}
            {step === 3 && (
              <>
                <div className="text-center mb-6">
                  <h2 className="font-semibold text-foreground text-xl">Location & Cluster</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set your working location
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Cluster
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      className={cn(
                        "w-full h-10 rounded-lg border border-border bg-background px-3 pl-10 text-sm",
                        errors.cluster && "border-red-500"
                      )}
                      value={formData.cluster}
                      onChange={(e) => updateFormData("cluster", e.target.value)}
                    >
                      <option value="">Select a cluster</option>
                      {clusters.map((cluster) => (
                        <option key={cluster} value={cluster}>
                          {cluster}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.cluster && (
                    <p className="text-xs text-red-500 mt-1">{errors.cluster}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      State
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <select
                        className={cn(
                          "w-full h-10 rounded-lg border border-border bg-background px-3 pl-10 text-sm",
                          errors.state && "border-red-500"
                        )}
                        value={formData.state}
                        onChange={(e) => updateFormData("state", e.target.value)}
                      >
                        <option value="">Select state</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter city"
                        className={cn("pl-10", errors.city && "border-red-500")}
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                      />
                    </div>
                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((step - 1) as 1 | 2)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1 gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Create Account
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
