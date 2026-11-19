import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("../client/src/components/WaitlistDialog", () => ({ WaitlistDialog: () => null }));
import { Pricing } from "../client/src/components/Pricing";

beforeAll(() => vi.stubGlobal("React", React));
afterAll(() => vi.unstubAllGlobals());

describe("honest planned-tier messaging", () => {
  it("marks both paid tiers coming soon instead of selling unavailable plans", () => {
    const html = renderToStaticMarkup(createElement(Pricing));
    expect(html).toContain("Pro — Coming Soon");
    expect(html).toContain("Studio — Coming Soon");
    expect(html).toContain("No payments or paid trials are enabled.");
    expect(html).not.toContain("14-day free trial");
  });
  it("discloses cloud usage and does not promise unlimited inference or live device control", () => {
    const html = renderToStaticMarkup(createElement(Pricing));
    expect(html).toContain("Embedded cloud-model calls consume project credits");
    expect(html).not.toContain("Unlimited JoyceGPT");
    expect(html).toContain("No autonomous payments or live device control today");
    expect(html).toContain("waitlist signup");
  });
});
