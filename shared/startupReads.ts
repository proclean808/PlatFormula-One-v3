export type ReadingStage = "Validate" | "Build" | "Grow" | "Raise";
export interface StartupRead {
  id: string;
  title: string;
  category: ReadingStage;
  summary: string;
  action: string;
  tags: string[];
  caution: string;
  sourceTitle: string;
  sourceUrl: string;
  reviewedAt: string;
}

export const STARTUP_READS_SOURCE = "https://www.everythingstartups.com/category/startupsreads";
export const READING_STAGES: ReadingStage[] = ["Validate", "Build", "Grow", "Raise"];
export const READING_WORKSPACES: Record<ReadingStage, string> = {
  Validate: "concept", Build: "buildstudio", Grow: "grow", Raise: "pitch",
};

export const startupReads: StartupRead[] = [
  {
    id: "fundraising-tools", title: "Build a fundraising stack that keeps diligence moving", category: "Raise",
    summary: "Match tools to the jobs of a raise: investor discovery, pitch sharing, pipeline follow-up and cap-table readiness. Start with the gaps in your workflow, not a bigger software shopping list.",
    action: "Map your raise into research, deck sharing, follow-up and diligence. Test one suitable tool for the biggest gap first.",
    tags: ["fundraising", "investor relations", "pitch decks", "cap table"],
    caution: "Verify current capabilities, prices and security claims with each provider.",
    sourceTitle: "8 Must-Know Startup Tools for Fundraising in 2026",
    sourceUrl: "https://www.everythingstartups.com/article/startup-tools-for-fundraising", reviewedAt: "2026-11-18",
  },
  {
    id: "startup-jobs", title: "Get ahead of the startup hiring crowd", category: "Build",
    summary: "Startup roles can surface through specialist newsletters, curated boards, founder communities and growth signals. A focused weekly routine can be more useful than another broad job-board search.",
    action: "Choose two relevant channels, save your role filters, and contact two target founders with a specific explanation of how you could help.",
    tags: ["startup jobs", "hiring", "career strategy", "founder outreach"],
    caution: "Check live listings, community access rules and paid-tier requirements.",
    sourceTitle: "How to Find Startup Jobs: 10 Underrated Places to Look",
    sourceUrl: "https://www.everythingstartups.com/article/how-to-find-startup-jobs", reviewedAt: "2026-11-18",
  },
  {
    id: "investor-databases", title: "Pick the right investor research stack", category: "Raise",
    summary: "Fund trackers, startup databases and outreach tools answer different questions. Compare freshness, filters, exports and contact provenance, then check investor fit against primary sources.",
    action: "Define stage, sector and geography. Build a shortlist, then verify each investor’s current fund, role and investment thesis before outreach.",
    tags: ["VC databases", "fundraising research", "investor discovery", "due diligence"],
    caution: "A database profile or new fund announcement does not prove active investment or a current check.",
    sourceTitle: "Best Startup and VC Databases in 2026",
    sourceUrl: "https://www.everythingstartups.com/article/best-startupvc-database", reviewedAt: "2026-11-18",
  },
  {
    id: "startup-credits", title: "Make AI infrastructure credits fit your workload", category: "Build",
    summary: "Cloud infrastructure credits and model/API credits are not interchangeable. Match programs to the work you actually run, your stage and the application route available to you.",
    action: "List your AI workloads and monthly costs. Compare eligibility, expiry and post-credit pricing before applying to a matching program.",
    tags: ["AI credits", "cloud infrastructure", "startup programs", "compute costs"],
    caution: "Credits are conditional offers, not guaranteed funding. Check live provider terms.",
    sourceTitle: "How to Get Startup Credits: 10 Programs for Free AI Credits",
    sourceUrl: "https://www.everythingstartups.com/article/how-to-get-startup-credits-10-programs-for-free-ai-credits", reviewedAt: "2026-11-18",
  },
  {
    id: "idea-stage-programs", title: "Find a founder program before you have traction", category: "Validate",
    summary: "Some accelerators and fellowships consider founders before a finished product or settled idea. Compare the program’s format, expectations and location with the support you need next.",
    action: "Shortlist two programs that fit your stage. Verify current equity terms, fees, deadlines and location requirements before applying.",
    tags: ["idea-stage startups", "startup accelerators", "founder fellowships", "pre-seed funding"],
    caution: "Program investment, eligibility and terms can change; no offer or acceptance is implied.",
    sourceTitle: "8 Startup Programs That Fund Founders at the Idea Stage (Up to $2M)",
    sourceUrl: "https://www.everythingstartups.com/article/idea-stage-startup-programs", reviewedAt: "2026-11-18",
  },
  {
    id: "fundraising-terms", title: "Decode the deal before you raise", category: "Raise",
    summary: "Understand SAFEs, dilution, liquidation preference, runway and closing before comparing offers. The amount raised is only one part of the ownership and control picture.",
    action: "Mark unfamiliar terms in your proposed deal, model dilution with your own numbers, and review the documents with a qualified startup adviser.",
    tags: ["fundraising", "SAFE", "dilution", "term sheets"],
    caution: "General education, not legal or investment advice. Use current documents and qualified advice.",
    sourceTitle: "50 Fundraising Terms and Definitions Every Founder Should Know",
    sourceUrl: "https://www.everythingstartups.com/article/fundraising-terms", reviewedAt: "2026-11-18",
  },
  {
    id: "startup-marketing", title: "Turn directory listings into a growth experiment", category: "Grow",
    summary: "Treat startup directory submissions as a measurable distribution test. Keep your story consistent, choose relevant audiences and look for actual referral traffic rather than assumed SEO gains.",
    action: "Choose three relevant directories, prepare one consistent listing, and track which submissions bring qualified visitors or conversations.",
    tags: ["startup marketing", "business directories", "SEO", "customer acquisition"],
    caution: "Visibility and rankings are not guaranteed. Check moderation, pricing and submission rules.",
    sourceTitle: "Startup Marketing Hacks: Submit Your Startup to These 49 Business Directories",
    sourceUrl: "https://www.everythingstartups.com/article/startup-marketing-hacks-submit-your-startup-to-these-49-business-directories", reviewedAt: "2026-11-18",
  },
  {
    id: "pivot-mistakes", title: "Pivot with evidence, not hype", category: "Validate",
    summary: "Changing customer, business model or product scope can compound an existing problem. Protect what already works and test a narrow change before chasing a trend or building a broader platform.",
    action: "Interview your best-fit users, identify what they already value, and run a small-cohort test of one focused change before committing.",
    tags: ["startup pivots", "product strategy", "customer discovery", "validation"],
    caution: "The source summarizes advice attributed to a16z; test it against your own customer evidence.",
    sourceTitle: "5 Common Mistakes Startups Make When Pivoting - According to a16z",
    sourceUrl: "https://www.everythingstartups.com/article/5-common-mistakes-startups-make-when-pivoting---according-to-a16z", reviewedAt: "2026-11-18",
  },
];

export function filterStartupReads(
  items: StartupRead[], query = "", stage: ReadingStage | "All" = "All",
): StartupRead[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(item => {
    if (stage !== "All" && item.category !== stage) return false;
    const haystack = [item.title, item.summary, item.action, item.category, item.sourceTitle, ...item.tags].join(" ").toLocaleLowerCase();
    return terms.every(term => haystack.includes(term));
  });
}
