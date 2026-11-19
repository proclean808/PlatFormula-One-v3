#!/usr/bin/env node
/** Read-only Vapi inventory. No secrets printed, no configuration modified. */
const token = process.env.VAPI_API_KEY;
if (!token) {
  console.error('Missing VAPI_API_KEY. Supply it locally via your secret manager; do not paste it into chat.');
  process.exit(2);
}
const base = 'https://api.vapi.ai';
async function list(path) {
  const response = await fetch(base + path, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {
    console.error(`${path}: HTTP ${response.status}. ${response.status === 401 ? 'Check API key.' : 'Check account permissions or endpoint.'}`);
    return [];
  }
  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.items ?? []);
}
const [phones, assistants, calls] = await Promise.all([
  list('/phone-number'), list('/assistant'), list('/call?limit=10')
]);
const assistantById = new Map(assistants.map(x => [x.id, x]));
console.log('\nVAPI NUMBERS (safe metadata only)');
for (const p of phones) {
  const a = assistantById.get(p.assistantId);
  console.log(JSON.stringify({number: p.number ?? null, provider: p.provider ?? null, phoneNumberId: p.id, assistantId: p.assistantId ?? null, assistantName: a?.name ?? null, modelProvider: a?.model?.provider ?? null, model: a?.model?.model ?? null, transcriber: a?.transcriber?.provider ?? null, voice: a?.voice?.provider ?? null}));
}
console.log('\nASSISTANTS (safe metadata only)');
for (const a of assistants) console.log(JSON.stringify({assistantId: a.id, name: a.name, modelProvider: a.model?.provider, model: a.model?.model, transcriber: a.transcriber?.provider ?? null, voice: a.voice?.provider ?? null}));
console.log('\nRECENT CALLS (timestamps and status only)');
for (const c of calls) console.log(JSON.stringify({callId: c.id, type: c.type, status: c.status, startedAt: c.startedAt, endedAt: c.endedAt, assistantId: c.assistantId, phoneNumberId: c.phoneNumberId, endedReason: c.endedReason}));
console.log('\nInventory complete. No writes performed; no bearer key or transcript exposed.');
