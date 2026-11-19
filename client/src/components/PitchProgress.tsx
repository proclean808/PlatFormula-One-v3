import { Check, Loader2 } from "lucide-react";
import { PITCH_WORKFLOW_STEPS, pitchSectionProgress, pitchWorkflowState } from "@shared/pitchProgress";

type Props = { brief: string; generating: boolean; hasDraft: boolean; applied: boolean; slides: Record<string, string>; activeSlide: string };
export default function PitchProgress(props: Props) {
  const sections = pitchSectionProgress(props.slides, props.activeSlide);
  const workflow = pitchWorkflowState({ ...props, hasExistingSlides: sections.populated > 0 });
  const observed = [props.brief.trim().length >= 10, props.hasDraft || props.applied, props.applied, false];
  return <section aria-labelledby="pitch-workflow-title" className="rounded-xl border border-violet-300/20 bg-black/15 p-4 space-y-3">
    <h3 id="pitch-workflow-title" className="text-sm font-semibold text-violet-100">Your pitch workflow</h3>
    <ol aria-label="Pitch generation steps" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {PITCH_WORKFLOW_STEPS.map((label, index) => {
        const current = workflow.index === index;
        const passed = observed[index] && !current;
        return <li key={label} aria-current={current ? "step" : undefined} className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-xs ${current ? "border-violet-400 bg-violet-500/20 text-violet-100" : "border-violet-200/15 text-violet-200/60"}`}>
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${current ? "bg-violet-400 text-violet-950" : "bg-white/5"}`} aria-hidden="true">{current && props.generating ? <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" /> : passed ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>
          <span>{label}</span>
        </li>;
      })}
    </ol>
    <p role="status" className="text-xs leading-relaxed text-violet-200/75">{workflow.message}</p>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-violet-200"><span id="pitch-slide-position-label">Slide {sections.position} of {sections.total} · {sections.title}</span><span>{sections.populated}/{sections.total} sections contain text</span></div>
    <div role="progressbar" aria-labelledby="pitch-slide-position-label" aria-valuemin={0} aria-valuemax={sections.total} aria-valuenow={sections.position} aria-valuetext={`Slide ${sections.position} of ${sections.total}: ${sections.title}`} className="h-1.5 overflow-hidden rounded-full bg-violet-100/10"><div className="h-full w-full origin-left rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-300" style={{ transform: `scaleX(${sections.position / sections.total})` }} /></div>
    <p className="text-[10px] text-violet-200/55">Workflow location and slide position—not factual validation or investor readiness.</p>
  </section>;
}
