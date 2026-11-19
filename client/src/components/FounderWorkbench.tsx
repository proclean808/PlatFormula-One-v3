import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Download, FileText, ShieldCheck, Unplug, CheckCircle2 } from "lucide-react";
import { founderBriefToMarkdown, type FounderBrief } from "@shared/founderJourney";

type Props = {
  mode: "buildstudio" | "grow" | "agentlab";
  brief: FounderBrief;
  onChange: (brief: FounderBrief) => void;
  navigate: (tab: string) => void;
};

function downloadBrief(brief: FounderBrief, destination: string) {
  const url = URL.createObjectURL(new Blob([founderBriefToMarkdown(brief, destination)], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `PlatFormula.One-${destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-brief.md`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function FounderWorkbench({ mode, brief, onChange, navigate }: Props) {
  const change = (key: keyof FounderBrief, value: string) => onChange({ ...brief, [key]: value });
  const fields: { key: keyof FounderBrief; label: string; placeholder: string }[] = mode === "grow"
    ? [
      { key: "experiment", label: "What will you test next?", placeholder: "One customer segment, one offer, one channel. What result would make you continue or change direction?" },
      { key: "evidence", label: "What actually happened?", placeholder: "Record real interviews, usage, paid pilots, conversion or revenue. Separate measured results from estimates." },
      { key: "ask", label: "What do you need to move forward?", placeholder: "A customer introduction, technical help, a pilot, funding, or another specific next step." },
    ]
    : [
      { key: "audience", label: "Who is this for?", placeholder: "Be specific about the person, team and situation." },
      { key: "problem", label: "What is getting in their way?", placeholder: "Describe the problem, today's workaround, and the cost of leaving it unsolved." },
      { key: "outcome", label: "What changes when it works?", placeholder: "The useful result your customer should experience." },
      { key: "buildScope", label: "What should the first version do?", placeholder: "The essential user flow, required inputs, integrations, constraints, and what is explicitly out of scope." },
    ];

  if (mode === "agentlab") return (
    <div className="space-y-8">
      <header className="max-w-3xl space-y-3">
        <p className="pf-kicker">Agent & Device Lab</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Know what is connected.<br /><span className="text-lime-300">Keep control of what runs.</span></h1>
        <p className="text-muted-foreground leading-relaxed">The founder assistant and manual handoffs are separate from remote agents. None of the devices below has been connected or tested by this application.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { name: "Claude Code", role: "Intended coding-agent build path", status: "Not connected", action: "Export a coding brief" },
          { name: "Hermes Agent", role: "Priority runtime integration", status: "Not tested", action: "Export a runtime brief" },
          { name: "Agent Relay", role: "Priority agent-coordination integration", status: "Not tested", action: "Export a coordination brief" },
          { name: "Phone Harness", role: "Priority phone observation and control integration", status: "Not tested on your phones", action: "Export a phone-test brief" },
          { name: "Obsidian", role: "Founder knowledge in your own Markdown vault", status: "Manual file import only", action: "Download vault note" },
        ].map(item => (
          <article key={item.name} className="pf-panel space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold">{item.name}</h2><span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 px-3 py-1 text-xs text-amber-200"><Unplug className="h-3 w-3" />{item.status}</span></div>
            <p className="text-sm text-muted-foreground">{item.role}</p>
            <Button variant="outline" className="border-lime-300/40 text-lime-300" onClick={() => downloadBrief(brief, item.name)}><Download className="mr-2 h-4 w-4" />{item.action}</Button>
          </article>
        ))}
        <article className="pf-panel p-6 space-y-4">
          <ShieldCheck className="h-7 w-7 text-lime-300" />
          <h2 className="text-xl font-semibold">A real connection needs evidence.</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">Authorize the actual device, confirm its supported transport, test a read-only action, and verify the result before allowing screen control. Local tapping does not mean the model runs locally.</p>
          <Button variant="outline" onClick={() => navigate("copilot")}>Open founder assistant <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </article>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="max-w-3xl space-y-3">
        <p className="pf-kicker">{mode === "grow" ? "03 / Grow" : "02 / Build Studio"}</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{mode === "grow" ? "Make the next move measurable." : "A clearer brief. A better first build."}</h1>
        <p className="text-muted-foreground leading-relaxed">{mode === "grow" ? "Define one experiment and log the evidence. There are no connected analytics feeds or invented growth metrics here." : "Capture the intent and use case first. Then hand a focused scope to Claude Code or your chosen builder. This workspace exports instructions; it does not execute code remotely."}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="pf-panel space-y-5 p-5 md:p-7">
          <div className="space-y-2"><label htmlFor="founder-project" className="text-sm font-medium">Project name</label><Input id="founder-project" maxLength={200} value={brief.project} onChange={e => change("project", e.target.value)} placeholder="Your venture, in your words" /></div>
          {fields.map(field => <div key={field.key} className="space-y-2"><label htmlFor={`brief-${field.key}`} className="text-sm font-medium">{field.label}</label><Textarea id={`brief-${field.key}`} maxLength={2000} value={brief[field.key]} onChange={e => change(field.key, e.target.value)} placeholder={field.placeholder} className="min-h-28" /></div>)}
          <p className="text-xs text-muted-foreground">Kept in this page session only. Download before closing or refreshing. Writing here does not send your brief to a model or vendor.</p>
          <Button className="bg-lime-300 text-zinc-950 hover:bg-lime-200" onClick={() => downloadBrief(brief, mode === "grow" ? "Growth evidence" : "Claude Code")}><Download className="mr-2 h-4 w-4" />{mode === "grow" ? "Export experiment & evidence" : "Export Claude Code build brief"}</Button>
        </section>
        <aside className="space-y-4">
          <div className="pf-panel p-6 space-y-4"><FileText className="text-lime-300 h-7 w-7" /><h2 className="text-xl font-semibold">Your work should travel with you.</h2><p className="text-sm text-muted-foreground leading-relaxed">The Markdown handoff opens in Obsidian, a repository, or your coding agent. You decide where it goes and what happens next.</p><Button variant="outline" className="w-full" onClick={() => downloadBrief(brief, "Obsidian")}>Download Obsidian note</Button></div>
          <div className="pf-panel p-6 space-y-3"><CheckCircle2 className="text-lime-300 h-6 w-6" /><h2 className="text-lg font-semibold">Next useful step</h2><p className="text-sm text-muted-foreground">{mode === "grow" ? "Turn real evidence into your pitch narrative." : "Use the assistant to challenge your scope, then review the handoff before a build."}</p><Button variant="ghost" className="w-full justify-between text-lime-300" onClick={() => navigate(mode === "grow" ? "pitch" : "copilot")}>{mode === "grow" ? "Open Pitch Studio" : "Open founder assistant"}<ArrowRight className="h-4 w-4" /></Button></div>
        </aside>
      </div>
    </div>
  );
}
