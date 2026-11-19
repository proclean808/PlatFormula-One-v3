import { describe, it, expect } from "vitest";
import { emptyFounderBrief, founderBriefToMarkdown, founderStages } from "../shared/founderJourney";

describe("founder journey and manual export", () => {
  it("uses the four agreed founder stages with distinct destinations", () => {
    expect(founderStages.map(stage => stage.label)).toEqual(["Validate", "Build", "Grow", "Raise"]);
    expect(new Set(founderStages.map(stage => stage.id)).size).toBe(4);
  });
  it("retains exact brand capitalization and does not fabricate missing evidence", () => {
    const text = founderBriefToMarkdown(emptyFounderBrief, "Claude Code");
    expect(text).toContain("PlatFormula.One");
    expect(text).toContain("Not provided — do not invent.");
    expect(text).not.toContain("PlatFormula.ONE");
  });
  it("carries the founder's own inputs into a Markdown handoff", () => {
    const text = founderBriefToMarkdown({ ...emptyFounderBrief, project: "Example test brief", evidence: "No customer trials yet.", buildScope: "A read-only prototype." }, "Obsidian");
    expect(text).toContain("Example test brief");
    expect(text).toContain("No customer trials yet.");
    expect(text).toContain("A read-only prototype.");
    expect(text).toContain("Obsidian: MANUAL_MARKDOWN_IMPORT");
  });
  it("never turns an export into a claim of connection or device execution", () => {
    const text = founderBriefToMarkdown(emptyFounderBrief, "Phone Harness");
    expect(text).toContain("Status: MANUAL_HANDOFF");
    expect(text).toContain("Claude Code: NOT_CONNECTED");
    expect(text).toContain("Hermes Agent: NOT_TESTED");
    expect(text).toContain("Phone Harness: NOT_TESTED");
    expect(text).toContain("Require approval before deployments, spending, outreach, or phone control.");
  });
});
