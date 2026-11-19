import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Play, Pause, Sparkles, FilePenLine } from "lucide-react";
import { trpc } from "@/lib/trpc";
import FounderAIControls, { useFounderAI } from "./FounderAIControls";
import { briefToPitchText, localPitchDraft, pitchDraftToRecord, pitchSections } from "@shared/founderRefinements";
import type { FounderBrief } from "@shared/founderJourney";
import PitchProgress from "./PitchProgress";
import RelatedFounderResources from "./RelatedFounderResources";

type Props = { slides: Record<string,string>; activeSlide: string; onSelect: (id:string)=>void; onChange: (id:string,text:string)=>void; onCommit: (id:string)=>void; onApply: (draft:Record<string,string>)=>void; brief?: FounderBrief };
export default function PitchDeckPreview({slides,activeSlide,onSelect,onChange,onCommit,onApply,brief}:Props) {
  const [context,setContext] = useState(()=>briefToPitchText(brief));
  const [draft,setDraft] = useState<Record<string,string>|null>(null);
  const [source,setSource] = useState("");
  const [error,setError] = useState("");
  const [playing,setPlaying] = useState(false);
  const [theme,setTheme] = useState("violet");
  const [edit,setEdit] = useState(false);
  const [draftApplied,setDraftApplied] = useState(false);
  const ai = useFounderAI();
  const generate = trpc.founderRefinements.pitchDraft.useMutation({retry:false});
  const index = Math.max(0,pitchSections.findIndex(s=>s.id===activeSlide));
  const selected = pitchSections[index];
  useEffect(()=> {
    if(!playing) return;
    const timer = window.setTimeout(()=> { if(index>=pitchSections.length-1) setPlaying(false); else onSelect(pitchSections[index+1].id); },5000);
    return ()=>window.clearTimeout(timer);
  },[playing,index,onSelect]);
  async function createDraft() {
    if(!ai.ready || generate.isPending || context.trim().length<10) return;
    setError("");
    try { const result = await generate.mutateAsync({model:ai.model,consent:true,brief:context}); setDraft(pitchDraftToRecord(result));setSource(`AI draft · ${result.model}`); }
    catch { setError("AI draft generation could not complete. Existing slides are unchanged; local drafting and preview remain available."); }
  }
  function applyDraft() {
    if(!draft) return;
    const next={...slides};
    let count=0;
    for(const section of pitchSections) if(!(next[section.id]??"").trim()) {next[section.id]=draft[section.id];count++;}
    if(!count) {setError("Every section already has content. Copy a reviewed draft section into the editor if you want to replace one.");return;}
    onApply(next);setDraft(null);setDraftApplied(true);setError("");setPlaying(false);
  }
  const text=slides[selected.id] || "Your slide is empty. Generate a reviewable draft or edit the section below.";
  return <section aria-labelledby="pitch-preview-title" className="mb-8 rounded-2xl border border-violet-300/25 bg-[#181321] p-4 sm:p-6 space-y-5 text-white">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-violet-300">Interactive generator preview</p><h2 id="pitch-preview-title" className="mt-2 text-2xl font-semibold">Build the story. See it take shape.</h2><p className="mt-2 text-xs text-violet-200/70">Preview and edit your actual slide state. Drafts need founder review; this is not a PowerPoint export.</p></div><label className="text-xs text-violet-200">Preview style<select aria-label="Pitch preview style" value={theme} onChange={e=>setTheme(e.target.value)} className="mt-2 block rounded-lg border border-violet-300/25 bg-[#21192e] px-3 py-2"><option value="violet">Violet studio</option><option value="midnight">Midnight</option><option value="paper">Paper</option></select></label></header>
    <PitchProgress brief={context} generating={generate.isPending} hasDraft={draft !== null} applied={draftApplied} slides={slides} activeSlide={activeSlide} />
    <div className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 sm:p-8 min-h-[260px] sm:aspect-video ${theme==="paper" ? "bg-[#faf8ff] text-[#211b35] border-violet-200" : theme==="midnight" ? "bg-gradient-to-br from-[#102138] to-[#070d17] text-white border-blue-300/20" : "bg-gradient-to-br from-[#4a276b] to-[#171022] text-white border-violet-300/25"}`} aria-label="Current pitch slide preview" data-active-slide={selected.id}><div className="flex items-center justify-between gap-2 text-xs opacity-65"><span>PlatFormula.One · Founder draft</span><span>{String(index+1).padStart(2,"0")} / {pitchSections.length}</span></div><h3 className="mt-6 sm:mt-10 text-3xl sm:text-5xl font-semibold tracking-tight">{selected.title}</h3><div className="mt-5 flex-1 overflow-auto max-h-64 sm:max-h-72 whitespace-pre-wrap break-words text-sm sm:text-lg leading-relaxed" aria-label="Preview slide content">{text}</div><p className="mt-5 text-[10px] opacity-50">Founder supplied or AI draft—not independently verified.</p></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><button aria-label="Previous preview slide" disabled={index===0} onClick={()=>{setPlaying(false);onSelect(pitchSections[index-1].id);}} className="min-h-11 rounded-lg border border-violet-300/30 px-3 disabled:opacity-40"><ArrowLeft className="h-4 w-4" /></button><button aria-label={playing?"Pause pitch preview":"Play pitch preview"} onClick={()=>{if(!playing && index===pitchSections.length-1) onSelect(pitchSections[0].id);setPlaying(!playing);}} className="min-h-11 inline-flex items-center gap-2 rounded-lg border border-violet-300/30 px-3 text-sm">{playing?<Pause className="h-4 w-4" />:<Play className="h-4 w-4" />}{playing?"Pause":"Play"}</button><button aria-label="Next preview slide" disabled={index===pitchSections.length-1} onClick={()=>{setPlaying(false);onSelect(pitchSections[index+1].id);}} className="min-h-11 rounded-lg border border-violet-300/30 px-3 disabled:opacity-40"><ArrowRight className="h-4 w-4" /></button></div><button onClick={()=>setEdit(!edit)} className="min-h-11 inline-flex items-center gap-2 rounded-lg border border-violet-300/30 px-3 text-sm"><FilePenLine className="h-4 w-4" />{edit?"Close preview editor":"Edit this slide"}</button></div>
    {edit && <label className="block space-y-2 text-sm"><span>Edit {selected.title}</span><textarea aria-label="Edit preview slide" maxLength={12000} value={slides[selected.id]??""} onChange={e=>onChange(selected.id,e.target.value)} onBlur={()=>onCommit(selected.id)} className="w-full min-h-32 rounded-lg border border-violet-300/30 bg-black/25 p-3 text-white" /></label>}
    <details className="rounded-xl border border-violet-300/20 p-4 space-y-4"><summary className="min-h-11 cursor-pointer font-semibold text-violet-200">Generate a pitch draft from my brief</summary><label htmlFor="pitch-generation-brief" className="block space-y-2 text-sm"><span>Founder context, evidence and ask</span><textarea id="pitch-generation-brief" maxLength={5000} value={context} disabled={generate.isPending} onChange={e=>{setContext(e.target.value);setDraft(null);}} placeholder="Describe your project and include only the facts you can support." className="w-full min-h-32 rounded-lg border border-violet-300/30 bg-black/25 p-3 text-white" /></label><FounderAIControls ai={ai} id="pitch" busy={generate.isPending} /><div className="flex flex-wrap gap-3"><button disabled={!ai.ready || generate.isPending || context.trim().length<10} onClick={()=>void createDraft()} className="min-h-11 inline-flex items-center gap-2 rounded-lg bg-violet-400 px-4 text-sm font-semibold text-violet-950 disabled:opacity-40"><Sparkles className="h-4 w-4" />{generate.isPending?"Generating draft…":"Generate AI pitch draft"}</button><button disabled={generate.isPending} onClick={()=>{setDraft(localPitchDraft(context));setSource("Local scaffold · not AI-generated");setError("");}} className="min-h-11 rounded-lg border border-violet-300/30 px-4 text-sm">Create local scaffold</button></div>
    {draft && <div aria-label="Review generated pitch draft" className="space-y-3 border-t border-violet-300/20 pt-4"><p className="text-xs text-violet-200">{source}. Review before applying; existing populated slides will not be overwritten.</p>{pitchSections.map(section=><details key={section.id} className="rounded-lg border border-violet-300/15 p-3"><summary className="cursor-pointer text-sm font-medium">{section.title}</summary><p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-violet-100/80">{draft[section.id]}</p></details>)}<button onClick={applyDraft} className="min-h-11 rounded-lg bg-violet-400 px-4 text-sm font-semibold text-violet-950">Apply draft to empty slides</button><button onClick={()=>setDraft(null)} className="min-h-11 px-4 text-sm text-violet-200">Discard draft</button></div>}
    {error && <p role="alert" className="text-xs text-amber-200">{error}</p>}</details>
    <p className="text-xs text-violet-200/60">Playback stays in this browser. There is no connected native conversational agent or deck-control session yet.</p>
    <RelatedFounderResources placement="pitch" title="Pitch, rehearsal and investor-sharing resources" />
  </section>;
}
