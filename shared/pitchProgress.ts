import { pitchSections } from "./founderRefinements";

export const PITCH_WORKFLOW_STEPS = ["Brief", "Generate", "Review", "Preview"] as const;
export function pitchWorkflowState(input: { brief: string; generating: boolean; hasDraft: boolean; applied: boolean; hasExistingSlides: boolean }) {
  if (input.generating) return { index: 1, message: "Generating a draft. Progress is indeterminate; wait for a reviewable response." };
  if (input.hasDraft) return { index: 2, message: "Review the draft, then apply it to empty slides. Existing content stays unchanged." };
  if (input.applied) return { index: 3, message: "Draft applied to the preview. Edit and review founder facts before presenting." };
  if (input.hasExistingSlides) return { index: 3, message: "Existing slides are available to preview and edit. Their facts are not verified by this indicator." };
  if (input.brief.trim().length >= 10) return { index: 1, message: "Brief ready. Choose an AI draft with consent or a local scaffold." };
  return { index: 0, message: "Start by adding founder context, evidence and your ask below." };
}
export function pitchSectionProgress(slides: Record<string, string>, activeSlide: string) {
  const index = Math.max(0, pitchSections.findIndex(section => section.id === activeSlide));
  return {
    position: index + 1,
    total: pitchSections.length,
    title: pitchSections[index].title,
    populated: pitchSections.filter(section => Boolean(slides[section.id]?.trim())).length,
  };
}
