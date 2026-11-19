import { z } from "zod";
import type { FounderBrief } from "./founderJourney";

export const founderGoalIds = ["website", "mobile", "pitch", "venture"] as const;
export type FounderGoal = typeof founderGoalIds[number];
export const goalGuidance: Record<FounderGoal, { greeting: string; nextStep: string }> = {
  website: { greeting: "Let’s give your website a clear job.", nextStep: "Who should arrive, what should they understand, and what should they do next?" },
  mobile: { greeting: "Let’s shape the app around one useful moment.", nextStep: "Name the person using it, the task they need to finish, and the simplest mobile flow." },
  pitch: { greeting: "Let’s turn your evidence into an investor story.", nextStep: "Start with the problem, your solution, what you can prove, and the ask. We’ll keep unknowns visible." },
  venture: { greeting: "Let’s connect the whole venture—not just its tools.", nextStep: "Choose the first customer outcome, then align the website, app, launch and pitch around it." },
};
export const greetingResultSchema = z.object({ greeting: z.string().trim().min(1).max(300), nextStep: z.string().trim().min(1).max(700) }).strict();
export const pitchSections = [
  { id: "problem", title: "Problem" }, { id: "solution", title: "Solution" }, { id: "market", title: "Market" },
  { id: "traction", title: "Traction" }, { id: "team", title: "Team" }, { id: "business_model", title: "Business Model" },
  { id: "competition", title: "Competition" }, { id: "ask", title: "The Ask" }, { id: "vision", title: "Vision" }, { id: "product", title: "Product" },
] as const;
export type PitchSectionId = typeof pitchSections[number]["id"];
export const pitchDraftSchema = z.object({ slides: z.array(z.object({ id: z.enum(["problem","solution","market","traction","team","business_model","competition","ask","vision","product"]), content: z.string().trim().min(1).max(1200) }).strict()).length(10) }).strict().superRefine((data, ctx) => {
  if (new Set(data.slides.map(slide => slide.id)).size !== 10) ctx.addIssue({ code: "custom", message: "Each of the ten sections must appear exactly once." });
});
export const refinementModelSchema = z.enum(["gpt-6-luna", "gpt-6.1-sol"]);
export type RefinementModel = z.infer<typeof refinementModelSchema>;
export const greetingInputSchema = z.object({ consent: z.literal(true), model: refinementModelSchema, goal: z.enum(founderGoalIds), intent: z.string().trim().max(2000) }).strict();
export const pitchInputSchema = z.object({ consent: z.literal(true), model: refinementModelSchema, brief: z.string().trim().min(10).max(5000) }).strict();

export function briefToPitchText(brief?: FounderBrief): string {
  if (!brief) return "";
  return Object.entries(brief).filter(([,value]) => value.trim()).map(([key,value]) => `${key}: ${value}`).join("\n").slice(0,5000);
}
export function localPitchDraft(brief: string): Record<string,string> {
  const supplied = brief.trim().slice(0,5000);
  return Object.fromEntries(pitchSections.map(({id,title}) => [id, id === "product" && supplied ? `Founder-provided context (unverified):\n${supplied}\n\nRefine this into your product workflow.` : `[To complete: ${title}]\nAdd founder-supplied facts and evidence. No market size, traction, team or funding claim has been invented.`]));
}
export function pitchDraftToRecord(draft: z.infer<typeof pitchDraftSchema>): Record<string,string> { return Object.fromEntries(draft.slides.map(slide=>[slide.id,slide.content])); }
