// Independent, local guidance only. No provider API, application submission, or stored profile.
// Provenance: Forum-reference-notes.md plus official pages reviewed November 18, 2026.
export const FORUM_REVIEW_DATE = "2026-11-18";

export type ForumGoal = "unknown" | "founder" | "talent";
export type ForumStage = "unknown" | "idea" | "concept" | "prototype" | "live";
export type ForumFunding = "unknown" | "under-500k" | "at-least-500k";
export type ForumTraction =
  | "unknown"
  | "none"
  | "design-partners"
  | "at-least-250k-arr";
export type ForumAnswer = "unknown" | "yes" | "no";
export type ForumFormation = "unknown" | "not-formed" | "formed";

export interface ForumProfile {
  goal: ForumGoal;
  stage: ForumStage;
  b2b: "unsure" | "yes" | "no";
  domainExpertise: ForumAnswer;
  aiNative: ForumAnswer;
  formation: ForumFormation;
  funding: ForumFunding;
  traction: ForumTraction;
}

export const DEFAULT_FORUM_PROFILE: Readonly<ForumProfile> = {
  goal: "unknown",
  stage: "unknown",
  b2b: "unsure",
  domainExpertise: "unknown",
  aiNative: "unknown",
  formation: "unknown",
  funding: "unknown",
  traction: "unknown",
};

export const FORUM_URLS = {
  studio: "https://www.forumvc.com/ai-studio",
  foundry: "https://www.forumvc.com/the-foundry-studio-sprint",
  accelerator: "https://www.forumvc.com/accelerator",
  preSeed: "https://www.forumvc.com/pre-seed-fund",
  talent: "https://forumvc.fillout.com/forum-talent-network",
  industryCouncil: "https://www.forumvc.com/forum-industry-council",
  terms: "https://www.forumvc.com/terms-of-use",
} as const;

export const FORUM_EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
  referrerPolicy: "no-referrer",
} as const;

export const FOUNDRY_PUBLISHED_COHORT = {
  applicationDeadline: "2026-11-04",
  cohortStart: "2026-11-09",
  availability: "published-cohort-passed",
  caution:
    "The published Foundry deadline (November 4, 2026) and cohort start (November 9, 2026) have both passed as of our November 18 review. Check with Forum for future cohorts; this finder does not say applications are currently open.",
} as const;

export type ForumProgramId =
  | "ai-studio"
  | "foundry"
  | "accelerator"
  | "pre-seed"
  | "talent";
export type ForumFounderProgramId = Exclude<ForumProgramId, "talent">;

export interface ForumProgram {
  id: ForumProgramId;
  name: string;
  audience: "founder" | "talent";
  relationship: "External Resource";
  summary: string;
  publishedTerms: string;
  caution: string;
  source: { url: string; reviewedOn: string; note: string };
  // Founder handoffs intentionally use official information pages, not guessed intake IDs.
  handoff: {
    url: string;
    label: string;
    destination: "official-info-page" | "official-intake";
  };
}

export const FORUM_PROGRAMS: Readonly<Record<ForumProgramId, ForumProgram>> = {
  "ai-studio": {
    id: "ai-studio",
    name: "AI Studio",
    audience: "founder",
    relationship: "External Resource",
    summary:
      "For domain experts at pre-idea or concept stage building an AI-native B2B company that is not already in market.",
    publishedTerms:
      "Forum publishes $250K at company formation, only after validation and investment committee approval—not on application.",
    caution:
      "Formation, equity and IP arrangements require review with Forum and qualified counsel. An existing incorporated prototype is not treated as a Studio fit by this finder.",
    source: {
      url: FORUM_URLS.studio,
      reviewedOn: FORUM_REVIEW_DATE,
      note: "Official AI Studio page; conditional formation investment.",
    },
    handoff: {
      url: FORUM_URLS.studio,
      label: "Review Studio application options",
      destination: "official-info-page",
    },
  },
  foundry: {
    id: "foundry",
    name: "The Foundry",
    audience: "founder",
    relationship: "External Resource",
    summary:
      "A free, five-week remote validation sprint for early B2B ideas; Forum publishes a 4–6 hour weekly commitment.",
    publishedTerms:
      "Validation support, not an investment offer or promise of admission.",
    caution: FOUNDRY_PUBLISHED_COHORT.caution,
    source: {
      url: FORUM_URLS.foundry,
      reviewedOn: FORUM_REVIEW_DATE,
      note: "Official Foundry page; listed November cohort dates have passed.",
    },
    handoff: {
      url: FORUM_URLS.foundry,
      label: "Check future Foundry cohorts",
      destination: "official-info-page",
    },
  },
  accelerator: {
    id: "accelerator",
    name: "Accelerator",
    audience: "founder",
    relationship: "External Resource",
    summary:
      "For B2B software companies with an MVP or near-MVP and less than $500K previously raised.",
    publishedTerms:
      "Forum's published terms: $100K for 7.5% via a post-money SAFE. These are not PlatFormula.One terms or a funding guarantee.",
    caution:
      "An early prototype alone does not establish MVP readiness. Confirm current terms and application availability directly with Forum.",
    source: {
      url: FORUM_URLS.accelerator,
      reviewedOn: FORUM_REVIEW_DATE,
      note: "Official Accelerator page; MVP and prior-funding criteria.",
    },
    handoff: {
      url: FORUM_URLS.accelerator,
      label: "Review Accelerator application options",
      destination: "official-info-page",
    },
  },
  "pre-seed": {
    id: "pre-seed",
    name: "Pre-Seed Fund",
    audience: "founder",
    relationship: "External Resource",
    summary:
      "For B2B companies with an MVP in market, meaningful early traction and domain expertise; typically at least $500K raised OR at least $250K ARR.",
    publishedTerms:
      "Investment is discretionary. This finder omits check sizes because the official page's hero and FAQ ranges differ.",
    caution:
      "Typical thresholds are not eligibility clearance. Design partners alone do not prove meaningful traction; Forum reviews the evidence.",
    source: {
      url: FORUM_URLS.preSeed,
      reviewedOn: FORUM_REVIEW_DATE,
      note: "Official Pre-Seed Fund page; typical thresholds and inconsistent public check-size ranges.",
    },
    handoff: {
      url: FORUM_URLS.preSeed,
      label: "Review Pre-Seed application options",
      destination: "official-info-page",
    },
  },
  talent: {
    id: "talent",
    name: "Talent Network",
    audience: "talent",
    relationship: "External Resource",
    summary:
      "A separate route for potential venture-building or early-hire opportunities—not a founder funding application.",
    publishedTerms:
      "Joining does not guarantee a role, an introduction, admission or investment.",
    caution:
      "The official talent intake is an external form. Review its policies and fields before entering information.",
    source: {
      url: FORUM_URLS.studio,
      reviewedOn: FORUM_REVIEW_DATE,
      note: "The official AI Studio page links to Forum's separate Talent Network intake on Fillout.",
    },
    handoff: {
      url: FORUM_URLS.talent,
      label: "Open official Talent Network intake",
      destination: "official-intake",
    },
  },
};

export const FORUM_FOUNDER_PROGRAM_IDS: readonly ForumFounderProgramId[] = [
  "ai-studio",
  "foundry",
  "accelerator",
  "pre-seed",
];

export const FORUM_INDUSTRY_COUNCIL = {
  name: "Industry Council reference",
  url: FORUM_URLS.industryCouncil,
  relationship: "External Resource",
  reviewedOn: FORUM_REVIEW_DATE,
  description:
    "Forum describes curated executive onboarding, private introductions and potential pilots. This is a customer-discovery model to study, not access to executives or pilots through PlatFormula.One; some sector routes are listed as Coming Soon.",
} as const;

export const FORUM_DISCLOSURE = {
  local:
    "This finder uses local rules only. No AI generation, automated qualification, network calls or application submission. Your selections are not saved or forwarded by this interface.",
  review:
    "Before an application handoff, review what you intend to disclose. No venture brief, patent details or files are sent by this interface. Opening a link is not an application submission. Anything you enter on the external provider's site is governed by its policies and actual agreements; this finder gives no legal confidentiality guarantee.",
  feedbackWarning:
    "Forum's website Terms of Use describe website feedback as non-confidential and non-proprietary. This is a warning about website feedback—not a determination that every separate application has the same confidentiality terms. Consult qualified counsel before disclosing an invention or sensitive architecture.",
  acknowledgement:
    "I reviewed this disclosure warning and will choose what, if anything, to share on Forum's external site.",
} as const;

export interface ForumRecommendation {
  status: "needs-details" | "explore" | "no-verified-fit";
  recommendedProgram: ForumProgramId | null;
  headline: string;
  reasons: string[];
  unknowns: string[];
  cautions: string[];
}

function profileUnknowns(profile: ForumProfile): string[] {
  const unknowns: string[] = [];
  if (profile.b2b === "unsure")
    unknowns.push("Confirm whether this is a B2B software company.");
  if (profile.stage === "unknown")
    unknowns.push("Choose the actual company/product stage.");
  if (profile.domainExpertise === "unknown")
    unknowns.push(
      "Domain expertise is unknown; needed to assess Studio or Pre-Seed alignment."
    );
  if (profile.funding === "unknown")
    unknowns.push(
      "Previously raised funding is unknown; Accelerator's less-than-$500K criterion is unconfirmed."
    );
  if (profile.traction === "unknown")
    unknowns.push(
      "Traction is unknown; meaningful in-market traction is needed for Pre-Seed."
    );
  if (profile.stage === "idea" || profile.stage === "concept") {
    if (profile.aiNative === "unknown")
      unknowns.push(
        "AI-native focus is unknown; needed to assess Studio alignment."
      );
    if (profile.formation === "unknown")
      unknowns.push(
        "Company formation status is unknown; Studio formation suitability needs confirmation."
      );
  }
  return unknowns;
}

/** Pure rule-based exploration, never an eligibility decision. Unknowns are not assumed true. */
export function recommendForumProgram(
  input: Partial<ForumProfile> = {}
): ForumRecommendation {
  const profile: ForumProfile = { ...DEFAULT_FORUM_PROFILE, ...input };
  const result: ForumRecommendation = {
    status: "needs-details",
    recommendedProgram: null,
    headline: "Choose your goal before exploring a route",
    reasons: ["No program recommendation is asserted for an unknown profile."],
    unknowns: [],
    cautions: [
      "Independent guidance only—not a partnership, white-label service, admission decision or guaranteed funding. Confirm all conditions with Forum.",
    ],
  };
  const explore = (
    id: ForumProgramId,
    reasons: string[]
  ): ForumRecommendation => ({
    ...result,
    status: "explore",
    recommendedProgram: id,
    headline: `${FORUM_PROGRAMS[id].name}: a program to explore`,
    reasons,
    cautions: [...result.cautions, FORUM_PROGRAMS[id].caution],
  });
  const noFit = (reason: string): ForumRecommendation => ({
    ...result,
    status: "no-verified-fit",
    headline: "No verified founder-program fit from these selections",
    reasons: [reason],
  });

  // Talent is deliberately separate and does not qualify a founder for any funding program.
  if (profile.goal === "talent") {
    return explore("talent", [
      "You chose venture-building or early-hire opportunities. Founder stage, funding and B2B answers do not turn this into a funding application.",
    ]);
  }
  if (profile.goal !== "founder") return result;
  result.unknowns = profileUnknowns(profile);
  if (profile.b2b === "no")
    return noFit(
      "The verified founder programs focus on B2B companies. A non-B2B profile has no verified fit here; do not infer eligibility."
    );
  if (profile.b2b !== "yes" || profile.stage === "unknown") {
    return {
      ...result,
      headline: "More details needed—no route selected",
      reasons: [
        "Confirm B2B software focus and actual stage before this finder suggests a founder program.",
      ],
    };
  }

  if (profile.stage === "idea" || profile.stage === "concept") {
    if (
      profile.domainExpertise === "yes" &&
      profile.aiNative === "yes" &&
      profile.formation === "not-formed"
    ) {
      return explore("ai-studio", [
        "You selected an unformed company at idea/concept stage, B2B software, domain expertise and an AI-native focus.",
        "Forum must validate the concept and approve investment before any formation-stage investment; applying does not release $250K.",
      ]);
    }
    const studioReason =
      profile.formation === "formed"
        ? "An already-formed company is not treated as a verified Studio formation fit here."
        : "Studio is not selected unless domain expertise, AI-native focus and unformed-company status are confirmed.";
    return explore("foundry", [
      "Your B2B idea/concept is at a validation stage, rather than an in-market MVP.",
      studioReason,
      "The Foundry is a validation route to investigate for a future cohort, not a currently open cohort recommendation.",
    ]);
  }

  if (profile.stage === "live") {
    const typicalPreSeedThreshold =
      profile.funding === "at-least-500k" ||
      profile.traction === "at-least-250k-arr";
    const hasTractionEvidence =
      profile.traction === "design-partners" ||
      profile.traction === "at-least-250k-arr";
    if (
      typicalPreSeedThreshold &&
      profile.domainExpertise === "yes" &&
      hasTractionEvidence
    ) {
      return explore("pre-seed", [
        "You selected a B2B MVP in market and domain expertise.",
        profile.traction === "at-least-250k-arr"
          ? "Your selected ARR meets the published typical $250K ARR threshold; the funding threshold is an OR condition, not an additional requirement."
          : "Your selected prior funding meets the published typical $500K threshold. Design partners need review for meaningful traction; they are not proof of eligibility.",
      ]);
    }
  }

  if (profile.funding === "under-500k") {
    return explore("accelerator", [
      "You selected B2B software, a prototype or live product, and less than $500K previously raised.",
      profile.stage === "prototype"
        ? "This is conditional on the prototype being an MVP or near-MVP. A basic prototype may be too early; verify readiness with Forum."
        : "Your live-product selection describes an MVP in market; verify product readiness and Forum's current terms.",
    ]);
  }
  if (profile.funding === "unknown") {
    return {
      ...result,
      headline: "Funding details needed—no route selected",
      reasons: [
        "A prototype/live product alone is insufficient: Accelerator requires less than $500K previously raised. Pre-Seed also needs an in-market MVP, meaningful traction, domain expertise and a typical funding or ARR threshold.",
      ],
    };
  }
  if (profile.stage === "prototype") {
    return noFit(
      "At least $500K raised is outside Accelerator's published prior-funding criterion. Pre-Seed needs an MVP in market with meaningful traction and domain expertise; a prototype is not enough."
    );
  }
  if (profile.domainExpertise === "unknown" || profile.traction === "unknown") {
    return {
      ...result,
      headline: "Traction and expertise need review—no route selected",
      reasons: [
        "The funding threshold alone does not establish Pre-Seed alignment. Confirm domain expertise and meaningful in-market traction.",
      ],
    };
  }
  return noFit(
    "The funding threshold alone does not establish Pre-Seed alignment. Meaningful in-market traction and domain expertise are also needed; Accelerator's less-than-$500K criterion is not met."
  );
}

/** No URLs accept profile fields; without a local review, no handoff anchors are exposed. */
export function getForumHandoffs(
  reviewed: boolean,
  goal: ForumGoal
): ForumProgram[] {
  if (!reviewed) return [];
  if (goal === "talent") return [FORUM_PROGRAMS.talent];
  if (goal === "founder")
    return FORUM_FOUNDER_PROGRAM_IDS.map(id => FORUM_PROGRAMS[id]);
  return [];
}
