import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Gift,
  GitCompareArrows,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FINANCIAL_REVIEWED_AT,
  FINANCIAL_ROLES,
  MAX_FINANCIAL_COMPARE,
  financialCompareRecords,
  financialExternalLinkProps,
  financialStackRecords,
  isSafeFinancialUrl,
  paginateFinancialStack,
  searchFinancialStack,
  toggleFinancialCompare,
  type FinancialRole,
  type FinancialStackRecord,
} from "@shared/founderFinancialStack";

const controlClass =
  "min-h-[44px] rounded-xl border border-violet-400/20 bg-slate-950/60 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";
const panelClass =
  "min-w-0 rounded-2xl border border-violet-400/20 bg-slate-900/70";

function OfficialLink({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  if (!isSafeFinancialUrl(url)) return null;
  return (
    <a
      href={url}
      {...financialExternalLinkProps}
      className="inline-flex min-h-[44px] min-w-0 items-center gap-2 rounded-lg px-2 text-sm text-violet-300 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <span className="min-w-0 break-words">{children}</span>
      <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
    </a>
  );
}

function Warning({ record }: { record: FinancialStackRecord }) {
  if (!record.warning) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm leading-relaxed text-amber-100">
      <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{record.warning}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-t border-white/10 pt-3 first:border-0 first:pt-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-violet-300">
        {label}
      </dt>
      <dd className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-300">
        {value}
      </dd>
    </div>
  );
}

/** Identical public fields in details and comparison; no computed total or inferred qualification. */
function RecordFacts({ record }: { record: FinancialStackRecord }) {
  return (
    <>
      <dl className="space-y-3">
        <Fact
          label="Product / program"
          value={`${record.kind} · ${record.role}`}
        />
        <Fact label="What it does" value={record.description} />
        <Fact label="Stage guidance" value={record.stageGuidance} />
        <Fact
          label="Published pricing / plan"
          value={`${record.pricingStatus}\n${record.pricing}`}
        />
        <Fact
          label="Offer / credits (conditional)"
          value={`${record.offerStatus}\n${record.creditsOrOffers}`}
        />
        <Fact
          label="Eligibility conditions"
          value={`Founder eligibility: ${record.eligibilityStatus}\n${record.eligibility}`}
        />
        <Fact label="Expiration / renewal" value={record.expiration} />
        <Fact
          label="API availability"
          value={`${record.apiStatus}\n${record.apiAvailability}`}
        />
        <Fact
          label="YC company / alumni"
          value={`${record.ycCompanyStatus}\n${record.ycCompanyEvidence}`}
        />
        <Fact
          label="YC program / partnership evidence"
          value={`${record.ycProgramStatus}\n${record.ycProgramEvidence}`}
        />
        <Fact
          label="Relationship / integration"
          value={`${record.relationshipStatus} · ${record.integrationStatus}`}
        />
        <Fact
          label="Research review"
          value={`${record.researchStatus} · ${record.reviewedAt}. This does not establish unknown pricing, API or YC details.`}
        />
        <Fact label="Cautions" value={record.caution} />
      </dl>
      {record.kind === "Perks marketplace" && (
        <p className="rounded-lg border border-violet-400/20 bg-violet-400/5 p-3 text-sm leading-relaxed text-violet-200">
          Marketplace listings are not guaranteed eligible offers. Check each
          partner's conditions and expiration. No aggregate savings or automatic
          redemption is provided.
        </p>
      )}
      <div className="border-t border-white/10 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
          Sources · reviewed {record.reviewedAt}
        </p>
        <ul className="mt-1 space-y-1">
          {record.sources.map((source, index) => (
            <li key={source} className="min-w-0">
              <OfficialLink url={source}>
                {index + 1}. {source}
              </OfficialLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function StatusLabels({ record }: { record: FinancialStackRecord }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs leading-relaxed">
      <span className="rounded-md bg-violet-400/10 px-2 py-1 text-violet-200">
        External Resource
      </span>
      <span className="rounded-md bg-white/5 px-2 py-1 text-slate-300">
        Not connected
      </span>
      <span className="rounded-md bg-white/5 px-2 py-1 text-slate-300">
        API: {record.apiStatus}
      </span>
      <span
        className={`rounded-md px-2 py-1 ${record.offerStatus === "Expired offer" || record.offerStatus === "Closed season" ? "bg-amber-400/10 text-amber-200" : "bg-white/5 text-slate-300"}`}
      >
        {record.offerStatus}
      </span>
    </div>
  );
}

export default function FounderFinancialStack() {
  const [view, setView] = useState<"directory" | "perks">("directory");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<FinancialRole>("All roles");
  const [api, setApi] = useState<"all" | "available" | "unknown">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const filtered = useMemo(
    () => searchFinancialStack({ query, role, view, api }),
    [query, role, view, api]
  );
  const visible = paginateFinancialStack(filtered, page);
  const comparison = financialCompareRecords(selectedIds);

  function changeView(next: "directory" | "perks") {
    setView(next);
    setQuery("");
    setRole("All roles");
    setApi("all");
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setRole("All roles");
    setApi("all");
    setPage(1);
  }

  return (
    <section
      data-financial-stack
      aria-labelledby="financial-stack-title"
      className="min-w-0 space-y-6 rounded-2xl bg-slate-950/60 p-4 text-slate-100 sm:p-6"
    >
      <header className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              Public-source research · {FINANCIAL_REVIEWED_AT}
            </p>
            <h2
              id="financial-stack-title"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Founder Financial Infrastructure
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Explore banking, payments, payroll, accounting and operating
              infrastructure. Compare public terms, not promised benefits.
            </p>
          </div>
          <span className="self-start rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-sm text-violet-200">
            {financialStackRecords.length} reviewed records
          </span>
        </div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4 text-sm leading-relaxed text-slate-300">
          Every listing is an{" "}
          <strong className="text-slate-100">External Resource</strong> and{" "}
          <strong className="text-slate-100">Not connected</strong>. Research
          review is not approval, a recommendation, a quote or verification of
          every metadata field. Unknown means not established. YC company status
          is separate from a YC program or partnership, and neither establishes
          a PlatFormula.One relationship. Confirm changing terms directly.
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Read-only public information. This workspace does not collect banking
          credentials or SSNs, connect accounts, submit applications or redeem
          offers. Search and comparison stay in this page; only clicking an
          official link opens an external site.
        </p>
      </header>

      <div
        className="grid gap-2 sm:grid-cols-2"
        role="group"
        aria-label="Financial workspace view"
      >
        <Button
          type="button"
          aria-pressed={view === "directory"}
          onClick={() => changeView("directory")}
          className={`min-h-[44px] whitespace-normal rounded-xl ${view === "directory" ? "bg-violet-600 text-white hover:bg-violet-500" : "border border-violet-400/20 bg-slate-900 text-slate-200 hover:bg-slate-800"}`}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" /> Financial
          directory
        </Button>
        <Button
          type="button"
          aria-pressed={view === "perks"}
          onClick={() => changeView("perks")}
          className={`min-h-[44px] whitespace-normal rounded-xl ${view === "perks" ? "bg-violet-600 text-white hover:bg-violet-500" : "border border-violet-400/20 bg-slate-900 text-slate-200 hover:bg-slate-800"}`}
        >
          <Gift className="h-4 w-4" aria-hidden="true" /> Perks Vault
        </Button>
      </div>

      {view === "perks" && (
        <div className={`${panelClass} space-y-2 p-4`}>
          <h3 className="font-semibold text-violet-200">
            Perks Vault · conditional programs
          </h3>
          <p className="text-sm leading-relaxed text-slate-300">
            Mercury Perks and Carta Startup Stack are customer marketplaces, not
            bundles of guaranteed eligible offers. Other selected programs below
            have their own funding, new-customer, jurisdiction and approval
            rules. We do not total credits or savings, determine eligibility or
            auto-redeem.
          </p>
          <p className="text-xs text-slate-400">
            Closed and expired program cautions remain in the financial
            directory. A program with no verified offer is not treated as a
            perk.
          </p>
        </div>
      )}

      <div className="grid items-end gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="min-w-0 space-y-2">
          <span className="text-sm font-medium text-slate-200">
            Search financial infrastructure
          </span>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400"
            />
            <input
              type="search"
              value={query}
              maxLength={256}
              placeholder="Provider, task or condition…"
              onChange={event => {
                setQuery(event.target.value);
                setPage(1);
              }}
              className={`${controlClass} w-full pl-9`}
            />
          </div>
        </label>
        <label className="min-w-0 space-y-2">
          <span className="text-sm font-medium text-slate-200">
            Infrastructure role
          </span>
          <select
            value={role}
            onChange={event => {
              setRole(event.target.value as FinancialRole);
              setPage(1);
            }}
            className={`${controlClass} w-full`}
          >
            {FINANCIAL_ROLES.map(value => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 space-y-2">
          <span className="text-sm font-medium text-slate-200">
            API documentation
          </span>
          <select
            value={api}
            onChange={event => {
              setApi(event.target.value as typeof api);
              setPage(1);
            }}
            className={`${controlClass} w-full`}
          >
            <option value="all">All API statuses</option>
            <option value="available">Public API / developer docs</option>
            <option value="unknown">Unknown / connector only</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-slate-400">
          Showing {visible.length} of {filtered.length} matching records ·
          research snapshot, not a live offer feed
        </p>
        <Button
          type="button"
          variant="ghost"
          onClick={resetFilters}
          className="min-h-[44px] text-violet-300 hover:bg-violet-400/10 hover:text-violet-200"
        >
          Reset filters
        </Button>
      </div>

      <div className={`${panelClass} space-y-3 p-4`}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <GitCompareArrows
                aria-hidden="true"
                className="h-4 w-4 text-violet-300"
              />
              Compare public terms
            </h3>
            <p className="mt-1 text-sm text-slate-400" aria-live="polite">
              {comparison.length} of {MAX_FINANCIAL_COMPARE} selected. Selection
              is not a configured financial stack.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={comparison.length === 0}
              aria-expanded={showComparison && comparison.length > 0}
              aria-controls="financial-stack-comparison"
              onClick={() => setShowComparison(value => !value)}
              className="min-h-[44px] bg-violet-600 text-white hover:bg-violet-500"
            >
              {showComparison ? "Hide comparison" : "Compare selected"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={comparison.length === 0}
              onClick={() => {
                setSelectedIds([]);
                setShowComparison(false);
              }}
              className="min-h-[44px] text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Clear comparison
            </Button>
          </div>
        </div>
        {comparison.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {comparison.map(record => (
              <Button
                key={record.id}
                type="button"
                variant="outline"
                onClick={() =>
                  setSelectedIds(ids => toggleFinancialCompare(ids, record.id))
                }
                aria-label={`Remove ${record.name} from comparison`}
                className="min-h-[44px] max-w-full whitespace-normal border-violet-400/30 bg-violet-400/10 text-violet-200 hover:bg-violet-400/20 hover:text-white"
              >
                {record.name}
                <X aria-hidden="true" className="h-4 w-4 shrink-0" />
              </Button>
            ))}
          </div>
        )}
      </div>

      {showComparison && comparison.length > 0 && (
        <section
          id="financial-stack-comparison"
          aria-labelledby="financial-comparison-title"
          className="space-y-4"
        >
          <h3 id="financial-comparison-title" className="text-xl font-semibold">
            Selected record comparison
          </h3>
          <p className="text-sm text-slate-400">
            Each card keeps the same source-backed fields. No guaranteed
            approval, account integration, combined benefit or recommendation is
            implied.
          </p>
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {comparison.map(record => (
              <article
                key={record.id}
                className={`${panelClass} space-y-4 p-4 sm:p-5`}
              >
                <h4 className="break-words text-lg font-semibold">
                  {record.name}
                </h4>
                <StatusLabels record={record} />
                <Warning record={record} />
                <OfficialLink url={record.officialUrl}>
                  Visit {record.name}
                </OfficialLink>
                <RecordFacts record={record} />
              </article>
            ))}
          </div>
        </section>
      )}

      {visible.length === 0 ? (
        <div className={`${panelClass} space-y-3 p-6`}>
          <h3 className="font-semibold">No matching reviewed records</h3>
          <p className="text-sm text-slate-400">
            Try a provider name or a broader role. No new provider data is
            fetched by searching.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="min-h-[44px] border-violet-400/30 text-violet-200 hover:bg-violet-400/10"
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(record => {
            const selected = selectedIds.includes(record.id);
            const compareLimit =
              !selected && comparison.length >= MAX_FINANCIAL_COMPARE;
            return (
              <article
                key={record.id}
                data-financial-record={record.id}
                className={`${panelClass} space-y-4 p-4 sm:p-5`}
              >
                <div className="space-y-2">
                  <p className="text-xs font-medium text-violet-300">
                    {record.role} · {record.kind}
                  </p>
                  <h3 className="break-words text-lg font-semibold">
                    {record.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {record.summary}
                  </p>
                </div>
                <StatusLabels record={record} />
                <Warning record={record} />
                <div className="space-y-1 text-xs leading-relaxed text-slate-400">
                  <p>
                    Research review: {record.reviewedAt} ·{" "}
                    {record.sources.length} source pages
                  </p>
                  <p>YC company: {record.ycCompanyStatus}</p>
                  <p>YC program / partnership: {record.ycProgramStatus}</p>
                  <p>Founder eligibility: Not assessed</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <OfficialLink url={record.officialUrl}>
                    Official site
                  </OfficialLink>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={`${selected ? "Remove" : "Compare"} ${record.name}`}
                    aria-pressed={selected}
                    disabled={compareLimit}
                    onClick={() =>
                      setSelectedIds(ids =>
                        toggleFinancialCompare(ids, record.id)
                      )
                    }
                    className="min-h-[44px] border-violet-400/30 bg-violet-400/5 text-violet-200 hover:bg-violet-400/15 hover:text-white"
                  >
                    {selected
                      ? "Remove from compare"
                      : compareLimit
                        ? "Compare limit reached"
                        : "Add to compare"}
                  </Button>
                </div>
                <details className="border-t border-white/10 pt-1">
                  <summary className="flex min-h-[44px] cursor-pointer items-center rounded-lg px-1 text-sm font-medium text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                    Terms, eligibility & sources
                  </summary>
                  <div className="mt-3 space-y-4">
                    <RecordFacts record={record} />
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      )}

      {visible.length < filtered.length && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPage(value => value + 1)}
            className="min-h-[44px] w-full border-violet-400/30 bg-violet-400/5 text-violet-200 hover:bg-violet-400/15 hover:text-white sm:w-auto"
          >
            Load more records
          </Button>
        </div>
      )}
    </section>
  );
}
