import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DIRECTORY_HISTORY_LIMIT,
  DIRECTORY_PERSONALIZATION_KEY,
  applyInitialDirectoryQuery,
  createSavedDirectoryExport,
  defaultDirectoryPersonalization,
  loadDirectoryPersonalization,
  parseDirectoryPersonalization,
  personalizeDirectoryResults,
  persistDirectoryPersonalization,
  recordDirectoryClick,
  recordDirectorySearch,
  removeDirectorySearch,
  savedDirectoryEntries,
  toggleDirectorySaved,
  type DirectoryPersonalization,
  type DirectoryStorage,
} from "../shared/directoryPersonalization";
import {
  paginateDirectory,
  resourceDirectory,
  searchResourceDirectory,
} from "../shared/resourceDirectory";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "../client/src/lib/safeStorage";

// A small deterministic hook/effect runner exercises the actual component event handlers
// without a DOM or browser. Real React hooks remain in use for static-render checks.
const hooks = vi.hoisted(() => ({ current: null as any }));
const feedback = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast: feedback }));
vi.mock("react", async importOriginal => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: unknown) =>
      hooks.current ? hooks.current.state(initial) : actual.useState(initial),
    useRef: (initial: unknown) =>
      hooks.current ? hooks.current.ref(initial) : actual.useRef(initial),
    useEffect: (effect: () => unknown, deps: unknown[]) =>
      hooks.current
        ? hooks.current.effect(effect, deps)
        : actual.useEffect(effect, deps),
    useMemo: (factory: () => unknown, deps: unknown[]) =>
      hooks.current ? factory() : actual.useMemo(factory, deps),
  };
});
import Resources from "../client/src/components/Resources";

beforeAll(() => vi.stubGlobal("React", React));
afterAll(() => vi.unstubAllGlobals());
afterEach(() => {
  hooks.current = null;
  feedback.success.mockReset();
  feedback.error.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.stubGlobal("React", React);
});

function memoryStorage(): DirectoryStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    get: vi.fn((key: string) => values.get(key) ?? null),
    set: vi.fn((key: string, value: string) => {
      values.set(key, value);
      return true;
    }),
  };
}
function ids(entries: { id: string }[]) {
  return entries.map(entry => entry.id);
}
function persisted(state: Partial<DirectoryPersonalization>) {
  return JSON.stringify({ ...defaultDirectoryPersonalization(), ...state });
}
function mockBrowser(values = new Map<string, string>()) {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        values.set(key, value);
      }),
    },
    setTimeout: (callback: () => void) => {
      callback();
      return 1;
    },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    },
  });
  return values;
}
function allNodes(root: any): any[] {
  if (Array.isArray(root)) return root.flatMap(allNodes);
  if (!root || typeof root !== "object" || !root.props) return [];
  return [root, ...allNodes(root.props.children)];
}
function text(root: any): string {
  if (Array.isArray(root)) return root.map(text).join("");
  if (root == null || typeof root === "boolean") return "";
  return typeof root === "object" ? text(root.props?.children) : String(root);
}
class ComponentHarness {
  index = 0;
  slots: any[] = [];
  pending: (() => unknown)[] = [];
  dirty = false;
  tree: any;
  props: { initialQuery?: string; onNavigate?: (tab: string) => void };
  constructor(props: ComponentHarness["props"] = {}) {
    this.props = props;
  }
  state(initial: any) {
    const index = this.index++;
    if (!(index in this.slots))
      this.slots[index] = typeof initial === "function" ? initial() : initial;
    return [
      this.slots[index],
      (value: any) => {
        const next =
          typeof value === "function" ? value(this.slots[index]) : value;
        if (!Object.is(next, this.slots[index])) {
          this.slots[index] = next;
          this.dirty = true;
        }
      },
    ];
  }
  ref(initial: any) {
    const index = this.index++;
    if (!(index in this.slots)) this.slots[index] = { current: initial };
    return this.slots[index];
  }
  effect(effect: () => unknown, deps: any[]) {
    const index = this.index++;
    const previous = this.slots[index];
    if (
      !previous ||
      deps.length !== previous.length ||
      deps.some((dep, i) => !Object.is(dep, previous[i]))
    ) {
      this.slots[index] = deps;
      this.pending.push(effect);
    }
  }
  render() {
    this.index = 0;
    this.dirty = false;
    hooks.current = this;
    try {
      this.tree = Resources(this.props);
    } finally {
      hooks.current = null;
    }
    return this;
  }
  flush() {
    for (let pass = 0; pass < 20; pass++) {
      const effects = this.pending.splice(0);
      effects.forEach(effect => effect());
      if (!this.dirty && !this.pending.length) return this;
      this.render();
    }
    throw new Error("Component effects did not settle");
  }
  act(action: () => void) {
    action();
    this.render();
    return this.flush();
  }
  find(predicate: (node: any) => boolean) {
    const node = allNodes(this.tree).find(predicate);
    if (!node) throw new Error("Expected component control not found");
    return node;
  }
  button(label: string) {
    return this.find(
      node => node.type === "button" && node.props["aria-label"] === label
    );
  }
  input() {
    return this.find(
      node => node.type === "input" && node.props.type === "search"
    );
  }
  cards() {
    return allNodes(this.tree).filter(
      node => node.props.entry && node.props.onToggleSaved
    );
  }
}
function mount(props: ComponentHarness["props"] = {}) {
  return new ComponentHarness(props).render().flush();
}
function readBrowserState(values: Map<string, string>) {
  return parseDirectoryPersonalization(
    values.get(DIRECTORY_PERSONALIZATION_KEY) ?? null
  );
}

describe("directory personalization validation", () => {
  it("starts with original AI-focused preferences and empty personal data", () => {
    expect(defaultDirectoryPersonalization()).toEqual({
      formatVersion: 1,
      preferences: { query: "", category: "All", aiOnly: true },
      recentSearches: [],
      clickedIds: [],
      savedIds: [],
    });
  });

  it.each([
    null,
    "",
    "not-json",
    "null",
    "[]",
    '"text"',
    "42",
    '{"formatVersion":2}',
    '{"formatVersion":"1"}',
    '{"formatVersion":1,"__proto__":{"polluted":true}}',
  ])("discards malformed, unsupported or prototype-bearing storage %j", raw => {
    expect(parseDirectoryPersonalization(raw)).toEqual(
      defaultDirectoryPersonalization()
    );
    expect(({} as any).polluted).toBeUndefined();
  });

  it("drops malformed preference/history records and prototype entries without losing valid IDs", () => {
    const raw =
      '{"formatVersion":1,"preferences":{"query":"AI","category":"All","aiOnly":true,"constructor":{}},"recentSearches":[{"query":"okay","category":"All","aiOnly":false},{"query":"bad","category":"All","aiOnly":true,"prototype":{}},{"query":"bad","category":"unknown","aiOnly":true},{"query":5,"category":"All","aiOnly":true},{"query":"bad","category":"All","aiOnly":"true"}],"clickedIds":["constructor",{},"ai-fund"],"savedIds":["__proto__","prototype",null,"lovable"]}';
    const state = parseDirectoryPersonalization(raw);
    expect(state.preferences).toEqual(
      defaultDirectoryPersonalization().preferences
    );
    expect(state.recentSearches).toEqual([
      { query: "okay", category: "All", aiOnly: false },
    ]);
    expect(state.clickedIds).toEqual(["ai-fund"]);
    expect(state.savedIds).toEqual(["lovable"]);
  });

  it("rejects oversized raw payloads and bounds query length to 256", () => {
    expect(parseDirectoryPersonalization("x".repeat(200_001))).toEqual(
      defaultDirectoryPersonalization()
    );
    const state = parseDirectoryPersonalization(
      persisted({
        preferences: { query: "x".repeat(1000), category: "All", aiOnly: true },
      })
    );
    expect(state.preferences.query).toHaveLength(256);
    expect(
      defaultDirectoryPersonalization("x".repeat(1000)).preferences.query
    ).toHaveLength(256);
  });

  it("caps history at ten distinct query/filter/AI snapshots and deduplicates case/whitespace", () => {
    const searches = [
      { query: "  AI  ", category: "All", aiOnly: true },
      { query: "ai", category: "All", aiOnly: true },
      ...Array.from({ length: 30 }, (_, i) => ({
        query: `search ${i}`,
        category: "All",
        aiOnly: false,
      })),
    ];
    const state = parseDirectoryPersonalization(
      persisted({ recentSearches: searches as any })
    );
    expect(state.recentSearches).toHaveLength(DIRECTORY_HISTORY_LIMIT);
    expect(state.recentSearches[0]).toEqual({
      query: "AI",
      category: "All",
      aiOnly: true,
    });
    expect(state.recentSearches[1].query).toBe("search 0");
  });

  it("discards unknown IDs, deduplicates and caps both ID lists at the complete catalog count", () => {
    const input = [
      "unknown",
      "__proto__",
      "constructor",
      42,
      null,
      {},
      ...resourceDirectory.map(entry => entry.id),
      ...resourceDirectory.map(entry => entry.id),
    ];
    const state = parseDirectoryPersonalization(
      persisted({ clickedIds: input as any, savedIds: input as any })
    );
    expect(state.clickedIds).toHaveLength(resourceDirectory.length);
    expect(state.savedIds).toEqual(resourceDirectory.map(entry => entry.id));
  });

  it("round-trips valid data and keeps preferences independent from recent history", () => {
    const state = {
      ...recordDirectorySearch(defaultDirectoryPersonalization("AI credits")),
      preferences: {
        query: "typed draft",
        category: "Investors" as const,
        aiOnly: false,
      },
    };
    expect(parseDirectoryPersonalization(JSON.stringify(state))).toEqual(state);
    expect(state.recentSearches[0].query).toBe("AI credits");
  });
});

describe("directory history and preference persistence", () => {
  it("does not persist anything before local state has loaded", () => {
    const storage = memoryStorage();
    expect(
      persistDirectoryPersonalization(
        storage,
        defaultDirectoryPersonalization(),
        false
      )
    ).toBeNull();
    expect(storage.set).not.toHaveBeenCalled();
  });

  it("loads before saving and preserves saved preferences on an empty initialQuery", () => {
    const storage = memoryStorage();
    const state = {
      ...defaultDirectoryPersonalization("fundraising"),
      preferences: {
        query: "fundraising",
        category: "Investors" as const,
        aiOnly: false,
      },
      savedIds: ["lovable"],
    };
    storage.values.set(DIRECTORY_PERSONALIZATION_KEY, JSON.stringify(state));
    const loaded = loadDirectoryPersonalization(storage, "");
    expect(loaded).toEqual(state);
    expect(storage.set).not.toHaveBeenCalled();
    expect(persistDirectoryPersonalization(storage, loaded, true)).toBe(true);
    expect(storage.set).toHaveBeenCalledWith(
      DIRECTORY_PERSONALIZATION_KEY,
      JSON.stringify(state)
    );
  });

  it("a nonempty initialQuery overrides only the stale query, not filters, AI or saved items", () => {
    const state = {
      ...defaultDirectoryPersonalization("stale"),
      preferences: {
        query: "stale",
        category: "AI Credits" as const,
        aiOnly: false,
      },
      savedIds: ["lovable"],
    };
    expect(applyInitialDirectoryQuery(state, "  ")).toBe(state);
    expect(applyInitialDirectoryQuery(state, "AI credits")).toEqual({
      ...state,
      preferences: { ...state.preferences, query: "AI credits" },
    });
  });

  it("moves a restored snapshot to the front and retains different filters for the same query", () => {
    let state = recordDirectorySearch(defaultDirectoryPersonalization("AI"));
    state = recordDirectorySearch(state, {
      query: "AI",
      category: "Investors",
      aiOnly: false,
    });
    state = recordDirectorySearch(state, {
      query: "build",
      category: "All",
      aiOnly: true,
    });
    state = recordDirectorySearch(state, {
      query: "ai",
      category: "All",
      aiOnly: true,
    });
    expect(state.recentSearches).toEqual([
      { query: "ai", category: "All", aiOnly: true },
      { query: "build", category: "All", aiOnly: true },
      { query: "AI", category: "Investors", aiOnly: false },
    ]);
  });

  it("deletes exactly one query/category/AI identity without mutating or restoring personal data", () => {
    const search = { query: "AI", category: "All" as const, aiOnly: true };
    const state: DirectoryPersonalization = {
      ...defaultDirectoryPersonalization("active draft"),
      recentSearches: [
        search,
        { ...search, category: "Investors" },
        { ...search, aiOnly: false },
        { ...search, query: "ai" },
        { ...search, query: " AI " },
      ],
      savedIds: ["lovable"],
      clickedIds: ["replit"],
    };
    const original = JSON.stringify(state);
    const next = removeDirectorySearch(state, search);
    expect(next.recentSearches).toEqual(state.recentSearches.slice(1));
    expect(next.preferences).toBe(state.preferences);
    expect(next.savedIds).toBe(state.savedIds);
    expect(next.clickedIds).toBe(state.clickedIds);
    expect(JSON.stringify(state)).toBe(original);
    expect(removeDirectorySearch(next, search)).toBe(next);
  });

  it("deletes the last search without clearing active preferences, favorites or clicked IDs", () => {
    const state = {
      ...recordDirectorySearch(defaultDirectoryPersonalization("AI credits")),
      savedIds: ["lovable"],
      clickedIds: ["replit"],
    };
    const next = removeDirectorySearch(state, state.recentSearches[0]);
    expect(next).toEqual({ ...state, recentSearches: [] });
    expect(state.recentSearches).toHaveLength(1);
  });

  it("ignores empty submitted queries, unknown saves and unknown clicks", () => {
    const state = defaultDirectoryPersonalization("  ");
    expect(recordDirectorySearch(state)).toBe(state);
    expect(toggleDirectorySaved(state, "not-in-catalog")).toBe(state);
    expect(recordDirectoryClick(state, "__proto__")).toBe(state);
  });

  it("returns session-only status using safeStorage when property access or quota is blocked", () => {
    const browser = {};
    Object.defineProperty(browser, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
    });
    vi.stubGlobal("window", browser);
    const storage = { get: getLocalStorageItem, set: setLocalStorageItem };
    expect(loadDirectoryPersonalization(storage)).toEqual(
      defaultDirectoryPersonalization()
    );
    expect(
      persistDirectoryPersonalization(
        storage,
        defaultDirectoryPersonalization(),
        true
      )
    ).toBe(false);
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
      },
    });
    expect(
      persistDirectoryPersonalization(
        storage,
        defaultDirectoryPersonalization(),
        true
      )
    ).toBe(false);
  });
});

describe("saved metadata, personalization order and nine-at-a-time semantics", () => {
  it("toggles saves independently and keeps clicks most-recent-first with no duplicate IDs", () => {
    let state = toggleDirectorySaved(
      defaultDirectoryPersonalization(),
      "lovable"
    );
    state = toggleDirectorySaved(state, "ai-fund");
    expect(state.savedIds).toEqual(["ai-fund", "lovable"]);
    state = recordDirectoryClick(state, "lovable");
    state = recordDirectoryClick(state, "ai-fund");
    state = recordDirectoryClick(state, "lovable");
    expect(state.clickedIds).toEqual(["lovable", "ai-fund"]);
    expect(toggleDirectorySaved(state, "ai-fund").savedIds).toEqual([
      "lovable",
    ]);
  });

  it("moves recent clicked then saved entries ahead of defaults only with no query", () => {
    const state = {
      ...defaultDirectoryPersonalization(),
      clickedIds: ["github-copilot", "lovable", "unknown"],
      savedIds: ["lovable", "replit"],
    };
    const defaults = searchResourceDirectory();
    const ordered = personalizeDirectoryResults(defaults, state);
    expect(ids(ordered).slice(0, 3)).toEqual([
      "github-copilot",
      "lovable",
      "replit",
    ]);
    expect(ordered).toHaveLength(defaults.length);
    expect(new Set(ids(ordered)).size).toBe(defaults.length);
    expect(ordered.slice(3)).toEqual(
      defaults.filter(
        entry => !["github-copilot", "lovable", "replit"].includes(entry.id)
      )
    );
    expect(paginateDirectory(ordered)).toHaveLength(9);
    expect(paginateDirectory(ordered, 2)).toHaveLength(18);
    expect(paginateDirectory(ordered, 100)).toEqual(ordered);
    const searched = searchResourceDirectory(resourceDirectory, {
      query: "AI build",
    });
    expect(personalizeDirectoryResults(searched, state, "AI build")).toEqual(
      searched
    );
  });

  it("respects category and AI filters without deleting the hidden saved items", () => {
    const state = {
      ...defaultDirectoryPersonalization(),
      clickedIds: ["y-combinator", "lovable"],
      savedIds: ["y-combinator", "ai-fund", "lovable"],
    };
    const matches = searchResourceDirectory(resourceDirectory, {
      category: "Investors",
      aiOnly: true,
    });
    const results = personalizeDirectoryResults(matches, state);
    expect(results[0].id).toBe("ai-fund");
    expect(ids(results)).not.toContain("lovable");
    expect(ids(results)).not.toContain("y-combinator");
    expect(ids(savedDirectoryEntries(state))).toEqual([
      "y-combinator",
      "ai-fund",
      "lovable",
    ]);
  });

  it("exports actual catalog metadata and URLs regardless of current query/filter/AI", () => {
    const state = {
      ...defaultDirectoryPersonalization("unmatchable private query"),
      preferences: {
        query: "unmatchable private query",
        category: "AI Credits" as const,
        aiOnly: true,
      },
      recentSearches: [
        { query: "private history", category: "All" as const, aiOnly: false },
      ],
      clickedIds: ["replit"],
      savedIds: [
        "y-combinator",
        "guide-fundraising-tools",
        "lovable",
        "unknown",
        "lovable",
      ],
    };
    const exported = createSavedDirectoryExport(
      state,
      resourceDirectory,
      "2026-11-19T00:00:00.000Z"
    );
    expect(exported).toMatchObject({
      format: "platformula-one/saved-directory",
      formatVersion: 1,
      exportedAt: "2026-11-19T00:00:00.000Z",
    });
    expect(exported.items).toEqual(
      state.savedIds
        .slice(0, 3)
        .map(id => resourceDirectory.find(entry => entry.id === id))
    );
    expect(exported.items[1]).toMatchObject({
      source: "Everything Startups",
      kind: "guide",
      action: expect.any(String),
      reviewedAt: expect.any(String),
    });
    expect(JSON.stringify(exported)).not.toMatch(
      /private query|private history|clickedIds|savedIds|preferences/
    );
    expect(exported.items[0].url).toBe("https://www.ycombinator.com");
    expect(exported.items[0]).not.toBe(resourceDirectory[0]);
    expect(exported.items[0].tags).not.toBe(resourceDirectory[0].tags);
  });

  it("exports no unknown or unsafe entries and defaults reset ordering without changing the catalog", () => {
    const original = JSON.stringify(resourceDirectory);
    const unsafe = {
      ...resourceDirectory[0],
      id: "unsafe",
      url: "javascript:alert(1)",
    };
    const state = {
      ...defaultDirectoryPersonalization(),
      savedIds: ["unsafe", "unknown"],
    };
    expect(createSavedDirectoryExport(state, [unsafe]).items).toEqual([]);
    const defaults = searchResourceDirectory();
    expect(
      personalizeDirectoryResults(defaults, defaultDirectoryPersonalization())
    ).toEqual(defaults);
    expect(resourceDirectory).toHaveLength(JSON.parse(original).length);
    expect(JSON.stringify(resourceDirectory)).toBe(original);
  });
});

describe("Resources personalization rendering and actual event/effect lifecycle", () => {
  it("renders an accessible nonsticky sidebar above results, disabled export and Save TITLE controls", () => {
    const html = renderToStaticMarkup(createElement(Resources));
    expect(html).toContain('class="rd-sidebar"');
    expect(html.indexOf('<aside class="rd-sidebar"')).toBeLessThan(
      html.indexOf('id="directory-results-section"')
    );
    expect(html).toContain('aria-label="Export saved items"');
    expect(html).toMatch(/aria-label="Export saved items"[^>]*disabled=""/);
    expect(html).toContain("Save a resource card first to enable export");
    expect(html).toContain('aria-label="Clear recent searches"');
    expect(html).toContain('aria-label="Reset personal directory"');
    expect(html).toContain('aria-label="Save Microsoft for Startups"');
    expect(html).toContain(
      "grid-template-columns:minmax(180px,220px) minmax(0,1fr)"
    );
    expect(html).not.toContain("position:sticky");
  });

  it("restores query/category/AI on mount without overwriting storage with defaults", () => {
    const state = {
      ...defaultDirectoryPersonalization(),
      preferences: {
        query: "fundraising",
        category: "Investors" as const,
        aiOnly: false,
      },
      savedIds: ["lovable"],
    };
    const values = mockBrowser(
      new Map([[DIRECTORY_PERSONALIZATION_KEY, JSON.stringify(state)]])
    );
    const component = new ComponentHarness({ initialQuery: "" }).render();
    expect(window.localStorage.setItem as any).not.toHaveBeenCalled();
    component.flush();
    expect(component.input().props.value).toBe("fundraising");
    expect(readBrowserState(values)).toEqual(state);
    const writes = (window.localStorage.setItem as any).mock.calls;
    expect(
      writes.every(
        ([, raw]: any) => JSON.parse(raw).preferences.query === "fundraising"
      )
    ).toBe(true);
    expect(component.button("Export saved items").props.disabled).toBe(false);
  });

  it("nonempty initialQuery supersedes stale query on mount; empty prop changes never wipe it", () => {
    const values = mockBrowser(
      new Map([
        [
          DIRECTORY_PERSONALIZATION_KEY,
          persisted({
            preferences: { query: "stale", category: "All", aiOnly: false },
          }),
        ],
      ])
    );
    const component = mount({ initialQuery: "AI credits" });
    expect(component.input().props.value).toBe("AI credits");
    component.props = { initialQuery: "" };
    component.render().flush();
    expect(component.input().props.value).toBe("AI credits");
    component.props = { initialQuery: "AI investors" };
    component.render().flush();
    expect(component.input().props.value).toBe("AI investors");
    expect(readBrowserState(values).preferences.aiOnly).toBe(false);
    expect(readBrowserState(values).recentSearches).toEqual([]);
  });

  it("typing filters immediately but adds history only on explicit submit; preferences survive remount", () => {
    const values = mockBrowser();
    const component = mount();
    component.act(() =>
      component.input().props.onChange({ target: { value: "AI credits" } })
    );
    expect(component.cards().map(card => card.props.entry.id)).toContain(
      "microsoft-startups"
    );
    expect(readBrowserState(values).recentSearches).toEqual([]);
    const form = component.find(node => node.type === "form");
    component.act(() => form.props.onSubmit({ preventDefault: vi.fn() }));
    expect(readBrowserState(values).recentSearches).toEqual([
      { query: "AI credits", category: "All", aiOnly: true },
    ]);
    component.act(() =>
      component.input().props.onChange({ target: { value: "typed draft" } })
    );
    expect(readBrowserState(values).recentSearches).toHaveLength(1);
    expect(mount().input().props.value).toBe("typed draft");
  });

  it("suggestion and history clicks record once and restore query/category/AI together", () => {
    const values = mockBrowser();
    const component = mount();
    component.act(() =>
      component
        .find(
          node => node.type === "button" && text(node) === "Pitch deck guides"
        )
        .props.onClick()
    );
    expect(readBrowserState(values).recentSearches).toEqual([
      { query: "Pitch deck guides", category: "All", aiOnly: false },
    ]);
    component.act(() =>
      component
        .find(node => node.type === "button" && text(node) === "AI Credits")
        .props.onClick()
    );
    component.act(() =>
      component.input().props.onChange({ target: { value: "cloud" } })
    );
    component.act(() =>
      component
        .find(node => node.type === "form")
        .props.onSubmit({ preventDefault: vi.fn() })
    );
    component.act(() =>
      component.button("Restore search: Pitch deck guides").props.onClick()
    );
    expect(readBrowserState(values).preferences).toEqual({
      query: "Pitch deck guides",
      category: "All",
      aiOnly: false,
    });
    expect(readBrowserState(values).recentSearches).toHaveLength(2);
    expect(readBrowserState(values).recentSearches[0].query).toBe(
      "Pitch deck guides"
    );
  });

  it("individual sibling delete buttons distinguish identical queries with different filters and preserve personal data", () => {
    const searches = [
      { query: "AI", category: "All" as const, aiOnly: true },
      { query: "AI", category: "Investors" as const, aiOnly: true },
      { query: "AI", category: "All" as const, aiOnly: false },
    ];
    const state = {
      ...defaultDirectoryPersonalization(),
      preferences: {
        query: "active draft",
        category: "AI Credits" as const,
        aiOnly: false,
      },
      recentSearches: searches,
      savedIds: ["lovable"],
      clickedIds: ["replit"],
    };
    const values = mockBrowser(
      new Map([[DIRECTORY_PERSONALIZATION_KEY, JSON.stringify(state)]])
    );
    const component = mount();
    const pills = allNodes(component.tree).filter(
      node => node.props.className === "rd-history-item"
    );
    expect(pills).toHaveLength(3);
    for (const [index, pill] of pills.entries()) {
      const [restore, remove] = pill.props.children;
      expect(restore.type).toBe("button");
      expect(restore.props.className).toBe("rd-chip");
      expect(remove.type).toBe("button");
      expect(remove.props["aria-label"]).toBe("Delete search: AI");
      expect(remove.props["aria-describedby"]).toBe(
        `directory-history-${index}-filters`
      );
      expect(restore.props["aria-describedby"]).toBe(
        remove.props["aria-describedby"]
      );
      expect(
        allNodes(restore.props.children).some(node => node.type === "button")
      ).toBe(false);
      expect(
        allNodes(remove.props.children).some(node => node.type === "button")
      ).toBe(false);
    }
    expect(text(component.tree)).toContain("width:44px; min-height:44px");
    expect(text(component.tree)).toContain(".rd-history .rd-chip:hover");
    const focus = vi.fn();
    pills[2].props.children[0].props.ref({ focus });
    component.act(() => pills[1].props.children[1].props.onClick());
    expect(readBrowserState(values)).toEqual({
      ...state,
      recentSearches: [searches[0], searches[2]],
    });
    expect(component.input().props.value).toBe("active draft");
    expect(focus).toHaveBeenCalledOnce();
    // Persistence happens in the event, not only the subsequent effect.
    component.button("Delete search: AI").props.onClick();
    expect(readBrowserState(values).recentSearches).toEqual([searches[2]]);
  });

  it("focuses the previous pill after deleting the tail, then the search input after last deletion", () => {
    const searches = [
      { query: "AI credits", category: "All" as const, aiOnly: true },
      { query: "fundraising", category: "Investors" as const, aiOnly: false },
    ];
    const values = mockBrowser(
      new Map([
        [
          DIRECTORY_PERSONALIZATION_KEY,
          persisted({
            preferences: {
              query: "draft",
              category: "AI Credits",
              aiOnly: false,
            },
            recentSearches: searches,
            savedIds: ["lovable"],
            clickedIds: ["replit"],
          }),
        ],
      ])
    );
    const component = mount();
    const pillFocus = vi.fn();
    const inputFocus = vi.fn();
    component
      .button("Restore search: AI credits")
      .props.ref({ focus: pillFocus });
    component.input().props.ref.current = { focus: inputFocus };
    component.act(() =>
      component.button("Delete search: fundraising").props.onClick()
    );
    expect(pillFocus).toHaveBeenCalledOnce();
    expect(inputFocus).not.toHaveBeenCalled();
    component.act(() =>
      component.button("Delete search: AI credits").props.onClick()
    );
    expect(inputFocus).toHaveBeenCalledOnce();
    expect(readBrowserState(values)).toMatchObject({
      preferences: { query: "draft", category: "AI Credits", aiOnly: false },
      recentSearches: [],
      savedIds: ["lovable"],
      clickedIds: ["replit"],
    });
    expect(component.button("Clear recent searches").props.disabled).toBe(true);
    expect(
      allNodes(component.tree).some(
        node => node.props.className === "rd-history-item"
      )
    ).toBe(false);
  });

  it("ordinary restoration does not unexpectedly focus a pill or the search input", () => {
    mockBrowser(
      new Map([
        [
          DIRECTORY_PERSONALIZATION_KEY,
          persisted({
            recentSearches: [
              { query: "AI", category: "All", aiOnly: true },
              { query: "fundraising", category: "Investors", aiOnly: false },
            ],
          }),
        ],
      ])
    );
    const component = mount();
    const focus = vi.fn();
    component.input().props.ref.current = { focus };
    component.button("Restore search: fundraising").props.ref({ focus });
    component.act(() =>
      component.button("Restore search: fundraising").props.onClick()
    );
    expect(component.input().props.value).toBe("fundraising");
    expect(focus).not.toHaveBeenCalled();
  });

  it("card saves/clicks reorder nine cards, survive filters and write immediately before leaving a tab", () => {
    const values = mockBrowser();
    const component = mount();
    const card = component
      .cards()
      .find(card => card.props.entry.id === "replit")!;
    component.act(() => card.props.onToggleSaved("replit"));
    expect(component.cards()[0].props.entry.id).toBe("replit");
    expect(component.cards()[0].props.saved).toBe(true);
    const open = component
      .cards()
      .find(card => card.props.entry.id === "ai-fund")!;
    open.props.onOpen("ai-fund");
    // No effect flush or rerender before navigation: the click must already be stored.
    expect(readBrowserState(values).clickedIds).toEqual(["ai-fund"]);
    component.render().flush();
    expect(component.cards()[0].props.entry.id).toBe("ai-fund");
    component.act(() =>
      component
        .find(node => node.type === "button" && text(node) === "Investors")
        .props.onClick()
    );
    expect(
      component.cards().some(card => card.props.entry.id === "replit")
    ).toBe(false);
    expect(component.button("Unsave Replit")).toBeDefined();
    expect(readBrowserState(values).savedIds).toEqual(["replit"]);
    expect(component.button("Export saved items").props.disabled).toBe(false);
  });

  it("clear history preserves saved items, clicks and preferences; explicit reset restores original nine cards", () => {
    const values = mockBrowser(
      new Map([
        [
          DIRECTORY_PERSONALIZATION_KEY,
          persisted({
            preferences: { query: "AI", category: "All", aiOnly: false },
            recentSearches: [{ query: "AI", category: "All", aiOnly: false }],
            savedIds: ["replit"],
            clickedIds: ["github-copilot"],
          }),
        ],
      ])
    );
    const component = mount();
    component.act(() =>
      component.button("Clear recent searches").props.onClick()
    );
    expect(readBrowserState(values)).toMatchObject({
      recentSearches: [],
      savedIds: ["replit"],
      clickedIds: ["github-copilot"],
      preferences: { query: "AI", category: "All", aiOnly: false },
    });
    component.act(() =>
      component.button("Reset personal directory").props.onClick()
    );
    expect(readBrowserState(values)).toEqual(defaultDirectoryPersonalization());
    expect(component.cards()).toHaveLength(9);
    expect(component.cards().map(card => card.props.entry.id)).toEqual(
      ids(paginateDirectory(searchResourceDirectory()))
    );
    expect(component.button("Export saved items").props.disabled).toBe(true);
  });

  it("blocked iframe storage keeps interaction working and displays an honest session-only notice", () => {
    const browser = {};
    Object.defineProperty(browser, "localStorage", {
      get() {
        throw new Error("Storage denied");
      },
    });
    vi.stubGlobal("window", browser);
    const component = mount();
    expect(text(component.tree)).toContain("Changes are session-only");
    component.act(() =>
      component
        .cards()[0]
        .props.onToggleSaved(component.cards()[0].props.entry.id)
    );
    expect(component.button("Export saved items").props.disabled).toBe(false);
    component.act(() =>
      component.input().props.onChange({ target: { value: "AI credits" } })
    );
    expect(component.input().props.value).toBe("AI credits");
    expect(text(component.tree)).toContain("Changes are session-only");
  });

  it("one click exports saved metadata locally without any fetch and revokes the object URL", async () => {
    mockBrowser(
      new Map([
        [
          DIRECTORY_PERSONALIZATION_KEY,
          persisted({
            preferences: {
              query: "nothing-matches",
              category: "Investors",
              aiOnly: true,
            },
            savedIds: ["y-combinator", "lovable"],
          }),
        ],
      ])
    );
    let blob: Blob | undefined;
    const createUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation(value => {
        blob = value as Blob;
        return "blob:local-export";
      });
    const revokeUrl = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const link = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    const append = vi.fn();
    vi.stubGlobal("document", {
      createElement: vi.fn(() => link),
      body: { appendChild: append },
    });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const component = mount();
    expect(component.cards()).toHaveLength(0);
    let exporting!: Promise<void>;
    component.act(() => {
      exporting = component.button("Export saved items").props.onClick();
    });
    expect(component.button("Export saved items").props.disabled).toBe(true);
    expect(component.button("Export saved items").props["aria-busy"]).toBe(
      true
    );
    expect(createUrl).not.toHaveBeenCalled();
    await exporting;
    component.render().flush();
    expect(createUrl).toHaveBeenCalledOnce();
    expect(link.click).toHaveBeenCalledOnce();
    expect(link.remove).toHaveBeenCalledOnce();
    expect(link.download).toBe("platformula-one-saved-directory-v1.json");
    expect(blob?.type).toBe("application/json");
    const data = JSON.parse(await blob!.text());
    expect(data.formatVersion).toBe(1);
    expect(ids(data.items)).toEqual(["y-combinator", "lovable"]);
    expect(data.items[0].url).toBe("https://www.ycombinator.com");
    expect(data).not.toHaveProperty("recentSearches");
    expect(fetch).not.toHaveBeenCalled();
    expect(revokeUrl).toHaveBeenCalledWith("blob:local-export");
    expect(text(component.tree)).toContain(
      "Prepared 2 saved items. Download requested."
    );
    expect(feedback.success).toHaveBeenCalledOnce();
    expect(feedback.success).toHaveBeenCalledWith(
      "Prepared 2 saved items. Download requested."
    );
    expect(feedback.error).not.toHaveBeenCalled();
    expect(component.button("Export saved items").props.disabled).toBe(false);
    expect(component.button("Export saved items").props["aria-busy"]).toBe(
      false
    );
    expect(
      component.button("Export saved items").props["aria-describedby"]
    ).toBe("directory-export-feedback");
  });

  it("empty export is disabled and a failed browser download has an actionable notice and error toast", async () => {
    mockBrowser();
    const component = mount();
    expect(component.button("Export saved items").props.disabled).toBe(true);
    const createUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation(() => {
        throw new Error("Blocked download");
      });
    await component.button("Export saved items").props.onClick();
    expect(createUrl).not.toHaveBeenCalled();
    expect(feedback.success).not.toHaveBeenCalled();
    expect(feedback.error).not.toHaveBeenCalled();
    component.act(() =>
      component
        .cards()[0]
        .props.onToggleSaved(component.cards()[0].props.entry.id)
    );
    let exporting!: Promise<void>;
    component.act(() => {
      exporting = component.button("Export saved items").props.onClick();
    });
    await exporting;
    component.render().flush();
    expect(text(component.tree)).toContain(
      "Try opening the site directly and exporting again"
    );
    expect(feedback.error).toHaveBeenCalledOnce();
    expect(feedback.error).toHaveBeenCalledWith(
      "Download unavailable in this browser or embedded frame. Try opening the site directly and exporting again."
    );
    expect(feedback.success).not.toHaveBeenCalled();
    expect(component.button("Export saved items").props.disabled).toBe(false);
    expect(component.button("Export saved items").props["aria-busy"]).toBe(
      false
    );
    expect(
      component.button("Export saved items").props["aria-describedby"]
    ).toBe("directory-export-feedback");
  });

  it("paints loading across a frame, locks rapid duplicate clicks and snapshots saves while filters and saves change", async () => {
    const values = mockBrowser(
      new Map([
        [DIRECTORY_PERSONALIZATION_KEY, persisted({ savedIds: ["lovable"] })],
      ])
    );
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      frames.push(callback);
      return frames.length;
    });
    let blob: Blob | undefined;
    const createUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockImplementation(value => {
        blob = value as Blob;
        return "blob:snapshot";
      });
    const revokeUrl = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const link = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    vi.stubGlobal("document", {
      createElement: vi.fn(() => link),
      body: { appendChild: vi.fn() },
    });
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const component = mount();
    const click = component.button("Export saved items").props.onClick;
    let exporting!: Promise<void>;
    let duplicate!: Promise<void>;
    component.act(() => {
      exporting = click();
      // Same handler before a rerender: the ref, not state, must guard this call.
      duplicate = click();
    });
    await duplicate;
    const button = component.button("Export saved items");
    expect(button.props.disabled).toBe(true);
    expect(button.props["aria-busy"]).toBe(true);
    expect(text(button)).toBe("Preparing export…");
    expect(
      allNodes(button).some(
        node =>
          node.props.className === "motion-safe:animate-spin" &&
          node.props["aria-hidden"] === "true"
      )
    ).toBe(true);
    expect(frames).toHaveLength(1);
    expect(createUrl).not.toHaveBeenCalled();
    frames.shift()!(0);
    await Promise.resolve();
    expect(frames).toHaveLength(1);
    expect(createUrl).not.toHaveBeenCalled();
    expect(component.button("Export saved items").props.disabled).toBe(true);
    component.act(() =>
      component
        .button(
          `Unsave ${resourceDirectory.find(entry => entry.id === "lovable")!.title}`
        )
        .props.onClick()
    );
    component.act(() =>
      component
        .cards()
        .find(card => card.props.entry.id === "replit")!
        .props.onToggleSaved("replit")
    );
    component.act(() =>
      component.input().props.onChange({ target: { value: "nothing-matches" } })
    );
    expect(readBrowserState(values).savedIds).toEqual(["replit"]);
    await component.button("Export saved items").props.onClick();
    expect(frames).toHaveLength(1);
    frames.shift()!(16);
    await exporting;
    component.render().flush();
    const data = JSON.parse(await blob!.text());
    expect(ids(data.items)).toEqual(["lovable"]);
    expect(data).not.toHaveProperty("preferences");
    expect(createUrl).toHaveBeenCalledOnce();
    expect(link.click).toHaveBeenCalledOnce();
    expect(link.remove).toHaveBeenCalledOnce();
    expect(revokeUrl).toHaveBeenCalledOnce();
    expect(revokeUrl).toHaveBeenCalledWith("blob:snapshot");
    expect(fetch).not.toHaveBeenCalled();
    expect(feedback.success).toHaveBeenCalledOnce();
    expect(feedback.success).toHaveBeenCalledWith(
      "Prepared 1 saved item. Download requested."
    );
    expect(feedback.error).not.toHaveBeenCalled();
    expect(component.button("Export saved items").props.disabled).toBe(false);
    expect(component.button("Export saved items").props["aria-busy"]).toBe(
      false
    );
  });

  it.each(["append", "click"])(
    "cleans up anchor and URL when %s fails, releases the lock and permits a retry",
    async failure => {
      mockBrowser(
        new Map([
          [DIRECTORY_PERSONALIZATION_KEY, persisted({ savedIds: ["lovable"] })],
        ])
      );
      const createUrl = vi
        .spyOn(URL, "createObjectURL")
        .mockReturnValue("blob:retry");
      const revokeUrl = vi
        .spyOn(URL, "revokeObjectURL")
        .mockImplementation(() => {});
      const click = vi.fn();
      const append = vi.fn();
      (failure === "append" ? append : click).mockImplementationOnce(() => {
        throw new Error("Download blocked");
      });
      const link = { href: "", download: "", click, remove: vi.fn() };
      vi.stubGlobal("document", {
        createElement: vi.fn(() => link),
        body: { appendChild: append },
      });
      const component = mount();
      await component.button("Export saved items").props.onClick();
      component.render().flush();
      expect(link.remove).toHaveBeenCalledOnce();
      expect(revokeUrl).toHaveBeenCalledOnce();
      expect(revokeUrl).toHaveBeenCalledWith("blob:retry");
      expect(feedback.error).toHaveBeenCalledOnce();
      expect(feedback.success).not.toHaveBeenCalled();
      expect(component.button("Export saved items").props.disabled).toBe(false);
      expect(text(component.tree)).toContain(
        "Try opening the site directly and exporting again"
      );
      await component.button("Export saved items").props.onClick();
      component.render().flush();
      expect(createUrl).toHaveBeenCalledTimes(2);
      expect(link.remove).toHaveBeenCalledTimes(2);
      expect(revokeUrl).toHaveBeenCalledTimes(2);
      expect(feedback.success).toHaveBeenCalledOnce();
      expect(feedback.success).toHaveBeenCalledWith(
        "Prepared 1 saved item. Download requested."
      );
      expect(component.button("Export saved items").props["aria-busy"]).toBe(
        false
      );
    }
  );
});
