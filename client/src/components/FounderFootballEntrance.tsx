import { useState } from "react";
import { ArrowRight, Play, Search, Youtube } from "lucide-react";

const tiles = [
  {title:"Founder Football",desc:"Phones, laptops, GPU compute, power and cases",query:"founder equipment"},
  {title:"Build My Lab",desc:"Configure a portable or desktop AI lab",query:"AI lab"},
  {title:"Agent Council",desc:"Models, MCP connections and governed execution",query:"agent"},
  {title:"Venture Radar",desc:"Startup opportunities and investor intelligence",query:"venture"},
  {title:"Partner Network",desc:"Affiliate suppliers, software and services",query:"partners"},
  {title:"Evidence Ledger",desc:"Proof, approvals and verified milestones",query:"evidence"}
];
function videoId(value:string) {
  const s=value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try { const u=new URL(s); if(u.hostname==="youtu.be") return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):""; if(["youtube.com","www.youtube.com","m.youtube.com","youtube-nocookie.com","www.youtube-nocookie.com"].includes(u.hostname)){ const v=u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1] || ""; return /^[\w-]{11}$/.test(v)?v:""; } }catch{}
  return "";
}
export default function FounderFootballEntrance({onExplore}:{onExplore:(query:string)=>void}) {
 const [message,setMessage]=useState("");
 const [video,setVideo]=useState("");
 const [loaded,setLoaded]=useState("");
 const [filter,setFilter]=useState("");
 const visible=tiles.filter(t=>(t.title+" "+t.desc).toLowerCase().includes(filter.toLowerCase()));
 const id=videoId(video);
 return <section aria-label="Founder Football conversational entrance" className="mb-10 space-y-6">
  <div className="rounded-3xl border border-red-500/40 bg-gradient-to-br from-[#1b1719] via-[#121214] to-[#290e13] p-5 sm:p-10 text-white shadow-xl">
   <p className="text-xs font-bold uppercase tracking-[.25em] text-red-400">PlatFormula.One / Founder Football</p>
   <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">YOUR COMPANY STARTS WITH A CONVERSATION.</h1>
   <p className="mt-4 max-w-3xl text-base text-zinc-300">Tell us what you're building. Assemble the AI, software, hardware, partners and proof to bring it to market.</p>
   <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={e=>{e.preventDefault();if(message.trim())onExplore(message.trim());}}>
    <label htmlFor="founder-intent" className="sr-only">Describe your founder goal</label>
    <input id="founder-intent" value={message} onChange={e=>setMessage(e.target.value)} placeholder="What are you trying to build?" className="min-h-14 w-full flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500"/>
    <button type="submit" disabled={!message.trim()} className="min-h-14 rounded-xl bg-red-600 px-6 font-bold text-white hover:bg-red-500 disabled:opacity-50">Explore your build <ArrowRight className="ml-2 inline h-4 w-4"/></button>
   </form>
   <p className="mt-3 text-xs text-zinc-400">Starts a resource search. Live AI conversation requires an authenticated inference connection.</p>
  </div>
  <div className="space-y-3">
   <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Choose your starting grid</h2><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400"/><input aria-label="Filter founder tiles" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter tiles" className="rounded-lg border border-white/20 bg-black/30 py-2 pl-9 pr-3 text-sm"/></div></div>
   <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{visible.map(t=><button key={t.title} onClick={()=>onExplore(t.query)} className="min-h-36 rounded-2xl border border-white/15 bg-white/5 p-4 text-left transition hover:border-red-500 hover:bg-red-500/10"><span className="text-base font-bold">{t.title}</span><span className="mt-2 block text-sm text-zinc-400">{t.desc}</span><ArrowRight className="mt-3 h-4 w-4 text-red-400"/></button>)}</div>
  </div>
  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-6">
   <div className="mb-3 flex items-center gap-2"><Youtube className="h-6 w-6 text-red-500"/><h2 className="text-xl font-bold">Founder Video Theater</h2></div>
   <p className="mb-4 text-sm text-zinc-400">Paste a public YouTube link or video ID to play it here. Embedding depends on the video's owner settings.</p>
   <form className="mb-4 flex gap-2" onSubmit={e=>{e.preventDefault();setLoaded(id);}}><input aria-label="YouTube URL" value={video} onChange={e=>setVideo(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="min-w-0 flex-1 rounded-lg border border-white/20 bg-black/30 p-3 text-sm"/><button disabled={!id} className="rounded-lg bg-red-600 px-4 font-semibold disabled:opacity-50"><Play className="inline h-4 w-4"/> Load</button></form>
   {loaded?<div className="aspect-video overflow-hidden rounded-xl bg-black"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${loaded}`} title="Founder Football YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy"/></div>:<div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/40 text-center text-sm text-zinc-400">Your embedded YouTube video appears here</div>}
  </div>
 </section>;
}
