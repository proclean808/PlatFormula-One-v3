// Standard JSON import works in Vite and Node/tsx; runtime evidence is validated as unknown below.
import evidenceJson from "./financialStackRecords.json";
import type { DirectoryEntry } from "./resourceDirectory";

/** Local public-page research snapshot; this is not a live feed or integration. */
export const FINANCIAL_REVIEWED_AT = "2026-11-18";
export const FINANCIAL_PAGE_SIZE = 9;
export const MAX_FINANCIAL_COMPARE = 3;
export const FINANCIAL_ROLES = [
  "All roles",
  "Banking & spend",
  "Payments & billing",
  "Accounting & tax",
  "Payroll & HR",
  "Equity & legal",
  "Insurance & risk",
  "Cloud & developer",
  "Analytics",
  "Sales & CRM",
  "Security & compliance",
  "Fundraising & documents",
  "Perks marketplaces",
] as const;
export type FinancialRole = (typeof FINANCIAL_ROLES)[number];
export type FinancialRecordKind =
  | "Product or service"
  | "Startup program"
  | "Perks marketplace";
export type ApiStatus =
  | "Available"
  | "Unknown"
  | "Connector only; public API unknown";
export type YcCompanyStatus =
  | "Verified YC company"
  | "Unknown"
  | "Not applicable";
export type YcProgramStatus =
  | "YC-published relationship"
  | "Provider-published YC program"
  | "Provider-claimed; independent confirmation unknown"
  | "Unknown";
export type OfferStatus =
  | "Conditional offer"
  | "Expired offer"
  | "Closed season"
  | "Past cohort; current availability unknown"
  | "Unknown / no specific offer verified";

export interface RawFinancialRecord {
  name: string;
  official_url: string;
  category: string;
  description: string;
  pricing: string;
  credits_or_offers: string;
  eligibility: string;
  expiration: string;
  stage_guidance: string;
  api_availability: string;
  yc_alumni_status: string;
  yc_partnership_status: string;
  relationship_status: string;
  caution: string;
  tags: string[];
  sources: string[];
  verified: boolean;
}

export interface FinancialStackRecord {
  id: string;
  name: string;
  aliases: readonly string[];
  officialUrl: string;
  role: FinancialRole;
  kind: FinancialRecordKind;
  summary: string;
  description: string;
  pricing: string;
  pricingStatus: "Published terms; not a quote" | "Unknown";
  creditsOrOffers: string;
  offerStatus: OfferStatus;
  eligibility: string;
  eligibilityStatus: "Not assessed";
  expiration: string;
  stageGuidance: string;
  apiStatus: ApiStatus;
  apiAvailability: string;
  ycCompanyStatus: YcCompanyStatus;
  ycCompanyEvidence: string;
  ycProgramStatus: YcProgramStatus;
  ycProgramEvidence: string;
  relationshipStatus: "External Resource";
  integrationStatus: "Not connected";
  researchStatus: "Public-source review";
  reviewedAt: typeof FINANCIAL_REVIEWED_AT;
  sources: readonly string[];
  tags: readonly string[];
  caution: string;
  perksVault: boolean;
  warning?: string;
  sunsetDate?: string;
  offerDeadline?: string;
}

interface DisplayMetadata {
  id: string;
  aliases?: string[];
  role: FinancialRole;
  summary: string;
  kind?: FinancialRecordKind;
  api?: ApiStatus;
  ycCompany?: YcCompanyStatus;
  ycProgram?: YcProgramStatus;
  offer?: OfferStatus;
  perks?: boolean;
  warning?: string;
  sunsetDate?: string;
  offerDeadline?: string;
}

/** Display categorization is curated, not a new claim about eligibility or plan access. */
const metadata: Record<string, DisplayMetadata> = {
  Brex: {
    id: "brex",
    role: "Banking & spend",
    summary:
      "Corporate cards, accounts and spend controls for eligible businesses.",
    api: "Available",
    ycCompany: "Verified YC company",
    ycProgram: "YC-published relationship",
    offer: "Expired offer",
    warning:
      "Expired YC offer: the reviewed sign-up window ended May 31, 2026. Do not count it as active credit. Core products remain subject to approval.",
    offerDeadline: "2026-05-31",
  },
  Ramp: {
    id: "ramp",
    role: "Banking & spend",
    summary:
      "Cards, expenses, bill pay and accounting automation in one finance platform.",
    api: "Available",
  },
  Rho: {
    id: "rho",
    role: "Banking & spend",
    summary:
      "Fintech checking, cards, treasury and spend tools for US-incorporated companies.",
    api: "Available",
    ycProgram: "Provider-claimed; independent confirmation unknown",
    offer: "Conditional offer",
    perks: true,
  },
  Pulley: {
    id: "pulley",
    role: "Equity & legal",
    summary:
      "Cap-table and equity platform with an announced service shutdown.",
    ycCompany: "Verified YC company",
    warning:
      "Sunset warning: Pulley announced all operations and services will cease December 8, 2026. Not a recommended new-stack default. Existing-customer Carta transition terms are account-dependent.",
    sunsetDate: "2026-12-08",
  },
  Stripe: {
    id: "stripe",
    aliases: ["Stripe Payments"],
    role: "Payments & billing",
    summary:
      "Payments, subscriptions, invoicing and financial infrastructure APIs; separate from Stripe Atlas.",
    api: "Available",
    offer: "Conditional offer",
    perks: true,
  },
  Paddle: {
    id: "paddle",
    role: "Payments & billing",
    summary:
      "Merchant of Record for digital products, including payments, billing and tax compliance.",
    api: "Available",
    offer: "Past cohort; current availability unknown",
    warning:
      "Launchpad's reviewed page lists a November 11, 2025 deadline. Current cohort availability is Unknown; the winner prize is not a signup credit.",
  },
  Pilot: {
    id: "pilot",
    role: "Accounting & tax",
    summary:
      "Bookkeeping, tax, controller and CFO services with plan-specific qualification.",
    offer: "Conditional offer",
    perks: true,
    warning:
      "The displayed Core $0/month figure is not a general quote. Scope, expenses and sales confirmation determine applicable pricing.",
  },
  "Kruze Consulting": {
    id: "kruze-consulting",
    aliases: ["Kruze"],
    role: "Accounting & tax",
    summary:
      "CPA and fractional CFO services focused on funded Delaware C-Corp startups.",
  },
  Fondo: {
    id: "fondo",
    role: "Accounting & tax",
    summary:
      "Bookkeeping and corporate-tax support for Delaware C-Corp startups.",
    ycCompany: "Verified YC company",
    ycProgram: "Provider-published YC program",
    offer: "Conditional offer",
    perks: true,
  },
  Gusto: {
    id: "gusto",
    role: "Payroll & HR",
    summary:
      "Small-business payroll, tax filing, benefits, onboarding and HR tools.",
    api: "Available",
  },
  Rippling: {
    id: "rippling",
    role: "Payroll & HR",
    summary:
      "Modular HR, payroll, IT and finance tools; a startup offer requires US VC-backed eligibility.",
    ycCompany: "Verified YC company",
    offer: "Conditional offer",
    perks: true,
  },
  Deel: {
    id: "deel",
    role: "Payroll & HR",
    summary:
      "Global payroll, contractor management and employer-of-record services.",
    api: "Available",
    ycCompany: "Verified YC company",
    offer: "Closed season",
    warning:
      "The Pitch 2026 season is wrapped; the reviewed page directs founders to a 2027 waitlist. Prizes and application-linked perks are not general account entitlements.",
  },
  "Orrick Tech Studio": {
    id: "orrick-tech-studio",
    aliases: ["Orrick Startup Forms"],
    role: "Equity & legal",
    summary:
      "Public startup legal forms and guidance; templates are not tailored legal advice.",
  },
  Vouch: {
    id: "vouch",
    role: "Insurance & risk",
    summary:
      "Technology-business insurance and risk support, subject to underwriting and state availability.",
    ycCompany: "Verified YC company",
  },
  "AWS Activate": {
    id: "aws-activate",
    aliases: ["Amazon AWS Activate"],
    role: "Cloud & developer",
    kind: "Startup program",
    summary:
      "Conditional startup cloud credits with tier, provider and prior-credit requirements.",
    ycProgram: "Provider-published YC program",
    offer: "Conditional offer",
    perks: true,
  },
  "Google for Startups Cloud Program": {
    id: "google-startups-cloud",
    aliases: ["Google Cloud Startup Program", "Google for Startups Cloud"],
    role: "Cloud & developer",
    kind: "Startup program",
    summary:
      "Startup cloud-credit pathways with application review and tier-specific terms.",
    offer: "Conditional offer",
    perks: true,
    warning:
      "Credit coverage excludes third-party products, including Marketplace and Model Garden third-party offerings. Account-level expiry must be confirmed.",
  },
  "Cloudflare for Startups / Cloudflare Workers": {
    id: "cloudflare-startups",
    aliases: ["Cloudflare for Startups", "Cloudflare Workers"],
    role: "Cloud & developer",
    kind: "Startup program",
    summary:
      "Conditional infrastructure credits and Workers developer tooling with service exclusions.",
    api: "Available",
    offer: "Conditional offer",
    perks: true,
    warning:
      "Do not assume Workers AI coverage: the reviewed incoming-startup terms exclude it. AI Gateway is temporarily not covered; caps, overages and post-expiration billing apply.",
  },
  PostHog: {
    id: "posthog",
    role: "Analytics",
    summary:
      "Product analytics, replay, flags and developer tooling; startup and YC credits have different terms.",
    api: "Available",
    ycCompany: "Verified YC company",
    ycProgram: "Provider-published YC program",
    offer: "Conditional offer",
    perks: true,
    warning:
      "Startup credits exclude the listed AI tools from September 14, 2026 and cannot cover a Boost BAA. YC-program rules are separate.",
  },
  Mixpanel: {
    id: "mixpanel",
    role: "Analytics",
    summary:
      "Product analytics with a conditional first-year-free Startup Plan, not a current credit balance.",
    api: "Available",
    offer: "Conditional offer",
    perks: true,
    warning:
      "Current startup offer: first year free for accepted eligible companies. The legacy $50,000 credit program is not the current offer; data must start flowing within 90 days.",
  },
  HubSpot: {
    id: "hubspot",
    aliases: ["HubSpot CRM"],
    role: "Sales & CRM",
    summary:
      "CRM and go-to-market tools with conditional startup and YC-related discounts.",
    api: "Available",
    ycCompany: "Not applicable",
    ycProgram: "Provider-published YC program",
    offer: "Conditional offer",
    perks: true,
  },
  Attio: {
    id: "attio",
    aliases: ["Attio CRM"],
    role: "Sales & CRM",
    summary:
      "CRM and revenue infrastructure with an approval-based startup program.",
    api: "Available",
    offer: "Conditional offer",
    perks: true,
  },
  Apollo: {
    id: "apollo",
    aliases: ["Apollo.io"],
    role: "Sales & CRM",
    summary:
      "B2B prospecting, enrichment and outreach; plan credits are usage units, not founder grants.",
    api: "Available",
  },
  Vanta: {
    id: "vanta",
    role: "Security & compliance",
    summary:
      "Security and compliance workflows with quoted pricing and conditional YC-related terms.",
    api: "Available",
    ycCompany: "Verified YC company",
    ycProgram: "YC-published relationship",
    offer: "Conditional offer",
    perks: true,
  },
  Drata: {
    id: "drata",
    role: "Security & compliance",
    summary:
      "Compliance automation, audit evidence and trust management with sales-led pricing.",
    api: "Available",
  },
  DocSend: {
    id: "docsend",
    aliases: ["Dropbox DocSend"],
    role: "Fundraising & documents",
    summary:
      "Secure document links, engagement analytics and virtual data rooms for fundraising.",
    api: "Connector only; public API unknown",
  },
  "Mercury Perks": {
    id: "mercury-perks",
    aliases: ["Mercury Customer Perks"],
    role: "Perks marketplaces",
    kind: "Perks marketplace",
    summary:
      "Mercury's customer perks marketplace. Each partner's access, restrictions and expiry must be checked separately.",
    offer: "Conditional offer",
    perks: true,
  },
  "Carta Startup Stack": {
    id: "carta-startup-stack",
    aliases: ["Carta Customer Startup Stack"],
    role: "Perks marketplaces",
    kind: "Perks marketplace",
    summary:
      "Carta's customer-offers marketplace. Partner discounts and credits have individual qualification rules.",
    offer: "Conditional offer",
    perks: true,
  },
};

export function isSafeFinancialUrl(value: string): boolean {
  if (value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value))
    return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function readEvidence(): RawFinancialRecord[] {
  const parsed: unknown = evidenceJson;
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("items" in parsed) ||
    !Array.isArray(parsed.items)
  ) {
    throw new Error("Financial evidence must contain an items array");
  }
  const textFields = [
    "name",
    "official_url",
    "category",
    "description",
    "pricing",
    "credits_or_offers",
    "eligibility",
    "expiration",
    "stage_guidance",
    "api_availability",
    "yc_alumni_status",
    "yc_partnership_status",
    "relationship_status",
    "caution",
  ] as const;
  return parsed.items.map((item: unknown) => {
    if (!item || typeof item !== "object")
      throw new Error("Invalid financial record");
    const record = item as Record<string, unknown>;
    if (
      textFields.some(
        key =>
          typeof record[key] !== "string" || !(record[key] as string).trim()
      ) ||
      typeof record.verified !== "boolean" ||
      record.relationship_status !== "External Resource" ||
      !Array.isArray(record.tags) ||
      !record.tags.length ||
      !record.tags.every(tag => typeof tag === "string") ||
      !Array.isArray(record.sources) ||
      !record.sources.length ||
      !record.sources.every(
        url => typeof url === "string" && isSafeFinancialUrl(url)
      ) ||
      !isSafeFinancialUrl(record.official_url as string)
    ) {
      throw new Error(`Invalid financial evidence for ${String(record.name)}`);
    }
    return item as RawFinancialRecord;
  });
}

/** The raw verified flag refers to a bounded research review, never all individual metadata. */
export const financialStackEvidence: readonly RawFinancialRecord[] =
  readEvidence();
const unknownPricingIds = new Set([
  "orrick-tech-studio",
  "vouch",
  "aws-activate",
  "google-startups-cloud",
  "apollo",
  "drata",
  "mercury-perks",
  "carta-startup-stack",
]);
export const financialStackRecords: readonly FinancialStackRecord[] =
  financialStackEvidence.map(raw => {
    const display = metadata[raw.name];
    if (!display || !raw.verified)
      throw new Error(`Missing reviewed display metadata for ${raw.name}`);
    return {
      id: display.id,
      name: raw.name,
      aliases: [raw.name, ...(display.aliases ?? [])],
      officialUrl: raw.official_url,
      role: display.role,
      kind: display.kind ?? "Product or service",
      summary: display.summary,
      description: raw.description,
      pricing: raw.pricing,
      pricingStatus:
        unknownPricingIds.has(display.id) || /^Unknown\b/i.test(raw.pricing)
          ? "Unknown"
          : "Published terms; not a quote",
      creditsOrOffers: raw.credits_or_offers,
      offerStatus: display.offer ?? "Unknown / no specific offer verified",
      eligibility: raw.eligibility,
      eligibilityStatus: "Not assessed",
      expiration: raw.expiration,
      stageGuidance: raw.stage_guidance,
      apiStatus: display.api ?? "Unknown",
      apiAvailability: raw.api_availability,
      ycCompanyStatus: display.ycCompany ?? "Unknown",
      ycCompanyEvidence: raw.yc_alumni_status,
      ycProgramStatus: display.ycProgram ?? "Unknown",
      ycProgramEvidence: raw.yc_partnership_status,
      relationshipStatus: "External Resource",
      integrationStatus: "Not connected",
      researchStatus: "Public-source review",
      reviewedAt: FINANCIAL_REVIEWED_AT,
      sources: raw.sources,
      tags: raw.tags,
      caution: raw.caution,
      perksVault: display.perks ?? false,
      warning: display.warning,
      sunsetDate: display.sunsetDate,
      offerDeadline: display.offerDeadline,
    };
  });

export function normalizeFinancialAlias(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function findFinancialRecordByAlias(
  value: string
): FinancialStackRecord | undefined {
  const alias = normalizeFinancialAlias(value);
  if (!alias) return undefined;
  return financialStackRecords.find(
    record =>
      normalizeFinancialAlias(record.id) === alias ||
      record.aliases.some(name => normalizeFinancialAlias(name) === alias)
  );
}

function normalizedUrl(value: string): string | undefined {
  if (!isSafeFinancialUrl(value)) return undefined;
  const url = new URL(value);
  return `${url.hostname.replace(/^www\./, "")}${url.pathname.replace(/\/+$/, "")}${url.search}`;
}

/** Exact product/program identity only. Shared domains never merge distinct products or perks. */
export function matchFinancialDirectoryEntry(
  record: FinancialStackRecord,
  entries: readonly DirectoryEntry[]
): DirectoryEntry | undefined {
  const url = normalizedUrl(record.officialUrl);
  const aliases = new Set(record.aliases.map(normalizeFinancialAlias));
  return entries.find(
    entry =>
      normalizedUrl(entry.url) === url ||
      aliases.has(normalizeFinancialAlias(entry.title)) ||
      entry.id === record.id
  );
}

/** Caller supplies the pre-existing catalog to avoid a shared-module runtime import cycle. */
export function createNewFinancialDirectoryEntries(
  existing: readonly DirectoryEntry[]
): DirectoryEntry[] {
  return financialStackRecords
    .filter(record => !matchFinancialDirectoryEntry(record, existing))
    .map(record => ({
      id: record.id,
      title: record.name,
      description: record.summary,
      category: "Financial Infrastructure",
      tags: [...record.tags, record.role, ...record.aliases],
      url: record.officialUrl,
      kind: "resource",
      source: new URL(record.officialUrl).hostname.replace(/^www\./, ""),
      featured: false,
      caution: [record.warning, record.caution].filter(Boolean).join(" "),
      sourceTitle:
        "Official public-page research review; individual terms may be Unknown",
      reviewedAt: record.reviewedAt,
      workspace: "Founder Financial Infrastructure",
      relationshipStatus: "External Resource",
    }));
}

export interface FinancialSearchOptions {
  query?: string;
  role?: FinancialRole;
  view?: "directory" | "perks";
  api?: "all" | "available" | "unknown";
}

/** Plain local keyword search. No LLM, remote feed, scoring recommendation or eligibility inference. */
export function searchFinancialStack({
  query = "",
  role = "All roles",
  view = "directory",
  api = "all",
}: FinancialSearchOptions = {}): FinancialStackRecord[] {
  const terms =
    query
      .slice(0, 256)
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? [];
  const matches = financialStackRecords.filter(record => {
    if (role !== "All roles" && record.role !== role) return false;
    if (view === "perks" && !record.perksVault) return false;
    if (api === "available" && record.apiStatus !== "Available") return false;
    if (api === "unknown" && record.apiStatus === "Available") return false;
    const text = [
      record.id,
      record.name,
      ...record.aliases,
      record.role,
      record.summary,
      ...record.tags,
      record.eligibility,
      record.stageGuidance,
    ]
      .join(" ")
      .toLowerCase();
    return terms.every(term => text.includes(term));
  });
  // Only presentation order: marketplaces first in Perks Vault, not a ranking or recommendation.
  return view === "perks"
    ? [...matches].sort(
        (a, b) =>
          Number(b.kind === "Perks marketplace") -
          Number(a.kind === "Perks marketplace")
      )
    : matches;
}

export function paginateFinancialStack(
  records: readonly FinancialStackRecord[],
  page = 1
): FinancialStackRecord[] {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  return records.slice(0, safePage * FINANCIAL_PAGE_SIZE);
}

/** Invalid, duplicated or oversized selections cannot escape the three-record compare boundary. */
export function safeFinancialCompareIds(ids: readonly string[]): string[] {
  const validIds = new Set(financialStackRecords.map(record => record.id));
  return Array.from(new Set(ids.filter(id => validIds.has(id)))).slice(
    0,
    MAX_FINANCIAL_COMPARE
  );
}

export function toggleFinancialCompare(
  ids: readonly string[],
  id: string
): string[] {
  const current = safeFinancialCompareIds(ids);
  if (current.includes(id)) return current.filter(value => value !== id);
  return safeFinancialCompareIds([...current, id]);
}

export function financialCompareRecords(
  ids: readonly string[]
): FinancialStackRecord[] {
  return safeFinancialCompareIds(ids).map(
    id => financialStackRecords.find(record => record.id === id)!
  );
}

export const financialExternalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
  referrerPolicy: "no-referrer",
} as const;
