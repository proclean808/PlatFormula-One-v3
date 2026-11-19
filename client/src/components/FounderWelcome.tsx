import { useState } from "react";
import { ArrowRight, Monitor, Smartphone, Presentation, Layers3, Search, Sparkles } from "lucide-react";
import FounderAIControls, { useFounderAI } from "./FounderAIControls";
import { trpc } from "@/lib/trpc";
import { goalGuidance, type FounderGoal } from "@shared/founderRefinements";

export const founderGoals = [
  { id: "website", label: "Website", icon: Monitor, query: "AI build", scope: "A founder website with the essential customer journey." },
  { id: "mobile", label: "Mobile app", icon: Smartphone, query: "AI build", scope: "A mobile app with a clearly defined core user flow." },
  { id: "pitch", label: "Pitch deck", icon: Presentation, query: "pitch guides", scope: "An investor pitch built around the problem, product, evidence and ask." },
  { id: "venture", label: "Full venture", icon: Layers3, query: "AI", scope: "A coordinated website, mobile app, launch plan and investor narrative." },
] as const;
type Props = { onStart: (scope: string, intent: string, destination: string) => void; onFind: (query: string) => void };

export default function FounderWelcome({ onStart, onFind }: Props) {
  const [goal, setGoal] = useState<FounderGoal>("website");
  const [intent, setIntent] = useState("");
  const [personalized, setPersonalized] = useState<{greeting:string;nextStep:string;model:string}|null>(null);
  const [error,setError] = useState("");
  const ai = useFounderAI();
  const generate = trpc.founderRefinements.greeting.useMutation({retry:false});
  const selected = founderGoals.find(item => item.id === goal)!;
  const guidance = personalized ?? goalGuidance[goal];
  async function personalize() {
    if(!ai.ready || generate.isPending) return;
    setError("");
    try { setPersonalized(await generate.mutateAsync({goal,intent,consent:true,model:ai.model})); }
    catch { setError("AI personalization could not complete. Your local intent guidance is still available; nothing was connected or executed."); }
  }
  return <section id="founder-welcome" aria-labelledby="founder-welcome-title" className="scroll-mt-48 rounded-2xl border border-violet-300/25 bg-gradient-to-br from-[#302048] to-[#181321] p-5 sm:p-7 space-y-5">
    <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-widest text-violet-300">Start with your intent</p><h2 id="founder-welcome-title" className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Hi, founder. What are you here to build?</h2><p className="text-sm leading-relaxed text-violet-100/75">Choose your first move. We’ll give it a useful place to start.</p></div>
    <div role="group" aria-label="Choose your build goal" className="grid grid-cols-2 gap-2">{founderGoals.map(({ id, label, icon: Icon }) => <button key={id} type="button" disabled={generate.isPending} aria-pressed={goal === id} onClick={() => {setGoal(id);setPersonalized(null);setError("");}} className={`flex min-h-14 items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition-colors ${goal === id ? "border-violet-300 bg-violet-500/30 text-white" : "border-violet-200/20 bg-white/5 text-violet-100 hover:bg-white/10"}`}><Icon className="h-5 w-5 shrink-0" />{label}</button>)}</div>
    <div role="status" aria-live="polite" className="rounded-xl border border-violet-300/20 bg-black/15 p-4 space-y-2" data-greeting-mode={personalized ? "ai-generated" : "local-guidance"}><p className="text-sm font-semibold text-violet-100">{guidance.greeting}</p><p className="text-xs leading-relaxed text-violet-200/80">{guidance.nextStep}</p><p className="text-[10px] text-violet-300/70">{personalized ? `AI response · ${personalized.model}` : "Immediate local guidance · no model request"}</p></div>
    <div className="space-y-2"><label htmlFor="founder-welcome-intent" className="block text-sm text-violet-100">What should it do for your audience? <span className="text-violet-200/60">(optional)</span></label><textarea id="founder-welcome-intent" value={intent} disabled={generate.isPending} onChange={e => {setIntent(e.target.value);setPersonalized(null);}} maxLength={2000} placeholder="Who is it for, and what changes when it works?" className="w-full min-h-24 rounded-xl border border-violet-200/25 bg-black/20 px-3 py-3 text-sm leading-relaxed text-white placeholder:text-violet-200/40 focus:outline-none focus:ring-2 focus:ring-violet-300" /></div>
    <details className="space-y-3"><summary className="min-h-11 cursor-pointer text-sm font-semibold text-violet-200">Personalize this greeting with AI</summary><FounderAIControls ai={ai} id="welcome" busy={generate.isPending} /><button type="button" disabled={!ai.ready || generate.isPending} onClick={()=>void personalize()} className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/30 px-4 py-2 text-sm text-violet-100 disabled:opacity-50"><Sparkles className="h-4 w-4" />{generate.isPending ? "Personalizing…" : "Generate AI greeting"}</button>{error && <p role="alert" className="text-xs text-amber-200">{error}</p>}</details>
    <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => onStart(selected.scope, intent.trim(), goal === "pitch" ? "pitch" : "buildstudio")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 py-3 text-sm font-semibold text-violet-950 hover:bg-violet-300">{goal === "pitch" ? "Open my pitch workspace" : "Start my build brief"}<ArrowRight className="h-4 w-4" /></button><button type="button" onClick={() => onFind(selected.query)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-violet-300/30 px-4 py-3 text-sm font-semibold text-violet-200 hover:bg-white/5"><Search className="h-4 w-4" />Explore matching resources</button></div>
    <p className="text-xs leading-relaxed text-violet-200/60">Intent stays local until an explicit generation request. Native LiveKit conversation is not connected yet.</p>
  </section>;
}
