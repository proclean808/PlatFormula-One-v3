import { describe, expect, it } from "vitest";
import { filterStartupReads, READING_WORKSPACES, startupReads, type StartupRead } from "../shared/startupReads";

const sample: StartupRead[] = [
  { id: "credits", title: "Scope your AI costs", category: "Build", summary: "Compare startup credits and eligibility.", action: "Create a provider budget.", tags: ["AI", "credits"], caution: "Check provider terms.", sourceTitle: "How to get startup credits", sourceUrl: "https://www.everythingstartups.com/article/how-to-get-startup-credits-10-programs-for-free-ai-credits", reviewedAt: "2026-11-18" },
  { id: "terms", title: "Understand your funding terms", category: "Raise", summary: "Read a fundraising glossary.", action: "Review dilution.", tags: ["fundraising", "equity"], caution: "Not legal advice.", sourceTitle: "Fundraising terms", sourceUrl: "https://www.everythingstartups.com/article/fundraising-terms", reviewedAt: "2026-11-18" },
];

describe("startup reading catalog", () => {
  it("returns the collection with an empty or whitespace-only search", () => {
    expect(filterStartupReads(sample)).toEqual(sample);
    expect(filterStartupReads(sample, "  ")).toEqual(sample);
  });
  it("matches case-insensitive tags, source titles and next moves", () => {
    expect(filterStartupReads(sample, "AI CREDITS").map(r => r.id)).toEqual(["credits"]);
    expect(filterStartupReads(sample, "dilution").map(r => r.id)).toEqual(["terms"]);
    expect(filterStartupReads(sample, "glossary").map(r => r.id)).toEqual(["terms"]);
  });
  it("combines stage and search without mutating the source", () => {
    expect(filterStartupReads(sample, "credits", "Raise")).toEqual([]);
    expect(filterStartupReads(sample, "", "Raise").map(r => r.id)).toEqual(["terms"]);
    expect(sample).toHaveLength(2);
  });
  it("returns no false results for an unmatched query", () => {
    expect(filterStartupReads(sample, "nonexistent_unique_word")).toEqual([]);
  });
  it("maps reading stages to existing founder workspace ids", () => {
    expect(READING_WORKSPACES).toEqual({ Validate: "concept", Build: "buildstudio", Grow: "grow", Raise: "pitch" });
  });
  it("ships reviewed, attributed, unique original reading summaries", () => {
    expect(startupReads).toHaveLength(8);
    expect(new Set(startupReads.map(item => item.id)).size).toBe(startupReads.length);
    for (const item of startupReads) {
      expect(item.sourceUrl).toMatch(/^https:\/\/www\.everythingstartups\.com\/article\//);
      expect(item.title).not.toBe(item.sourceTitle);
      expect(item.summary.length).toBeGreaterThan(25);
      expect(item.action.length).toBeGreaterThan(20);
      expect(item.tags.length).toBeGreaterThanOrEqual(2);
      expect(item.reviewedAt).toBe("2026-11-18");
      expect(item.sourceUrl).not.toMatch(/[?&](aff|ref|affiliate)=/);
    }
  });
});
