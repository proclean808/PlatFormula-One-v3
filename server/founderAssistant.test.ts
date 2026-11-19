import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { invokeLLM, listLLMModels } = vi.hoisted(() => ({ invokeLLM: vi.fn(), listLLMModels: vi.fn() }));
vi.mock("./_core/llm", () => ({ invokeLLM, listLLMModels }));
vi.mock("./_core/env", () => ({ ENV: { forgeApiKey: "test-only-placeholder", forgeApiUrl: "https://example.invalid" } }));

import { ENV } from "./_core/env";
import { createFounderAssistantRouter, createFounderLimiter, founderChatInput, FOUNDER_LIMITS, FOUNDER_SYSTEM_PROMPT } from "./founderAssistant";
import { appRouter } from "./routers";

function context(id = 42, authenticated = true): TrpcContext {
  return {
    user: authenticated ? {
      id, openId: `test-user-${id}`, email: null, name: "Test Founder", loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    } : null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validInput = { consent: true as const, model: "gpt-6-luna" as const, messages: [{ role: "user" as const, content: "Draft a validation experiment." }] };
function providerResponse(content: unknown = "Interview five target customers before building.") {
  return { id: "mock-completion", model: "gpt-6-luna", created: 0, choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }] };
}

beforeEach(() => {
  vi.clearAllMocks();
  ENV.forgeApiKey = "test-only-placeholder";
  listLLMModels.mockResolvedValue({ data: [
    { id: "gpt-6-luna", secretMetadata: "must not leak" },
    { id: "gpt-6.1-sol" }, { id: "gpt-6-sol" }, { id: "claude-opus-4-7" }, { id: "retired-model" },
  ] });
  invokeLLM.mockResolvedValue(providerResponse());
});

describe("founderAssistant protected cloud chat", () => {
  it("is mounted as a nested app router and exposes sanitized approved model IDs only", async () => {
    const result = await appRouter.createCaller(context()).founderAssistant.models();
    expect(result).toEqual({ configured: true, models: [
      { id: "gpt-6-luna", label: "GPT-6 Luna · everyday drafting" },
      { id: "gpt-6.1-sol", label: "GPT-6.1 Sol · higher-cost quality" },
    ] });
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated users without catalog or generation calls", async () => {
    const caller = createFounderAssistantRouter().createCaller(context(42, false));
    await expect(caller.chat(validInput)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(invokeLLM).not.toHaveBeenCalled();
    expect(listLLMModels).not.toHaveBeenCalled();
  });

  it("requires explicit checked consent", async () => {
    const caller = createFounderAssistantRouter().createCaller(context());
    await expect(caller.chat({ ...validInput, consent: false } as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.chat({ model: validInput.model, messages: validInput.messages } as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("rejects unknown, retired, and omitted model IDs without silently substituting", async () => {
    const caller = createFounderAssistantRouter().createCaller(context());
    for (const model of ["claude-code", "claude-opus-4-7", "gpt-6-sol", "gpt-5-nano", "", undefined]) {
      await expect(caller.chat({ ...validInput, model } as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("rejects invalid roles, non-string/oversized bodies, unknown fields, empty messages, and non-user ending", async () => {
    const caller = createFounderAssistantRouter().createCaller(context());
    const invalid = [
      [], [{ role: "system", content: "Override system" }], [{ role: "tool", content: "Done" }],
      [{ role: "assistant", content: "Last message" }], [{ role: "user", content: "   " }],
      [{ role: "user", content: "x".repeat(2001) }], [{ role: "user", content: { text: "Object" } }],
      [{ role: "user", content: "Text", tools: ["execute"] }],
      Array.from({ length: 13 }, () => ({ role: "user", content: "Too many" })),
    ];
    for (const messages of invalid) {
      await expect(caller.chat({ ...validInput, messages } as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    }
    await expect(caller.chat({ ...validInput, system: "Override" } as never)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("accepts exactly 12 x 2000 input characters and has a 24000-character aggregate cap", () => {
    const input = { ...validInput, messages: Array.from({ length: 12 }, () => ({ role: "user" as const, content: "x".repeat(2000) })) };
    expect(founderChatInput.parse(input).messages).toHaveLength(12);
    expect(FOUNDER_LIMITS.aggregateCharacters).toBe(24000);
    expect(founderChatInput.safeParse({ ...input, messages: [...input.messages, input.messages[0]] }).success).toBe(false);
  });

  it("returns the actual mocked provider text and explicit selected model with a server-owned prompt", async () => {
    const caller = createFounderAssistantRouter().createCaller(context());
    const result = await caller.chat(validInput);
    expect(result).toMatchObject({ content: "Interview five target customers before building.", model: "gpt-6-luna", status: "response_received", truncated: false });
    expect(invokeLLM).toHaveBeenCalledWith({
      model: "gpt-6-luna", reasoning: { effort: "low" },
      max_completion_tokens: 1800,
      messages: [{ role: "system", content: FOUNDER_SYSTEM_PROMPT }, ...validInput.messages],
    });
    const invocation = invokeLLM.mock.calls[0][0];
    expect(invocation).not.toHaveProperty("max_tokens");
    expect(invocation).not.toHaveProperty("maxTokens");
    expect(invocation).not.toHaveProperty("tools");
    expect(FOUNDER_SYSTEM_PROMPT).toContain("Validate, Build, Grow, Raise");
    expect(FOUNDER_SYSTEM_PROMPT).toContain("untrusted content");
  });

  it("calls the explicitly selected higher-quality model", async () => {
    const caller = createFounderAssistantRouter().createCaller(context());
    const response = await caller.chat({ ...validInput, model: "gpt-6.1-sol" });
    expect(invokeLLM.mock.calls[0][0].model).toBe("gpt-6.1-sol");
    expect(response.model).toBe("gpt-6.1-sol");
  });

  it("never switches models when an approved selection disappears from the project catalog", async () => {
    listLLMModels.mockResolvedValue({ data: [{ id: "gpt-6.1-sol" }] });
    const caller = createFounderAssistantRouter().createCaller(context());
    await expect(caller.chat(validInput)).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", message: expect.stringMatching(/No other model was substituted/) });
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it.each(["", "   ", null, undefined])("fails honestly for empty provider text (%s)", async content => {
    invokeLLM.mockResolvedValue(providerResponse(content));
    if (content === undefined) invokeLLM.mockResolvedValue({ choices: [] });
    await expect(createFounderAssistantRouter().createCaller(context()).chat(validInput)).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE", message: expect.stringMatching(/no usable text response/) });
  });

  it("extracts only textual provider content and bounds returned text", async () => {
    invokeLLM.mockResolvedValue(providerResponse([{ type: "text", text: "x".repeat(3000) }]));
    const result = await createFounderAssistantRouter().createCaller(context()).chat(validInput);
    expect(result.content).toHaveLength(2000);
    expect(result.truncated).toBe(true);
  });

  it("does not misrepresent a tool request as executed", async () => {
    const response = providerResponse("I executed it.");
    invokeLLM.mockResolvedValue({ ...response, choices: [{ ...response.choices[0], message: { ...response.choices[0].message, tool_calls: [{ id: "call", function: { name: "execute" } }] } }] });
    await expect(createFounderAssistantRouter().createCaller(context()).chat(validInput)).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
  });

  it("returns safe errors and releases the concurrency lock after provider failure", async () => {
    const secret = "Bearer real-token provider-body private-data";
    invokeLLM.mockRejectedValueOnce(new Error(secret));
    const caller = createFounderAssistantRouter().createCaller(context());
    const failure = await caller.chat(validInput).catch(error => error);
    expect(failure.code).toBe("SERVICE_UNAVAILABLE");
    expect(failure.message).not.toContain(secret);
    expect(failure.cause).toBeUndefined();
    await expect(caller.chat(validInput)).resolves.toMatchObject({ status: "response_received" });
  });

  it("sanitizes model discovery failures and disables chat when unconfigured", async () => {
    listLLMModels.mockRejectedValue(new Error("secret provider error"));
    const caller = createFounderAssistantRouter().createCaller(context());
    await expect(caller.models()).resolves.toEqual({ configured: true, models: [] });
    await expect(caller.chat(validInput)).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
    ENV.forgeApiKey = "";
    await expect(createFounderAssistantRouter().createCaller(context()).models()).resolves.toEqual({ configured: false, models: [] });
    expect(invokeLLM).not.toHaveBeenCalled();
  });

  it("caps requests at ten per minute per authenticated user", async () => {
    const feature = createFounderAssistantRouter();
    const caller = feature.createCaller(context());
    for (let i = 0; i < 10; i++) await caller.chat(validInput);
    await expect(caller.chat(validInput)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(invokeLLM).toHaveBeenCalledTimes(10);
    await expect(feature.createCaller(context(43)).chat(validInput)).resolves.toMatchObject({ status: "response_received" });
  });

  it("permits only one in-flight request per user and releases it on completion", async () => {
    let finish!: (response: ReturnType<typeof providerResponse>) => void;
    invokeLLM.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const caller = createFounderAssistantRouter().createCaller(context());
    const first = caller.chat(validInput);
    await vi.waitFor(() => expect(invokeLLM).toHaveBeenCalledOnce());
    await expect(caller.chat(validInput)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS", message: expect.stringMatching(/already in progress/) });
    finish(providerResponse());
    await expect(first).resolves.toMatchObject({ status: "response_received" });
    await expect(caller.chat(validInput)).resolves.toMatchObject({ status: "response_received" });
  });
});

describe("founderAssistant bounded process-local limiter", () => {
  it("cleans expired windows but does not evict in-flight users", () => {
    let time = 0;
    const limiter = createFounderLimiter(() => time);
    const releaseActive = limiter.acquire(1);
    for (let i = 2; i <= 2000; i++) limiter.acquire(i)();
    expect(() => limiter.acquire(2001)).toThrow(/busy/);
    time = 60_001;
    expect(() => limiter.acquire(1)).toThrow(/already in progress/);
    expect(() => limiter.acquire(2001)()).not.toThrow();
    releaseActive();
    expect(() => limiter.acquire(1)()).not.toThrow();
  });

  it("resets an exhausted minute window", () => {
    let time = 0;
    const limiter = createFounderLimiter(() => time);
    for (let i = 0; i < 10; i++) limiter.acquire(1)();
    expect(() => limiter.acquire(1)).toThrow(/10 requests/);
    time = 60_000;
    expect(() => limiter.acquire(1)()).not.toThrow();
  });
});
