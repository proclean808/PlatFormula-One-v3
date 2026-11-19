import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../client/src/components/FounderWelcome", () => ({
  default: () => React.createElement("div", null, "Founder goal controls"),
}));
vi.mock("../client/src/components/Pricing", () => ({ Pricing: () => null }));

import Dashboard from "../client/src/components/Dashboard";

Object.assign(globalThis, { React });

function renderHome() {
  return renderToStaticMarkup(React.createElement(Dashboard, {
    setActiveTab: vi.fn(), onStartGoal: vi.fn(), onFindResources: vi.fn(),
  }));
}

describe("original founder-first homepage", () => {
  it("starts with domain insight and distinct concept and product entry paths", () => {
    const html = renderHome();
    expect(html).toContain("Your insight.");
    expect(html).toContain("What problem do you know");
    expect(html).toContain("I know a problem worth solving.");
    expect(html).toContain("I already have a product.");
    expect(html).toContain("Validate my concept");
    expect(html).toContain("Plan my next growth step");
  });
  it("preserves the original identity and factual resource boundaries", () => {
    const html = renderHome();
    expect(html).toContain("PlatFormula.One");
    expect(html).toContain("Next YC Deadline");
    expect(html).toContain("No model call or login required.");
    expect(html).toContain("not partnerships, admissions guarantees, or preapproved credits");
    expect(html).not.toContain("$250K on day one");
    expect(html).not.toContain("forumvc.fillout.com");
  });
});
