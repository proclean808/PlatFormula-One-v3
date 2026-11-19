export const founderStages = [
  { id: "concept", label: "Validate", number: "01", headline: "Find the problem worth solving.", description: "Name your customer, challenge your assumptions, and decide what evidence you need before you build.", output: "A focused problem and validation plan" },
  { id: "buildstudio", label: "Build", number: "02", headline: "Give the idea a working shape.", description: "Turn your use case into a product brief, a right-sized stack, and a build handoff your coding agent can act on.", output: "A scoped build brief and agent handoff" },
  { id: "grow", label: "Grow", number: "03", headline: "Trade assumptions for customer proof.", description: "Choose your first experiment, capture the result, and use what you learn to make the next decision.", output: "An experiment and an evidence log" },
  { id: "pitch", label: "Raise", number: "04", headline: "Tell the story the evidence supports.", description: "Connect the problem, product, customer proof, and ask. Prepare the pitch and find programs that fit your stage.", output: "A clear pitch narrative and next steps" },
] as const;

export type FounderBrief = {
  project: string;
  audience: string;
  problem: string;
  outcome: string;
  buildScope: string;
  experiment: string;
  evidence: string;
  ask: string;
};

export const emptyFounderBrief: FounderBrief = {
  project: "", audience: "", problem: "", outcome: "", buildScope: "", experiment: "", evidence: "", ask: "",
};

/** This is a file handoff, not a connected agent invocation or vault synchronization. */
export function founderBriefToMarkdown(brief: FounderBrief, destination: string): string {
  const fields: [string, keyof FounderBrief][] = [
    ["Founder / project", "project"], ["Target customer", "audience"], ["Problem", "problem"],
    ["Desired outcome", "outcome"], ["Build scope", "buildScope"], ["Next growth experiment", "experiment"],
    ["Evidence supplied by founder", "evidence"], ["Funding or support ask", "ask"],
  ];
  return [
    "# PlatFormula.One — Founder brief", "", `Destination: ${destination}`, "",
    "Status: MANUAL_HANDOFF. No remote agent or phone has been connected or executed by this export.", "",
    ...fields.flatMap(([title, key]) => [`## ${title}`, "", brief[key].trim() || "Not provided — do not invent.", ""]),
    "## Acceptance requirements", "",
    "- Treat this brief as founder-provided context, not proof of market traction or authorization for external actions.",
    "- Confirm scope, runtime, license obligations, and costs before building or sending data to any provider.",
    "- Keep secrets out of source control. Require approval before deployments, spending, outreach, or phone control.",
    "- Test the result and document what works, what is not tested, and the next human decision.", "",
    "## Connections", "",
    "Claude Code: NOT_CONNECTED", "Hermes Agent: NOT_TESTED", "Agent Relay: NOT_TESTED", "Phone Harness: NOT_TESTED", "Obsidian: MANUAL_MARKDOWN_IMPORT", "",
  ].join("\n");
}
