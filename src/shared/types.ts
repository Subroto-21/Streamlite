// ── Widget style - the single customisation contract every widget renders against

export interface WidgetStyle {
  enabled: boolean;
  x: number; // percentage 0–100, relative to canvas width
  y: number; // percentage 0–100, relative to canvas height
  width: number; // percentage 0–100
  height: number; // percentage 0–100
  backgroundColor: string; // hex
  backgroundOpacity: number; // 0–1
  textColor: string; // hex
  accentColor: string; // hex
  borderRadius: number; // px
  fontFamily: "inter" | "roboto" | "poppins" | "mono";
  fontSize: number; // px
  animation: "none" | "fade" | "slide" | "bounce";
}

// ── Root serialised config - single source of truth ───────────────────────

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface AlertMediaFields {
  alertDurationMs: number;
  followMediaUrl: string;
  followSoundUrl: string;
  subMediaUrl: string;
  subSoundUrl: string;
  giftMediaUrl: string;
  giftSoundUrl: string;
}

export type StreamLabelType =
  | "latestFollower"
  | "latestSub"
  | "latestGiftSub"
  | "topGifter"
  | "followerCount"
  | "subCount"
  | "viewerCount";

export interface StreamLabelItem {
  id: string;
  type: StreamLabelType;
}

export interface LayoutConfig {
  v: number;
  kickChannelSlug?: string;
  twitchChannel?: string; // not yet implemented
  youtubeApiKey?: string; // not yet implemented
  widgets: {
    chat: WidgetStyle;
    alert: WidgetStyle & AlertMediaFields;
    followerGoal: WidgetStyle & { goalTarget: number; goalLabel: string };
    subGoal: WidgetStyle & { goalTarget: number; goalLabel: string };
    viewerCount: WidgetStyle;
    subCount: WidgetStyle;
    recentEvents: WidgetStyle & { maxItems: number };
    streamLabels: WidgetStyle & { items: StreamLabelItem[] };
    clock: WidgetStyle & { format: "12h" | "24h"; showSeconds: boolean };
    countdown: WidgetStyle & {
      targetDate: string;
      label: string;
      showDays: boolean;
    };
    ticker: WidgetStyle & { items: string[]; speed: number };
    todoList: WidgetStyle & { title: string; items: TodoItem[] };
    qrCode: WidgetStyle & { qrUrl: string; label: string };
    spotify: WidgetStyle;
    dateTime: WidgetStyle & { dateFormat: string };
    weather: WidgetStyle & { city: string; unit: "C" | "F" };
  };
  sig?: string;
}

export const CURRENT_SCHEMA_VERSION = 1;

// ── Default style applied to every widget before per-widget overrides ─────

export const DEFAULT_WIDGET_STYLE: WidgetStyle = {
  enabled: true,
  x: 5,
  y: 5,
  width: 30,
  height: 40,
  backgroundColor: "#000000",
  backgroundOpacity: 0.6,
  textColor: "#ffffff",
  accentColor: "#53fc18",
  borderRadius: 12,
  fontFamily: "inter",
  fontSize: 14,
  animation: "fade",
};

// ── Runtime-only types (never serialised) ─────────────────────────────────

export type ChatBadge =
  | "broadcaster"
  | "moderator"
  | "staff"
  | "verified"
  | "sidekick"
  | "founder"
  | "og"
  | "vip"
  | "subscriber"
  | "subgifter"
  | "subgifter25"
  | "subgifter50"
  | "subgifter100";

// Highest priority first - used for both display order and primaryRole derivation
export const BADGE_PRIORITY: ChatBadge[] = [
  "broadcaster",
  "moderator",
  "staff",
  "founder",
  "og",
  "vip",
  "subgifter100",
  "subgifter50",
  "subgifter25",
  "subgifter",
  "subscriber",
  "verified",
  "sidekick",
];

export interface ReplyContext {
  parentId: string;
  username: string;
  content: string; // raw Kick content string - may contain emote tokens
}

// Ready-to-render badge - carries the actual image URL resolved at parse time,
// so the component never needs to look up CDN paths itself.
export interface MessageBadge {
  type: string; // raw badge name ('subscriber', 'level', 'moderator', …)
  imageUrl: string; // actual URL: from payload image_url, or BADGE_META fallback
  label: string; // alt/title text
}

export interface ChatMessage {
  id: string;
  platform: "kick" | "twitch" | "youtube";
  username: string;
  color?: string;
  message: string;
  timestamp: number;
  badges: MessageBadge[]; // sorted by Kick's sort_order; empty array when none
  primaryRole: ChatBadge | "user"; // highest-priority role badge, for name-colour styling
  replyTo?: ReplyContext;
}

export interface AlertEvent {
  id: string;
  platform: "kick" | "twitch" | "youtube";
  type: "follow" | "subscription" | "gift_sub";
  username: string;
  monthsSubscribed?: number;
  giftedUsers?: string[];
  quantityGifted?: number;
  timestamp: number;
}

export interface ViewerCountUpdate {
  count: number;
  timestamp: number;
}

export interface ChatAdapter {
  connect(channelIdentifier: string): void;
  disconnect(): void;
  onMessage(callback: (msg: ChatMessage) => void): void;
  onAlert(callback: (alert: AlertEvent) => void): void;
  onViewerCountUpdate(callback: (update: ViewerCountUpdate) => void): void;
  onFollowerCountUpdate(callback: (count: number) => void): void;
  onSubscriberCountUpdate(callback: (count: number) => void): void;
  onStatusChange(
    callback: (status: "connected" | "disconnected" | "reconnecting") => void,
  ): void;
}
