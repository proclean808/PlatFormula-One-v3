import { READING_WORKSPACES, startupReads } from "./startupReads";
import { founderServiceResources } from "./founderServices";
import { createNewFinancialDirectoryEntries } from "./founderFinancialStack";

export const DIRECTORY_PAGE_SIZE = 9;
export const DIRECTORY_FILTERS = [
  "All",
  "Accelerators",
  "AI Credits",
  "Investors",
  "Startup Reads",
  "Tools & Platforms",
  "Founder Services",
  "Financial Infrastructure",
] as const;
export type DirectoryFilter = (typeof DIRECTORY_FILTERS)[number];
export type DirectoryCategory = Exclude<DirectoryFilter, "All">;
export type DirectoryKind = "resource" | "guide";

export interface DirectoryEntry {
  id: string;
  title: string;
  description: string;
  category: DirectoryCategory;
  tags: string[];
  url: string;
  kind: DirectoryKind;
  source: string;
  featured: boolean;
  logo?: string;
  action?: string;
  caution?: string;
  sourceTitle?: string;
  reviewedAt?: string;
  workspace?: string;
  relationshipStatus?:
    | "External Resource"
    | "Integration Planned"
    | "Integration Verified"
    | "Commercial Partner";
}

export interface DirectorySource {
  id: string;
  title: string;
  description: string;
  landingUrl: string;
  mode: "external-source-search";
  feedStatus: "not-connected";
  aiUrl?: string;
  statusNote?: string;
  /** Add only a source-verified query adapter; otherwise open the source landing page. */
  search?: { url: string; queryParam: string };
}

/** External landing links, not imported feeds. Verification/adapter updates belong here. */
export const directorySources: DirectorySource[] = [
  {
    id: "yc",
    title: "Y Combinator",
    description: "Explore YC companies and find startups by sector.",
    landingUrl: "https://www.ycombinator.com/companies",
    mode: "external-source-search",
    feedStatus: "not-connected",
    search: {
      url: "https://www.ycombinator.com/companies",
      queryParam: "query",
    },
    aiUrl: "https://www.ycombinator.com/companies/industry/ai",
    statusNote:
      "YC-backed companies only. Query deep link verified November 18, 2026.",
  },
  {
    id: "techstars",
    title: "Techstars",
    description: "Browse companies in the Techstars portfolio.",
    landingUrl: "https://www.techstars.com/portfolio",
    mode: "external-source-search",
    feedStatus: "not-connected",
    statusNote:
      "Portfolio landing page. Search transfer and a dedicated AI filter are not verified.",
  },
  {
    id: "product-hunt",
    title: "Product Hunt",
    description: "Discover AI products and explore new launches.",
    landingUrl: "https://www.producthunt.com/topics/artificial-intelligence",
    mode: "external-source-search",
    feedStatus: "not-connected",
    aiUrl: "https://www.producthunt.com/topics/artificial-intelligence",
    statusNote:
      "AI product launches, not every startup. Search transfer disabled after automated botblocking.",
  },
  {
    id: "kickstarter",
    title: "Kickstarter",
    description: "Explore creative projects and crowdfunding ideas.",
    landingUrl: "https://www.kickstarter.com/discover/advanced",
    mode: "external-source-search",
    feedStatus: "not-connected",
    statusNote:
      "Creative crowdfunding projects. Search transfer is not verified; use the site's keyword and Technology filters.",
  },
];

export function isSafeDirectoryUrl(value: string): boolean {
  if (value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value))
    return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function directorySourceUrl(
  source: DirectorySource,
  query = ""
): string | undefined {
  const base =
    source.search && query.trim() ? source.search.url : source.landingUrl;
  if (!isSafeDirectoryUrl(base)) return undefined;
  if (!source.search || !query.trim()) return base;
  const url = new URL(base);
  url.searchParams.set(source.search.queryParam, query.trim().slice(0, 256));
  return url.toString();
}

function resource(
  id: string,
  title: string,
  url: string,
  description: string,
  category: DirectoryCategory,
  tags: string[],
  featured = false,
  logo?: string
): DirectoryEntry {
  return {
    id,
    title,
    url,
    description,
    category,
    tags,
    featured,
    logo,
    kind: "resource",
    source: new URL(url).hostname.replace(/^www\./, ""),
  };
}

/** All 88 original resource URLs and stored logos are retained. Terms are deliberately not promised. */
export const localResources: DirectoryEntry[] = [
  resource(
    "y-combinator",
    "Y Combinator",
    "https://www.ycombinator.com",
    "Accelerator for early-stage startups across industries.",
    "Accelerators",
    ["accelerator", "early stage", "YC"],
    false,
    "/manus-storage/yc-logo_37599741.png"
  ),
  resource(
    "yc-application",
    "YC Application",
    "https://www.ycombinator.com/apply",
    "Explore the application process for Y Combinator’s accelerator.",
    "Accelerators",
    ["YC", "apply", "early stage"]
  ),
  resource(
    "startup-school",
    "Startup School",
    "https://www.startupschool.org",
    "Online founder education and startup-building resources.",
    "Tools & Platforms",
    ["learning", "founder education", "build"]
  ),
  resource(
    "yc-startup-directory",
    "YC Startup Directory",
    "https://www.ycombinator.com/companies",
    "Browse companies in the Y Combinator startup directory.",
    "Tools & Platforms",
    ["YC", "company discovery", "research"]
  ),
  resource(
    "hacker-news",
    "Hacker News",
    "https://news.ycombinator.com",
    "Technology and startup news community.",
    "Tools & Platforms",
    ["community", "news", "technology"]
  ),
  resource(
    "f6s",
    "F6S",
    "https://www.f6s.com",
    "Platform connecting founders with startup programs, investors and events.",
    "Tools & Platforms",
    ["accelerators", "investors", "programs"]
  ),
  resource(
    "f6s-events",
    "F6S Event Finder",
    "https://www.f6s.com/programs?type[]=short_event&sort=closest&sort_dir=desc",
    "Discover startup events, hackathons, pitch competitions and networking opportunities.",
    "Tools & Platforms",
    ["events", "hackathons", "pitch", "networking"]
  ),
  resource(
    "techstars",
    "Techstars",
    "https://www.techstars.com",
    "Startup accelerator network with mentorship and founder support.",
    "Accelerators",
    ["accelerator", "mentorship", "global"],
    false,
    "/manus-storage/techstars-logo_670a0e22.webp"
  ),
  resource(
    "500-global",
    "500 Global",
    "https://500.co",
    "Venture investment and startup accelerator programs.",
    "Accelerators",
    ["accelerator", "venture capital", "global"],
    false,
    "/manus-storage/500global-logo_9b4545d9.png"
  ),
  resource(
    "thrive-capital",
    "Thrive Capital",
    "https://thrivecap.com",
    "Investment firm backing technology companies with long-term capital.",
    "Investors",
    ["venture capital", "technology"]
  ),
  resource(
    "innovation-works",
    "Innovation Works",
    "https://innovationworks.org",
    "Pittsburgh startup support, including AlphaLab and Robotics Factory programs.",
    "Accelerators",
    ["Pittsburgh", "robotics", "incubator"]
  ),
  resource(
    "startupbootcamp",
    "Startupbootcamp",
    "https://www.startupbootcamp.org",
    "Network of industry-focused accelerators, including AI, fintech and health technology.",
    "Accelerators",
    ["AI", "fintech", "healthtech", "accelerator"]
  ),
  resource(
    "forum-ventures",
    "Forum Ventures",
    "https://www.forumvc.com",
    "B2B software founder support with a go-to-market focus.",
    "Accelerators",
    ["B2B", "SaaS", "go to market"]
  ),
  resource(
    "entrepreneurs-first",
    "Entrepreneurs First",
    "https://www.joinef.com",
    "Founder and team-building programs for ambitious technical entrepreneurs.",
    "Accelerators",
    ["deep tech", "pre idea", "team building"]
  ),
  resource(
    "nfx",
    "NFX",
    "https://www.nfx.com",
    "Venture firm focused on startups with network effects.",
    "Investors",
    ["venture capital", "network effects"]
  ),
  resource(
    "ntt-docomo-ventures",
    "NTT DOCOMO Ventures",
    "https://www.nttdocomo-v.com/en/",
    "Technology investment firm with interests including AI, IoT and fintech.",
    "Investors",
    ["AI", "Japan", "IoT", "fintech"]
  ),
  resource(
    "idealab",
    "Idealab",
    "https://www.idealab.com",
    "Technology company creation and incubation.",
    "Accelerators",
    ["incubator", "technology", "venture studio"]
  ),
  resource(
    "dmz",
    "DMZ",
    "https://dmz.torontomu.ca",
    "University-connected startup incubator in Toronto.",
    "Accelerators",
    ["incubator", "Canada", "Toronto"]
  ),
  resource(
    "european-innovation-council",
    "European Innovation Council",
    "https://eic.ec.europa.eu",
    "European innovation programs for emerging technologies and entrepreneurs.",
    "Accelerators",
    ["Europe", "innovation", "deep tech"]
  ),
  resource(
    "founder-friendly-labs",
    "Founder Friendly Labs",
    "https://founderfriendlylabs.com",
    "Startup founder program and company-building support.",
    "Accelerators",
    ["founder program", "build"]
  ),
  resource(
    "founderfuel",
    "FounderFuel",
    "https://founderfuel.com",
    "Montreal-based startup accelerator.",
    "Accelerators",
    ["accelerator", "Montreal", "Canada"]
  ),
  resource(
    "h-farm",
    "H-FARM",
    "https://www.h-farm.com",
    "Italian innovation hub for entrepreneurs and technology ventures.",
    "Accelerators",
    ["Italy", "innovation", "founder support"]
  ),
  resource(
    "bonangels",
    "BonAngels Venture Partners",
    "https://www.bonangels.net",
    "South Korean early-stage venture investment firm.",
    "Investors",
    ["venture capital", "South Korea", "early stage"]
  ),
  resource(
    "south-park-commons",
    "South Park Commons",
    "https://www.southparkcommons.com",
    "Founder community for exploring ideas and building companies.",
    "Accelerators",
    ["community", "pre idea", "build"]
  ),
  resource(
    "surge",
    "Surge",
    "https://surge.xyz",
    "Startup founder program and early-stage company support.",
    "Accelerators",
    ["accelerator", "early stage"]
  ),
  resource(
    "microsoft-startups",
    "Microsoft for Startups",
    "https://www.microsoft.com/startups",
    "Explore cloud resources and startup support for building AI products.",
    "AI Credits",
    ["AI", "cloud", "credits", "build"],
    true
  ),
  resource(
    "sparklabs",
    "SparkLabs",
    "https://www.sparklabs.co.kr",
    "Seoul-based startup accelerator and founder network.",
    "Accelerators",
    ["accelerator", "Seoul", "South Korea"]
  ),
  resource(
    "accelerator-centre",
    "Accelerator Centre",
    "https://acceleratorcentre.com",
    "Startup incubation and acceleration in Waterloo, Canada.",
    "Accelerators",
    ["accelerator", "incubator", "Waterloo", "Canada"]
  ),
  resource(
    "outlier-ventures",
    "Outlier Ventures",
    "https://outlierventures.io",
    "Venture support for Web3 and AI entrepreneurs.",
    "Accelerators",
    ["AI", "Web3", "venture support"]
  ),
  resource(
    "indiebio",
    "IndieBio",
    "https://indiebio.co",
    "Startup program at the intersection of biotechnology and technology.",
    "Accelerators",
    ["biotech", "accelerator"]
  ),
  resource(
    "appworks",
    "AppWorks",
    "https://appworks.tw",
    "Taiwan-based startup accelerator and founder community.",
    "Accelerators",
    ["accelerator", "Taiwan", "community"]
  ),
  resource(
    "allen-institute-ai",
    "Allen Institute for AI",
    "https://allenai.org",
    "Seattle-based artificial intelligence research institute.",
    "Tools & Platforms",
    ["AI", "research", "Seattle"]
  ),
  resource(
    "cyberport",
    "Cyberport Hong Kong",
    "https://www.cyberport.hk",
    "Hong Kong digital technology hub and startup support community.",
    "Accelerators",
    ["Hong Kong", "digital technology", "community"]
  ),
  resource(
    "scale-ai",
    "SCALE AI",
    "https://www.scaleai.ca",
    "Canadian ecosystem supporting applied artificial intelligence.",
    "Accelerators",
    ["AI", "Canada", "applied AI"]
  ),
  resource(
    "expert-dojo",
    "EXPERT DOJO",
    "https://expertdojo.com",
    "Startup accelerator and venture support based in Santa Monica.",
    "Accelerators",
    ["accelerator", "Santa Monica"]
  ),
  resource(
    "tandemlaunch",
    "TandemLaunch",
    "https://tandemlaunch.com",
    "Montreal-based venture creation and deep technology commercialization.",
    "Accelerators",
    ["deep tech", "Montreal", "venture studio"]
  ),
  resource(
    "zeroth-ai",
    "Zeroth.AI",
    "https://zeroth.ai",
    "AI-focused startup accelerator.",
    "Accelerators",
    ["AI", "accelerator"]
  ),
  resource(
    "ai-fund",
    "AI Fund",
    "https://aifund.ai",
    "AI-focused venture firm and company-building support.",
    "Investors",
    ["AI", "venture capital", "venture studio"],
    true
  ),
  resource(
    "next-ai",
    "Next AI",
    "https://www.nextcanada.com/next-ai/",
    "Canadian accelerator for artificial intelligence ventures.",
    "Accelerators",
    ["AI", "accelerator", "Canada"]
  ),
  resource(
    "accelerating-asia",
    "Accelerating Asia",
    "https://www.acceleratingasia.com",
    "Singapore-based startup accelerator and venture support.",
    "Accelerators",
    ["accelerator", "Singapore", "Asia"]
  ),
  resource(
    "nvidia-inception",
    "Nvidia Inception",
    "https://www.nvidia.com/en-us/startups/",
    "Explore GPU-related resources and technical support for AI startups.",
    "AI Credits",
    ["AI", "GPU", "compute", "startup program"],
    true
  ),
  resource(
    "genai-fasttrack",
    "GenAI Fund FastTrack",
    "https://genaifund.ai/fasttrack-ai-accelerator/",
    "AI accelerator with an enterprise proof-of-concept and Southeast Asia focus.",
    "Accelerators",
    ["AI", "enterprise", "proof of concept", "Asia"]
  ),
  resource(
    "ai-grant",
    "AI Grant",
    "https://aigrant.org",
    "Explore support and application information for AI projects.",
    "AI Credits",
    ["AI", "grants", "research"]
  ),
  resource(
    "alchemist",
    "Alchemist Accelerator",
    "https://www.alchemistaccelerator.com",
    "Accelerator for early-stage enterprise ventures.",
    "Accelerators",
    ["accelerator", "enterprise", "seed stage"]
  ),
  resource(
    "plug-and-play",
    "Plug and Play",
    "https://www.plugandplaytechcenter.com",
    "Innovation platform connecting startups with corporations.",
    "Accelerators",
    ["innovation", "corporate", "startup support"]
  ),
  resource(
    "berkeley-skydeck",
    "Berkeley SkyDeck",
    "https://skydeck.berkeley.edu",
    "University of California, Berkeley startup accelerator.",
    "Accelerators",
    ["accelerator", "Berkeley", "university"]
  ),
  resource(
    "angelpad",
    "AngelPad",
    "https://angelpad.com",
    "Seed-stage accelerator with a hands-on founder approach.",
    "Accelerators",
    ["accelerator", "seed stage", "mentorship"]
  ),
  resource(
    "founder-institute",
    "Founder Institute",
    "https://fi.co",
    "Pre-seed accelerator and founder development programs.",
    "Accelerators",
    ["accelerator", "pre seed", "founder program"]
  ),
  resource(
    "hax",
    "HAX",
    "https://hax.co",
    "Venture firm and startup support focused on hard technology.",
    "Accelerators",
    ["hard tech", "hardware", "venture support"]
  ),
  resource(
    "deepcore",
    "Deepcore",
    "https://deepcore.jp/en/",
    "Tokyo-based investment and incubation for AI and deep technology.",
    "Investors",
    ["AI", "deep tech", "Tokyo", "incubator"]
  ),
  resource(
    "ai2-incubator",
    "AI2 Incubator",
    "https://allenai.org/incubator",
    "AI startup incubation associated with the Allen Institute ecosystem.",
    "Accelerators",
    ["AI", "incubator", "build"],
    true
  ),
  resource(
    "vercel-ai-accelerator",
    "Vercel AI Accelerator",
    "https://vercel.com/blog/the-vercel-ai-accelerator-is-back-with-6-million-in-credits",
    "Read Vercel’s AI accelerator announcement; check current availability and terms.",
    "AI Credits",
    ["AI", "credits", "accelerator", "build"],
    false,
    "/manus-storage/vercel-logo_6976c134.png"
  ),
  resource(
    "vercel-ai-sdk",
    "Vercel AI SDK",
    "https://ai-sdk.dev/docs/introduction",
    "TypeScript toolkit for building AI apps and model-powered interfaces.",
    "Tools & Platforms",
    ["AI", "build", "app", "website", "TypeScript", "SDK"],
    true,
    "/manus-storage/vercel-logo_6976c134.png"
  ),
  resource(
    "accel-atoms",
    "Accel Atoms",
    "https://www.accel.com/programs/atoms",
    "Explore Accel’s pre-seed founder programs and AI-related cohorts.",
    "Accelerators",
    ["AI", "pre seed", "founder program"]
  ),
  resource(
    "a16z-speedrun",
    "a16z Speedrun",
    "https://a16z.com/speedrun/",
    "Startup accelerator for technology, gaming and AI founders.",
    "Accelerators",
    ["AI", "gaming", "accelerator"]
  ),
  resource(
    "pearx",
    "Pear VC PearX",
    "https://pear.vc/pearx/",
    "Pre-seed accelerator with recruiting, sales and fundraising support.",
    "Accelerators",
    ["pre seed", "accelerator", "fundraising", "sales"]
  ),
  resource(
    "tinyfish-accelerator",
    "TinyFish Accelerator",
    "https://www.tinyfish.ai/accelerator",
    "Startup accelerator focused on agentic web products.",
    "Accelerators",
    ["AI", "agents", "web", "build"]
  ),
  resource(
    "founders-inc",
    "Founders, Inc (f.inc)",
    "https://f.inc/",
    "Venture studio and founder community with company-building support.",
    "Accelerators",
    ["venture studio", "community", "build"]
  ),
  resource(
    "skydeck-ipp",
    "Berkeley SkyDeck IPP",
    "https://skydeck.berkeley.edu/innovation-partner-program/",
    "Explore SkyDeck’s Innovation Partner Program and founder resources.",
    "Accelerators",
    ["Berkeley", "innovation", "founder program"]
  ),
  resource(
    "digital-catapult",
    "Digital Catapult",
    "https://www.digicalcatapult.org.uk",
    "UK deep technology innovation and startup support.",
    "Accelerators",
    ["UK", "deep tech", "innovation"]
  ),
  resource(
    "jolt-capital",
    "Jolt Capital",
    "https://www.jolt.vc",
    "Paris-based investor in deep technology companies.",
    "Investors",
    ["venture capital", "deep tech", "Paris"]
  ),
  resource(
    "reo-dev",
    "Reo.Dev",
    "https://reo.dev",
    "AI-native go-to-market platform for developer-tool companies.",
    "Tools & Platforms",
    ["AI", "go to market", "developer tools", "sales"],
    false,
    "/manus-storage/reodev-logo_d7263c4a.jpg"
  ),
  resource(
    "angellist",
    "AngelList",
    "https://www.angellist.com",
    "Platform for venture investing, angel investors and syndicates.",
    "Investors",
    ["angel investors", "syndicates", "venture capital"]
  ),
  resource(
    "first-round",
    "First Round Capital",
    "https://firstround.com",
    "Seed-stage investment firm with founder content through First Round Review.",
    "Investors",
    ["venture capital", "seed stage", "founder learning"]
  ),
  resource(
    "tq-ventures",
    "TQ Ventures",
    "https://www.tqventures.com",
    "Pre-seed and seed-stage venture firm focused on technical founders.",
    "Investors",
    ["venture capital", "pre seed", "seed stage"]
  ),
  resource(
    "e2vc",
    "e2vc",
    "https://www.e2vc.com",
    "European seed-stage venture firm backing technology founders.",
    "Investors",
    ["venture capital", "Europe", "seed stage"]
  ),
  resource(
    "inovo",
    "Inovo",
    "https://www.inovo.vc",
    "European seed and Series A investor in technology startups.",
    "Investors",
    ["venture capital", "Europe", "seed stage", "Series A"]
  ),
  resource(
    "rockaway",
    "Rockaway Ventures",
    "https://www.rockaway.com",
    "Central and Eastern Europe-focused venture investment.",
    "Investors",
    ["venture capital", "Europe", "growth stage"]
  ),
  resource(
    "uncork",
    "Uncork Capital",
    "https://www.uncorkcapital.com",
    "Investor in early-stage software and marketplace startups.",
    "Investors",
    ["venture capital", "software", "marketplace", "seed stage"]
  ),
  resource(
    "samsung-next",
    "Samsung Next",
    "https://www.samsungnext.com",
    "Technology investment in software and services.",
    "Investors",
    ["venture capital", "software", "services"]
  ),
  resource(
    "encoded",
    "Encoded Ventures",
    "https://www.encoded.vc",
    "Venture firm backing technical founders in B2B software.",
    "Investors",
    ["venture capital", "B2B", "software"]
  ),
  resource(
    "elevation",
    "Elevation Capital",
    "https://www.elevationcapital.com",
    "India-focused early-stage venture investment.",
    "Investors",
    ["venture capital", "India", "early stage"]
  ),
  resource(
    "lightspeed",
    "Lightspeed Venture Partners",
    "https://lsvp.com",
    "Multi-stage venture firm focused on enterprise, fintech and consumer technology.",
    "Investors",
    ["venture capital", "enterprise", "fintech", "consumer"]
  ),
  resource(
    "bain-ventures",
    "Bain Capital Ventures",
    "https://www.baincapitalventures.com",
    "Seed-to-growth technology investment and company support.",
    "Investors",
    ["venture capital", "seed stage", "growth stage"]
  ),
  resource(
    "greylock",
    "Greylock",
    "https://greylock.com",
    "Venture firm focused on enterprise software and consumer internet.",
    "Investors",
    ["venture capital", "enterprise", "consumer", "software"]
  ),
  resource(
    "norwest",
    "Norwest Venture Partners",
    "https://www.nvp.com",
    "Multi-stage investment in enterprise and consumer technology.",
    "Investors",
    ["venture capital", "enterprise", "consumer"]
  ),
  resource(
    "two-bear",
    "Two Bear Capital",
    "https://www.twobearcapital.com",
    "Early-stage venture investment in technology companies.",
    "Investors",
    ["venture capital", "early stage", "software"]
  ),
  resource(
    "infinity",
    "Infinity Ventures",
    "https://www.infinityventures.com",
    "Investment in technology and internet companies.",
    "Investors",
    ["venture capital", "technology", "internet"]
  ),
  resource(
    "synchrony",
    "Synchrony Ventures",
    "https://www.synchronyventures.com",
    "Explore investment activity in financial services and technology.",
    "Investors",
    ["venture capital", "financial services"]
  ),
  resource(
    "a16z",
    "Andreessen Horowitz (a16z)",
    "https://a16z.com",
    "Venture firm investing across stages in technology companies.",
    "Investors",
    ["venture capital", "technology", "multi stage"]
  ),
  resource(
    "nea",
    "NEA",
    "https://www.nea.com",
    "New Enterprise Associates: venture investment across company stages.",
    "Investors",
    ["venture capital", "multi stage"]
  ),
  resource(
    "general-catalyst",
    "General Catalyst",
    "https://www.generalcatalyst.com",
    "Multi-stage venture firm backing technology companies.",
    "Investors",
    ["venture capital", "technology", "multi stage"]
  ),
  resource(
    "georgian",
    "Georgian Partners",
    "https://www.georgian.io",
    "Growth-stage investment in B2B software with an applied AI focus.",
    "Investors",
    ["AI", "B2B", "software", "growth stage"]
  ),
  resource(
    "sequoia",
    "Sequoia Capital",
    "https://www.sequoiacap.com",
    "Venture firm backing companies from seed through growth stages.",
    "Investors",
    ["venture capital", "seed stage", "growth stage"]
  ),
  resource(
    "sapphire",
    "Sapphire Ventures",
    "https://sapphireventures.com",
    "Growth-stage venture investment in B2B software companies.",
    "Investors",
    ["venture capital", "B2B", "software", "growth stage"]
  ),
  resource(
    "bessemer",
    "Bessemer Venture Partners",
    "https://www.bvp.com",
    "Cross-stage venture investment with interests in AI, cloud and healthcare.",
    "Investors",
    ["AI", "cloud", "healthcare", "venture capital"],
    true
  ),
  resource(
    "founders-fund",
    "Founders Fund",
    "https://foundersfund.com",
    "San Francisco-based venture investment in technology companies.",
    "Investors",
    ["venture capital", "technology", "San Francisco"]
  ),
  resource(
    "kleiner-perkins",
    "Kleiner Perkins",
    "https://www.kleinerperkins.com",
    "Venture firm backing technology founders and companies.",
    "Investors",
    ["venture capital", "technology"]
  ),
];

/** Small existing local selection; no inferred YC affiliation, ranking or price guarantees. */
const existingBuildTools: DirectoryEntry[] = [
  resource(
    "lovable",
    "Lovable.dev",
    "https://lovable.dev/",
    "Build web apps from natural-language instructions with an AI-assisted workflow.",
    "Tools & Platforms",
    ["AI", "build", "website", "app", "no code"],
    true
  ),
  resource(
    "replit",
    "Replit",
    "https://replit.com",
    "AI-assisted browser development environment for coding and deploying apps.",
    "Tools & Platforms",
    ["AI", "build", "website", "app", "coding", "deployment"],
    true
  ),
  resource(
    "github-copilot",
    "GitHub Copilot",
    "https://github.com/features/copilot",
    "AI coding assistant for code suggestions and development workflows.",
    "Tools & Platforms",
    ["AI", "build", "coding", "developer tools"]
  ),
];

export const directoryGuides: DirectoryEntry[] = startupReads.map(read => ({
  id: `guide-${read.id}`,
  title: read.title,
  description: read.summary,
  category: "Startup Reads",
  tags: [...read.tags, read.category],
  url: read.sourceUrl,
  kind: "guide",
  source: "Everything Startups",
  featured: read.id === "startup-credits",
  action: read.action,
  caution: read.caution,
  sourceTitle: read.sourceTitle,
  reviewedAt: read.reviewedAt,
  workspace: READING_WORKSPACES[read.category],
}));

const existingDirectoryEntries: DirectoryEntry[] = [
  ...localResources,
  ...directoryGuides,
  ...existingBuildTools,
  ...founderServiceResources,
];

/** Count only approved actual additions after exact URL and product/program alias matching. */
export const newFinancialDirectoryEntries = createNewFinancialDirectoryEntries(
  existingDirectoryEntries
);
export const resourceDirectory: DirectoryEntry[] = [
  ...existingDirectoryEntries,
  ...newFinancialDirectoryEntries,
];

const STOPWORDS = new Set([
  "a",
  "am",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "can",
  "could",
  "do",
  "for",
  "from",
  "has",
  "have",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "please",
  "that",
  "the",
  "their",
  "this",
  "to",
  "us",
  "we",
  "what",
  "where",
  "which",
  "with",
  "would",
  "you",
  "your",
  "find",
  "finding",
  "get",
  "getting",
  "give",
  "help",
  "looking",
  "need",
  "needs",
  "show",
  "tell",
  "want",
  "wants",
  "like",
  "some",
  "any",
  "best",
  "good",
  "great",
  "first",
  "new",
  "start",
  "starting",
  "startup",
  "startups",
  "founder",
  "founders",
]);

/** Explicit, inspectable synonyms; plain text matching only, not AI inference or executable input. */
export const DIRECTORY_SYNONYMS: Readonly<Record<string, string>> = {
  artificialintelligence: "ai",
  genai: "ai",
  ml: "ai",
  llm: "ai",
  llms: "ai",
  credit: "credits",
  credits: "credits",
  compute: "credits",
  cloud: "credits",
  cloudfunding: "credits",
  gpu: "credits",
  investor: "investors",
  investors: "investors",
  investing: "investors",
  investment: "investors",
  investments: "investors",
  fundraising: "investors",
  funding: "investors",
  vc: "investors",
  capital: "investors",
  deck: "pitch",
  decks: "pitch",
  pitch: "pitch",
  pitching: "pitch",
  website: "build",
  websites: "build",
  app: "build",
  apps: "build",
  application: "build",
  applications: "build",
  build: "build",
  building: "build",
  builder: "build",
  builders: "build",
  coding: "build",
  code: "build",
  create: "build",
  creating: "build",
  develop: "build",
  developing: "build",
  development: "build",
  launch: "build",
  accelerator: "accelerators",
  accelerators: "accelerators",
  incubator: "accelerators",
  incubators: "accelerators",
  read: "reads",
  reads: "reads",
  reading: "reads",
  guide: "reads",
  guides: "reads",
  tools: "tool",
  platforms: "platform",
  attorney: "counsel",
  attorneys: "counsel",
  lawyer: "counsel",
  lawyers: "counsel",
};

function canonicalWord(word: string): string {
  return Object.prototype.hasOwnProperty.call(DIRECTORY_SYNONYMS, word)
    ? DIRECTORY_SYNONYMS[word]
    : word;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bartificial\s+intelligence\b/g, "ai")
    .replace(/\bcloud\s+funding\b/g, "credits")
    .replace(/\bventure\s+capital\b/g, "investors");
}

function words(value: string): string[] {
  return normalizeText(value).match(/[a-z0-9]+/g) ?? [];
}

export function directorySearchTerms(query: string): string[] {
  return Array.from(
    new Set(
      words(query.slice(0, 256))
        .filter(word => !STOPWORDS.has(word))
        .map(canonicalWord)
    )
  );
}

function searchableWords(value: string): Set<string> {
  return new Set(words(value).map(canonicalWord));
}

/** AI focus uses explicit curated tags, never the fact that a program accepts all industries. */
export function isAiDirectoryEntry(entry: DirectoryEntry): boolean {
  return entry.tags.some(tag => searchableWords(tag).has("ai"));
}

export interface DirectorySearchOptions {
  query?: string;
  category?: DirectoryFilter;
  aiOnly?: boolean;
}

export function searchResourceDirectory(
  entries: readonly DirectoryEntry[] = resourceDirectory,
  { query = "", category = "All", aiOnly = true }: DirectorySearchOptions = {}
): DirectoryEntry[] {
  const terms = directorySearchTerms(query);
  return entries
    .filter(
      entry =>
        isSafeDirectoryUrl(entry.url) &&
        (category === "All" || entry.category === category) &&
        (!aiOnly || isAiDirectoryEntry(entry))
    )
    .map((entry, index) => {
      const title = searchableWords(entry.title);
      const tags = searchableWords([entry.category, ...entry.tags].join(" "));
      const body = searchableWords(
        [entry.description, entry.action ?? "", entry.source].join(" ")
      );
      const match = terms.every(
        term => title.has(term) || tags.has(term) || body.has(term)
      );
      const score = terms.reduce(
        (sum, term) => sum + (title.has(term) ? 4 : tags.has(term) ? 2 : 1),
        0
      );
      return { entry, index, match, score };
    })
    .filter(result => result.match)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.entry.featured) - Number(a.entry.featured) ||
        a.index - b.index
    )
    .map(result => result.entry);
}

export function paginateDirectory(
  entries: readonly DirectoryEntry[],
  page = 1
): DirectoryEntry[] {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  return entries.slice(0, safePage * DIRECTORY_PAGE_SIZE);
}

export function featuredDirectoryEntries(
  entries: readonly DirectoryEntry[] = resourceDirectory
): DirectoryEntry[] {
  return entries
    .filter(entry => entry.featured && isSafeDirectoryUrl(entry.url))
    .slice(0, DIRECTORY_PAGE_SIZE);
}
