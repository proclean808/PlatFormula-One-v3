import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import ForumProgramRouter, {
  ForumDisclosureReview,
} from "../client/src/components/ForumProgramRouter";
import {
  DEFAULT_FORUM_PROFILE,
  FOUNDRY_PUBLISHED_COHORT,
  FORUM_DISCLOSURE,
  FORUM_EXTERNAL_LINK_PROPS,
  FORUM_FOUNDER_PROGRAM_IDS,
  FORUM_INDUSTRY_COUNCIL,
  FORUM_PROGRAMS,
  FORUM_REVIEW_DATE,
  FORUM_URLS,
  getForumHandoffs,
  recommendForumProgram,
  type ForumProfile,
} from "../shared/forumPrograms";

beforeAll(() => vi.stubGlobal("React", React));
afterAll(() => vi.unstubAllGlobals());

const idea: ForumProfile = {
  ...DEFAULT_FORUM_PROFILE,
  goal: "founder",
  stage: "concept",
  b2b: "yes",
  domainExpertise: "yes",
  aiNative: "yes",
  formation: "not-formed",
  funding: "under-500k",
  traction: "none",
};
const live: ForumProfile = {
  ...idea,
  stage: "live",
  formation: "formed",
  funding: "at-least-500k",
  traction: "design-partners",
};
const routerMarkup = (initialProfile: Partial<ForumProfile> = {}) =>
  renderToStaticMarkup(createElement(ForumProgramRouter, { initialProfile }));
const reviewMarkup = (
  reviewed: boolean,
  goal: ForumProfile["goal"] = "founder"
) =>
  renderToStaticMarkup(
    createElement(ForumDisclosureReview, {
      reviewed,
      goal,
      onReviewChange: () => {},
      id: "test-disclosure",
    })
  );

function anchors(html: string) {
  return Array.from(html.matchAll(/<a\b([^>]*)>/g)).map(match => {
    const attributes: Record<string, string> = {};
    Array.from(match[1].matchAll(/([\w-]+)="([^"]*)"/g)).forEach(attribute => {
      attributes[attribute[1]] = attribute[2];
    });
    return attributes;
  });
}

describe("Forum local profile recommendations", () => {
  it("defaults to unknown without an asserted recommendation", () => {
    expect(
      Object.values(DEFAULT_FORUM_PROFILE).every(
        value => value === "unknown" || value === "unsure"
      )
    ).toBe(true);
    expect(recommendForumProgram()).toMatchObject({
      status: "needs-details",
      recommendedProgram: null,
    });
    expect(recommendForumProgram({ goal: "founder" })).toMatchObject({
      status: "needs-details",
      recommendedProgram: null,
    });
    expect(routerMarkup()).toContain('data-recommendation="none"');
    expect(routerMarkup()).toContain("No program recommendation is asserted");
  });

  it.each(["idea", "concept", "prototype", "live"] as const)(
    "does not recommend founder funding for a non-B2B %s profile",
    stage => {
      const result = recommendForumProgram({ ...live, stage, b2b: "no" });
      expect(result).toMatchObject({
        status: "no-verified-fit",
        recommendedProgram: null,
      });
      expect(result.reasons.join(" ")).toContain("non-B2B");
    }
  );

  it.each(["unsure", undefined] as const)(
    "does not assume B2B fit when the answer is %s",
    b2b => {
      const { b2b: _unused, ...withoutB2b } = idea;
      const result = recommendForumProgram(b2b ? { ...idea, b2b } : withoutB2b);
      expect(result.recommendedProgram).toBeNull();
      expect(result.unknowns.join(" ")).toContain("B2B");
    }
  );

  it("routes a confirmed unformed AI-native domain-expert concept to explore Studio, not to eligibility", () => {
    const result = recommendForumProgram(idea);
    expect(result).toMatchObject({
      status: "explore",
      recommendedProgram: "ai-studio",
    });
    expect(result.headline).toContain("to explore");
    expect(result.reasons.join(" ")).toContain("investment before");
    expect(result.reasons.join(" ")).toContain(
      "applying does not release $250K"
    );
    expect(FORUM_PROGRAMS["ai-studio"].publishedTerms).toContain(
      "only after validation and investment committee approval—not on application"
    );
  });

  it.each([
    { domainExpertise: "unknown" },
    { domainExpertise: "no" },
    { aiNative: "unknown" },
    { aiNative: "no" },
    { formation: "unknown" },
    { formation: "formed" },
  ] satisfies Partial<ForumProfile>[])(
    "does not infer Studio fit from missing or conflicting conditions: %j",
    patch => {
      const result = recommendForumProgram({ ...idea, ...patch });
      expect(result.recommendedProgram).toBe("foundry");
      expect(result.reasons.join(" ")).toMatch(/not selected|not treated/);
    }
  );

  it("makes unknown Studio conditions explicit without treating them as true", () => {
    const result = recommendForumProgram({
      ...idea,
      aiNative: "unknown",
      domainExpertise: "unknown",
      formation: "unknown",
      funding: "unknown",
      traction: "unknown",
    });
    expect(result.recommendedProgram).toBe("foundry");
    expect(result.unknowns.join(" ")).toContain("AI-native focus is unknown");
    expect(result.unknowns.join(" ")).toContain("Domain expertise is unknown");
    expect(result.unknowns.join(" ")).toContain("formation status is unknown");
  });

  it("recommends only a future Foundry cohort investigation and includes the passed deadline caution", () => {
    const result = recommendForumProgram({ ...idea, aiNative: "no" });
    expect(result.recommendedProgram).toBe("foundry");
    expect(result.cautions).toContain(FOUNDRY_PUBLISHED_COHORT.caution);
    expect(result.reasons.join(" ")).toContain(
      "not a currently open cohort recommendation"
    );
  });

  it("treats an incorporated prototype as a conditional Accelerator exploration, never Studio", () => {
    const result = recommendForumProgram({
      ...idea,
      stage: "prototype",
      formation: "formed",
    });
    expect(result.recommendedProgram).toBe("accelerator");
    expect(result.reasons.join(" ")).toContain(
      "conditional on the prototype being an MVP or near-MVP"
    );
    expect(result.cautions.join(" ")).toContain(
      "does not establish MVP readiness"
    );
  });

  it("routes a live MVP with less than $500K raised and no traction to Accelerator", () => {
    expect(
      recommendForumProgram({
        ...live,
        funding: "under-500k",
        traction: "none",
      }).recommendedProgram
    ).toBe("accelerator");
    expect(FORUM_PROGRAMS.accelerator.publishedTerms).toContain(
      "Forum's published terms: $100K for 7.5% via a post-money SAFE"
    );
  });

  it("does not assume Accelerator's funding threshold from an unknown answer", () => {
    const result = recommendForumProgram({
      ...idea,
      stage: "prototype",
      funding: "unknown",
    });
    expect(result).toMatchObject({
      status: "needs-details",
      recommendedProgram: null,
    });
    expect(result.unknowns.join(" ")).toContain(
      "Previously raised funding is unknown"
    );
  });

  it("does not route a prototype with at least $500K raised to Accelerator or Pre-Seed", () => {
    expect(
      recommendForumProgram({ ...live, stage: "prototype" })
    ).toMatchObject({ status: "no-verified-fit", recommendedProgram: null });
  });

  it("routes live MVP, domain expertise, early traction and $500K raised to explore Pre-Seed conditionally", () => {
    const result = recommendForumProgram(live);
    expect(result.recommendedProgram).toBe("pre-seed");
    expect(result.reasons.join(" ")).toContain(
      "Design partners need review for meaningful traction"
    );
    expect(result.cautions.join(" ")).toContain("not eligibility clearance");
  });

  it.each(["under-500k", "unknown"] as const)(
    "uses Pre-Seed's ARR OR condition when prior funding is %s",
    funding => {
      const result = recommendForumProgram({
        ...live,
        funding,
        traction: "at-least-250k-arr",
      });
      expect(result.recommendedProgram).toBe("pre-seed");
      expect(result.reasons.join(" ")).toContain("OR condition");
      if (funding === "unknown")
        expect(result.unknowns.join(" ")).toContain("funding is unknown");
    }
  );

  it.each([
    { traction: "unknown", status: "needs-details" },
    { traction: "none", status: "no-verified-fit" },
    { domainExpertise: "unknown", status: "needs-details" },
    { domainExpertise: "no", status: "no-verified-fit" },
  ] as const)(
    "requires traction and expertise beyond funding: %j",
    ({ status, ...patch }) => {
      expect(recommendForumProgram({ ...live, ...patch })).toMatchObject({
        status,
        recommendedProgram: null,
      });
    }
  );

  it("keeps talent entirely separate even if retained founder answers indicate non-B2B", () => {
    const result = recommendForumProgram({
      ...live,
      goal: "talent",
      b2b: "no",
    });
    expect(result.recommendedProgram).toBe("talent");
    expect(result.unknowns).toEqual([]);
    expect(result.reasons.join(" ")).toContain(
      "do not turn this into a funding application"
    );
    expect(routerMarkup({ ...live, goal: "talent" })).not.toContain(
      "Founder routes · compare official information"
    );
  });

  it("does not mutate the supplied profile", () => {
    const profile = Object.freeze({ ...idea });
    recommendForumProgram(profile);
    expect(profile).toEqual(idea);
    expect(DEFAULT_FORUM_PROFILE.stage).toBe("unknown");
  });
});

describe("Forum source provenance and privacy-safe external links", () => {
  it("uses the exact verified official URLs without payload or tracking parameters", () => {
    expect(FORUM_URLS).toEqual({
      studio: "https://www.forumvc.com/ai-studio",
      foundry: "https://www.forumvc.com/the-foundry-studio-sprint",
      accelerator: "https://www.forumvc.com/accelerator",
      preSeed: "https://www.forumvc.com/pre-seed-fund",
      talent: "https://forumvc.fillout.com/forum-talent-network",
      industryCouncil: "https://www.forumvc.com/forum-industry-council",
      terms: "https://www.forumvc.com/terms-of-use",
    });
    for (const url of Object.values(FORUM_URLS)) {
      const parsed = new URL(url);
      expect(parsed.protocol).toBe("https:");
      expect(parsed.search).toBe("");
      expect(parsed.hash).toBe("");
      expect(parsed.username).toBe("");
      expect(parsed.password).toBe("");
    }
  });

  it("records source dates for every program and the official provenance of Talent Network", () => {
    for (const program of Object.values(FORUM_PROGRAMS)) {
      expect(program.relationship).toBe("External Resource");
      expect(program.source.reviewedOn).toBe(FORUM_REVIEW_DATE);
      expect(Object.values(FORUM_URLS)).toContain(program.source.url);
      expect(Object.values(FORUM_URLS)).toContain(program.handoff.url);
      expect(program.source.note.length).toBeGreaterThan(20);
    }
    expect(FORUM_PROGRAMS.talent.source.url).toBe(FORUM_URLS.studio);
    expect(FORUM_PROGRAMS.talent.source.note).toContain("Fillout");
    for (const id of FORUM_FOUNDER_PROGRAM_IDS) {
      expect(FORUM_PROGRAMS[id].handoff.destination).toBe("official-info-page");
      expect(FORUM_PROGRAMS[id].handoff.url).toBe(
        FORUM_PROGRAMS[id].source.url
      );
    }
  });

  it("shows dated Foundry caution instead of treating a retained Apply link as open", () => {
    expect(
      FOUNDRY_PUBLISHED_COHORT.applicationDeadline < FORUM_REVIEW_DATE
    ).toBe(true);
    expect(FOUNDRY_PUBLISHED_COHORT.cohortStart < FORUM_REVIEW_DATE).toBe(true);
    expect(FOUNDRY_PUBLISHED_COHORT.availability).toBe(
      "published-cohort-passed"
    );
    const html = routerMarkup(idea);
    expect(html).toContain(
      "Published November cohort has passed. Future availability unverified."
    );
    expect(html).toContain("November 4, 2026");
    expect(html).toContain("November 9, 2026");
    expect(FORUM_PROGRAMS.foundry.summary).toContain("five-week remote");
    expect(FORUM_PROGRAMS.foundry.summary).toContain("4–6 hour");
  });

  it("omits inconsistent Pre-Seed check sizes and does not promise Council access", () => {
    const html = routerMarkup(live);
    expect(html).toContain("hero and FAQ ranges differ");
    expect(html).not.toMatch(/\$750K|\$1M|\$1 million|\$250K[–-]\$750K/);
    expect(FORUM_INDUSTRY_COUNCIL.description).toContain(
      "curated executive onboarding"
    );
    expect(FORUM_INDUSTRY_COUNCIL.description).toContain(
      "not access to executives or pilots"
    );
    expect(html).toContain(FORUM_URLS.industryCouncil);
  });

  it("protects all informational and reviewed handoff links and never adds profile payloads", () => {
    const rendered = [
      routerMarkup(),
      routerMarkup(live),
      reviewMarkup(true),
      reviewMarkup(true, "talent"),
    ];
    for (const html of rendered) {
      for (const anchor of anchors(html)) {
        expect(Object.values(FORUM_URLS)).toContain(anchor.href);
        expect(anchor.target).toBe(FORUM_EXTERNAL_LINK_PROPS.target);
        expect(anchor.rel).toBe(FORUM_EXTERNAL_LINK_PROPS.rel);
        expect(anchor.referrerPolicy).toBe(
          FORUM_EXTERNAL_LINK_PROPS.referrerPolicy
        );
        expect(new URL(anchor.href).search).toBe("");
      }
    }
  });

  it("keeps routing and rendering local without network, mutation, storage or form submission code", () => {
    const paths = [
      "../shared/forumPrograms.ts",
      "../client/src/components/ForumProgramRouter.tsx",
    ];
    for (const path of paths) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      expect(source).not.toMatch(
        /\bfetch\s*\(|\bXMLHttpRequest\b|\baxios\b|\btrpc\b|useMutation|localStorage|sessionStorage|sendBeacon|invokeLLM|<form\b|onSubmit/
      );
    }
  });
});

describe("Forum local disclosure review gate and accessible UI", () => {
  it("returns no handoffs before review regardless of goal", () => {
    for (const goal of ["unknown", "founder", "talent"] as const)
      expect(getForumHandoffs(false, goal)).toEqual([]);
    expect(getForumHandoffs(true, "unknown")).toEqual([]);
  });

  it("only unlocks the selected goal's verified handoffs, and relocks when review is revoked", () => {
    expect(
      getForumHandoffs(true, "founder").map(program => program.id)
    ).toEqual(FORUM_FOUNDER_PROGRAM_IDS);
    expect(getForumHandoffs(true, "talent").map(program => program.id)).toEqual(
      ["talent"]
    );
    expect(getForumHandoffs(false, "founder")).toEqual([]);
    expect(getForumHandoffs(false, "talent")).toEqual([]);
  });

  it("renders no handoff anchors in the initial finder or unchecked review state", () => {
    expect(routerMarkup(live)).not.toContain("data-forum-handoff");
    expect(routerMarkup({ goal: "talent" })).not.toContain(FORUM_URLS.talent);
    expect(reviewMarkup(false)).toContain('data-disclosure-gate="locked"');
    expect(reviewMarkup(false)).not.toContain("data-forum-handoff");
    expect(reviewMarkup(false, "talent")).not.toContain(FORUM_URLS.talent);
    expect(routerMarkup()).toContain(FORUM_URLS.studio);
  });

  it("renders four official-page founder handoffs after explicit review, without the talent intake", () => {
    const html = reviewMarkup(true);
    expect(html).toContain('data-disclosure-gate="reviewed"');
    expect(
      anchors(html).filter(anchor => anchor["data-forum-handoff"])
    ).toHaveLength(4);
    expect(html).not.toContain(FORUM_URLS.talent);
    expect(html).toContain(
      "No application URLs or intake IDs are invented here"
    );
    expect(html).not.toMatch(/<form\b|type="submit"/);
  });

  it("renders only the official talent intake after reviewing the separate talent goal", () => {
    const links = anchors(reviewMarkup(true, "talent")).filter(
      anchor => anchor["data-forum-handoff"]
    );
    expect(links).toHaveLength(1);
    expect(links[0].href).toBe(FORUM_URLS.talent);
    expect(links[0]["data-forum-handoff"]).toBe("talent");
    expect(reviewMarkup(true, "talent")).toContain("nothing is submitted here");
  });

  it("discloses non-transmission and provider policies without a legal confidentiality guarantee", () => {
    expect(FORUM_DISCLOSURE.review).toContain(
      "No venture brief, patent details or files are sent by this interface"
    );
    expect(FORUM_DISCLOSURE.review).toContain(
      "Opening a link is not an application submission"
    );
    expect(FORUM_DISCLOSURE.review).toContain(
      "governed by its policies and actual agreements"
    );
    expect(FORUM_DISCLOSURE.review).toContain(
      "no legal confidentiality guarantee"
    );
    expect(reviewMarkup(false)).toContain(
      "No venture brief, patent details or files are sent"
    );
  });

  it("limits the nonconfidential warning to website feedback and recommends invention-disclosure counsel", () => {
    expect(FORUM_DISCLOSURE.feedbackWarning).toContain(
      "website feedback as non-confidential and non-proprietary"
    );
    expect(FORUM_DISCLOSURE.feedbackWarning).toContain(
      "not a determination that every separate application"
    );
    expect(FORUM_DISCLOSURE.feedbackWarning).toContain(
      "Consult qualified counsel before disclosing an invention"
    );
    expect(reviewMarkup(false)).toContain(FORUM_URLS.terms);
  });

  it("exposes stable root and recommendation markers, labelled controls, minimum-size styles and no table", () => {
    const html = routerMarkup(idea);
    expect(html).toContain("data-forum-router");
    expect(html).toContain('data-recommendation="ai-studio"');
    expect(html).toContain("Actual product / company stage");
    expect(html).toContain("Is this B2B software?");
    expect(html).toContain("Firsthand domain expertise?");
    expect(html.replaceAll("&#x27;", "'")).toContain(
      FORUM_DISCLOSURE.acknowledgement
    );
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("min-h-11");
    expect(html).toContain("h-11 w-11");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("focus-visible:ring-2");
    expect(html).not.toContain("<table");
    expect(html).toContain(
      "not a Forum partner or licensed white-label backend"
    );
  });

  it("wires checkbox changes and resets review on any profile change", () => {
    const source = readFileSync(
      new URL(
        "../client/src/components/ForumProgramRouter.tsx",
        import.meta.url
      ),
      "utf8"
    );
    expect(source).toContain("onReviewChange(event.target.checked)");
    expect(source).toContain("onReviewChange={setReviewed}");
    expect(source).toMatch(
      /function update[\s\S]*?setProfile\([\s\S]*?setReviewed\(false\)/
    );
  });
});
