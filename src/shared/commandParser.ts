import type { LayoutConfig } from "./types";

// ── Overlay control command parser ────────────────────────────────────────
// Pure function - no SolidJS, adapter, or DOM dependencies.
// Syntax: !overlay <show|hide> <widget>

export type CommandResult =
  | {
      matched: true;
      widget: keyof LayoutConfig["widgets"];
      action: "show" | "hide";
    }
  | { matched: false };

const WIDGET_ALIASES: Record<string, keyof LayoutConfig["widgets"]> = {
  chat: "chat",
  alert: "alert",
  alerts: "alert",
  goal: "followerGoal",
  followergoal: "followerGoal",
  viewers: "viewerCount",
  viewercount: "viewerCount",
  subs: "subCount",
  subcount: "subCount",
  events: "recentEvents",
  recentevents: "recentEvents",
  clock: "clock",
  countdown: "countdown",
  timer: "countdown",
  ticker: "ticker",
  todo: "todoList",
  todolist: "todoList",
  qr: "qrCode",
  qrcode: "qrCode",
  spotify: "spotify",
  datetime: "dateTime",
  date: "dateTime",
};

export function parseOverlayCommand(messageText: string): CommandResult {
  const normalized = messageText.trim().toLowerCase();
  if (!normalized.startsWith("!overlay ")) return { matched: false };

  const parts = normalized.slice("!overlay ".length).trim().split(/\s+/);
  if (parts.length < 2) return { matched: false };

  const [actionRaw, widgetRaw] = parts;
  if (actionRaw !== "show" && actionRaw !== "hide") return { matched: false };

  const widget = WIDGET_ALIASES[widgetRaw];
  if (!widget) return { matched: false };

  return { matched: true, widget, action: actionRaw };
}

// ── Dev self-test (mirrors stateEncoder.ts pattern) ──────────────────────

if (import.meta.env.DEV) {
  const cases: Array<{ input: string; expectMatch: boolean }> = [
    { input: "!overlay hide chat", expectMatch: true },
    { input: "!overlay show alert", expectMatch: true },
    { input: "!overlay hide goal", expectMatch: true },
    { input: "!overlay show alerts", expectMatch: true },
    { input: "!overlay hide viewercount", expectMatch: true },
    { input: "!overlay show subs", expectMatch: true },
    { input: "!overlay hide events", expectMatch: true },
    { input: "!overlay show clock", expectMatch: true },
    { input: "!overlay hide countdown", expectMatch: true },
    { input: "!overlay show ticker", expectMatch: true },
    { input: "!overlay hide todo", expectMatch: true },
    { input: "!overlay show qr", expectMatch: true },
    { input: "!overlay hide spotify", expectMatch: true },
    { input: "!overlay show datetime", expectMatch: true },
    { input: "!OVERLAY HIDE CHAT", expectMatch: true },
    { input: "!overlay hide unknown", expectMatch: false },
    { input: "!overlay chat", expectMatch: false },
    { input: "hello world", expectMatch: false },
    { input: "!goal 5", expectMatch: false },
  ];
  console.group("[commandParser] self-test");
  for (const { input, expectMatch } of cases) {
    const result = parseOverlayCommand(input);
    const pass = result.matched === expectMatch;
    console[pass ? "debug" : "error"](
      pass ? "✓" : "✗",
      JSON.stringify(input),
      "→",
      JSON.stringify(result),
    );
  }
  console.groupEnd();
}
