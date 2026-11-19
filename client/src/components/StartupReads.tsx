import { useState } from "react";
import { BookOpen, ArrowUpRight, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filterStartupReads, READING_STAGES, READING_WORKSPACES, STARTUP_READS_SOURCE, startupReads, type ReadingStage } from "@shared/startupReads";

const colors: Record<ReadingStage, string> = {
  Validate: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  Build: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
  Grow: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
  Raise: "border-violet-300/25 bg-violet-300/10 text-violet-200",
};

type Props = { searchTerm?: string; onNavigate?: (tab: string) => void };

export default function StartupReads({ searchTerm = "", onNavigate }: Props) {
  const [stage, setStage] = useState<ReadingStage | "All">("All");
  const filtered = filterStartupReads(startupReads, searchTerm, stage);
  return (
    <section aria-labelledby="startup-reads-heading" className="space-y-6">
      <div className="rounded-2xl border border-lime-200/20 bg-gradient-to-br from-[#223221] via-[#17251c] to-[#10201d] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-lime-200"><BookOpen className="h-4 w-4" /> The founder reading room</div>
            <h2 id="startup-reads-heading" className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Read with intent.<br /><span className="text-lime-300">Leave with a next move.</span></h2>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-200">Practical startup reading, remixed into a founder workflow. Find your question, get the takeaway, then put it to work in Validate, Build, Grow or Raise.</p>
          </div>
          <a href={STARTUP_READS_SOURCE} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-lime-200/30 px-4 py-2 text-sm font-medium text-lime-200 hover:bg-lime-200/10">Browse original collection <ArrowUpRight className="h-4 w-4" /></a>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-zinc-300">Reading selection from EverythingStartups. Summaries and founder exercises by PlatFormula.One; not a partnership or affiliate offer. Article content reviewed November 18, 2026. Check current offers, eligibility and terms with the provider.</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter startup reads by founder stage" className="flex flex-wrap gap-2">
          {(["All", ...READING_STAGES] as const).map(value => <button key={value} type="button" aria-pressed={stage === value} onClick={() => setStage(value)} className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${stage === value ? "border-lime-300 bg-lime-300 text-zinc-950" : "border-white/15 bg-[#19251d] text-zinc-200 hover:border-lime-300/50"}`}>{value === "All" ? "All reads" : value}</button>)}
        </nav>
        <p role="status" className="text-sm text-muted-foreground">{filtered.length} of {startupReads.length} guides</p>
      </div>
      {filtered.length === 0 ? <div className="rounded-xl border border-white/15 bg-card p-6 text-sm text-muted-foreground">No reading guides match this search and stage. Try a different search or choose All reads.</div> :
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => <article key={item.id} aria-labelledby={`read-${item.id}`} className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#142019] transition-colors hover:border-lime-200/40">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-white/[0.045] to-lime-300/[0.035] px-5 py-4">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${colors[item.category]}`}>{item.category}</span>
              <span className="text-xs font-mono text-zinc-400">FIELD NOTE / {String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <h3 id={`read-${item.id}`} className="text-xl font-semibold leading-snug text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-300">{item.summary}</p>
              <div className="rounded-xl border border-lime-200/15 bg-lime-200/[0.045] p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-lime-200"><CheckCircle2 className="h-4 w-4" /> Your next move</p>
                <p className="text-sm leading-relaxed text-zinc-200">{item.action}</p>
              </div>
              <div className="flex flex-wrap gap-2">{item.tags.map(tag => <span key={tag} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-zinc-300">{tag}</span>)}</div>
              {item.caution && <p className="text-xs leading-relaxed text-zinc-400">{item.caution}</p>}
              <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
                <a href={item.sourceUrl} title={item.sourceTitle} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-lime-200 hover:text-lime-300" aria-label={`Read original: ${item.title}`}>Read original article <ArrowUpRight className="h-4 w-4" /></a>
                <p className="text-[11px] text-zinc-400">Source: EverythingStartups · {item.reviewedAt}</p>
                {onNavigate && <Button variant="outline" className="w-full justify-between border-white/20 bg-white/5 text-zinc-100 hover:bg-lime-300/10" onClick={() => onNavigate(READING_WORKSPACES[item.category])}>Use in {item.category}<ArrowRight className="h-4 w-4" /></Button>}
              </div>
            </div>
          </article>)}
        </div>}
    </section>
  );
}
