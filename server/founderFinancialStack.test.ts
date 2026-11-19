import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import evidenceJson from "../shared/financialStackRecords.json?raw";
import FounderFinancialStack from "../client/src/components/FounderFinancialStack";
import {
  FINANCIAL_PAGE_SIZE,
  FINANCIAL_REVIEWED_AT,
  FINANCIAL_ROLES,
  MAX_FINANCIAL_COMPARE,
  createNewFinancialDirectoryEntries,
  financialCompareRecords,
  financialExternalLinkProps,
  financialStackEvidence,
  financialStackRecords,
  findFinancialRecordByAlias,
  isSafeFinancialUrl,
  matchFinancialDirectoryEntry,
  normalizeFinancialAlias,
  paginateFinancialStack,
  safeFinancialCompareIds,
  searchFinancialStack,
  toggleFinancialCompare,
  type FinancialStackRecord,
} from "../shared/founderFinancialStack";
import { founderServiceResources } from "../shared/founderServices";
import {
  directoryGuides,
  localResources,
  newFinancialDirectoryEntries,
  resourceDirectory,
  type DirectoryEntry,
} from "../shared/resourceDirectory";

// Deterministic hook runner for actual event handlers; static rendering still uses React hooks.
const activeHarness = vi.hoisted(() => ({
  current: null as FinancialHarness | null,
}));
vi.mock("react", async importOriginal => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: unknown) =>
      activeHarness.current
        ? activeHarness.current.state(initial)
        : actual.useState(initial),
    useMemo: (factory: () => unknown, deps: unknown[]) =>
      activeHarness.current ? factory() : actual.useMemo(factory, deps),
  };
});

function nodes(root: any): any[] {
  if (Array.isArray(root)) return root.flatMap(nodes);
  if (!root || typeof root !== "object" || !root.props) return [];
  return [root, ...nodes(root.props.children)];
}
function nodeText(root: any): string {
  if (Array.isArray(root)) return root.map(nodeText).join("");
  if (root == null || typeof root === "boolean") return "";
  return typeof root === "object"
    ? nodeText(root.props?.children)
    : String(root);
}
class FinancialHarness {
  index = 0;
  slots: any[] = [];
  tree: any;
  state(initial: any) {
    const index = this.index++;
    if (!(index in this.slots))
      this.slots[index] = typeof initial === "function" ? initial() : initial;
    return [
      this.slots[index],
      (value: any) => {
        this.slots[index] =
          typeof value === "function" ? value(this.slots[index]) : value;
      },
    ];
  }
  render() {
    this.index = 0;
    activeHarness.current = this;
    try {
      this.tree = FounderFinancialStack();
    } finally {
      activeHarness.current = null;
    }
    return this;
  }
  find(predicate: (node: any) => boolean) {
    const found = nodes(this.tree).find(predicate);
    if (!found) throw new Error("Expected financial control not found");
    return found;
  }
  button(label: string) {
    return this.find(
      node => node.props.onClick && nodeText(node).trim() === label
    );
  }
  click(label: string) {
    this.button(label).props.onClick();
    return this.render();
  }
  cards() {
    return nodes(this.tree).filter(node => node.props["data-financial-record"]);
  }
}

const ids = (records: readonly FinancialStackRecord[]) =>
  records.map(record => record.id);
const record = (id: string) =>
  financialStackRecords.find(item => item.id === id)!;
const sampleDirectoryEntry = (
  overrides: Partial<DirectoryEntry> = {}
): DirectoryEntry => ({
  id: "existing-record",
  title: "Existing product",
  url: "https://example.com/product",
  description: "Public product",
  category: "Founder Services",
  tags: ["product"],
  kind: "resource",
  source: "example.com",
  featured: false,
  ...overrides,
});

describe("bounded financial-stack public evidence registry", () => {
  it("includes exactly 27 reviewed records with unique stable IDs and normalized aliases", () => {
    expect(financialStackEvidence).toHaveLength(27);
    expect(financialStackRecords).toHaveLength(27);
    expect(new Set(ids(financialStackRecords)).size).toBe(27);
    expect(
      new Set(financialStackRecords.map(item => item.officialUrl)).size
    ).toBe(27);
    const aliases = financialStackRecords.flatMap(item =>
      item.aliases.map(normalizeFinancialAlias)
    );
    expect(new Set(aliases).size).toBe(aliases.length);
    for (const item of financialStackRecords) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.aliases).toContain(item.name);
      expect(item.reviewedAt).toBe(FINANCIAL_REVIEWED_AT);
      expect(item.researchStatus).toBe("Public-source review");
      expect(item.relationshipStatus).toBe("External Resource");
      expect(item.integrationStatus).toBe("Not connected");
      expect(item.eligibilityStatus).toBe("Not assessed");
      expect(FINANCIAL_ROLES).toContain(item.role);
      expect(item.sources.length).toBeGreaterThan(0);
    }
  });

  it("retains verbatim primary-record fields instead of turning unknown metadata into verified benefits", () => {
    const raw = JSON.parse(evidenceJson).items;
    expect(financialStackEvidence).toEqual(raw);
    for (const item of financialStackRecords) {
      const original = raw.find(
        (entry: { name: string }) => entry.name === item.name
      );
      expect(item.description).toBe(original.description);
      expect(item.pricing).toBe(original.pricing);
      expect(item.creditsOrOffers).toBe(original.credits_or_offers);
      expect(item.eligibility).toBe(original.eligibility);
      expect(item.expiration).toBe(original.expiration);
      expect(item.stageGuidance).toBe(original.stage_guidance);
      expect(item.apiAvailability).toBe(original.api_availability);
      expect(item.ycCompanyEvidence).toBe(original.yc_alumni_status);
      expect(item.ycProgramEvidence).toBe(original.yc_partnership_status);
      expect(item.sources).toEqual(original.sources);
      if (/^Unknown\b/i.test(original.api_availability))
        expect(item.apiStatus).toBe("Unknown");
      if (/^Unknown\b/i.test(original.yc_alumni_status))
        expect(item.ycCompanyStatus).toBe("Unknown");
      if (/^Unknown\b/i.test(original.yc_partnership_status))
        expect(item.ycProgramStatus).toBe("Unknown");
      if (/^Unknown\b/i.test(original.pricing))
        expect(item.pricingStatus).toBe("Unknown");
    }
    expect(record("mercury-perks").apiStatus).toBe("Unknown");
    expect(record("carta-startup-stack").apiStatus).toBe("Unknown");
    expect(record("docsend").apiStatus).toBe(
      "Connector only; public API unknown"
    );
    expect(record("ramp").ycCompanyStatus).toBe("Unknown");
    expect(record("stripe").ycCompanyStatus).toBe("Unknown");
  });

  it("requires HTTPS, no credentials and safe source URLs for all primary and evidence links", () => {
    for (const item of financialStackRecords) {
      expect(isSafeFinancialUrl(item.officialUrl)).toBe(true);
      expect(item.sources.every(isSafeFinancialUrl)).toBe(true);
    }
    expect(financialExternalLinkProps).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
      referrerPolicy: "no-referrer",
    });
  });

  it.each([
    "http://example.com",
    "javascript:alert(1)",
    "data:text/html,hello",
    "/relative",
    "//example.com",
    "https://user:password@example.com",
    " https://example.com",
    "https://example.com\n",
    "ftp://example.com",
    "",
  ])("rejects unsafe financial URL %j", url => {
    expect(isSafeFinancialUrl(url)).toBe(false);
  });

  it("separates confirmed YC company evidence from provider-published or provider-claimed programs", () => {
    expect(record("pulley").ycCompanyStatus).toBe("Verified YC company");
    expect(record("pulley").ycProgramStatus).toBe("Unknown");
    expect(record("rippling").ycCompanyStatus).toBe("Verified YC company");
    expect(record("rippling").ycProgramStatus).toBe("Unknown");
    expect(record("aws-activate").ycCompanyStatus).toBe("Unknown");
    expect(record("aws-activate").ycProgramStatus).toBe(
      "Provider-published YC program"
    );
    expect(record("rho").ycCompanyStatus).toBe("Unknown");
    expect(record("rho").ycProgramStatus).toBe(
      "Provider-claimed; independent confirmation unknown"
    );
    expect(record("carta-startup-stack").ycCompanyStatus).toBe("Unknown");
    expect(record("carta-startup-stack").ycProgramStatus).toBe("Unknown");
  });

  it("flags shutdown, expired YC promotion and closed/stale cohorts without recommending or activating them", () => {
    expect(record("pulley").sunsetDate).toBe("2026-12-08");
    expect(record("pulley").warning).toMatch(
      /Sunset warning.*December 8, 2026.*Not a recommended new-stack default/
    );
    expect(record("pulley").apiStatus).toBe("Unknown");
    expect(record("brex").offerStatus).toBe("Expired offer");
    expect(record("brex").offerDeadline).toBe("2026-05-31");
    expect(record("brex").warning).toMatch(/Do not count it as active credit/);
    expect(record("deel").offerStatus).toBe("Closed season");
    expect(record("paddle").offerStatus).toBe(
      "Past cohort; current availability unknown"
    );
    expect(ids(searchFinancialStack({ view: "perks" }))).not.toEqual(
      expect.arrayContaining(["brex", "pulley", "deel", "paddle"])
    );
    for (const id of ["brex", "pulley", "deel", "paddle"])
      expect(record(id).perksVault).toBe(false);
  });

  it("keeps current Mixpanel plan and cloud exclusions explicit, not legacy or universal credit claims", () => {
    expect(record("mixpanel").summary).toMatch(/first-year-free/);
    expect(record("mixpanel").creditsOrOffers).toMatch(/first year free/);
    expect(record("mixpanel").warning).toMatch(
      /legacy \$50,000 credit program is not the current offer/
    );
    expect(record("mixpanel").eligibility).toMatch(/within 90 days/);
    expect(record("cloudflare-startups").warning).toMatch(
      /Do not assume Workers AI coverage/
    );
    expect(record("cloudflare-startups").creditsOrOffers).toMatch(
      /Workers AI is not covered/
    );
    expect(record("google-startups-cloud").warning).toMatch(
      /excludes third-party products/
    );
    expect(record("google-startups-cloud").creditsOrOffers).toMatch(
      /third-party offerings.*excluded/
    );
    expect(record("posthog").warning).toMatch(/AI tools.*September 14, 2026/);
  });
});

describe("financial directory identity and preservation", () => {
  it("derives approved actual additions while retaining the original 88 resources, eight guides and original 99", () => {
    const additions = new Set(
      newFinancialDirectoryEntries.map(item => item.id)
    );
    const retained = resourceDirectory.filter(item => !additions.has(item.id));
    expect(localResources).toHaveLength(88);
    expect(directoryGuides).toHaveLength(8);
    expect(retained).toHaveLength(99 + founderServiceResources.length);
    expect(newFinancialDirectoryEntries).toHaveLength(27);
    expect(resourceDirectory).toHaveLength(
      99 + founderServiceResources.length + newFinancialDirectoryEntries.length
    );
    expect(new Set(resourceDirectory.map(item => item.id)).size).toBe(
      resourceDirectory.length
    );
    expect(new Set(resourceDirectory.map(item => item.url)).size).toBe(
      resourceDirectory.length
    );
    for (const existing of [
      ...localResources,
      ...directoryGuides,
      ...founderServiceResources,
    ]) {
      expect(resourceDirectory.find(item => item.id === existing.id)).toBe(
        existing
      );
    }
    for (const addition of newFinancialDirectoryEntries) {
      expect(addition.category).toBe("Financial Infrastructure");
      expect(addition.featured).toBe(false);
      expect(addition.relationshipStatus).toBe("External Resource");
    }
  });

  it("recognizes exact URLs and provider aliases without merging distinct products on a shared domain", () => {
    const stripe = record("stripe");
    const mercuryPerks = record("mercury-perks");
    const cartaStack = record("carta-startup-stack");
    expect(
      matchFinancialDirectoryEntry(stripe, founderServiceResources)
    ).toBeUndefined();
    expect(
      matchFinancialDirectoryEntry(mercuryPerks, founderServiceResources)
    ).toBeUndefined();
    expect(
      matchFinancialDirectoryEntry(cartaStack, founderServiceResources)
    ).toBeUndefined();
    const alias = sampleDirectoryEntry({
      id: "saved-stripe-payments",
      title: "STRIPE Payments",
      url: "https://stripe.com/payments",
    });
    expect(matchFinancialDirectoryEntry(stripe, [alias])).toBe(alias);
    expect(
      createNewFinancialDirectoryEntries([alias]).map(item => item.id)
    ).not.toContain("stripe");
    const url = sampleDirectoryEntry({
      id: "saved-ramp",
      title: "Finance provider",
      url: "https://www.ramp.com",
    });
    expect(matchFinancialDirectoryEntry(record("ramp"), [url])).toBe(url);
    expect(
      createNewFinancialDirectoryEntries([url]).map(item => item.id)
    ).not.toContain("ramp");
    expect(alias.id).toBe("saved-stripe-payments");
    expect(url.id).toBe("saved-ramp");
  });

  it("does not fabricate reviewed rich metadata for unreverified existing Mercury, Carta or formation services", () => {
    expect(findFinancialRecordByAlias("Mercury")).toBeUndefined();
    expect(findFinancialRecordByAlias("Carta Launch")).toBeUndefined();
    expect(findFinancialRecordByAlias("Stripe Atlas")).toBeUndefined();
    expect(findFinancialRecordByAlias("Clerky")).toBeUndefined();
    expect(findFinancialRecordByAlias("APOLLO.IO")?.id).toBe("apollo");
    expect(findFinancialRecordByAlias("Google Cloud Startup Program")?.id).toBe(
      "google-startups-cloud"
    );
    expect(resourceDirectory.find(item => item.id === "mercury")?.url).toBe(
      "https://mercury.com/"
    );
    expect(
      resourceDirectory.find(item => item.id === "carta-launch")?.url
    ).toBe("https://carta.com/equity-management/launch/");
    expect(
      resourceDirectory.find(item => item.id === "stripe-atlas")?.url
    ).toBe("https://stripe.com/atlas");
  });
});

describe("local financial search, perks and safe comparison", () => {
  it("searches provider aliases and actual conditions, handles empty results and applies role/API filters", () => {
    expect(searchFinancialStack()).toHaveLength(27);
    expect(ids(searchFinancialStack({ query: "Kruze" }))).toEqual([
      "kruze-consulting",
    ]);
    expect(
      ids(searchFinancialStack({ query: "Delaware", role: "Accounting & tax" }))
    ).toEqual(expect.arrayContaining(["kruze-consulting", "fondo"]));
    expect(searchFinancialStack({ query: "banana spaceship" })).toEqual([]);
    expect(
      searchFinancialStack({ role: "Banking & spend" }).every(
        item => item.role === "Banking & spend"
      )
    ).toBe(true);
    expect(
      searchFinancialStack({ api: "available" }).every(
        item => item.apiStatus === "Available"
      )
    ).toBe(true);
    expect(ids(searchFinancialStack({ api: "unknown" }))).toContain("docsend");
    expect(
      searchFinancialStack({
        query: "<script>globalThis.injected=true</script>",
      })
    ).toEqual([]);
    expect(() =>
      searchFinancialStack({ query: "__proto__ constructor" })
    ).not.toThrow();
  });

  it("starts at nine and loads nine more without changing source records", () => {
    expect(FINANCIAL_PAGE_SIZE).toBe(9);
    expect(paginateFinancialStack(financialStackRecords)).toHaveLength(9);
    expect(paginateFinancialStack(financialStackRecords, 2)).toHaveLength(18);
    expect(paginateFinancialStack(financialStackRecords, 3)).toHaveLength(27);
    for (const page of [NaN, Infinity, -1, 0])
      expect(paginateFinancialStack(financialStackRecords, page)).toHaveLength(
        9
      );
    expect(paginateFinancialStack(financialStackRecords, 2.9)).toHaveLength(18);
    expect(paginateFinancialStack([])).toEqual([]);
    expect(financialStackRecords).toHaveLength(27);
  });

  it("provides marketplaces and selected conditional programs without guaranteed eligibility or program API inference", () => {
    const perks = searchFinancialStack({ view: "perks" });
    expect(ids(perks).slice(0, 2)).toEqual([
      "mercury-perks",
      "carta-startup-stack",
    ]);
    expect(
      perks.every(
        item => item.perksVault && item.offerStatus === "Conditional offer"
      )
    ).toBe(true);
    expect(record("mercury-perks").kind).toBe("Perks marketplace");
    expect(record("mercury-perks").eligibility).toMatch(
      /Mercury customers\/members/
    );
    expect(record("mercury-perks").expiration).toMatch(
      /each Perk has its own expiration/
    );
    expect(record("carta-startup-stack").eligibility).toMatch(
      /Carta customers/
    );
    expect(record("carta-startup-stack").expiration).toMatch(/Unknown/);
    expect(record("carta-startup-stack").pricingStatus).toBe("Unknown");
    expect(record("aws-activate").pricingStatus).toBe("Unknown");
    expect(record("carta-startup-stack").pricing).toMatch(/pricing is Unknown/);
    expect(perks.map(item => item.eligibilityStatus)).not.toContain("Approved");
  });

  it("caps compare at three, rejects invalid IDs, deduplicates, removes and never mutates input", () => {
    expect(MAX_FINANCIAL_COMPARE).toBe(3);
    const all = ids(financialStackRecords);
    expect(safeFinancialCompareIds(all)).toHaveLength(3);
    expect(
      safeFinancialCompareIds([
        "invalid",
        "brex",
        "brex",
        "ramp",
        "rho",
        "pulley",
      ])
    ).toEqual(["brex", "ramp", "rho"]);
    expect(
      safeFinancialCompareIds([
        "__proto__",
        "constructor",
        "javascript:alert(1)",
      ])
    ).toEqual([]);
    const selected = ["brex", "ramp", "rho"];
    expect(toggleFinancialCompare(selected, "pulley")).toEqual(selected);
    expect(toggleFinancialCompare(selected, "ramp")).toEqual(["brex", "rho"]);
    expect(toggleFinancialCompare([], "invalid")).toEqual([]);
    expect(selected).toEqual(["brex", "ramp", "rho"]);
    expect(
      ids(financialCompareRecords(["rho", "invalid", "brex", "ramp", "pulley"]))
    ).toEqual(["rho", "brex", "ramp"]);
    expect(financialCompareRecords(["brex"])[0]).toBe(record("brex"));
  });
});

describe("financial workspace component contract", () => {
  it("loads nine more, searches locally, resets pagination and switches to marketplace-first Perks Vault", () => {
    const component = new FinancialHarness().render();
    expect(component.cards()).toHaveLength(9);
    component.click("Load more records");
    expect(component.cards()).toHaveLength(18);
    component
      .find(node => node.type === "input")
      .props.onChange({ target: { value: "Mixpanel" } });
    component.render();
    expect(
      component.cards().map(node => node.props["data-financial-record"])
    ).toEqual(["mixpanel"]);
    component.click("Reset filters");
    expect(component.cards()).toHaveLength(9);
    component.click("Perks Vault");
    expect(
      component
        .cards()
        .slice(0, 2)
        .map(node => node.props["data-financial-record"])
    ).toEqual(["mercury-perks", "carta-startup-stack"]);
    expect(nodeText(component.tree)).toContain(
      "not bundles of guaranteed eligible offers"
    );
    expect(component.button("Perks Vault").props["aria-pressed"]).toBe(true);
    component.click("Financial directory");
    expect(component.cards()).toHaveLength(9);
    expect(component.cards()[0].props["data-financial-record"]).toBe("brex");
  });

  it("uses the real role and API dropdown handlers with explicit Unknown status", () => {
    const component = new FinancialHarness().render();
    component
      .find(node => node.type === "select" && node.props.value === "All roles")
      .props.onChange({ target: { value: "Payroll & HR" } });
    component.render();
    expect(
      component.cards().map(node => node.props["data-financial-record"])
    ).toEqual(["gusto", "rippling", "deel"]);
    component
      .find(node => node.type === "select" && node.props.value === "all")
      .props.onChange({ target: { value: "unknown" } });
    component.render();
    expect(
      component.cards().map(node => node.props["data-financial-record"])
    ).toEqual(["rippling"]);
  });

  it("selects at most three across filtering and renders vertical source-backed comparisons", () => {
    const component = new FinancialHarness().render();
    for (const name of ["Brex", "Ramp", "Rho"]) {
      component
        .find(node => node.props["aria-label"] === `Compare ${name}`)
        .props.onClick();
      component.render();
    }
    expect(
      component.find(node => node.props["aria-label"] === "Compare Pulley")
        .props.disabled
    ).toBe(true);
    // Even an invocation bypassing disabled HTML cannot exceed the shared boundary.
    component
      .find(node => node.props["aria-label"] === "Compare Pulley")
      .props.onClick();
    component.render().click("Compare selected");
    const comparison = component.find(
      node => node.props.id === "financial-stack-comparison"
    );
    expect(
      nodes(comparison).filter(node => node.type === "article")
    ).toHaveLength(3);
    expect(
      nodes(comparison).filter(
        node => node.props.record && node.type.name === "RecordFacts"
      )
    ).toHaveLength(3);
    component
      .find(node => node.type === "input")
      .props.onChange({ target: { value: "DocSend" } });
    component.render();
    expect(component.cards()).toHaveLength(1);
    expect(nodeText(component.tree)).toContain("3 of 3 selected");
    component
      .find(node => node.props["aria-label"] === "Remove Ramp from comparison")
      .props.onClick();
    component.render();
    expect(nodeText(component.tree)).toContain("2 of 3 selected");
    component.click("Clear comparison");
    expect(component.button("Compare selected").props.disabled).toBe(true);
    expect(
      nodes(component.tree).some(
        node => node.props.id === "financial-stack-comparison"
      )
    ).toBe(false);
  });

  it("renders a no-props root with labelled controls, nine initial cards, source details and prominent cautions", () => {
    const html = renderToStaticMarkup(createElement(FounderFinancialStack));
    expect(html).toContain("data-financial-stack");
    expect(html.match(/data-financial-record=/g)).toHaveLength(9);
    for (const label of [
      "Founder Financial Infrastructure",
      "Search financial infrastructure",
      "Infrastructure role",
      "API documentation",
      "Financial directory",
      "Perks Vault",
      "Compare selected",
      "Load more records",
      "Terms, eligibility &amp; sources",
    ])
      expect(html).toContain(label);
    expect(html).toContain("Sunset warning");
    expect(html).toContain("Expired YC offer");
    expect(html).toContain("Not connected");
    expect(html).toContain("Founder eligibility: Not assessed");
    expect(html).toContain("no-referrer");
    const links = html.match(/<a\b[^>]*>/g) ?? [];
    expect(links.length).toBeGreaterThan(27);
    for (const link of links) {
      expect(link).toContain('target="_blank"');
      expect(link).toContain('rel="noopener noreferrer"');
      expect(link).toContain('referrerPolicy="no-referrer"');
      expect(link).toMatch(/href="https:\/\//);
    }
    expect(html).not.toContain("<table");
    expect(html).not.toMatch(
      /Recommended default|Total savings|Redeem all|Connect bank account/
    );
  });

  it("uses shared selection/search helpers with responsive vertical cards and no network or sensitive collection", () => {
    const source = readFileSync(
      new URL(
        "../client/src/components/FounderFinancialStack.tsx",
        import.meta.url
      ),
      "utf8"
    );
    expect(source).toContain("financialCompareRecords(selectedIds)");
    expect(source).toContain("toggleFinancialCompare(ids, record.id)");
    expect(source).toContain(
      "searchFinancialStack({ query, role, view, api })"
    );
    expect(source).toContain("RecordFacts record={record}");
    expect(source).toContain("md:grid-cols-2 xl:grid-cols-3");
    expect(source).toContain("min-h-[44px]");
    expect(source).toContain(
      "Marketplace listings are not guaranteed eligible offers"
    );
    expect(source).not.toMatch(
      /fetch\s*\(|axios|invokeLLM|useQuery|useMutation|localStorage|sessionStorage|dangerouslySetInnerHTML|<table/
    );
    expect(source).not.toMatch(
      /type=["']password|name=["'](?:ssn|bank|credentials)/
    );
  });
});
