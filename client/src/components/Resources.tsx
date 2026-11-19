import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Download,
  ExternalLink,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DIRECTORY_FILTERS,
  DIRECTORY_PAGE_SIZE,
  directorySearchTerms,
  directorySources,
  directorySourceUrl,
  isAiDirectoryEntry,
  paginateDirectory,
  resourceDirectory,
  searchResourceDirectory,
  type DirectoryEntry,
} from "@shared/resourceDirectory";
import { STARTUP_READS_SOURCE } from "@shared/startupReads";
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/safeStorage";
import {
  applyInitialDirectoryQuery,
  createSavedDirectoryExport,
  defaultDirectoryPersonalization,
  loadDirectoryPersonalization,
  personalizeDirectoryResults,
  persistDirectoryPersonalization,
  recordDirectoryClick,
  recordDirectorySearch,
  removeDirectorySearch,
  savedDirectoryEntries,
  toggleDirectorySaved,
  type DirectoryPersonalization,
  type DirectoryPreferences,
} from "@shared/directoryPersonalization";

export interface ResourcesProps {
  onNavigate?: (tab: string) => void;
  initialQuery?: string;
}

const suggestions = [
  "AI credits",
  "Build an AI app",
  "AI investors",
  "Pitch deck guides",
];

const directoryStorage = { get: getLocalStorageItem, set: setLocalStorageItem };

function historyIdentity(search: DirectoryPreferences) {
  return JSON.stringify([search.query, search.category, search.aiOnly]);
}

// Scoped light surfaces remain readable inside the existing dark dashboard shell.
const directoryStyles = `
.resource-directory { color:#211b35; color-scheme:light; font-family:inherit; background:#fdfbff; padding:16px; border:1px solid #eee7f6; border-radius:24px; }
.resource-directory * { box-sizing:border-box; }
.resource-directory button, .resource-directory input { font:inherit; }
.resource-directory button, .resource-directory a, .resource-directory summary { -webkit-tap-highlight-color:transparent; }
.resource-directory a { text-decoration:none; }
.resource-directory :is(a,button,input,summary):focus-visible { outline:3px solid #a78bfa; outline-offset:4px; }
.resource-directory .rd-hero { position:relative; overflow:hidden; border:1px solid #e2daf6; border-radius:24px; padding:28px; background:radial-gradient(ellipse at 95% 0%,#dac7ff 0%,transparent 48%),linear-gradient(120deg,#faf8ff,#f2ebff); }
.resource-directory .rd-eyebrow { display:flex; align-items:center; gap:8px; color:#6d28d9; font-size:12px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; }
.resource-directory .rd-title { max-width:770px; margin:20px 0 14px; color:#241b3b; font-size:clamp(30px,4.5vw,52px); line-height:1.12; letter-spacing:-.045em; font-weight:750; }
.resource-directory .rd-intro { max-width:670px; margin:0; color:#5d536d; font-size:16px; line-height:1.65; }
.resource-directory .rd-search-label { display:block; margin:26px 0 9px; font-size:13px; font-weight:650; color:#443458; }
.resource-directory .rd-search { display:flex; flex-wrap:wrap; gap:10px; max-width:820px; }
.resource-directory .rd-input-wrap { position:relative; flex:1; min-width:190px; }
.resource-directory .rd-input-icon { position:absolute; top:16px; left:16px; color:#8b6ca7; pointer-events:none; }
.resource-directory .rd-input { height:54px; width:100%; padding:12px 15px 12px 45px; border:1px solid #d8cbe9; border-radius:12px; color:#211b35; background:#fff; }
.resource-directory .rd-input::placeholder { color:#83738f; opacity:1; }
.resource-directory .rd-primary { display:inline-flex; min-height:46px; align-items:center; justify-content:center; gap:8px; padding:12px 22px; border:1px solid #6d28d9; border-radius:12px; color:#fff; background:#6d28d9; font-weight:650; cursor:pointer; }
.resource-directory .rd-primary:hover { background:#5b21b6; }
.resource-directory .rd-suggestions { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:14px; }
.resource-directory .rd-suggestions span { color:#74617e; font-size:12px; }
.resource-directory .rd-chip { min-height:36px; border:1px solid #dacdeb; border-radius:999px; background:#ffffffaa; padding:7px 12px; color:#62437e; font-size:12px; cursor:pointer; }
.resource-directory .rd-chip:hover { background:#fff; border-color:#b89dd8; }
.resource-directory .rd-explainer { margin:14px 0 0; font-size:12px; line-height:1.6; color:#74617e; }
.resource-directory .rd-sources { margin:30px 0; }
.resource-directory .rd-section-heading { margin:0; color:#30223f; font-size:22px; font-weight:700; letter-spacing:-.025em; }
.resource-directory .rd-section-caption { margin:7px 0 18px; font-size:13px; line-height:1.6; color:#766884; }
.resource-directory .rd-source-grid { display:grid; grid-template-columns:1fr; gap:12px; }
.resource-directory .rd-source { display:flex; flex-direction:column; gap:10px; border:1px solid #e9e0f4; border-radius:16px; padding:18px; background:#fbf9fe; }
.resource-directory .rd-source-title { display:flex; align-items:center; justify-content:space-between; gap:8px; color:#4e286e; font-weight:700; }
.resource-directory .rd-source-description { flex:1; margin:0; color:#746482; font-size:12px; line-height:1.65; }
.resource-directory .rd-source-status { margin:0; color:#756783; font-size:10px; line-height:1.5; }
.resource-directory .rd-source-link { display:inline-flex; min-height:36px; align-items:center; gap:6px; color:#6d28d9; font-size:12px; font-weight:650; }
.resource-directory .rd-controls { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; margin-bottom:22px; }
.resource-directory .rd-filters { display:flex; flex-wrap:wrap; gap:6px; }
.resource-directory .rd-filter { min-height:42px; padding:9px 13px; border:1px solid #e5dcef; border-radius:10px; background:#fff; color:#685474; font-size:12px; cursor:pointer; }
.resource-directory .rd-filter[aria-pressed=true] { border-color:#6d28d9; background:#6d28d9; color:#fff; font-weight:650; }
.resource-directory .rd-filter:hover:not([aria-pressed=true]) { background:#f4eefb; }
.resource-directory .rd-toggle { display:inline-flex; min-height:42px; align-items:center; gap:9px; color:#654878; font-size:13px; white-space:nowrap; cursor:pointer; }
.resource-directory .rd-toggle input { width:18px; height:18px; accent-color:#7c3aed; }
.resource-directory .rd-results-header { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:baseline; gap:10px; margin-bottom:16px; }
.resource-directory .rd-status { margin:0; font-size:12px; color:#796988; }
.resource-directory .rd-matched { margin:0 0 18px; font-size:12px; color:#796988; }
.resource-directory .rd-grid { display:grid; grid-template-columns:1fr; gap:18px; }
.resource-directory .rd-card { display:flex; flex-direction:column; border:1px solid #e7dff0; border-radius:18px; padding:22px; background:#fff; box-shadow:0 4px 14px #38245905; }
.resource-directory .rd-card-top { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:20px; }
.resource-directory .rd-icon { display:flex; align-items:center; justify-content:center; width:42px; height:42px; border:1px solid #eee6f8; border-radius:12px; background:#f8f4fe; color:#8050a8; font-weight:750; }
.resource-directory .rd-icon img { max-width:28px; max-height:28px; object-fit:contain; }
.resource-directory .rd-badges { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:5px; }
.resource-directory .rd-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 7px; border-radius:6px; background:#f3ecfc; color:#8050a8; font-size:10px; font-weight:650; }
.resource-directory .rd-featured { background:#fdf5e8; color:#946b24; }
.resource-directory .rd-card-title { margin:0 0 10px; font-size:18px; line-height:1.4; letter-spacing:-.02em; font-weight:700; }
.resource-directory .rd-card-title a { color:#2f2340; }
.resource-directory .rd-card-title a:hover { color:#6d28d9; }
.resource-directory .rd-description { margin:0 0 18px; color:#796b86; font-size:13px; line-height:1.75; }
.resource-directory .rd-details { margin-top:auto; border-top:1px solid #efe8f6; padding-top:12px; color:#746282; font-size:12px; }
.resource-directory .rd-details summary { padding:5px 0; color:#6c4b86; font-weight:600; cursor:pointer; }
.resource-directory .rd-detail-content { display:flex; flex-direction:column; gap:12px; padding-top:14px; line-height:1.6; }
.resource-directory .rd-detail-content p { margin:0; }
.resource-directory .rd-tags { display:flex; flex-wrap:wrap; gap:5px; }
.resource-directory .rd-tag { padding:3px 7px; border-radius:5px; background:#f6f2fa; color:#7e6b8c; font-size:10px; }
.resource-directory .rd-guide-action { padding:12px; border-radius:10px; background:#f6f1fc; color:#63427e; }
.resource-directory .rd-guide-action strong { display:block; margin-bottom:5px; }
.resource-directory .rd-open { display:flex; min-height:44px; align-items:center; justify-content:space-between; gap:8px; margin-top:16px; padding:10px 12px; border:1px solid #e4d5f6; border-radius:9px; background:#f7f2fd; color:#6d28d9; font-size:12px; font-weight:650; }
.resource-directory .rd-open:hover { border-color:#b49bda; background:#efe5fd; }
.resource-directory .rd-secondary { display:inline-flex; min-height:42px; align-items:center; justify-content:center; gap:8px; padding:10px 16px; border:1px solid #d7c5ed; border-radius:10px; background:#fff; color:#6d28d9; font-size:13px; font-weight:600; cursor:pointer; }
.resource-directory .rd-secondary:hover { background:#f6f1fc; }
.resource-directory button:disabled { opacity:.55; cursor:not-allowed; }
.resource-directory .rd-layout { display:grid; grid-template-columns:minmax(0,1fr); gap:24px; align-items:start; }
.resource-directory .rd-sidebar { min-width:0; padding:18px; border:1px solid #e7dff0; border-radius:18px; background:#faf7ff; }
.resource-directory .rd-sidebar h2 { margin:0 0 10px; font-size:17px; color:#443158; }
.resource-directory .rd-sidebar h3 { margin:22px 0 10px; font-size:14px; color:#443158; }
.resource-directory .rd-sidebar p { color:#796988; font-size:12px; line-height:1.65; }
.resource-directory .rd-history { display:flex; flex-wrap:wrap; gap:8px; margin:12px 0; }
.resource-directory .rd-history .rd-chip { max-width:100%; min-height:44px; text-align:left; overflow-wrap:anywhere; transform:none; transition:none; box-shadow:0 2px 6px #6d28d900; }
.resource-directory .rd-history-item { display:flex; align-items:center; gap:2px; max-width:100%; }
.resource-directory .rd-history-item .rd-chip { min-width:0; }
.resource-directory .rd-history-delete { display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; width:44px; min-height:44px; border:1px solid #dacdeb; border-radius:999px; background:#ffffffaa; color:#62437e; cursor:pointer; }
.resource-directory .rd-history-delete:hover { background:#fff; border-color:#b89dd8; }
.resource-directory .rd-history small { display:block; margin-top:3px; font-size:10px; }
.resource-directory .rd-sidebar-actions { display:flex; flex-wrap:wrap; gap:8px; }
.resource-directory .rd-saved-list { list-style:none; display:grid; gap:10px; margin:12px 0; padding:0; max-height:320px; overflow:auto; }
.resource-directory .rd-saved-list li { display:flex; align-items:center; gap:8px; font-size:12px; }
.resource-directory .rd-saved-list a { flex:1; min-width:0; color:#6d28d9; overflow-wrap:anywhere; }
.resource-directory .rd-save { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:40px; padding:8px 10px; margin:12px 0 0; border:1px solid #e4d5f6; border-radius:9px; background:#fff; color:#6d28d9; cursor:pointer; font-size:12px; font-weight:600; }
.resource-directory .rd-save[aria-pressed=true] { background:#ede3fc; border-color:#b89dd8; }
.resource-directory .rd-saved-list .rd-save { flex-shrink:0; margin:0; }
.resource-directory .rd-results { min-width:0; }
.resource-directory .rd-more { display:flex; flex-direction:column; align-items:center; gap:12px; margin:28px 0 0; }
.resource-directory .rd-empty { border:1px dashed #d9c9ed; border-radius:18px; background:#faf7ff; padding:30px; }
.resource-directory .rd-empty h3 { margin:0 0 10px; color:#443158; font-size:20px; }
.resource-directory .rd-empty p { max-width:650px; color:#7c6b88; font-size:14px; line-height:1.75; }
.resource-directory .rd-empty-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; }
.resource-directory .rd-footer { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:18px; margin-top:34px; padding:22px; border:1px solid #e9e0f4; border-radius:16px; background:#faf7ff; }
.resource-directory .rd-footer p { margin:0; color:#7b6987; font-size:12px; line-height:1.65; }
.resource-directory .rd-footer-link { display:inline-flex; min-height:44px; align-items:center; gap:8px; color:#6d28d9; font-size:13px; font-weight:650; }
@media(min-width:640px) { .resource-directory { padding:24px; } .resource-directory .rd-hero { padding:40px; } .resource-directory .rd-source-grid, .resource-directory .rd-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(min-width:1100px) { .resource-directory .rd-source-grid { grid-template-columns:repeat(4,minmax(0,1fr)); } .resource-directory .rd-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } .resource-directory .rd-layout { grid-template-columns:minmax(180px,220px) minmax(0,1fr); } }
@media(prefers-reduced-motion:no-preference) { .resource-directory button { transition:transform 160ms ease-out; } .resource-directory button:active { transform:scale(.98); } }
@media(hover:hover) and (pointer:fine) { .resource-directory .rd-history .rd-chip:hover { background:#f0e7ff; border-color:#a78bfa; color:#5b21b6; box-shadow:0 4px 12px #6d28d91a; } }
@media(prefers-reduced-motion:no-preference) { .resource-directory .rd-history .rd-chip { transition:transform 180ms cubic-bezier(.23,1,.32,1),background-color 180ms cubic-bezier(.23,1,.32,1),border-color 180ms cubic-bezier(.23,1,.32,1),color 180ms cubic-bezier(.23,1,.32,1),box-shadow 180ms cubic-bezier(.23,1,.32,1); } .resource-directory .rd-history .rd-chip:active { transform:translateY(0) scale(.98); } }
@media(prefers-reduced-motion:no-preference) and (hover:hover) and (pointer:fine) { .resource-directory .rd-history .rd-chip:hover:not(:active):not(:focus-visible) { transform:translateY(-2px); } }
@media(prefers-reduced-motion:reduce) { .resource-directory .rd-history .rd-chip { transition:none; } .resource-directory .rd-history .rd-chip:is(:hover,:active) { transform:none; } }
.resource-directory .rd-history .rd-chip:focus-visible { background:#f0e7ff; border-color:#a78bfa; color:#5b21b6; transform:none; transition:none; }
`;

function DirectoryCard({
  entry,
  onNavigate,
  saved,
  onToggleSaved,
  onOpen,
}: {
  entry: DirectoryEntry;
  onNavigate?: ResourcesProps["onNavigate"];
  saved: boolean;
  onToggleSaved: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const ai = isAiDirectoryEntry(entry);
  return (
    <article
      className="rd-card"
      data-directory-entry={entry.id}
      aria-labelledby={`directory-${entry.id}`}
    >
      <div className="rd-card-top">
        <div className="rd-icon" aria-hidden="true">
          {entry.logo ? (
            <img
              src={entry.logo}
              alt=""
              loading="lazy"
              onError={event => {
                event.currentTarget.hidden = true;
              }}
            />
          ) : entry.kind === "guide" ? (
            <BookOpen size={20} />
          ) : (
            entry.title.charAt(0)
          )}
        </div>
        <div className="rd-badges">
          {entry.featured && (
            <span className="rd-badge rd-featured">Featured</span>
          )}
          {ai && (
            <span className="rd-badge">
              <Sparkles size={10} aria-hidden="true" /> AI focus
            </span>
          )}
          <span className="rd-badge">
            {entry.kind === "guide" ? "Guide" : "Resource"}
          </span>
          {entry.relationshipStatus && <span className="rd-badge" data-relationship-status={entry.relationshipStatus}>{entry.relationshipStatus}</span>}
        </div>
      </div>
      <h3 id={`directory-${entry.id}`} className="rd-card-title">
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onOpen(entry.id)}
        >
          {entry.title}
        </a>
      </h3>
      <p className="rd-description">{entry.description}</p>
      <details className="rd-details">
        <summary>Details &amp; next steps</summary>
        <div className="rd-detail-content">
          <p>
            <strong>Category:</strong> {entry.category}
          </p>
          <div className="rd-tags" aria-label="Resource tags">
            {entry.tags.map(tag => (
              <span className="rd-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          {entry.action && (
            <div className="rd-guide-action">
              <strong>Your next move</strong>
              {entry.action}
            </div>
          )}
          <p>
            {entry.caution ??
              "Check current availability, eligibility and commercial terms directly with the provider. Listing is not an endorsement or a guaranteed benefit."}
          </p>
          <p>
            Source: {entry.source}
            {entry.reviewedAt
              ? ` · Guide reviewed ${entry.reviewedAt}`
              : " · Existing local catalog"}
          </p>
          {entry.kind === "guide" && entry.workspace && onNavigate && (
            <button
              type="button"
              className="rd-secondary"
              onClick={() => {
                onOpen(entry.id);
                onNavigate(entry.workspace!);
              }}
            >
              Put this guide to work <ArrowRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </details>
      <a
        className="rd-open"
        href={entry.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onOpen(entry.id)}
        aria-label={`${entry.kind === "guide" ? "Read guide" : "Open resource"}: ${entry.title}`}
      >
        {entry.kind === "guide" ? "Read guide" : "Open resource"}
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <button
        type="button"
        className="rd-save"
        aria-label={`${saved ? "Unsave" : "Save"} ${entry.title}`}
        aria-pressed={saved}
        onClick={() => onToggleSaved(entry.id)}
      >
        <Bookmark
          size={15}
          aria-hidden="true"
          fill={saved ? "currentColor" : "none"}
        />
        {saved ? "Saved" : "Save resource"}
      </button>
    </article>
  );
}

export default function Resources({
  onNavigate,
  initialQuery = "",
}: ResourcesProps) {
  const [personal, setPersonal] = useState(() =>
    defaultDirectoryPersonalization(initialQuery)
  );
  const [loaded, setLoaded] = useState(false);
  const [sessionOnly, setSessionOnly] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const previousInitialQuery = useRef(initialQuery);
  const searchInput = useRef<HTMLInputElement>(null);
  const historyButtons = useRef(new Map<string, HTMLButtonElement>());
  const pendingHistoryFocus = useRef<string | null>(null);
  const exportInProgress = useRef(false);
  const { query, category, aiOnly } = personal.preferences;

  useEffect(() => {
    setPersonal(loadDirectoryPersonalization(directoryStorage, initialQuery));
    setLoaded(true);
    // Read once on mount. Empty initialQuery deliberately leaves saved preferences intact.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const persisted = persistDirectoryPersonalization(
      directoryStorage,
      personal,
      loaded
    );
    if (persisted !== null) setSessionOnly(!persisted);
  }, [personal, loaded]);

  useEffect(() => {
    if (previousInitialQuery.current === initialQuery) return;
    previousInitialQuery.current = initialQuery;
    if (!initialQuery.trim()) return;
    setPersonal(current => applyInitialDirectoryQuery(current, initialQuery));
    setPage(1);
  }, [initialQuery]);

  useEffect(() => {
    const target = pendingHistoryFocus.current;
    if (target === null) return;
    pendingHistoryFocus.current = null;
    (historyButtons.current.get(target) ?? searchInput.current)?.focus();
  }, [personal.recentSearches]);

  const results = useMemo(
    () =>
      personalizeDirectoryResults(
        searchResourceDirectory(resourceDirectory, { query, category, aiOnly }),
        personal,
        query
      ),
    [personal, query, category, aiOnly]
  );
  const visible = paginateDirectory(results, page);
  const terms = directorySearchTerms(query);
  const savedEntries = savedDirectoryEntries(personal);

  function updatePersonal(next: DirectoryPersonalization) {
    setPersonal(next);
    // Event-time writes also preserve guide clicks immediately before the tab unmounts.
    const persisted = persistDirectoryPersonalization(
      directoryStorage,
      next,
      loaded
    );
    if (persisted !== null) setSessionOnly(!persisted);
  }

  function updatePreferences(patch: Partial<DirectoryPreferences>) {
    updatePersonal({
      ...personal,
      preferences: { ...personal.preferences, ...patch },
    });
    setPage(1);
  }

  function updateQuery(value: string) {
    updatePreferences({ query: value.slice(0, 256) });
  }

  function resetFilters() {
    updatePreferences({ query: "", category: "All", aiOnly: false });
  }

  function restoreSearch(preferences: DirectoryPreferences) {
    updatePersonal(
      recordDirectorySearch({ ...personal, preferences }, preferences)
    );
    setPage(1);
  }

  function deleteSearch(search: DirectoryPreferences) {
    const next = removeDirectorySearch(personal, search);
    if (next === personal) return;
    const index = personal.recentSearches.findIndex(
      candidate => historyIdentity(candidate) === historyIdentity(search)
    );
    const nearby =
      next.recentSearches[Math.min(index, next.recentSearches.length - 1)];
    pendingHistoryFocus.current = nearby ? historyIdentity(nearby) : "";
    updatePersonal(next);
  }

  function toggleSaved(id: string) {
    updatePersonal(toggleDirectorySaved(personal, id));
    setExportMessage("");
  }

  function recordOpen(id: string) {
    updatePersonal(recordDirectoryClick(personal, id));
  }

  function resetPersonalDirectory() {
    updatePersonal(defaultDirectoryPersonalization());
    setPage(1);
    setExportMessage("");
  }

  async function exportSavedItems() {
    if (exportInProgress.current || !savedEntries.length) return;
    exportInProgress.current = true;
    setIsExporting(true);
    setExportMessage("");
    const snapshot = { ...personal, savedIds: [...personal.savedIds] };
    let downloadUrl: string | undefined;
    let link: HTMLAnchorElement | undefined;
    try {
      const data = createSavedDirectoryExport(snapshot);
      // Two frame callbacks allow the loading state to paint before local work;
      // there is no artificial delay or network request.
      await new Promise<void>(resolve => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });
      downloadUrl = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      );
      link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "platformula-one-saved-directory-v1.json";
      document.body.appendChild(link);
      link.click();
      const message = `Prepared ${data.items.length} saved ${data.items.length === 1 ? "item" : "items"}. Download requested.`;
      setExportMessage(message);
      toast.success(message);
    } catch {
      const message =
        "Download unavailable in this browser or embedded frame. Try opening the site directly and exporting again.";
      setExportMessage(message);
      toast.error(message);
    } finally {
      try {
        link?.remove();
      } finally {
        try {
          if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        } finally {
          exportInProgress.current = false;
          setIsExporting(false);
        }
      }
    }
  }

  return (
    <div className="resource-directory text-[#211b35]">
      <style>{directoryStyles}</style>
      <header className="rd-hero">
        <div className="rd-eyebrow">
          <Sparkles size={16} aria-hidden="true" /> The founder’s launch
          directory
        </div>
        <h1 className="rd-title">
          Everything founders need to go from idea to launch.
        </h1>
        <p className="rd-intro">
          Find AI build tools, startup programs, investors and practical guides.
          Describe what you need, then explore a focused set of resources.
        </p>
        <label htmlFor="startup-directory-query" className="rd-search-label">
          Search startup directory
        </label>
        <form
          className="rd-search"
          role="search"
          onSubmit={event => {
            event.preventDefault();
            updatePersonal(recordDirectorySearch(personal));
            setPage(1);
            resultsHeading.current?.focus();
          }}
        >
          <div className="rd-input-wrap">
            <Search className="rd-input-icon" size={20} aria-hidden="true" />
            <input
              id="startup-directory-query"
              className="rd-input"
              ref={searchInput}
              type="search"
              aria-label="Search startup directory"
              aria-describedby="directory-search-explanation"
              placeholder="I need AI credits to build my first app…"
              maxLength={256}
              value={query}
              onChange={event => updateQuery(event.target.value)}
            />
          </div>
          <button type="submit" className="rd-primary">
            Search <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>
        <div
          className="rd-suggestions"
          aria-label="Suggested directory searches"
        >
          <span>Try asking:</span>
          {suggestions.map(suggestion => (
            <button
              type="button"
              key={suggestion}
              className="rd-chip"
              onClick={() => {
                restoreSearch({
                  query: suggestion,
                  category: "All",
                  aiOnly: directorySearchTerms(suggestion).includes("ai"),
                });
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <p id="directory-search-explanation" className="rd-explainer">
          Instant local keyword matching—not a chatbot. Common filler words are
          ignored; AI, cloud/compute credits, fundraising/VC, pitch/deck and
          app/website building use explicit synonyms. Every meaningful term must
          match.
        </p>
      </header>

      <section
        aria-labelledby="directory-sources-heading"
        className="rd-sources"
      >
        <h2 id="directory-sources-heading" className="rd-section-heading">
          Discover beyond the directory
        </h2>
        <p className="rd-section-caption">
          Open the source website to explore its listings. These are external
          source-search links; no API feeds are connected and no listings are
          imported.
        </p>
        <div className="rd-source-grid">
          {directorySources.map(source => {
            const href = directorySourceUrl(source, query);
            const usesQuery = Boolean(source.search && query.trim());
            return (
              <article
                className="rd-source"
                key={source.id}
                data-source-mode={source.mode}
              >
                <div className="rd-source-title">
                  {source.title}
                  <ExternalLink size={14} aria-hidden="true" />
                </div>
                <p className="rd-source-description">{source.description}</p>
                <p className="rd-source-status">
                  External source-search · No API feed connected
                </p>
                {source.statusNote && (
                  <p className="rd-source-status">{source.statusNote}</p>
                )}
                {source.aiUrl && source.aiUrl !== href && (
                  <a
                    className="rd-source-link"
                    href={source.aiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Browse AI on {source.title}{" "}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                )}
                {href ? (
                  <a
                    className="rd-source-link"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${usesQuery ? "Search" : "Browse"} ${source.title} externally`}
                  >
                    {usesQuery ? "Search on source" : "Browse on source"}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <p className="rd-source-status">Source link unavailable</p>
                )}
                <p className="rd-source-status">
                  {usesQuery
                    ? "Your query is sent only when you open this link."
                    : "Use the source’s own filters; your query is not sent."}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="rd-layout">
        <aside
          className="rd-sidebar"
          aria-labelledby="directory-personal-heading"
        >
          <h2 id="directory-personal-heading">Your personal directory</h2>
          <p>
            Searches, preferences and saved items stay in this browser. No
            account sync or server requests.
          </p>
          {sessionOnly && (
            <p role="status">
              Storage is unavailable. Changes are session-only and may be lost
              when you leave this tab or reload. Export saved items to keep a
              copy.
            </p>
          )}
          <h3>Recent searches</h3>
          {personal.recentSearches.length ? (
            <div className="rd-history" aria-label="Recent directory searches">
              {personal.recentSearches.map((search, index) => (
                <span className="rd-history-item" key={historyIdentity(search)}>
                  <button
                    type="button"
                    className="rd-chip"
                    ref={node => {
                      const key = historyIdentity(search);
                      if (node) historyButtons.current.set(key, node);
                      else historyButtons.current.delete(key);
                    }}
                    aria-label={`Restore search: ${search.query}`}
                    aria-describedby={`directory-history-${index}-filters`}
                    onClick={() => restoreSearch(search)}
                  >
                    {search.query}
                    <small id={`directory-history-${index}-filters`}>
                      {search.category} · AI {search.aiOnly ? "on" : "off"}
                    </small>
                  </button>
                  <button
                    type="button"
                    className="rd-history-delete"
                    aria-label={`Delete search: ${search.query}`}
                    aria-describedby={`directory-history-${index}-filters`}
                    title={`Delete search: ${search.query}`}
                    onClick={() => deleteSearch(search)}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p>
              Submit a search or try a suggestion to keep a recent-search
              shortcut. Typing alone is not added to history.
            </p>
          )}
          <button
            type="button"
            className="rd-secondary"
            aria-label="Clear recent searches"
            disabled={!personal.recentSearches.length}
            onClick={() => updatePersonal({ ...personal, recentSearches: [] })}
          >
            Clear recent searches
          </button>
          <h3>Saved items ({savedEntries.length})</h3>
          {savedEntries.length ? (
            <ul className="rd-saved-list" aria-label="Saved directory items">
              {savedEntries.map(entry => (
                <li key={entry.id}>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordOpen(entry.id)}
                  >
                    {entry.title}
                  </a>
                  <button
                    type="button"
                    className="rd-save"
                    aria-label={`Unsave ${entry.title}`}
                    aria-pressed={true}
                    onClick={() => toggleSaved(entry.id)}
                  >
                    <Bookmark
                      size={14}
                      aria-hidden="true"
                      fill="currentColor"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p id="directory-export-empty">
              Save a resource card first to enable export. Saved items stay
              available here even when filters hide their cards.
            </p>
          )}
          {savedEntries.length > 0 && (
            <p>
              Includes every saved item, regardless of the current search,
              category or AI filter.
            </p>
          )}
          <div className="rd-sidebar-actions">
            <button
              type="button"
              className="rd-secondary"
              aria-label="Export saved items"
              aria-describedby={
                !savedEntries.length
                  ? "directory-export-empty"
                  : exportMessage
                    ? "directory-export-feedback"
                    : undefined
              }
              aria-busy={isExporting}
              disabled={isExporting || !savedEntries.length}
              onClick={exportSavedItems}
            >
              {isExporting ? (
                <Loader2
                  size={14}
                  className="motion-safe:animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Download size={14} aria-hidden="true" />
              )}
              {isExporting ? "Preparing export…" : "Export saved items"}
            </button>
            <button
              type="button"
              className="rd-secondary"
              aria-label="Reset personal directory"
              onClick={resetPersonalDirectory}
            >
              Reset personal directory
            </button>
          </div>
          {exportMessage && (
            <p id="directory-export-feedback" role="status" aria-live="polite">
              {exportMessage}
            </p>
          )}
          <p>
            Reset clears saved items, clicked items, recent searches and
            preferences, restoring the default nine-card AI-focused display.
            Clear recent searches only clears history.
          </p>
          <p>
            Without an active query, recently opened items appear first, then
            saved items, then the default order. Filters still apply; load more
            to explore the remaining entries.
          </p>
        </aside>
        <section
          aria-labelledby="directory-results-heading"
          id="directory-results-section"
          className="rd-results"
        >
          <div className="rd-controls">
            <nav className="rd-filters" aria-label="Filter startup directory">
              {DIRECTORY_FILTERS.map(filter => (
                <button
                  key={filter}
                  type="button"
                  className="rd-filter"
                  aria-pressed={category === filter}
                  onClick={() => {
                    updatePreferences({ category: filter, ...(["Founder Services", "Financial Infrastructure"].includes(filter) ? { aiOnly: false } : {}) });
                  }}
                >
                  {filter}
                </button>
              ))}
            </nav>
            <label className="rd-toggle">
              <input
                type="checkbox"
                checked={aiOnly}
                onChange={event => {
                  updatePreferences({ aiOnly: event.target.checked });
                }}
              />{" "}
              AI focus
            </label>
          </div>
          {category === "Founder Services" && <div className="rd-guide-action" style={{marginBottom:20}}><strong>Founder Services Lattice</strong>Formation, legal resources, banking, equity, insurance and patent-practitioner lookup. These are independent external resources; no commercial affiliation or integration is established. Consult qualified professionals for regulated decisions.</div>}
          {category === "Financial Infrastructure" && <div className="rd-guide-action" style={{marginBottom:20}}><strong>Founder Financial Infrastructure</strong>Research banking, payments, payroll, accounting, compliance and operating tools. Public API documentation is not a connected integration; provider approval and current terms still apply.{onNavigate && <button type="button" className="rd-secondary" onClick={() => onNavigate("financialstack")}>Open provider and perks comparison</button>}</div>}
          <div className="rd-results-header">
            <h2
              id="directory-results-heading"
              tabIndex={-1}
              ref={resultsHeading}
              className="rd-section-heading"
            >
              {query.trim()
                ? "Resources for your next move"
                : "A focused place to start"}
            </h2>
            <p className="rd-status" role="status" aria-live="polite">
              Showing {visible.length} of {results.length} matches
              {aiOnly ? " · AI focus on" : " · All startup topics"}
            </p>
          </div>
          {query.trim() && (
            <p className="rd-matched">
              {terms.length
                ? `Matching all terms: ${terms.join(" · ")}`
                : "No specific keywords in this request. Showing entries that match your filters."}
            </p>
          )}
          {results.length ? (
            <>
              <div className="rd-grid">
                {visible.map(entry => (
                  <DirectoryCard
                    key={entry.id}
                    entry={entry}
                    onNavigate={onNavigate}
                    saved={personal.savedIds.includes(entry.id)}
                    onToggleSaved={toggleSaved}
                    onOpen={recordOpen}
                  />
                ))}
              </div>
              {visible.length < results.length && (
                <div className="rd-more">
                  <button
                    type="button"
                    className="rd-secondary"
                    onClick={() => setPage(current => current + 1)}
                  >
                    Load{" "}
                    {Math.min(
                      DIRECTORY_PAGE_SIZE,
                      results.length - visible.length
                    )}{" "}
                    more resources <ArrowRight size={15} aria-hidden="true" />
                  </button>
                  <p className="rd-status">
                    Small batches, not a wall of links.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rd-empty">
              <h3>No resources match this request yet.</h3>
              <p>
                Try fewer keywords, choose another category, or turn off AI
                focus to include broader startup resources. You can also explore
                the external sources above using their own search tools.
              </p>
              <div className="rd-empty-actions">
                <button
                  type="button"
                  className="rd-primary"
                  onClick={resetFilters}
                >
                  Reset search &amp; filters
                </button>
                {aiOnly && (
                  <button
                    type="button"
                    className="rd-secondary"
                    onClick={() => {
                      updatePreferences({ aiOnly: false });
                    }}
                  >
                    Include non-AI resources
                  </button>
                )}
                <a className="rd-secondary" href="#directory-sources-heading">
                  Explore source websites{" "}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </section>
      </div>

      <footer aria-label="Startup Resources attribution" className="rd-footer">
        <p>
          Keep exploring founder guides and insights from Everything Startups.
          <br />
          Independent links and curated reading—not a partnership or affiliate
          offer.
        </p>
        <a
          href={STARTUP_READS_SOURCE}
          target="_blank"
          rel="noopener noreferrer"
          className="rd-footer-link"
        >
          Everything Startups — Startup Reads{" "}
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}
