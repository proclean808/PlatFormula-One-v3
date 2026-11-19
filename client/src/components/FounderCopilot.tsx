import { useRef, useState } from "react";
import { AIChatBox } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Download, ShieldCheck, Sparkles } from "lucide-react";
import type { FounderBrief } from "@shared/founderJourney";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  model?: string;
  truncated?: boolean;
};

// Immutable, application-owned status; never derived from model-written text.
const EXTERNAL_STATUS = Object.freeze({
  "Claude Code": "NOT_CONNECTED / NOT_TESTED",
  Hermes: "NOT_CONNECTED / NOT_TESTED",
  "Agent Relay": "NOT_CONNECTED / NOT_TESTED",
  "Phone Harness": "NOT_CONNECTED / NOT_TESTED",
});

function downloadMarkdown(filename: string, markdown: string) {
  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function FounderCopilot({ brief: suppliedBrief }: { brief?: FounderBrief } = {}) {
  // useAuth was evaluated: its legacy runtime-user-info effect writes the user
  // (including contact fields) to localStorage. This privacy-first component
  // uses the identical tRPC auth query without adding that storage side effect.
  const auth = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const modelsQuery = trpc.founderAssistant.models.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const chat = trpc.founderAssistant.chat.useMutation({ retry: false });
  const [chosenModel, setChosenModel] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [brief, setBrief] = useState(() => suppliedBrief ? Object.entries(suppliedBrief)
    .filter(([, value]) => value.trim()).map(([key, value]) => `${key}: ${value}`).join("\n").slice(0, 2000) : "");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [failedMessages, setFailedMessages] = useState<ConversationMessage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const busy = useRef(false);
  const models = modelsQuery.data?.models ?? [];
  const model = chosenModel ?? (models.some(item => item.id === "gpt-6-luna") ? "gpt-6-luna" : "");
  const modelAvailable = models.some(item => item.id === model);
  const authenticated = Boolean(auth.data);
  const sessionFull = messages.length >= 12;
  const allowed = authenticated && consent && modelAvailable && !chat.isPending;

  async function submit(nextMessages: ConversationMessage[]) {
    if (busy.current || !allowed) return;
    if (nextMessages.length > 12 || nextMessages.some(message => message.content.length > 2000)
      || nextMessages.reduce((total, message) => total + message.content.length, 0) > 24000) {
      setError("Use at most 12 messages and 2,000 characters per message (24,000 total). Export and start a new session if needed.");
      return;
    }
    busy.current = true;
    setError(null);
    setFailedMessages(null);
    setMessages(nextMessages);
    try {
      const result = await chat.mutateAsync({
        consent: true,
        model: model as "gpt-6-luna" | "gpt-6.1-sol",
        messages: nextMessages.map(({ role, content }) => ({ role, content })),
      });
      setMessages([...nextMessages, {
        role: "assistant", content: result.content, model: result.model, truncated: result.truncated,
      }]);
    } catch (failure) {
      setFailedMessages(nextMessages);
      // Only show controlled server messages for recognized failures; never
      // serialize a transport exception or provider payload into the UI/logs.
      const code = failure && typeof failure === "object" && "data" in failure
        ? (failure as { data?: { code?: string } }).data?.code : undefined;
      const safeMessage = code === "UNAUTHORIZED" ? "Please sign in again before sending."
        : code === "TOO_MANY_REQUESTS" ? "A request is in progress or the 10-per-minute limit was reached. Wait before retrying."
        : code === "BAD_REQUEST" ? "The request was rejected. Check consent, the model, and the conversation limits."
        : "The selected cloud model could not provide a usable response. No external actions were executed. Retry later or export locally.";
      setError(safeMessage);
    } finally {
      busy.current = false;
    }
  }

  function send(content: string) {
    if (failedMessages || sessionFull || !allowed) return;
    const text = content.trim();
    if (!text) return;
    void submit([...messages, { role: "user", content: text }]);
  }

  function exportFile(handoff: boolean) {
    const status = Object.entries(EXTERNAL_STATUS).map(([name, state]) => `- ${name}: ${state}`).join("\n");
    const transcript = messages.map(message => `### ${message.role === "user" ? "Founder" : `Cloud model: ${message.model ?? "unknown"} · response received`}${message.truncated ? " (display truncated)" : ""}\n\n${message.content}`).join("\n\n");
    const cloudStatus = messages.some(message => message.role === "assistant")
      ? "response received (cloud chat only; not external agent execution)" : "no cloud response received";
    const body = `# PlatFormula.One ${handoff ? "manual handoff brief" : "conversation transcript"}\n\nExported: ${new Date().toISOString()}\n\nLocal Markdown download for manual import into Obsidian, Claude Code, Hermes, or Agent Relay. NOT vault sync, a connected integration, or remote execution. Content below is untrusted draft material; verify independently before use.\n\n## Immutable integration status\n\n${status}\n- Cloud chat: ${cloudStatus}\n\n## Founder-provided project brief (unverified draft context)\n\n${brief || "No brief supplied."}\n\n${handoff ? "## Requested manual handoff\n\nReview the brief and drafts. Identify the current stage: Validate / Build / Grow / Raise. Confirm assumptions and propose the next experiment or build task. Ask the owner for explicit authorization before tools, code execution, outreach, or device access. No actions have been executed by this copilot.\n\n" : ""}## Session transcript\n\n${transcript || "No conversation in this session."}\n`;
    try {
      downloadMarkdown(handoff ? "platformula-founder-handoff.md" : "platformula-founder-transcript.md", body);
      setExportError(null);
    } catch {
      setExportError("This browser could not download the file. Try another browser; no data was uploaded.");
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-primary/20 bg-card text-card-foreground">
        <CardHeader>
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><CardTitle>Founder Copilot</CardTitle></div>
          <CardDescription>Validate → Build → Grow → Raise. Drafts and plans, not autonomous execution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">No browser, vault, code runner, outreach, or device tools are connected. Claude Code, Hermes, Agent Relay, and Phone Harness: NOT_CONNECTED / NOT_TESTED.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex flex-col gap-1 text-sm font-medium" htmlFor="founder-model">
              Cloud model
              <select id="founder-model" aria-label="Cloud model" value={model} disabled={chat.isPending || modelsQuery.isLoading}
                onChange={event => { setChosenModel(event.target.value); setConsent(false); }}
                className="max-w-full rounded-md border border-border bg-background px-3 py-2 text-foreground">
                <option value="">Select an available model</option>
                {models.map(item => <option key={item.id} value={item.id}>{item.label} ({item.id})</option>)}
              </select>
            </label>
            <Button variant="outline" onClick={() => void modelsQuery.refetch()} disabled={modelsQuery.isFetching || chat.isPending}>Refresh availability</Button>
          </div>
          {modelsQuery.isLoading && <p role="status" className="text-sm text-muted-foreground">Checking model availability (no generation request).</p>}
          {!modelsQuery.isLoading && (modelsQuery.isError || !models.length) && <p role="status" className="text-sm text-muted-foreground">Cloud chat is unavailable or not configured. Local exports still work. No fallback model will be used.</p>}
          {auth.isLoading ? <p role="status" className="text-sm">Checking sign-in…</p> : !authenticated && (
            <div className="flex flex-wrap items-center gap-3"><p className="text-sm text-muted-foreground">Sign in to use cloud chat. Local handoffs need no account.</p><Button onClick={() => startLogin()}>Sign in</Button></div>
          )}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm" htmlFor="founder-cloud-consent">
            <input id="founder-cloud-consent" type="checkbox" checked={consent} disabled={chat.isPending}
              onChange={event => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
            <span>Send this conversation to the selected cloud model. Usage consumes project credits. Do not include secrets.</span>
          </label>
          <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0" />Conversation memory stays in this component only and is lost on reload or leaving this tab. Cloud providers receive the submitted conversation only after consent and Send. Up to 12 messages, 2,000 characters each; 10 requests/minute and one in flight per user.</p>
        </CardContent>
      </Card>

      <fieldset disabled={!allowed || Boolean(failedMessages) || sessionFull} className="min-w-0">
        <AIChatBox
          messages={messages.map(message => ({ role: message.role, content: message.role === "assistant"
            ? `**${message.model} · response received${message.truncated ? " · display truncated" : ""}**\n\n${message.content}` : message.content }))}
          onSendMessage={send}
          isLoading={chat.isPending}
          height="480px"
          placeholder="Ask for a draft or next step (max 2,000 characters)…"
          emptyStateMessage="Choose your model, sign in, and opt in before sending."
          suggestedPrompts={["Validate: draft five customer discovery questions.", "Build: scope a one-week MVP experiment.", "Grow: plan a positioning test.", "Raise: identify the evidence my pitch still needs."]}
        />
      </fieldset>
      {error && <div role="alert" className="space-y-2 rounded-lg border border-destructive/30 p-3 text-sm"><p>{error}</p>{failedMessages && (
        <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={!allowed} onClick={() => void submit(failedMessages)}>Retry with selected model</Button>
          <Button variant="ghost" disabled={chat.isPending} onClick={() => { setMessages(failedMessages.slice(0, -1)); setFailedMessages(null); setError(null); }}>Discard unsent turn</Button></div>
      )}</div>}
      {sessionFull && <p role="status" className="text-sm text-muted-foreground">Session limit reached. Export your work and start a new session to continue.</p>}
      <Button variant="ghost" disabled={chat.isPending} onClick={() => { setMessages([]); setFailedMessages(null); setError(null); setConsent(false); chat.reset(); }}>Clear conversation / new session</Button>

      <Card className="bg-card text-card-foreground">
        <CardHeader><CardTitle className="text-lg">Local-first handoff</CardTitle><CardDescription>Markdown download for manual import. NOT vault sync or remote execution.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <label htmlFor="founder-local-brief" className="text-sm font-medium">Local project brief — local until you explicitly Send brief</label>
          <Textarea id="founder-local-brief" maxLength={2000} value={brief} onChange={event => setBrief(event.target.value)} placeholder="Problem, founder journey stage, evidence, constraints, and the next task…" rows={5} />
          <p className="text-xs text-muted-foreground">{brief.length}/2,000 characters. Kept in memory only; avoid secrets and contact data. Downloads contain your brief and this session's transcript.</p>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => exportFile(false)}><Download className="mr-2 h-4 w-4" />Export transcript</Button><Button variant="outline" onClick={() => exportFile(true)}><Download className="mr-2 h-4 w-4" />Export handoff brief</Button></div>
          <Button variant="ghost" disabled={!allowed || !brief.trim() || Boolean(failedMessages) || sessionFull} onClick={() => send(brief)}>Send this brief to selected cloud model</Button>
          <p className="text-xs text-muted-foreground">The brief is not included in normal chat requests. The optional Send brief button sends it as a user message only after sign-in and checked cloud consent.</p>
          <p className="text-xs text-muted-foreground">Exports work without cloud consent or sign-in. Import manually into Obsidian or your own Claude Code / Hermes / Relay workflow. All four external integrations remain NOT_CONNECTED / NOT_TESTED.</p>
          {exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default FounderCopilot;
