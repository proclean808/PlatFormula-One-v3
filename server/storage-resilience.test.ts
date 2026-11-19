import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { getLocalStorageItem, setLocalStorageItem } from "../client/src/lib/safeStorage";
import { ThemeProvider, useTheme } from "../client/src/contexts/ThemeContext";

vi.mock("../client/src/const", () => ({ startLogin: vi.fn() }));
vi.mock("../client/src/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { setData: vi.fn(), invalidate: vi.fn() } } }),
    auth: {
      me: { useQuery: () => ({ data: null, isLoading: false, error: null, refetch: vi.fn() }) },
      logout: { useMutation: () => ({ isPending: false, error: null, mutateAsync: vi.fn() }) },
    },
  },
}));

import { useAuth } from "../client/src/_core/hooks/useAuth";

function blockedWindow() {
  const browser = {};
  Object.defineProperty(browser, "localStorage", {
    get() { throw new DOMException("Access is denied for this document", "SecurityError"); },
  });
  vi.stubGlobal("window", browser);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() { throw new DOMException("Access is denied for this document", "SecurityError"); },
  });
}

function ThemeProbe() {
  return React.createElement("span", null, useTheme().theme);
}
function AuthProbe() {
  const { isAuthenticated } = useAuth();
  return React.createElement("span", null, isAuthenticated ? "signed in" : "visitor");
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("browser storage resilience", () => {
  it("falls back when reading the localStorage property itself is denied", () => {
    blockedWindow();
    expect(getLocalStorageItem("theme")).toBeNull();
    expect(setLocalStorageItem("theme", "dark")).toBe(false);
  });

  it("falls back when storage methods throw", () => {
    vi.stubGlobal("window", { localStorage: {
      getItem: () => { throw new Error("Storage denied"); },
      setItem: () => { throw new Error("Quota exceeded"); },
    } });
    expect(getLocalStorageItem("theme")).toBeNull();
    expect(setLocalStorageItem("theme", "dark")).toBe(false);
  });

  it("supports normal persistence when storage is available", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    } });
    expect(setLocalStorageItem("theme", "dark")).toBe(true);
    expect(getLocalStorageItem("theme")).toBe("dark");
  });

  it("works without a browser window", () => {
    vi.stubGlobal("window", undefined);
    expect(getLocalStorageItem("theme")).toBeNull();
    expect(setLocalStorageItem("theme", "dark")).toBe(false);
  });

  it("renders a switchable theme when storage is blocked", () => {
    blockedWindow();
    expect(renderToString(React.createElement(ThemeProvider, {
      defaultTheme: "dark", switchable: true, children: React.createElement(ThemeProbe),
    }))).toContain("dark");
  });

  it("renders auth state without touching denied storage during render", () => {
    blockedWindow();
    expect(renderToString(React.createElement(AuthProbe))).toContain("visitor");
  });

  it("ignores an invalid saved theme", () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => "invalid-theme" } });
    expect(renderToString(React.createElement(ThemeProvider, {
      defaultTheme: "dark", switchable: true, children: React.createElement(ThemeProbe),
    }))).toContain("dark");
  });
});
