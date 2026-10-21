import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Search, UserPlus, Users } from "lucide-react";
import { investorsApi } from "../utils/api-service";
import {
  INVESTMENT_PLATFORMS,
  platformBadgeClass,
  platformLabel,
} from "../utils/platform";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function InvestorManagement() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("all");
  const [registrationPlatform, setRegistrationPlatform] = useState("");

  const loadInvestors = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await investorsApi.getAll();
      if (!Array.isArray(response)) throw new Error("Invalid investor response.");
      setInvestors(response);
    } catch (error: any) {
      setLoadError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load investors.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvestors();
  }, []);

  const filteredInvestors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return investors.filter((investor) => {
      const investorTrack = investor.investorAccount?.track;
      const matchesTrack = track === "all" || investorTrack === track;
      const matchesSearch =
        !query ||
        [investor.name, investor.email, investor.phone, investor.serialId]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesTrack && matchesSearch;
    });
  }, [investors, search, track]);

  const beginRegistration = () => {
    if (!registrationPlatform) return;
    const investorAppUrl = String(
      import.meta.env.VITE_INVESTOR_APP_URL || "http://localhost:3000",
    ).replace(/\/$/, "");
    const selectedTrack =
      registrationPlatform === "Urbco Foundry" ? "foundry" : "harbor";
    window.open(`${investorAppUrl}/auth/signup?track=${selectedTrack}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Investors</h1>
          <p className="text-muted-foreground">
            Identify and manage investors by investment platform
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><UserPlus className="mr-2 h-4 w-4" />Register Investor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose the investor platform</DialogTitle>
              <DialogDescription>
                The investor registration and KYC requirements will follow this platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Investment Platform</Label>
                <Select value={registrationPlatform} onValueChange={setRegistrationPlatform}>
                  <SelectTrigger><SelectValue placeholder="Select Foundry or Harbor" /></SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" disabled={!registrationPlatform} onClick={beginRegistration}>
                Continue to verified registration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search name, email, phone or ID" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger className="w-full md:w-52"><SelectValue placeholder="Platform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="FOUNDRY">Urbco Foundry</SelectItem>
                <SelectItem value="HARBOR">Urbco Harbor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading investors…</p>
      ) : loadError ? (
        <Card className="border-destructive/40"><CardContent className="flex flex-col items-center gap-3 p-8 text-center"><AlertCircle className="h-8 w-8 text-destructive" /><p>{loadError}</p><Button variant="outline" onClick={() => void loadInvestors()}>Try again</Button></CardContent></Card>
      ) : filteredInvestors.length === 0 ? (
        <Card><CardContent className="p-10 text-center"><Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p className="font-medium">No investors found</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredInvestors.map((investor) => (
            <Card key={investor.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-semibold">{investor.name}</p><p className="text-xs text-muted-foreground">{investor.serialId || investor.id}</p></div>
                  <Badge variant="outline" className={platformBadgeClass(investor.investorAccount?.track)}>{platformLabel(investor.investorAccount?.track)}</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground"><p>{investor.email}</p><p>{investor.phone || "No phone provided"}</p></div>
                <div className="flex flex-wrap gap-2"><Badge variant="secondary">{String(investor.investorAccount?.entityType || "Investor").replaceAll("_", " ")}</Badge><Badge variant="outline">{String(investor.investorAccount?.onboardingStatus || investor.status).replaceAll("_", " ")}</Badge></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
