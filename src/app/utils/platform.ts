export const INVESTMENT_PLATFORMS = ["Urbco Foundry", "Urbco Harbor"] as const;
export type InvestmentPlatform = (typeof INVESTMENT_PLATFORMS)[number];

export const platformLabel = (platform?: string | null) =>
  platform === "Urbco Harbor" || platform === "HARBOR"
    ? "Urbco Harbor"
    : platform === "Urbco Foundry" || platform === "FOUNDRY"
      ? "Urbco Foundry"
      : "Unassigned";

export const platformBadgeClass = (platform?: string | null) =>
  platformLabel(platform) === "Urbco Harbor"
    ? "border-purple-200 bg-purple-50 text-purple-700"
    : platformLabel(platform) === "Urbco Foundry"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-slate-50 text-slate-600";
