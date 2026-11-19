import { ArrowUpRight } from "lucide-react";
import { resourcesForPlacement, type FounderResourcePlacement } from "@shared/founderServices";

export default function RelatedFounderResources({placement,title}:{placement:FounderResourcePlacement;title:string}) {
  const entries=resourcesForPlacement(placement);
  if(!entries.length)return null;
  return <section aria-label={title} className="rounded-2xl border border-violet-300/20 bg-[#181321] p-4 sm:p-6 space-y-4 text-white">
    <h2 className="text-lg font-semibold text-violet-100">{title}</h2>
    <p className="text-xs leading-relaxed text-violet-200/70">Independent tools and references you can explore. These are external resources—not connected agents, established affiliate relationships or professional recommendations.</p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{entries.map(entry=><article key={entry.id} className="flex min-w-0 flex-col rounded-xl border border-violet-200/15 bg-white/5 p-4 gap-3">
      <span className="text-[10px] font-medium uppercase tracking-wide text-violet-300">{entry.relationshipStatus}</span><h3 className="text-sm font-semibold">{entry.title}</h3><p className="flex-1 text-xs leading-relaxed text-violet-200/75">{entry.description}</p><a href={entry.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-violet-300/25 px-3 text-xs font-semibold text-violet-200" aria-label={`Explore ${entry.title} externally`}>Explore resource<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></a>
    </article>)}</div>
  </section>;
}
