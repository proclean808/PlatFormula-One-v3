import { describe, expect, it } from "vitest";
import { startupReads } from "../shared/startupReads";
import { founderServiceResources } from "../shared/founderServices";
import {
  DIRECTORY_FILTERS,
  DIRECTORY_PAGE_SIZE,
  DIRECTORY_SYNONYMS,
  directoryGuides,
  directorySearchTerms,
  directorySources,
  directorySourceUrl,
  featuredDirectoryEntries,
  isAiDirectoryEntry,
  isSafeDirectoryUrl,
  localResources,
  paginateDirectory,
  newFinancialDirectoryEntries,
  resourceDirectory,
  searchResourceDirectory,
  type DirectoryEntry,
  type DirectorySource,
} from "../shared/resourceDirectory";

const ids = (entries: DirectoryEntry[]) => entries.map(entry => entry.id);

function sample(overrides: Partial<DirectoryEntry> = {}): DirectoryEntry {
  return {
    id: "sample",
    title: "Sample resource",
    description: "A useful local entry.",
    category: "Tools & Platforms",
    tags: [],
    url: "https://example.com/resource",
    kind: "resource",
    source: "example.com",
    featured: false,
    ...overrides,
  };
}

describe("unified local resource catalog", () => {
  it("retains all 88 original resources, eight guides and three existing build tools while adding the verified founder resources", () => {
    expect(localResources).toHaveLength(88);
    expect(directoryGuides).toHaveLength(8);
    expect(resourceDirectory).toHaveLength(
      99 + founderServiceResources.length + newFinancialDirectoryEntries.length
    );
    expect(new Set(resourceDirectory.map(entry => entry.id)).size).toBe(
      resourceDirectory.length
    );
    expect(new Set(resourceDirectory.map(entry => entry.url)).size).toBe(
      resourceDirectory.length
    );
    expect(ids(localResources)).toContain("kleiner-perkins");
  });

  it("preserves the original stored logos and notable URLs", () => {
    const expected: Record<string, string> = {
      "y-combinator": "/manus-storage/yc-logo_37599741.png",
      techstars: "/manus-storage/techstars-logo_670a0e22.webp",
      "500-global": "/manus-storage/500global-logo_9b4545d9.png",
      "vercel-ai-accelerator": "/manus-storage/vercel-logo_6976c134.png",
      "vercel-ai-sdk": "/manus-storage/vercel-logo_6976c134.png",
      "reo-dev": "/manus-storage/reodev-logo_d7263c4a.jpg",
    };
    for (const [id, logo] of Object.entries(expected)) {
      expect(localResources.find(entry => entry.id === id)?.logo).toBe(logo);
    }
    expect(localResources.find(entry => entry.id === "f6s-events")?.url).toBe(
      "https://www.f6s.com/programs?type[]=short_event&sort=closest&sort_dir=desc"
    );
    expect(
      localResources.find(entry => entry.id === "vercel-ai-accelerator")?.url
    ).toBe(
      "https://vercel.com/blog/the-vercel-ai-accelerator-is-back-with-6-million-in-credits"
    );
  });

  it("keeps guide source links, summaries, cautions and actionable next steps factual", () => {
    for (const read of startupReads) {
      const entry = directoryGuides.find(
        guide => guide.id === `guide-${read.id}`
      );
      expect(entry).toMatchObject({
        title: read.title,
        description: read.summary,
        url: read.sourceUrl,
        category: "Startup Reads",
        kind: "guide",
        source: "Everything Startups",
        action: read.action,
        caution: read.caution,
        reviewedAt: read.reviewedAt,
      });
      expect(entry?.workspace).toBeTruthy();
    }
  });

  it("uses the unified filters and requires stable metadata and safe URLs on every entry", () => {
    expect(DIRECTORY_FILTERS).toEqual([
      "All",
      "Accelerators",
      "AI Credits",
      "Investors",
      "Startup Reads",
      "Tools & Platforms",
      "Founder Services",
      "Financial Infrastructure",
    ]);
    for (const entry of resourceDirectory) {
      expect(entry.id).toMatch(/^[a-z0-9-]+$/);
      expect(entry.title).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.source).toBeTruthy();
      expect(entry.tags.length).toBeGreaterThan(0);
      expect(DIRECTORY_FILTERS).toContain(entry.category);
      expect(["resource", "guide"]).toContain(entry.kind);
      expect(typeof entry.featured).toBe("boolean");
      expect(isSafeDirectoryUrl(entry.url)).toBe(true);
    }
  });

  it("does not expose stale monetary, ranking, portfolio-count or guaranteed-offer snippets", () => {
    for (const entry of localResources) {
      expect(entry.description).not.toMatch(
        /\$|\d+[KM]|\d+,\d+|\d+%|\b(world.?s (first|largest)|top[- ]tier|largest|leading|best|guaranteed|success rate)\b/i
      );
    }
  });

  it("has no more than nine featured entries or unsupported affiliate labels", () => {
    const featured = featuredDirectoryEntries();
    expect(featured).toHaveLength(9);
    expect(resourceDirectory.filter(entry => entry.featured)).toHaveLength(9);
    expect(featured.every(entry => isAiDirectoryEntry(entry))).toBe(true);
    for (const entry of featured) {
      expect(
        [entry.title, entry.description, ...entry.tags].join(" ")
      ).not.toMatch(/affiliate|official partner/i);
      expect(entry.url).not.toMatch(/[?&](aff|ref|affiliate|referral)=/i);
    }
    expect(
      featuredDirectoryEntries(
        Array.from({ length: 20 }, (_, index) =>
          sample({ id: `featured-${index}`, featured: true })
        )
      )
    ).toHaveLength(9);
  });
});

describe("transparent local keyword search", () => {
  it("removes request stopwords and deduplicates canonical terms", () => {
    expect(
      directorySearchTerms("Please help me find AI AI credits for my startup")
    ).toEqual(["ai", "credits"]);
    expect(directorySearchTerms("the and for my startup")).toEqual([]);
    expect(directorySearchTerms("  AI   CREDITS  ")).toEqual(["ai", "credits"]);
  });

  it("handles the hero example and ordinary request phrasing without filler-word false negatives", () => {
    expect(
      directorySearchTerms("I need AI credits to build my first app")
    ).toEqual(["ai", "credits", "build"]);
    expect(
      ids(
        searchResourceDirectory(resourceDirectory, {
          query: "I need AI credits to build my first app",
        })
      )
    ).toContain("microsoft-startups");
    expect(
      ids(
        searchResourceDirectory(resourceDirectory, {
          query: "find AI tools to create a website",
        })
      )
    ).toContain("lovable");
    expect(
      ids(
        searchResourceDirectory(resourceDirectory, {
          query: "I am looking for an AI investor",
        })
      )
    ).toContain("ai-fund");
  });

  it.each(["AI", "artificial intelligence", "artificialintelligence", "GenAI"])(
    "matches the explicit AI synonym %s",
    query => {
      expect(directorySearchTerms(query)).toEqual(["ai"]);
      expect(
        ids(searchResourceDirectory(resourceDirectory, { query }))
      ).toContain("ai-fund");
    }
  );

  it.each([
    "credits",
    "compute",
    "cloud",
    "cloud funding",
    "cloudfunding",
    "GPU",
  ])("matches credits intent %s", query => {
    expect(directorySearchTerms(query)).toEqual(["credits"]);
    expect(
      ids(searchResourceDirectory(resourceDirectory, { query }))
    ).toContain("microsoft-startups");
  });

  it.each(["investors", "fundraising", "VC", "venture capital"])(
    "matches investor intent %s",
    query => {
      expect(directorySearchTerms(query)).toEqual(["investors"]);
      expect(
        ids(
          searchResourceDirectory(resourceDirectory, { query: `AI ${query}` })
        )
      ).toContain("ai-fund");
    }
  );

  it("matches pitch/deck and app/website/build intents without simulated inference", () => {
    expect(directorySearchTerms("pitch deck guides")).toEqual([
      "pitch",
      "reads",
    ]);
    expect(
      ids(
        searchResourceDirectory(resourceDirectory, {
          query: "pitch deck guides",
          aiOnly: false,
        })
      )
    ).toContain("guide-fundraising-tools");
    const appIds = ids(
      searchResourceDirectory(resourceDirectory, {
        query: "Help me build an AI website",
      })
    );
    expect(appIds).toEqual(
      expect.arrayContaining([
        "vercel-ai-sdk",
        "lovable",
        "replit",
        "github-copilot",
      ])
    );
    expect(DIRECTORY_SYNONYMS.website).toBe("build");
  });

  it("requires all meaningful words, rather than returning anything matching just one word", () => {
    const entries = [
      sample({ id: "ai-only", tags: ["AI"] }),
      sample({ id: "cloud-only", tags: ["credits"] }),
      sample({ id: "both", tags: ["AI", "cloud"] }),
    ];
    expect(
      ids(
        searchResourceDirectory(entries, {
          query: "I need artificial intelligence compute",
        })
      )
    ).toEqual(["both"]);
    expect(
      searchResourceDirectory(resourceDirectory, {
        query: "AI banana spaceship",
      })
    ).toEqual([]);
  });

  it("handles punctuation and word boundaries, not accidental AI substrings in email or capital", () => {
    expect(directorySearchTerms("AI, compute! please")).toEqual([
      "ai",
      "credits",
    ]);
    expect(
      searchResourceDirectory([sample({ title: "Email capital" })], {
        query: "AI",
        aiOnly: false,
      })
    ).toEqual([]);
    expect(
      isAiDirectoryEntry(sample({ tags: ["email", "capital", "paid"] }))
    ).toBe(false);
  });

  it("treats mixed-case and HTML/script-like user input as inert words and never evaluates it", () => {
    const malicious =
      "<script>globalThis.directoryInjected = true</script> javascript:alert(1)";
    const state = globalThis as typeof globalThis & {
      directoryInjected?: boolean;
    };
    expect(state.directoryInjected).toBeUndefined();
    expect(() =>
      searchResourceDirectory(resourceDirectory, { query: malicious })
    ).not.toThrow();
    expect(
      searchResourceDirectory(resourceDirectory, { query: malicious })
    ).toEqual([]);
    expect(state.directoryInjected).toBeUndefined();
    expect(
      directorySearchTerms("__proto__ constructor prototype").every(
        term => typeof term === "string"
      )
    ).toBe(true);
  });

  it("bounds query length and uses stable deterministic relevance ordering", () => {
    expect(directorySearchTerms("x".repeat(300))).toEqual(["x".repeat(256)]);
    const entries = [
      sample({ id: "body", description: "AI service" }),
      sample({ id: "tag", tags: ["AI"] }),
      sample({ id: "title", title: "AI service" }),
    ];
    expect(
      ids(searchResourceDirectory(entries, { query: "AI", aiOnly: false }))
    ).toEqual(["title", "tag", "body"]);
    expect(
      searchResourceDirectory(resourceDirectory, { query: "AI credits" })
    ).toEqual(
      searchResourceDirectory(resourceDirectory, { query: "AI credits" })
    );
  });
});

describe("directory filters and batching", () => {
  it("defaults AI focus to explicit tags while keeping all original entries discoverable", () => {
    const aiResults = searchResourceDirectory();
    expect(aiResults.length).toBeGreaterThan(9);
    expect(aiResults.every(isAiDirectoryEntry)).toBe(true);
    expect(ids(aiResults)).not.toContain("y-combinator");
    expect(ids(aiResults)).not.toContain("techstars");
    expect(
      searchResourceDirectory(resourceDirectory, { aiOnly: false })
    ).toHaveLength(resourceDirectory.length);
  });

  it.each(DIRECTORY_FILTERS.filter(category => category !== "All"))(
    "keeps %s filters mutually consistent",
    category => {
      const filtered = searchResourceDirectory(resourceDirectory, {
        category,
        aiOnly: false,
      });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(entry => entry.category === category)).toBe(true);
    }
  );

  it("shows guides as searchable peer entries without a separate reading wall", () => {
    expect(
      searchResourceDirectory(resourceDirectory, {
        category: "Startup Reads",
        aiOnly: false,
      })
    ).toHaveLength(8);
    const aiGuides = searchResourceDirectory(resourceDirectory, {
      category: "Startup Reads",
    });
    expect(ids(aiGuides)).toEqual(["guide-startup-credits"]);
    expect(
      searchResourceDirectory(resourceDirectory, {
        category: "Investors",
        query: "pitch decks",
        aiOnly: false,
      })
    ).toEqual([]);
  });

  it("starts with nine, loads nine more and can reset to the first page", () => {
    const entries = searchResourceDirectory(resourceDirectory, {
      aiOnly: false,
    });
    expect(DIRECTORY_PAGE_SIZE).toBe(9);
    const initial = paginateDirectory(entries);
    const expanded = paginateDirectory(entries, 2);
    expect(initial).toHaveLength(9);
    expect(expanded).toHaveLength(18);
    expect(expanded.slice(0, 9)).toEqual(initial);
    expect(paginateDirectory(entries, 3)).toHaveLength(27);
    expect(paginateDirectory(entries, 1)).toEqual(initial);
    expect(paginateDirectory(entries, 100)).toHaveLength(entries.length);
  });

  it("clamps invalid pages and does not mutate catalogs", () => {
    const entries = [...resourceDirectory];
    for (const page of [0, -2, NaN, Infinity])
      expect(paginateDirectory(entries, page)).toHaveLength(9);
    expect(paginateDirectory(entries, 2.9)).toHaveLength(18);
    const short = entries.slice(0, 3);
    expect(paginateDirectory(short)).toHaveLength(3);
    expect(paginateDirectory([])).toEqual([]);
    searchResourceDirectory(entries, { query: "AI" });
    expect(entries).toEqual(resourceDirectory);
  });
});

describe("safe external resource links and source adapters", () => {
  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "//example.com",
    "/relative/path",
    "not a url",
    "",
    " https://example.com",
    "https://example.com\n",
    "java\nscript:alert(1)",
    "https://user:password@example.com",
    "ftp://example.com",
  ])("rejects unsafe URL %j", url =>
    expect(isSafeDirectoryUrl(url)).toBe(false)
  );

  it.each([
    "https://example.com/path?q=AI%20credits",
    "http://example.com/resource",
    "https://example.com?a[]=one&b=two",
  ])("accepts ordinary web URL %s", url => {
    expect(isSafeDirectoryUrl(url)).toBe(true);
  });

  it("filters unsafe entry URLs even if they otherwise match", () => {
    const entries = [
      sample({
        id: "unsafe",
        tags: ["AI"],
        url: "javascript:alert(1)",
        featured: true,
      }),
      sample({ id: "safe", tags: ["AI"] }),
    ];
    expect(ids(searchResourceDirectory(entries))).toEqual(["safe"]);
    expect(featuredDirectoryEntries(entries)).toEqual([]);
  });

  it("exposes four honest external-source links, not imported or connected feeds", () => {
    expect(directorySources.map(source => source.id)).toEqual([
      "yc",
      "techstars",
      "product-hunt",
      "kickstarter",
    ]);
    for (const source of directorySources) {
      expect(source.mode).toBe("external-source-search");
      expect(source.feedStatus).toBe("not-connected");
      expect(isSafeDirectoryUrl(source.landingUrl)).toBe(true);
      if (!source.search)
        expect(directorySourceUrl(source, "AI credits")).toBe(
          source.landingUrl
        );
    }
  });

  it("uses only explicitly supplied adapters and safely encodes query parameters", () => {
    const source: DirectorySource = {
      id: "verified-example",
      title: "Example",
      description: "Search landing",
      mode: "external-source-search",
      feedStatus: "not-connected",
      landingUrl: "https://example.com/discover",
      search: { url: "https://example.com/search?sort=new", queryParam: "q" },
    };
    const input = 'AI & credits = "<script>" #help';
    const url = new URL(directorySourceUrl(source, input)!);
    expect(url.searchParams.get("q")).toBe(input);
    expect(url.searchParams.get("sort")).toBe("new");
    expect(url.hash).toBe("");
    expect(directorySourceUrl(source, "")).toBe(source.landingUrl);
    expect(
      new URL(directorySourceUrl(source, "a".repeat(500))!).searchParams.get(
        "q"
      )
    ).toHaveLength(256);
    expect(
      directorySourceUrl({
        ...source,
        landingUrl: "javascript:alert(1)",
        search: undefined,
      })
    ).toBeUndefined();
    expect(
      directorySourceUrl(
        {
          ...source,
          search: { url: "data:text/html,unsafe", queryParam: "q" },
        },
        "AI"
      )
    ).toBeUndefined();
  });
});
