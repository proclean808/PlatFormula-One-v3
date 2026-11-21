import { lazy, Suspense, useState } from "react";
import { Rocket, Database, Wrench, Mic, ListChecks, Users, FileText, Lightbulb, Bot, Eye, Shield, Zap, Layout, TrendingUp, ArrowUpRight, ArrowLeft } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import { emptyFounderBrief, type FounderBrief } from "@shared/founderJourney";

const Resources = lazy(() => import("@/components/Resources"));
const Builder = lazy(() => import("@/components/Builder"));
const PitchStudio = lazy(() => import("@/components/PitchStudio"));
const Tracking = lazy(() => import("@/components/Tracking"));
const Community = lazy(() => import("@/components/Community"));
const ApplicationAssistant = lazy(() => import("@/components/ApplicationAssistant"));
const ConceptRefinement = lazy(() => import("@/components/ConceptRefinement"));
const FounderCopilot = lazy(() => import("@/components/FounderCopilot"));
const FounderWorkbench = lazy(() => import("@/components/FounderWorkbench"));
const FinishLineSDK = lazy(() => import("@/components/FinishLineSDK").then(module => ({ default: module.FinishLineSDK })));
const VentureVision = lazy(() => import("@/components/VentureVision").then(module => ({ default: module.VentureVision })));
const VentureVault = lazy(() => import("@/components/VentureVault").then(module => ({ default: module.VentureVault })));
const PageTemplates = lazy(() => import("@/components/PageTemplates").then(module => ({ default: module.PageTemplates })));
const RelatedFounderResources = lazy(() => import("@/components/RelatedFounderResources"));
const ForumProgramRouter = lazy(() => import("@/components/ForumProgramRouter"));
const FounderFinancialStack = lazy(() => import("@/components/FounderFinancialStack"));

const mainNavigation = [
  { id: "dashboard", label: "Home", icon: Rocket },
  { id: "venturestudio", label: "Venture Studio", icon: Wrench },
  { id: "resources", label: "Startup Resources", icon: Database },
  { id: "tracking", label: "Evidence", icon: ListChecks },
  { id: "subdomains", label: "Coming Soon", icon: Zap },
];
const studioWorkspaces = [
  { id: "concept", label: "Validate the idea", icon: Lightbulb, description: "Name the problem and challenge the assumptions before you build.", stage: "01 / Validate" },
  { id: "buildstudio", label: "Website & mobile build brief", icon: Wrench, description: "Define the first version and export a scope for your chosen coding agent.", stage: "02 / Build" },
  { id: "pitch", label: "Pitch Studio", icon: Mic, description: "Shape the investor narrative and review your slide outline.", stage: "04 / Raise" },
  { id: "grow", label: "Growth experiments", icon: TrendingUp, description: "Record what you are testing, what happened, and the next useful move.", stage: "03 / Grow" },
  { id: "copilot", label: "Founder Assistant", icon: Bot, description: "Optional authenticated cloud-model planning. Processing requires your choice.", stage: "Planning" },
  { id: "financialstack", label: "Financial Infrastructure & Perks", icon: Database, description: "Compare source-backed operating tools, public terms and conditional perks. No account is connected.", stage: "Founder operations" },
  { id: "application", label: "Accelerator applications", icon: Rocket, description: "Explore Forum programs by your actual stage and prepare an evidence-backed application story.", stage: "Founder programs" },
  { id: "venturevault", label: "Venture Vault", icon: Shield, description: "Explore the existing founder knowledge workspace and its current features.", stage: "Knowledge" },
  { id: "agentlab", label: "Agent connections", icon: Zap, description: "See actual connection status. Native LiveKit and phone agents are not connected yet.", stage: "Integration status" },
];
const moreWorkspaces = [
  { id: "builder", label: "Application Engine", icon: FileText },
  { id: "community", label: "Community", icon: Users },
  { id: "finishline", label: "Manus Build Guide", icon: Rocket },
  { id: "venturevision", label: "Venture Vision", icon: Eye },
  { id: "templates", label: "Page Templates", icon: Layout },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [brief, setBrief] = useState<FounderBrief>({ ...emptyFounderBrief });
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [copilotVisited, setCopilotVisited] = useState(false);
  const navigate = (tab: string) => {
    setActiveTab(tab === "toolkit" || tab === "aimodels" ? "resources" : tab);
    if (tab === "copilot") setCopilotVisited(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const findResources = (query: string) => { setDirectoryQuery(query); navigate("resources"); };
  const startGoal = (scope: string, intent: string, destination: string) => { setBrief(current => ({ ...current, buildScope: scope, outcome: intent || current.outcome })); navigate(destination); };
  const activePrimary = mainNavigation.some(item => item.id === activeTab) ? activeTab : "venturestudio";

  return <div className="min-h-screen bg-background text-foreground">
    <a href="#founder-content" className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:bg-violet-300 focus:p-4 focus:text-black">Skip to content</a>
    <header className="sticky top-0 z-50 border-b border-violet-300/20 bg-[#191323] text-white">
      <div className="container py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate("dashboard")} className="flex items-center gap-3 text-left" aria-label="PlatFormula.One home"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-400 text-violet-950"><Rocket className="h-6 w-6" /></span><span><span className="block text-xl sm:text-2xl font-semibold tracking-tight">PlatFormula.<span className="text-violet-300">One</span></span><span className="block text-[11px] sm:text-xs text-violet-100/70">AI-Native Accelerator & Venture Studio</span></span></button>
        <button className="hidden md:block rounded-xl border border-violet-300/40 px-4 py-3 text-sm font-semibold text-violet-200 hover:bg-violet-300/10" onClick={() => navigate("venturestudio")}>Explore your workspace <ArrowUpRight className="inline ml-1 h-4 w-4" /></button>
      </div>
      <nav aria-label="Main navigation" className="container pb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{mainNavigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { if (id === "resources") setDirectoryQuery(""); navigate(id); }} aria-current={activePrimary === id ? "page" : undefined} className={`min-h-11 rounded-xl border px-3 sm:px-5 py-2.5 text-[13px] sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activePrimary === id ? "bg-violet-500 border-violet-400 text-white" : "border-white/10 bg-white/5 text-violet-100 hover:bg-white/10"}`}><Icon className="h-4 w-4 shrink-0" />{label}</button>)}</nav>
    </header>
    <main id="founder-content" className="container py-6 sm:py-8 md:py-12">
      {activePrimary === "venturestudio" && activeTab !== "venturestudio" && <button onClick={() => navigate("venturestudio")} className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-violet-300/25 px-4 text-sm text-violet-200 hover:bg-violet-300/10"><ArrowLeft className="h-4 w-4" />Back to Venture Studio</button>}
      <Suspense fallback={<div role="status" className="pf-panel p-8 text-violet-200">Opening your workspace…</div>}>
        {activeTab === "subdomains" && <section className="space-y-6" aria-labelledby="subdomain-heading"><header className="space-y-3"><p className="text-xs font-semibold uppercase tracking-widest text-violet-300">PlatFormula.One ecosystem</p><h1 id="subdomain-heading" className="text-3xl sm:text-5xl font-semibold">Coming Soon — Subdomain Directory</h1><p className="max-w-3xl text-zinc-300">Quantum Loop: Leap to Anything. Planned destinations below are roadmap announcements, not active services. Links will be enabled after DNS, deployment, and acceptance verification.</p></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[{host:"discourse.platformula.one",title:"Discourse Community",description:"Discussions, public roadmap, plugin requests and founder collaboration."},{host:"harness.platformula.one",title:"Harness Rooms",description:"Portable multi-model rooms and Pair-Chain mission execution."},{host:"plugins.platformula.one",title:"Trusted Plugin Foundry",description:"Generate, validate, sign and provision authorized MCP integrations."},{host:"agents.platformula.one",title:"Agent Presence",description:"Identity, discovery and Pair-Chain registry."},{host:"memory.platformula.one",title:"Memory Fabric",description:"Permissioned conversational memory and mission checkpoints."},{host:"voice.platformula.one",title:"Voice and LiveKit",description:"Joyce, SIP and WebRTC mission sessions."}].map(item=><article key={item.host} className="rounded-2xl border border-violet-300/20 bg-[#251e32] p-5 space-y-3"><div className="flex items-center justify-between gap-2"><h2 className="text-lg font-semibold">{item.title}</h2><span className="rounded-full border border-violet-300/30 px-2 py-1 text-xs text-violet-200">Coming Soon</span></div><p className="text-sm text-zinc-300">{item.description}</p><p className="break-all font-mono text-xs text-violet-300">{item.host}</p></article>)}</div><p className="text-xs text-zinc-400">A listed hostname is a planned destination. No DNS or production deployment is implied.</p></section>}
        {activeTab === "dashboard" && <Dashboard setActiveTab={navigate} onStartGoal={startGoal} onFindResources={findResources} onCaptureIntent={intent => { setBrief(current => ({ ...current, outcome: intent })); navigate("buildstudio"); }} />}
        {activeTab === "venturestudio" && <section className="space-y-8"><header className="space-y-3 max-w-3xl"><p className="text-xs font-semibold tracking-widest uppercase text-violet-300">The AI-Native founder workspace</p><h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Your venture. One working place.</h1><p className="text-zinc-300 leading-relaxed">Validate, build, grow and raise without hunting through scattered tabs. Pick the next job; everything else stays within reach.</p></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{studioWorkspaces.map(({ id, label, icon: Icon, description, stage }) => <button key={id} onClick={() => navigate(id)} className="group rounded-2xl border border-violet-300/20 bg-gradient-to-br from-[#251e32] to-[#17131e] p-6 text-left transition-colors hover:border-violet-300/60 flex flex-col items-start gap-4"><div className="w-full flex items-center justify-between gap-2"><span className="text-xs text-violet-300">{stage}</span><Icon className="h-5 w-5 text-violet-300" /></div><h2 className="text-xl font-semibold text-white">{label}</h2><p className="text-sm text-zinc-300 leading-relaxed flex-1">{description}</p><span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200">Open workspace <ArrowUpRight className="h-4 w-4" /></span></button>)}</div><details className="rounded-2xl border border-violet-300/20 p-5"><summary className="cursor-pointer font-semibold text-violet-200">More workspaces</summary><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{moreWorkspaces.map(({id, label, icon: Icon}) => <button key={id} onClick={() => navigate(id)} className="flex min-h-12 items-center gap-2 rounded-xl border border-white/15 p-3 text-left text-sm text-zinc-200 hover:bg-white/5"><Icon className="h-4 w-4" />{label}</button>)}</div></details><div className="rounded-2xl border border-violet-300/20 p-6 space-y-3"><h2 className="text-xl font-semibold">Looking for an external app, program or investor?</h2><p className="text-sm leading-relaxed text-zinc-300">They now live in one searchable Startup Resources directory, not separate tool or model tabs.</p><button onClick={() => findResources("")} className="min-h-11 inline-flex items-center gap-2 rounded-lg bg-violet-400 px-4 py-2 text-sm font-semibold text-violet-950">Open Startup Resources <ArrowUpRight className="h-4 w-4" /></button></div></section>}
        {activeTab === "resources" && <Resources onNavigate={navigate} initialQuery={directoryQuery} />}
        {activeTab === "builder" && <Builder />}
        {activeTab === "pitch" && <PitchStudio brief={brief} />}
        {activeTab === "tracking" && <Tracking />}
        {activeTab === "community" && <Community />}
        {activeTab === "application" && <div className="space-y-10"><ForumProgramRouter /><ApplicationAssistant /></div>}
        {activeTab === "financialstack" && <FounderFinancialStack />}
        {activeTab === "concept" && <ConceptRefinement />}
        {activeTab === "concept" && <RelatedFounderResources placement="validation" title="Customer discovery and validation resources" />}
        {activeTab === "application" && <RelatedFounderResources placement="raise" title="Investor sharing and equity resources" />}
        {copilotVisited && <div hidden={activeTab !== "copilot"}><FounderCopilot brief={brief} /></div>}
        {(activeTab === "buildstudio" || activeTab === "grow" || activeTab === "agentlab") && <FounderWorkbench mode={activeTab} brief={brief} onChange={setBrief} navigate={navigate} />}
        {activeTab === "finishline" && <FinishLineSDK />}
        {activeTab === "venturevision" && <VentureVision />}
        {activeTab === "venturevault" && <VentureVault />}
        {activeTab === "templates" && <PageTemplates />}
      </Suspense>
    </main>
    <footer className="border-t border-violet-300/20 bg-[#17111f] mt-10"><div className="container py-8 grid gap-6 md:grid-cols-[1.5fr_1fr_1fr]"><div className="space-y-3"><p className="text-xl font-semibold">PlatFormula.<span className="text-violet-300">One</span></p><p className="max-w-md text-sm text-zinc-300 leading-relaxed">From intent to a focused build, customer evidence, and an investor-ready story.</p><p className="text-xs leading-relaxed text-zinc-400">Independent resources are not partnerships. Native conversation and phone-agent connections remain pending setup.</p></div><div className="space-y-3"><p className="font-semibold text-violet-200">One place to move forward</p>{mainNavigation.slice(1).map(item => <button key={item.id} className="block min-h-9 text-sm text-zinc-300 hover:text-violet-200" onClick={() => navigate(item.id)}>{item.label}</button>)}</div><div className="space-y-3"><p className="font-semibold text-violet-200">Talk to us</p><a href="tel:4156954604" className="block text-sm text-zinc-300">415-695-4604</a><a href="https://lnkd.in/gjMdVuAf" target="_blank" rel="noopener noreferrer" className="block text-sm text-violet-300">LinkedIn</a><button onClick={() => navigate("agentlab")} className="block min-h-9 text-sm text-zinc-300 hover:text-violet-200">Connection status</button></div></div><div className="container pb-6 text-xs text-zinc-400">© {new Date().getFullYear()} PlatFormula.One · Version 3. Your intent. Your venture. Your next move.</div></footer>
  </div>;
}
