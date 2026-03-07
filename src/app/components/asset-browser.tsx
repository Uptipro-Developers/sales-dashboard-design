"use client";

import { useEffect, useState } from "react";
import { assetsApi, resolveMediaUrl } from "../utils/api-service";
import {
  Search,
  Grid2x2,
  List,
  MapPin,
  DollarSign,
  Eye,
  Building2,
  Home,
  ShoppingBag,
  Warehouse,
  X,
  TrendingUp,
  Users,
  Bed,
  Bath,
  Car,
  Wifi,
  Zap,
  Droplet,
  ArrowLeft,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Percent,
  Calendar,
  Shield,
  Sofa,
} from "lucide-react";

// Map asset types to icon components
const typeIcons: Record<string, React.ElementType> = {
  commercial: Building2,
  residential: Home,
  retail: ShoppingBag,
  industrial: Warehouse,
};
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

// Map asset status to badge color classes
const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-yellow-100 text-yellow-800",
  sold: "bg-red-100 text-red-800",
};

// Map risk levels to badge color classes
const riskColors: Record<string, string> = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
  // Add more levels if needed
};

// Map project status to badge color classes
const projectStatusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Delayed: "bg-red-100 text-red-800",
  Planned: "bg-blue-100 text-blue-800",
  // Add more statuses as needed
};

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

type Asset = {
  id: string;
  title: string;
  type: string;
  price: string;
  priceRange: string;
  commission: string;
  commissionRate: string;
  location: string;
  status: string;
  projectStatus: string;
  area: string;
  units: number;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  furnished: string;
  facilities: string[];
  ownershipOptions: string[];
  fractionCost: string;
  fundingStatus: number;
  rentalYield: string;
  capitalAppreciation: string;
  totalReturns: string;
  riskLevel: string;
  constructionStage: string;
  images: number;
  virtualTours: number;
  documents: number;
  description: string;
  leads: any[];
};

export function AssetBrowser() {
  const [assets, setAssets] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  useEffect(() => {
    assetsApi.getAll().then(setAssets);
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "all" ||
      asset.type?.toLowerCase() === filterType.toLowerCase();
    const matchesStatus =
      filterStatus === "all" ||
      asset.projectStatus?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  if (selectedAsset) {
    const TypeIcon = typeIcons[selectedAsset.type] || Building2;

    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedAsset(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browser
          </Button>
          <div className="flex-1">
            <h1>{selectedAsset.title || selectedAsset.name}</h1>
            <p className="text-muted-foreground">
              {selectedAsset.serialId || selectedAsset.id}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="returns">Returns & Risk</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero Image */}
            <Card className="overflow-hidden">
              <div className="h-80 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center relative">
                {selectedAsset.images?.length > 0 ? (
                  <img
                    src={resolveMediaUrl(selectedAsset.images[0].url)}
                    alt={selectedAsset.title || selectedAsset.name}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    title="Click to view full size"
                    onClick={() => {
                      setSelectedImage(selectedAsset.images[0]);
                      setIsImageViewerOpen(true);
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <TypeIcon className="w-24 h-24 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Asset Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Asset Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Asset Type
                    </span>
                    <Badge variant="outline" className="gap-2">
                      <TypeIcon className="w-3 h-3" />
                      {selectedAsset.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge className={statusColors[selectedAsset.status]}>
                      {selectedAsset.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Project Status
                    </span>
                    <Badge
                      className={
                        projectStatusColors[selectedAsset.projectStatus]
                      }
                    >
                      {selectedAsset.projectStatus}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAsset.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Physical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Units
                    </span>
                    <span className="font-semibold">
                      {selectedAsset.units || selectedAsset.totalUnits || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Area
                    </span>
                    <span className="font-semibold">{selectedAsset.area}</span>
                  </div>
                  {selectedAsset.bedrooms !== "N/A" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Bed className="w-4 h-4" />
                        Bedrooms
                      </div>
                      <span className="font-semibold">
                        {selectedAsset.bedrooms}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Bath className="w-4 h-4" />
                      Bathrooms
                    </div>
                    <span className="font-semibold">
                      {selectedAsset.bathrooms}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Car className="w-4 h-4" />
                      Parking
                    </div>
                    <span className="font-semibold">
                      {selectedAsset.parking}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Sofa className="w-4 h-4" />
                      Furnishing
                    </div>
                    <span className="font-semibold">
                      {selectedAsset.furnished}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(selectedAsset.facilities ?? []).map((facility, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {selectedAsset.description}
                </p>
              </CardContent>
            </Card>

            {/* Important Dates */}
            {(selectedAsset.constructionStart ||
              selectedAsset.constructionEnd ||
              selectedAsset.firstPayoutDate ||
              selectedAsset.completionDate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedAsset.constructionStart && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          Construction Start
                        </p>
                        <p className="font-medium text-sm">
                          {new Date(
                            selectedAsset.constructionStart,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedAsset.constructionEnd && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          Construction End
                        </p>
                        <p className="font-medium text-sm">
                          {new Date(
                            selectedAsset.constructionEnd,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedAsset.completionDate &&
                      !selectedAsset.constructionEnd && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            Expected Completion
                          </p>
                          <p className="font-medium text-sm">
                            {new Date(
                              selectedAsset.completionDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    {selectedAsset.firstPayoutDate && (
                      <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          First Payout Date
                        </p>
                        <p className="font-medium text-sm text-accent">
                          {new Date(
                            selectedAsset.firstPayoutDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leads Section */}
            {selectedAsset.leads && selectedAsset.leads.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Leads for this Asset</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedAsset.leads.map((lead: any) => (
                      <div
                        key={lead.id}
                        className="p-4 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {lead.email} &bull; {lead.phone}
                            </p>
                          </div>
                          <Badge variant="outline">{lead.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Budget: ₦
                            {lead.budget
                              ? Number(
                                  String(lead.budget).replace(/[₦,]/g, ""),
                                ).toLocaleString()
                              : "-"}
                          </span>
                          <span className="text-muted-foreground">
                            Source: {lead.source || "-"}
                          </span>
                          <span className="text-muted-foreground">
                            Location: {lead.location || "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Investment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ownership Options
                    </p>
                    <div className="space-y-2">
                      {selectedAsset.ownershipOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                          <span className="text-sm">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">
                      Fraction Cost Range
                    </p>
                    <p className="text-xl font-semibold text-primary">
                      {selectedAsset.fractionCost}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Funding Status
                    </p>
                    <div className="space-y-2">
                      <Progress
                        value={selectedAsset.fundingStatus}
                        className="h-2"
                      />
                      <p className="text-sm font-semibold">
                        {selectedAsset.fundingStatus}% Funded
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Asset Value
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {selectedAsset.price}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">
                      Price Range (Per Unit)
                    </p>
                    <p className="text-lg font-semibold">
                      {selectedAsset.priceRange}
                    </p>
                  </div>
                  <div className="pt-4 border-t bg-accent/5 p-4 rounded-lg border border-accent/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-muted-foreground">
                        Your Commission
                      </p>
                      <Badge variant="outline">
                        {selectedAsset.commissionRate}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-accent">
                      {selectedAsset.commission}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Returns & Risk Tab */}
          <TabsContent value="returns" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Returns */}
              <Card>
                <CardHeader>
                  <CardTitle>Investment Returns</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Projected annual returns
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Percent className="w-5 h-5 text-accent" />
                        <span className="text-sm font-medium">
                          Rental Yield
                        </span>
                      </div>
                      <span className="text-xl font-bold text-accent">
                        {selectedAsset.rentalYield}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Annual rental income
                    </p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">
                          Capital Appreciation
                        </span>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {selectedAsset.capitalAppreciation}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Property value growth
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">
                          Total Returns
                        </span>
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {selectedAsset.totalReturns}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Combined annual returns
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Investment risk factors
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Risk Level</span>
                      </div>
                      <Badge className={riskColors[selectedAsset.riskLevel]}>
                        {selectedAsset.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall investment risk rating
                    </p>
                  </div>

                  <div className="p-4 bg-card rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Construction Stage
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        {selectedAsset.constructionStage}
                      </span>
                    </div>
                    <Progress
                      value={parseInt(selectedAsset.constructionStage)}
                      className="h-2 mt-2"
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium mb-1">Risk Factors</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Construction timeline risk (if applicable)</li>
                          <li>• Market volatility in property sector</li>
                          <li>• Rental income may vary based on occupancy</li>
                          <li>• Regulatory and economic factors</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            {selectedAsset.images?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Images ({selectedAsset.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedAsset.images.map((img: any) => (
                      <div
                        key={img.id}
                        className="relative aspect-square rounded overflow-hidden border hover:border-primary transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedImage(img);
                          setIsImageViewerOpen(true);
                        }}
                      >
                        <img
                          src={resolveMediaUrl(img.url)}
                          alt={img.caption || "Property image"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {img.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedAsset.virtualTours && selectedAsset.virtualTours > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Virtual Tours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Video className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      {selectedAsset.virtualTours}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      3D Tours Available
                    </p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Start Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedAsset.documents?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents ({selectedAsset.documents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedAsset.documents.map((doc: any) => (
                      <a
                        key={doc.id}
                        href={resolveMediaUrl(doc.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-muted rounded hover:bg-muted/80 transition-colors group"
                      >
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.title || "Document"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedAsset.images?.length &&
              !selectedAsset.documents?.length &&
              !selectedAsset.virtualTours && (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      No media available for this asset
                    </p>
                  </CardContent>
                </Card>
              )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Asset Browser</h1>
        <p className="text-muted-foreground">
          Browse available properties with detailed information
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="off-plan">Off-plan</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Project Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="under construction">
                  Under Construction
                </SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid2x2 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAssets.length} of {assets.length} assets
        </p>
      </div>

      {/* Asset Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const TypeIcon = typeIcons[asset.type] || Building2;

            return (
              <Card
                key={asset.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                  {asset.images?.length > 0 ? (
                    <img
                      src={resolveMediaUrl(asset.images[0].url)}
                      alt={asset.title || asset.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(asset.images[0]);
                        setIsImageViewerOpen(true);
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <TypeIcon className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {asset.type}
                      </p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={statusColors[asset.status]}>
                      {asset.status}
                    </Badge>
                  </div>
                  {asset.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 z-10">
                      <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> {asset.images.length}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {asset.serialId || asset.id}
                      </p>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {asset.title || asset.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {asset.location}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      {asset.projectStatus && (
                        <Badge
                          variant="outline"
                          className={projectStatusColors[asset.projectStatus]}
                        >
                          {asset.projectStatus}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">
                        {asset.units || asset.totalUnits || 0} units
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold">
                        {asset.priceRange ||
                          (asset.price
                            ? `₦${parseFloat(asset.price).toLocaleString()}`
                            : asset.fractionCost
                              ? `₦${parseFloat(asset.fractionCost).toLocaleString()}`
                              : "—")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-accent/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground">
                          Commission
                        </span>
                      </div>
                      <span className="font-semibold text-accent">
                        {asset.commission ||
                          (asset.leadCommission && asset.closerCommission
                            ? `${asset.leadCommission}% + ${asset.closerCommission}%`
                            : asset.commissionRate
                              ? `${asset.commissionRate}%`
                              : "—")}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAsset(asset);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredAssets.map((asset) => {
                const TypeIcon = typeIcons[asset.type] || Building2;

                return (
                  <div
                    key={asset.id}
                    className="p-6 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex gap-4 flex-1">
                        <div
                          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (asset.images?.length > 0) {
                              setSelectedImage(asset.images[0]);
                              setIsImageViewerOpen(true);
                            }
                          }}
                        >
                          {asset.images?.length > 0 ? (
                            <img
                              src={resolveMediaUrl(asset.images[0].url)}
                              alt={asset.title || asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <TypeIcon className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline">
                              {asset.serialId || asset.id}
                            </Badge>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {asset.title || asset.name}
                            </h3>
                            <Badge className={statusColors[asset.status]}>
                              {asset.status}
                            </Badge>
                            {asset.projectStatus && (
                              <Badge
                                variant="outline"
                                className={
                                  projectStatusColors[asset.projectStatus]
                                }
                              >
                                {asset.projectStatus}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {asset.location}
                            </div>
                            <span>{asset.type}</span>
                            <span>
                              {asset.units || asset.totalUnits || 0} units
                            </span>
                            {asset.area && <span>{asset.area}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          Price
                        </p>
                        <p className="font-semibold text-lg mb-3">
                          {asset.priceRange ||
                            (asset.price
                              ? `₦${parseFloat(asset.price).toLocaleString()}`
                              : asset.fractionCost
                                ? `₦${parseFloat(asset.fractionCost).toLocaleString()}`
                                : "—")}
                        </p>
                        <div className="bg-accent/10 px-3 py-2 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">
                            Commission
                          </p>
                          <p className="text-sm font-semibold text-accent">
                            {asset.commission ||
                              (asset.leadCommission && asset.closerCommission
                                ? `${asset.leadCommission}% + ${asset.closerCommission}%`
                                : asset.commissionRate
                                  ? `${asset.commissionRate}%`
                                  : "—")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedImage?.caption || "Property Image"}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full">
            <img
              src={resolveMediaUrl(selectedImage?.url)}
              alt={selectedImage?.caption || "Property image"}
              className="w-full h-auto max-h-[70vh] object-contain rounded"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
