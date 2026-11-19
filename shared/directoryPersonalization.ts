import {
  DIRECTORY_FILTERS,
  isSafeDirectoryUrl,
  resourceDirectory,
  type DirectoryEntry,
  type DirectoryFilter,
} from "./resourceDirectory";

/** Browser-only data. No API, analytics, account sync or remote storage. */
export const DIRECTORY_PERSONALIZATION_KEY =
  "platformula-one.directory-personalization.v1";
export const DIRECTORY_PERSONALIZATION_VERSION = 1 as const;
export const DIRECTORY_HISTORY_LIMIT = 10;
export const DIRECTORY_QUERY_LIMIT = 256;

export interface DirectoryPreferences {
  query: string;
  category: DirectoryFilter;
  aiOnly: boolean;
}

export interface DirectoryPersonalization {
  formatVersion: typeof DIRECTORY_PERSONALIZATION_VERSION;
  preferences: DirectoryPreferences;
  /** Most recently explicitly submitted/restored search first. */
  recentSearches: DirectoryPreferences[];
  /** Most recently opened/saved catalog ID first. */
  clickedIds: string[];
  savedIds: string[];
}

export interface DirectoryStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => boolean;
}

export interface SavedDirectoryExport {
  format: "platformula-one/saved-directory";
  formatVersion: typeof DIRECTORY_PERSONALIZATION_VERSION;
  exportedAt: string;
  items: DirectoryEntry[];
}

export function defaultDirectoryPersonalization(
  initialQuery = ""
): DirectoryPersonalization {
  return {
    formatVersion: DIRECTORY_PERSONALIZATION_VERSION,
    preferences: {
      query: initialQuery.slice(0, DIRECTORY_QUERY_LIMIT),
      category: "All",
      aiOnly: true,
    },
    recentSearches: [],
    clickedIds: [],
    savedIds: [],
  };
}

const forbiddenKeys = new Set(["__proto__", "prototype", "constructor"]);
function plainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return (
    (prototype === Object.prototype || prototype === null) &&
    !Object.keys(value).some(key => forbiddenKeys.has(key))
  );
}

function readPreferences(value: unknown): DirectoryPreferences | null {
  if (
    !plainRecord(value) ||
    typeof value.query !== "string" ||
    typeof value.aiOnly !== "boolean" ||
    !DIRECTORY_FILTERS.includes(value.category as DirectoryFilter)
  )
    return null;
  return {
    query: value.query.slice(0, DIRECTORY_QUERY_LIMIT),
    category: value.category as DirectoryFilter,
    aiOnly: value.aiOnly,
  };
}

function cleanIds(
  value: unknown,
  catalog: readonly DirectoryEntry[]
): string[] {
  if (!Array.isArray(value)) return [];
  const known = new Set(catalog.map(entry => entry.id));
  const ids = new Set<string>();
  for (const id of value) {
    if (typeof id === "string" && !forbiddenKeys.has(id) && known.has(id))
      ids.add(id);
    if (ids.size >= known.size) break;
  }
  return Array.from(ids);
}

function searchKey(preferences: DirectoryPreferences): string {
  return JSON.stringify([
    preferences.query.trim().toLowerCase(),
    preferences.category,
    preferences.aiOnly,
  ]);
}

function cleanHistory(value: unknown): DirectoryPreferences[] {
  if (!Array.isArray(value)) return [];
  const history: DirectoryPreferences[] = [];
  const seen = new Set<string>();
  for (const candidate of value) {
    const preferences = readPreferences(candidate);
    if (!preferences || !preferences.query.trim()) continue;
    preferences.query = preferences.query.trim();
    const key = searchKey(preferences);
    if (seen.has(key)) continue;
    seen.add(key);
    history.push(preferences);
    if (history.length === DIRECTORY_HISTORY_LIMIT) break;
  }
  return history;
}

/** Pick known fields only; never merge untrusted parsed objects into application state. */
export function parseDirectoryPersonalization(
  raw: string | null,
  catalog: readonly DirectoryEntry[] = resourceDirectory
): DirectoryPersonalization {
  const defaults = defaultDirectoryPersonalization();
  if (!raw || raw.length > 200_000) return defaults;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !plainRecord(value) ||
      value.formatVersion !== DIRECTORY_PERSONALIZATION_VERSION
    )
      return defaults;
    return {
      formatVersion: DIRECTORY_PERSONALIZATION_VERSION,
      preferences: readPreferences(value.preferences) ?? defaults.preferences,
      recentSearches: cleanHistory(value.recentSearches),
      clickedIds: cleanIds(value.clickedIds, catalog),
      savedIds: cleanIds(value.savedIds, catalog),
    };
  } catch {
    return defaults;
  }
}

/** Empty homepage input is not a reset. A supplied request overrides only the stale query. */
export function applyInitialDirectoryQuery(
  state: DirectoryPersonalization,
  initialQuery: string
): DirectoryPersonalization {
  if (!initialQuery.trim()) return state;
  return {
    ...state,
    preferences: {
      ...state.preferences,
      query: initialQuery.slice(0, DIRECTORY_QUERY_LIMIT),
    },
  };
}

export function loadDirectoryPersonalization(
  storage: DirectoryStorage,
  initialQuery = ""
): DirectoryPersonalization {
  return applyInitialDirectoryQuery(
    parseDirectoryPersonalization(storage.get(DIRECTORY_PERSONALIZATION_KEY)),
    initialQuery
  );
}

/** null = not loaded, false = unavailable, true = persisted. Never overwrite before load. */
export function persistDirectoryPersonalization(
  storage: DirectoryStorage,
  state: DirectoryPersonalization,
  loaded: boolean
): boolean | null {
  if (!loaded) return null;
  return storage.set(DIRECTORY_PERSONALIZATION_KEY, JSON.stringify(state));
}

/** Invoke only on submit, a suggestion click, or a history-pill restore, never on typing. */
export function recordDirectorySearch(
  state: DirectoryPersonalization,
  preferences: DirectoryPreferences = state.preferences
): DirectoryPersonalization {
  const valid = readPreferences(preferences);
  if (!valid || !valid.query.trim()) return state;
  valid.query = valid.query.trim();
  return {
    ...state,
    recentSearches: cleanHistory([valid, ...state.recentSearches]),
  };
}

/** Remove only the exact stored query/category/AI snapshot; never restore or record it. */
export function removeDirectorySearch(
  state: DirectoryPersonalization,
  search: DirectoryPreferences
): DirectoryPersonalization {
  const recentSearches = state.recentSearches.filter(
    candidate =>
      candidate.query !== search.query ||
      candidate.category !== search.category ||
      candidate.aiOnly !== search.aiOnly
  );
  return recentSearches.length === state.recentSearches.length
    ? state
    : { ...state, recentSearches };
}

export function recordDirectoryClick(
  state: DirectoryPersonalization,
  id: string,
  catalog: readonly DirectoryEntry[] = resourceDirectory
): DirectoryPersonalization {
  if (!cleanIds([id], catalog).length) return state;
  return { ...state, clickedIds: cleanIds([id, ...state.clickedIds], catalog) };
}

export function toggleDirectorySaved(
  state: DirectoryPersonalization,
  id: string,
  catalog: readonly DirectoryEntry[] = resourceDirectory
): DirectoryPersonalization {
  if (!cleanIds([id], catalog).length) return state;
  return {
    ...state,
    savedIds: state.savedIds.includes(id)
      ? state.savedIds.filter(saved => saved !== id)
      : cleanIds([id, ...state.savedIds], catalog),
  };
}

/** Apply AFTER local filters: clicked, then saved, then unchanged defaults. No query ranking changes. */
export function personalizeDirectoryResults(
  results: readonly DirectoryEntry[],
  state: DirectoryPersonalization,
  query = state.preferences.query
): DirectoryEntry[] {
  if (query.trim()) return [...results];
  const byId = new Map(results.map(entry => [entry.id, entry]));
  const ordered: DirectoryEntry[] = [];
  for (const id of [
    ...state.clickedIds,
    ...state.savedIds,
    ...Array.from(byId.keys()),
  ]) {
    const entry = byId.get(id);
    if (!entry) continue;
    ordered.push(entry);
    byId.delete(id);
  }
  return ordered;
}

/** Always resolve IDs against the full canonical catalog, not the visible/filtered cards. */
export function savedDirectoryEntries(
  state: DirectoryPersonalization,
  catalog: readonly DirectoryEntry[] = resourceDirectory
): DirectoryEntry[] {
  const byId = new Map(catalog.map(entry => [entry.id, entry]));
  return cleanIds(state.savedIds, catalog)
    .map(id => byId.get(id)!)
    .filter(entry => isSafeDirectoryUrl(entry.url));
}

/** Fresh metadata + actual URLs; deliberately excludes query/history/click/preferences data. */
export function createSavedDirectoryExport(
  state: DirectoryPersonalization,
  catalog: readonly DirectoryEntry[] = resourceDirectory,
  exportedAt = new Date().toISOString()
): SavedDirectoryExport {
  return {
    format: "platformula-one/saved-directory",
    formatVersion: DIRECTORY_PERSONALIZATION_VERSION,
    exportedAt,
    items: savedDirectoryEntries(state, catalog).map(entry => ({
      ...entry,
      tags: [...entry.tags],
    })),
  };
}
