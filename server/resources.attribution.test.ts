import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Resources from "../client/src/components/Resources";

beforeAll(() => vi.stubGlobal("React", React));
afterAll(() => vi.unstubAllGlobals());

function attribution(html: string): string {
  const footer = html.match(
    /<footer aria-label="Startup Resources attribution"[\s\S]*?<\/footer>/
  )?.[0];
  expect(footer).toBeDefined();
  return footer ?? "";
}

function cardCount(html: string): number {
  return (html.match(/data-directory-entry=/g) ?? []).length;
}

describe("Startup Resources bottom attribution", () => {
  it("places the exact Everything Startups link after the complete result section, not an assumed last catalog entry", () => {
    const html = renderToStaticMarkup(createElement(Resources));
    const footer = attribution(html);
    expect(footer).toContain(
      'href="https://www.everythingstartups.com/category/startupsreads"'
    );
    expect(footer).toContain("Everything Startups — Startup Reads");
    const footerIndex = html.indexOf(
      '<footer aria-label="Startup Resources attribution"'
    );
    const resultsIndex = html.indexOf('id="directory-results-section"');
    expect(resultsIndex).toBeGreaterThan(-1);
    expect(footerIndex).toBeGreaterThan(resultsIndex);
    expect(footerIndex).toBeGreaterThan(html.lastIndexOf("</section>"));
    expect(footerIndex).toBeGreaterThan(
      html.lastIndexOf("data-directory-entry=")
    );
  });

  it("opens the source safely without affiliate tracking or a partnership claim", () => {
    const footer = attribution(renderToStaticMarkup(createElement(Resources)));
    expect(footer).toContain('target="_blank"');
    expect(footer).toContain('rel="noopener noreferrer"');
    expect(footer).not.toMatch(/[?&](ref|aff|affiliate)=/);
    expect(footer).not.toMatch(/official partner|powered by/i);
  });

  it("retains the footer after an actionable no-results section", () => {
    const html = renderToStaticMarkup(
      createElement(Resources, { initialQuery: "unmatchable-banana-spaceship" })
    );
    expect(cardCount(html)).toBe(0);
    expect(html).toContain("No resources match this request yet.");
    expect(html).toContain("Reset search &amp; filters");
    expect(html).toContain("Include non-AI resources");
    expect(html).toContain("Explore source websites");
    expect(attribution(html)).toContain("Everything Startups — Startup Reads");
    expect(
      html.indexOf('<footer aria-label="Startup Resources attribution"')
    ).toBeGreaterThan(html.lastIndexOf("</section>"));
  });
});

describe("unified Resources rendering", () => {
  it("renders nine balanced cards initially, not a separate giant StartupReads section", () => {
    const html = renderToStaticMarkup(createElement(Resources));
    expect(cardCount(html)).toBe(9);
    expect(
      (html.match(/class="rd-badge rd-featured"/g) ?? []).length
    ).toBeLessThanOrEqual(9);
    expect(html).toContain(
      "Everything founders need to go from idea to launch."
    );
    expect(html).toContain('aria-label="Search startup directory"');
    expect(html).toContain('type="submit"');
    expect(html).toContain("AI focus");
    expect(html).toContain('type="checkbox" checked=""');
    expect(html).toContain("Load 9 more resources");
    expect(html).toContain('<details class="rd-details">');
    expect(html).toContain("Open resource");
    expect(html).toContain("Read guide");
    expect(html).not.toContain("startup-reads-heading");
    expect(html).not.toContain("Kleiner Perkins");
    expect(html).not.toContain("Formula 1 Victory");
  });

  it("honors the homepage initial request with deterministic local results", () => {
    const html = renderToStaticMarkup(
      createElement(Resources, {
        initialQuery: "Please find AI credits for my startup",
      })
    );
    expect(html).toContain('value="Please find AI credits for my startup"');
    expect(html).toContain("Matching all terms: ai · credits");
    expect(html).toContain('data-directory-entry="microsoft-startups"');
    expect(html).toContain('data-directory-entry="guide-startup-credits"');
    expect(html).not.toContain('data-directory-entry="y-combinator"');
    expect(cardCount(html)).toBeGreaterThan(0);
    expect(cardCount(html)).toBeLessThanOrEqual(9);
  });

  it("uses escaped inert text for HTML/script-like requests", () => {
    const html = renderToStaticMarkup(
      createElement(Resources, {
        initialQuery: '<script>alert("injected")</script>',
      })
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain('<script>alert("injected")</script>');
    expect(html).toContain("No resources match this request yet.");
  });

  it("exposes four responsive external source panels with honest no-feed status", () => {
    const html = renderToStaticMarkup(createElement(Resources));
    expect(
      (html.match(/data-source-mode="external-source-search"/g) ?? []).length
    ).toBe(4);
    expect(
      (html.match(/External source-search · No API feed connected/g) ?? [])
        .length
    ).toBe(4);
    expect(html).toContain("Y Combinator");
    expect(html).toContain("Techstars");
    expect(html).toContain("Product Hunt");
    expect(html).toContain("Kickstarter");
    expect(html).toContain(
      "no API feeds are connected and no listings are imported"
    );
    expect(html).toContain("grid-template-columns:repeat(2,minmax(0,1fr))");
    expect(html).toContain("grid-template-columns:repeat(3,minmax(0,1fr))");
    expect(html).toContain("grid-template-columns:repeat(4,minmax(0,1fr))");
  });

  it("uses explicit light surfaces and safe external links even inside the dark dashboard", () => {
    const html = renderToStaticMarkup(createElement(Resources));
    expect(html).toContain('class="resource-directory text-[#211b35]"');
    expect(html).toContain("color-scheme:light");
    const externalAnchors = html.match(/<a [^>]*target="_blank"[^>]*>/g) ?? [];
    expect(externalAnchors.length).toBeGreaterThan(4);
    for (const anchor of externalAnchors) {
      expect(anchor).toContain('rel="noopener noreferrer"');
      expect(anchor).not.toMatch(/href="(?:javascript|data):/i);
    }
  });
});
