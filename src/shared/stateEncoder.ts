import LZString from 'lz-string'
import type { LayoutConfig } from './types'
import { CURRENT_SCHEMA_VERSION, DEFAULT_WIDGET_STYLE } from './types'

const CURRENT_VERSION = CURRENT_SCHEMA_VERSION

// ── Fallback ──────────────────────────────────────────────────────────────

export const DEFAULT_CONFIG: LayoutConfig = {
  v: CURRENT_VERSION,
  kickChannelSlug: '',
  widgets: {
    chat: {
      ...DEFAULT_WIDGET_STYLE,
      x: 2, y: 5, width: 22, height: 70,
    },
    alert: {
      ...DEFAULT_WIDGET_STYLE,
      x: 30, y: 5, width: 40, height: 14,
    },
    followerGoal: {
      ...DEFAULT_WIDGET_STYLE,
      x: 2, y: 78, width: 22, height: 9,
      goalTarget: 100,
      goalLabel: 'Follower Goal',
    },
    viewerCount: {
      ...DEFAULT_WIDGET_STYLE,
      x: 88, y: 2, width: 10, height: 6,
    },
    clock: {
      ...DEFAULT_WIDGET_STYLE,
      enabled: false,
      x: 75, y: 2, width: 12, height: 6,
      accentColor: '#863bff',
      format: '24h',
      showSeconds: false,
    },
    recentEvents: {
      ...DEFAULT_WIDGET_STYLE,
      enabled: false,
      x: 75, y: 78, width: 23, height: 20,
      accentColor: '#863bff',
      maxEvents: 5,
    },
  },
}

// ── Codec ─────────────────────────────────────────────────────────────────

export function compressState(config: LayoutConfig): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(config))
}

export function decompressState(str: string): LayoutConfig {
  try {
    const json = LZString.decompressFromEncodedURIComponent(str)
    if (!json) throw new Error('decompression returned empty string')
    const parsed = JSON.parse(json) as LayoutConfig
    if (parsed.v < CURRENT_VERSION) migrate(parsed)
    return parsed
  } catch (err) {
    console.error('[Streamlite] Failed to decompress state — using default:', err)
    return structuredClone(DEFAULT_CONFIG)
  }
}

function migrate(config: LayoutConfig): void {
  // Add migration cases here when CURRENT_SCHEMA_VERSION is bumped.
  void config
}

// ── URL helpers ───────────────────────────────────────────────────────────

export function getUrlState(): LayoutConfig {
  const c = new URLSearchParams(window.location.search).get('c')
  return c ? decompressState(c) : structuredClone(DEFAULT_CONFIG)
}

export function setUrlState(config: LayoutConfig): void {
  const params = new URLSearchParams(window.location.search)
  params.set('c', compressState(config))
  history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
}

export function buildOverlayUrl(config: LayoutConfig, origin: string): string {
  return `${origin}/overlay.html?c=${compressState(config)}`
}

// ── Dev self-test ─────────────────────────────────────────────────────────

if (import.meta.env.DEV) {
  const compressed = compressState(DEFAULT_CONFIG)
  const roundTripped = decompressState(compressed)
  const roundTripOk = JSON.stringify(roundTripped) === JSON.stringify(DEFAULT_CONFIG)
  console.debug('[Streamlite] stateEncoder self-test', {
    originalBytes: JSON.stringify(DEFAULT_CONFIG).length,
    compressedLen: compressed.length,
    compressionRatio: `${((1 - compressed.length / JSON.stringify(DEFAULT_CONFIG).length) * 100).toFixed(1)}%`,
    roundTripOk,
    ...(roundTripOk ? {} : { expected: DEFAULT_CONFIG, got: roundTripped }),
  })
  if (!roundTripOk) {
    console.error('[Streamlite] stateEncoder round-trip FAILED — check lz-string version')
  }
}
