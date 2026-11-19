import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import type { RefinementModel } from "@shared/founderRefinements";

export function useFounderAI() {
  const auth = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const catalog = trpc.founderAssistant.models.useQuery(undefined, { retry: false, staleTime: 60_000, refetchOnWindowFocus: false });
  const [choice,setChoice] = useState<RefinementModel>("gpt-6-luna");
  const [consent,setConsent] = useState(false);
  return { auth, catalog, model: choice, consent, setConsent, setModel: (model: RefinementModel) => { setChoice(model); setConsent(false); }, ready: Boolean(auth.data) && consent && Boolean(catalog.data?.models.some(item=>item.id===choice)) };
}
export type FounderAI = ReturnType<typeof useFounderAI>;
export default function FounderAIControls({ ai, id, busy = false }: { ai: FounderAI; id: string; busy?: boolean }) {
  return <div className="rounded-xl border border-violet-300/25 bg-violet-500/5 p-4 space-y-3 text-sm text-violet-100">
    <label className="block space-y-2" htmlFor={`${id}-model`}><span>Generation model</span><select id={`${id}-model`} aria-label={`${id} generation model`} value={ai.model} disabled={busy} onChange={e=>ai.setModel(e.target.value as RefinementModel)} className="block w-full rounded-lg border border-violet-200/30 bg-[#21192e] px-3 py-2.5 text-white"><option value="">Choose an available model</option>{ai.catalog.data?.models.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    {ai.catalog.isLoading ? <p role="status" className="text-xs">Checking model availability—no generation request.</p> : !ai.catalog.data?.models.length && <p role="status" className="text-xs">AI generation is unavailable. Local editing and previews still work.</p>}
    {!ai.auth.isLoading && !ai.auth.data && <div className="flex flex-wrap items-center gap-3"><p className="text-xs">Sign in for AI generation.</p><button onClick={()=>startLogin()} className="min-h-11 rounded-lg border border-violet-300/30 px-3 text-xs">Sign in securely</button></div>}
    <label htmlFor={`${id}-consent`} className="flex items-start gap-3 text-xs leading-relaxed"><input id={`${id}-consent`} type="checkbox" checked={ai.consent} disabled={busy} onChange={e=>ai.setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-violet-400" /><span>Send this intent or brief to the selected cloud model when I click Generate. Usage consumes project credits. Do not include secrets.</span></label>
    <p className="text-[11px] leading-relaxed text-violet-200/60">No automatic model calls, microphone access or connected-agent execution. This is optional generation, not a native LiveKit session.</p>
  </div>;
}
