"use client";

import { useEffect, useState } from "react";
import {
  User,
  Briefcase,
  Heart,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  UserCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { userApi } from "../utils/api-service";

export function ProfileSettings() {
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mapUserToFormData = (user: any) => ({
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "",
    clusterName: user.agentProfile?.cluster?.name || "",
    clusterId: user.agentProfile?.clusterId || "",
    // Extended profile fields from backend
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ").slice(-1)[0] || "",
    middleName:
      user.name?.split(" ").length > 2
        ? user.name?.split(" ").slice(1, -1).join(" ")
        : "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
    phoneNumber: user.phone || "",
    homeAddress: user.homeAddress || "",
    nin: user.nin || "",
    stateOfOrigin: user.stateOfOrigin || "",
    reportsTo: "",
    dateOfRecruitment: user.dateOfRecruitment
      ? new Date(user.dateOfRecruitment).toISOString().split("T")[0]
      : "",
    kinFullName: user.kinFullName || "",
    kinPhoneNumber: user.kinPhoneNumber || "",
    kinRelationship: user.kinRelationship || "",
    kinAddress: user.kinAddress || "",
    bankName: user.bankName || "",
    accountNumber: user.accountNumber || "",
    beneficiaryName: user.beneficiaryName || "",
  });

  useEffect(() => {
    setLoading(true);
    userApi
      .getCurrent()
      .then((user) => {
        // Flatten and map backend response to UI fields
        setFormData(mapUserToFormData(user));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    // Combine first, middle, and last name into full name
    const fullName = [
      formData.firstName,
      formData.middleName,
      formData.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    // Send all updatable fields to backend
    try {
      const updatedUser = await userApi.update({
        name: fullName || formData.name,
        email: formData.email,
        phone: formData.phoneNumber || formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        homeAddress: formData.homeAddress,
        nin: formData.nin,
        stateOfOrigin: formData.stateOfOrigin,
        dateOfRecruitment: formData.dateOfRecruitment,
        kinFullName: formData.kinFullName,
        kinPhoneNumber: formData.kinPhoneNumber,
        kinRelationship: formData.kinRelationship,
        kinAddress: formData.kinAddress,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        beneficiaryName: formData.beneficiaryName,
      });
      setFormData(mapUserToFormData(updatedUser));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading || !formData) return <div>Loading profile...</div>;

  // UI lists
  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const nigerianBanks = [
    "Access Bank",
    "Zenith Bank",
    "GTBank",
    "First Bank of Nigeria",
    "UBA",
    "Fidelity Bank",
    "Union Bank",
    "Sterling Bank",
    "Stanbic IBTC",
    "Polaris Bank",
    "Wema Bank",
    "FCMB",
    "Heritage Bank",
    "Keystone Bank",
    "Ecobank",
    "Unity Bank",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account details
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) =>
                    handleInputChange("middleName", e.target.value)
                  }
                  placeholder="Enter middle name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9+]/g, "");
                    handleInputChange("phoneNumber", value);
                  }}
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeAddress">Home Address</Label>
              <Input
                id="homeAddress"
                value={formData.homeAddress}
                onChange={(e) =>
                  handleInputChange("homeAddress", e.target.value)
                }
                placeholder="Enter full home address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Identity & Origin */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              <CardTitle>Identity & Origin</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nin">
                  NIN (National Identification Number)
                </Label>
                <Input
                  id="nin"
                  value={formData.nin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange("nin", value);
                  }}
                  placeholder="Enter 11-digit NIN"
                  maxLength={11}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateOfOrigin">State of Origin</Label>
                <Select
                  value={formData.stateOfOrigin}
                  onValueChange={(value) =>
                    handleInputChange("stateOfOrigin", value)
                  }
                >
                  <SelectTrigger id="stateOfOrigin">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <CardTitle>Work Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clusterName">Cluster</Label>
                <Input id="clusterName" value={formData.clusterName} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={formData.role} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfRecruitment">Date of Recruitment</Label>
              <Input
                id="dateOfRecruitment"
                type="date"
                value={formData.dateOfRecruitment}
                onChange={(e) =>
                  handleInputChange("dateOfRecruitment", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" value={formData.id} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Next of Kin */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <CardTitle>Next of Kin</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kinFullName">Full Name</Label>
              <Input
                id="kinFullName"
                value={formData.kinFullName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, "");
                  handleInputChange("kinFullName", value);
                }}
                placeholder="Enter next of kin's full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kinPhoneNumber">Phone Number</Label>
                <Input
                  id="kinPhoneNumber"
                  value={formData.kinPhoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9+]/g, "");
                    handleInputChange("kinPhoneNumber", value);
                  }}
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kinRelationship">Relationship</Label>
                <Select
                  value={formData.kinRelationship}
                  onValueChange={(value) =>
                    handleInputChange("kinRelationship", value)
                  }
                >
                  <SelectTrigger id="kinRelationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kinAddress">Address</Label>
              <Input
                id="kinAddress"
                value={formData.kinAddress}
                onChange={(e) =>
                  handleInputChange("kinAddress", e.target.value)
                }
                placeholder="Enter next of kin's address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Banking Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <CardTitle>Banking Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                list="bank-options"
                value={formData.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
                placeholder="Enter bank name"
              />
              <datalist id="bank-options">
                {nigerianBanks.map((bank) => (
                  <option key={bank} value={bank} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange("accountNumber", value);
                  }}
                  placeholder="Enter 10-digit account number"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                <Input
                  id="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[0-9]/g, "");
                    handleInputChange("beneficiaryName", value);
                  }}
                  placeholder="Enter account holder name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSaveProfile}>Save Profile Changes</Button>
        </div>
      </div>
    </div>
  );
}
