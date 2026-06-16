import type { LayoutConfig } from './types'

export interface ParsedCommand {
  name: string
  args: string[]
  raw: string
}

export function parseCommand(text: string, prefix = '!'): ParsedCommand | null {
  const trimmed = text.trim()
  if (!trimmed.startsWith(prefix)) return null

  const parts = trimmed.slice(prefix.length).split(/\s+/)
  const [name, ...args] = parts
  if (!name) return null

  return { name: name.toLowerCase(), args, raw: trimmed }
}

export function isCommand(text: string, command: string, prefix = '!'): boolean {
  const parsed = parseCommand(text, prefix)
  return parsed?.name === command.toLowerCase()
}

export function parseGoalIncrement(text: string, command = 'goal', prefix = '!'): number | null {
  const parsed = parseCommand(text, prefix)
  if (!parsed || parsed.name !== command) return null
  const value = Number(parsed.args[0])
  return Number.isFinite(value) ? value : null
}

// ── Overlay control command parser ────────────────────────────────────────
// Pure function — no SolidJS, adapter, or DOM dependencies.
// Syntax: !overlay <show|hide> <widget>

export type CommandResult =
  | { matched: true; widget: keyof LayoutConfig['widgets']; action: 'show' | 'hide' }
  | { matched: false }

const WIDGET_ALIASES: Record<string, keyof LayoutConfig['widgets']> = {
  chat: 'chat',
  alert: 'alert',
  alerts: 'alert',
  goal: 'followerGoal',
  followergoal: 'followerGoal',
  viewers: 'viewerCount',
  viewercount: 'viewerCount',
}

export function parseOverlayCommand(messageText: string): CommandResult {
  const normalized = messageText.trim().toLowerCase()
  if (!normalized.startsWith('!overlay ')) return { matched: false }

  const parts = normalized.slice('!overlay '.length).trim().split(/\s+/)
  if (parts.length < 2) return { matched: false }

  const [actionRaw, widgetRaw] = parts
  if (actionRaw !== 'show' && actionRaw !== 'hide') return { matched: false }

  const widget = WIDGET_ALIASES[widgetRaw]
  if (!widget) return { matched: false }

  return { matched: true, widget, action: actionRaw }
}

// ── Dev self-test (mirrors stateEncoder.ts pattern) ──────────────────────

if (import.meta.env.DEV) {
  const cases: Array<{ input: string; expectMatch: boolean }> = [
    { input: '!overlay hide chat',         expectMatch: true  },
    { input: '!overlay show alert',        expectMatch: true  },
    { input: '!overlay hide goal',         expectMatch: true  },
    { input: '!overlay show alerts',       expectMatch: true  },
    { input: '!overlay hide viewercount',  expectMatch: true  },
    { input: '!OVERLAY HIDE CHAT',         expectMatch: true  },
    { input: '!overlay hide unknown',      expectMatch: false },
    { input: '!overlay chat',              expectMatch: false },
    { input: 'hello world',               expectMatch: false },
    { input: '!goal 5',                   expectMatch: false },
  ]
  console.group('[commandParser] self-test')
  for (const { input, expectMatch } of cases) {
    const result = parseOverlayCommand(input)
    const pass = result.matched === expectMatch
    console[pass ? 'debug' : 'error'](pass ? '✓' : '✗', JSON.stringify(input), '→', JSON.stringify(result))
  }
  console.groupEnd()
}
