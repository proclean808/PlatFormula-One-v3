import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const source = readFileSync(new URL("../client/src/components/Resources.tsx", import.meta.url), "utf8");
const css = source.match(/const directoryStyles = `([\s\S]*?)`;/)?.[1] ?? "";
describe("recent-search pill interaction styles", () => {
  it("adds a short eased transition only to recent-search pills", () => {
    expect(css).toContain(".resource-directory .rd-history .rd-chip { transition:transform 180ms cubic-bezier(.23,1,.32,1)");
    expect(css).toContain("background-color 180ms");
    expect(css).toContain("box-shadow 180ms");
    expect(css).not.toContain("transition:all");
  });
  it("limits hover lift to precise hover-capable devices with motion allowed", () => {
    expect(css).toContain("@media(prefers-reduced-motion:no-preference) and (hover:hover) and (pointer:fine)");
    expect(css).toContain(".rd-chip:hover:not(:active):not(:focus-visible) { transform:translateY(-2px);");
  });
  it("makes reduced-motion and keyboard focus immediate and preserves tappable sizing", () => {
    expect(css).toContain("@media(prefers-reduced-motion:reduce) { .resource-directory .rd-history .rd-chip { transition:none;");
    expect(css).toContain(".rd-chip:is(:hover,:active) { transform:none;");
    expect(css).toMatch(/\.rd-chip:focus-visible \{[^}]*transform:none; transition:none;/);
    expect(css).toMatch(/\.rd-history \.rd-chip \{[^}]*min-height:44px;/);
  });
});
