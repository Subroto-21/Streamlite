// ── Widget style — the single customisation contract every widget renders against

export interface WidgetStyle {
  enabled: boolean
  x: number              // percentage 0–100, relative to canvas width
  y: number              // percentage 0–100, relative to canvas height
  width: number          // percentage 0–100
  height: number         // percentage 0–100
  backgroundColor: string  // hex
  backgroundOpacity: number // 0–1
  textColor: string      // hex
  accentColor: string    // hex
  borderRadius: number   // px
  fontFamily: 'inter' | 'roboto' | 'poppins' | 'mono'
  fontSize: number       // px
  animation: 'none' | 'fade' | 'slide' | 'bounce'
}

// ── Root serialised config — single source of truth ───────────────────────

export interface LayoutConfig {
  v: number
  kickChannelSlug?: string
  twitchChannel?: string   // not yet implemented
  youtubeApiKey?: string   // not yet implemented
  widgets: {
    chat: WidgetStyle
    alert: WidgetStyle
    followerGoal: WidgetStyle & { goalTarget: number; goalLabel: string }
    viewerCount: WidgetStyle
  }
  sig?: string
}

export const CURRENT_SCHEMA_VERSION = 1

// ── Default style applied to every widget before per-widget overrides ─────

export const DEFAULT_WIDGET_STYLE: WidgetStyle = {
  enabled: true,
  x: 5, y: 5, width: 30, height: 40,
  backgroundColor: '#000000',
  backgroundOpacity: 0.6,
  textColor: '#ffffff',
  accentColor: '#53fc18',
  borderRadius: 12,
  fontFamily: 'inter',
  fontSize: 14,
  animation: 'fade',
}

// ── Runtime-only types (never serialised) ─────────────────────────────────

export interface ChatMessage {
  id: string
  platform: 'kick' | 'twitch' | 'youtube'
  username: string
  color?: string
  message: string
  timestamp: number
  badges?: string[]
}

export interface AlertEvent {
  id: string
  platform: 'kick' | 'twitch' | 'youtube'
  type: 'follow' | 'subscription' | 'gift_sub'
  username: string
  monthsSubscribed?: number
  giftedUsers?: string[]
  quantityGifted?: number
  timestamp: number
}

export interface ChatAdapter {
  connect(channelIdentifier: string): void
  disconnect(): void
  onMessage(callback: (msg: ChatMessage) => void): void
  onAlert(callback: (alert: AlertEvent) => void): void
  onStatusChange(callback: (status: 'connected' | 'disconnected' | 'reconnecting') => void): void
}
