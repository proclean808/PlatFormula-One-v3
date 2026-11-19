import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, Lightbulb, Wrench, TrendingUp, Mic, Rocket, ShieldCheck, FileText, Layers3, Sparkles, Flag } from "lucide-react";
import { Pricing } from "./Pricing";
import { founderStages } from "@shared/founderJourney";
import FounderWelcome from "./FounderWelcome";

type Props = { setActiveTab: (tab: string) => void; onCaptureIntent?: (intent: string) => void; onStartGoal: (scope: string, intent: string, destination: string) => void; onFindResources: (query: string) => void };
const stageIcons = [Lightbulb, Wrench, TrendingUp, Mic];

export default function Dashboard({ setActiveTab, onCaptureIntent, onStartGoal, onFindResources }: Props) {
  const [intent, setIntent] = useState("");
  const begin = () => {
    if (intent.trim() && onCaptureIntent) onCaptureIntent(intent.trim());
    else setActiveTab("buildstudio");
  };
  return (
    <div className="space-y-16 md:space-y-24">
      <section className="grid gap-10 items-start lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-7">
          <p className="pf-kicker flex items-center gap-2"><span className="h-2 w-2 bg-lime-300 rounded-full" />AI-Native Startup Accelerator & Venture Studio</p>
          <h1 className="text-[clamp(2.7rem,5.8vw,5.5rem)] leading-[1.02] font-semibold tracking-[-0.055em]">Your insight.<br />A focused build.<br /><span className="text-lime-300">A venture worth proving.</span></h1>
          <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-xl">You know a problem from the inside. Start there. PlatFormula.One connects your domain knowledge to a validation plan, a scoped product brief, customer evidence, and the story behind your first raise. No finished idea or polished deck is needed to begin.</p>
          <div className="pf-panel p-4 space-y-3">
            <label htmlFor="founder-intent" className="block text-sm font-medium text-lime-100">What problem do you know—and who needs it solved?</label>
            <textarea id="founder-intent" value={intent} onChange={e => setIntent(e.target.value)} maxLength={2000} placeholder="I want to help…" className="w-full bg-[#0d160f] border border-lime-200/20 rounded-lg p-3 text-sm text-white min-h-20 focus:outline-none focus:ring-2 focus:ring-lime-300" />
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-zinc-400">Start with intent. No model call or login required.</p><Button onClick={begin} className="bg-lime-300 hover:bg-lime-200 text-zinc-950 font-semibold">Shape my venture <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm"><button onClick={() => setActiveTab("copilot")} className="text-lime-200 hover:text-lime-300 flex items-center gap-2">Meet your founder assistant <ArrowUpRight className="h-4 w-4" /></button><a href="#founder-journey" className="text-zinc-300 hover:text-white">See the journey ↓</a></div>
        </div>
        <div className="space-y-4">
          <FounderWelcome onStart={onStartGoal} onFind={onFindResources} />
          <div className="pf-panel p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between gap-3"><p className="text-xs text-lime-200 tracking-widest uppercase">From intent to opportunity</p><Flag className="h-5 w-5 text-lime-300" /></div>
            <div className="space-y-3">{founderStages.map((stage, index) => { const Icon = stageIcons[index]; return <button key={stage.id} onClick={() => setActiveTab(stage.id)} className="group w-full text-left grid grid-cols-[2.3rem_1fr_1rem] gap-3 items-center rounded-xl bg-lime-300/[0.07] border border-lime-300/20 p-4 hover:bg-lime-300/[0.14] transition-colors"><span className="text-xs font-mono text-lime-300">{stage.number}</span><span><span className="flex items-center gap-2 font-semibold text-lime-100"><Icon className="h-4 w-4" />{stage.label}</span><span className="text-xs text-zinc-400 mt-1 block leading-relaxed">{stage.output}</span></span><ArrowUpRight className="h-4 w-4 text-lime-300" /></button>; })}</div>
            <div className="border-t border-lime-300/15 pt-5 flex items-start gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-lime-300 mt-1" /><p className="text-sm leading-relaxed text-zinc-300">Your decisions stay yours. Export your brief. Review the build. Approve what gets connected.</p></div>
          </div>
          <div className="flex items-center gap-4 px-4"><img src="/manus-storage/15894_40b42506.jpg" alt="Formula 1 car — the founder-velocity identity of PlatFormula.One" className="w-28 h-16 object-contain rounded-lg" /><div><p className="text-xs font-semibold text-zinc-200">Built around founder velocity.</p><p className="text-xs text-zinc-400 mt-1">A direction. A next action. A useful result.</p></div></div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.6fr_1.4fr]">
        <div className="space-y-3"><p className="pf-kicker">The missing connection</p><h2 className="text-3xl md:text-4xl font-semibold tracking-tight">More tools aren't<br />the same as progress.</h2></div>
        <div className="space-y-5 text-zinc-300 leading-relaxed text-base md:text-lg"><p>A builder can write code. A slide tool can make a deck. An accelerator can open a door. But first, someone has to connect your intent, your customer, and the thing that is actually worth building.</p><p>That is the job PlatFormula.One is designed around: a founder workspace that gives each decision a place, each tool a purpose, and each stage a concrete next step.</p><p className="text-lime-200">Not a wall of logos. A path you can follow—and a brief you can take with you.</p></div>
      </section>

      <section aria-labelledby="founder-entry-heading" className="space-y-6">
        <div className="space-y-3"><p className="pf-kicker">Start where you are</p><h2 id="founder-entry-heading" className="text-3xl md:text-4xl font-semibold tracking-tight">An early insight or a working product.<br />A different next move for each.</h2></div>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="pf-panel p-6 sm:p-8 flex flex-col items-start gap-4"><Lightbulb className="h-7 w-7 text-lime-300" /><h3 className="text-2xl font-semibold">I know a problem worth solving.</h3><p className="text-zinc-300 leading-relaxed flex-1">Turn firsthand experience into a clear customer problem. Map your assumptions and the evidence you need before committing to a build.</p><Button onClick={() => setActiveTab("concept")} className="min-h-11 bg-lime-300 text-zinc-950 hover:bg-lime-200">Validate my concept <ArrowRight className="ml-2 h-4 w-4" /></Button><p className="text-xs text-zinc-400">Create a brief without a company, deck, or external application.</p></article>
          <article className="pf-panel p-6 sm:p-8 flex flex-col items-start gap-4"><TrendingUp className="h-7 w-7 text-violet-300" /><h3 className="text-2xl font-semibold">I already have a product.</h3><p className="text-zinc-300 leading-relaxed flex-1">Record what customers are telling you, plan the next experiment, and prepare a pitch that separates proven results from open questions.</p><Button onClick={() => setActiveTab("grow")} className="min-h-11 bg-violet-400 text-violet-950 hover:bg-violet-300">Plan my next growth step <ArrowRight className="ml-2 h-4 w-4" /></Button><button onClick={() => setActiveTab("application")} className="min-h-11 inline-flex items-center gap-2 text-sm text-violet-200 hover:text-violet-100">Explore programs for my stage <ArrowUpRight className="h-4 w-4" /></button></article>
        </div>
      </section>

      <section id="founder-journey" className="space-y-7 scroll-mt-44">
        <div className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-3"><p className="pf-kicker">Your Founder Journey</p><h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Four stages. One venture.</h2></div><p className="text-sm text-zinc-400 max-w-sm">Start where you are. Move when the evidence says you are ready.</p></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{founderStages.map((stage, i) => {const Icon = stageIcons[i]; return <button key={stage.id} className="pf-stage text-left p-6 space-y-5" onClick={() => setActiveTab(stage.id)}><div className="flex justify-between items-center"><span className="font-mono text-xs text-lime-300">{stage.number}</span><Icon className="h-6 w-6 text-lime-300" /></div><div className="space-y-3"><p className="text-sm text-lime-200 font-medium">{stage.label}</p><h3 className="text-xl font-semibold leading-snug">{stage.headline}</h3><p className="text-sm text-zinc-400 leading-relaxed">{stage.description}</p></div><span className="flex items-center gap-2 text-sm text-lime-300">Explore {stage.label.toLowerCase()} <ArrowRight className="h-4 w-4" /></span></button>; })}</div>
      </section>

      <section className="pf-panel grid gap-8 p-6 md:p-10 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4"><p className="pf-kicker">AI with a clear job</p><h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Think with an assistant.<br />Build with your chosen team.</h2><p className="text-zinc-300 leading-relaxed">The embedded assistant helps you challenge assumptions and draft the next action. A portable handoff gives Claude Code—or another coding agent—the brief. Your knowledge can move into an Obsidian vault as Markdown.</p><Button variant="outline" className="border-lime-300/40 text-lime-200" onClick={() => setActiveTab("agentlab")}>See connection status <ArrowRight className="ml-2 h-4 w-4" /></Button></div>
        <div className="space-y-3">{[
          { icon: Sparkles, title: "Embedded founder assistant", text: "Authenticated cloud-model chat with an explicit processing choice. Drafting and planning—not autonomous execution." },
          { icon: FileText, title: "A portable founder brief", text: "Build and growth notes exported as Markdown. No hidden upload or automatic vault synchronization." },
          { icon: Layers3, title: "A connected studio, built deliberately", text: "Claude Code, Hermes, Relay and Phone Harness remain unconnected or untested until authorized setup and real-device checks pass." },
        ].map(({icon: Icon, title, text}) => <div key={title} className="rounded-xl border border-lime-300/15 bg-lime-300/5 p-5 flex items-start gap-3"><Icon className="h-5 w-5 shrink-0 text-lime-300 mt-1" /><div><h3 className="font-medium text-lime-100">{title}</h3><p className="mt-2 text-sm text-zinc-400 leading-relaxed">{text}</p></div></div>)}</div>
      </section>

      <section className="space-y-6"><div className="space-y-3"><p className="pf-kicker">Doors worth exploring</p><h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Prepare the story.<br />Find the right room.</h2><p className="text-zinc-400 max-w-2xl">Explore public founder programs and presentation tools. These are independent resources, not partnerships, admissions guarantees, or preapproved credits.</p></div><div className="grid gap-4 md:grid-cols-3">
        <a href="https://www.ycombinator.com/apply" target="_blank" rel="noopener noreferrer" className="pf-panel p-6 space-y-3 hover:border-orange-300/50"><p className="text-xs text-orange-300">Next YC Deadline</p><h3 className="text-xl font-semibold">Check the current YC batch.</h3><p className="text-sm text-zinc-400 leading-relaxed">Application dates change. Use YC's official page for the current deadline and requirements.</p><span className="text-sm text-orange-300 inline-flex gap-2 items-center">View YC application <ArrowUpRight className="h-4 w-4" /></span></a>
        <a href="https://www.techstars.com" target="_blank" rel="noopener noreferrer" className="pf-panel p-6 space-y-3 hover:border-blue-300/50"><p className="text-xs text-blue-300">Founder programs</p><h3 className="text-xl font-semibold">Explore the Techstars network.</h3><p className="text-sm text-zinc-400 leading-relaxed">Find programs by geography and focus. Review the official application and investment terms.</p><span className="text-sm text-blue-300 inline-flex gap-2 items-center">Explore Techstars <ArrowUpRight className="h-4 w-4" /></span></a>
        <button onClick={() => setActiveTab("pitch")} className="pf-panel p-6 space-y-3 text-left hover:border-lime-300/50"><p className="text-xs text-lime-300">Pitch Studio</p><h3 className="text-xl font-semibold">Make the narrative defensible.</h3><p className="text-sm text-zinc-400 leading-relaxed">Draft your slide outline, review heuristic weak-slide flags, and export text for your presentation workflow.</p><span className="text-sm text-lime-300 inline-flex gap-2 items-center">Open Pitch Studio <ArrowRight className="h-4 w-4" /></span></button>
      </div></section>
      <section className="text-center space-y-5 py-8"><Rocket className="mx-auto h-8 w-8 text-lime-300" /><h2 className="text-3xl md:text-5xl font-semibold tracking-tight">You don't need another starting point.<br /><span className="text-lime-300">You need the next move.</span></h2><p className="text-zinc-400 max-w-xl mx-auto">Bring your intent. Leave with a clearer problem, a focused build brief, or the first draft of the story you need to tell.</p><Button size="lg" onClick={() => setActiveTab("buildstudio")} className="bg-lime-300 hover:bg-lime-200 text-zinc-950">Start your founder brief <ArrowRight className="ml-2 h-4 w-4" /></Button></section>
      <Pricing />
    </div>
  );
}
