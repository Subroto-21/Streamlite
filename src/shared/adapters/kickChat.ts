/**
 * Kick.com chat adapter — uses undocumented public Pusher channels
 * reverse-engineered from Kick's own frontend (no official API without OAuth).
 *
 * LIVE-TESTED STATUS (2026-06-16)
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ Chat messages       chatrooms.{chatroomId}.v2  App\Events\ChatMessageEvent
 *                        Payload confirmed. badges + badges_v2 both parsed.
 *
 * ⚠️  Subscriptions      channel.{channelId}        App\Events\SubscriptionEvent
 *                        Subscription to channel succeeds. Event binding is in
 *                        place but NOT yet confirmed with a live sub event.
 *
 * ⚠️  Gift subs          channel.{channelId}        LuckyUsersWhoGotGiftSubscriptionsEvent
 *                                                   GiftedSubscriptionsEvent
 *                        Same as above — bound, unverified. Two event names
 *                        are bound because community sources disagree on which
 *                        one fires.
 *
 * ❌  Follows            NOT available via public Pusher channels.
 *                        Live test confirmed zero events arrive on either
 *                        chatrooms.{id} or channel.{id} when a follow occurs.
 *                        Kick sends follows only to the streamer's authenticated
 *                        session (private-channelpoints-{id} requires OAuth).
 *
 * RISK: Event names, payload shapes, or the Pusher app key/cluster can change
 * without notice. If alerts stop firing, check Kick's Network > WS tab for
 * current event names before assuming a bug here.
 */
import Pusher from 'pusher-js'
import type { AlertEvent, ChatAdapter, ChatMessage } from '../types'

const PUSHER_APP_KEY = '32cbd69e4b950bf97679'
const PUSHER_CLUSTER = 'us2'

// ── Kick API response shape ───────────────────────────────────────────────

interface KickChannelResponse {
  id: number           // channel ID  → used for channel.{id}
  chatroom: {
    id: number         // chatroom ID → used for chatrooms.{id}.v2
  }
}

// ── Kick Pusher payload shapes (community-reverse-engineered, may drift) ──

interface KickChatPayload {
  id: string
  content: string
  sender: {
    username: string
    identity: {
      color: string
      badges: Array<{ type: string; text: string }>
      badges_v2: Array<{ name: string; badge_type: string; metadata?: Record<string, unknown> }>
    }
  }
}

interface KickSubPayload {
  id?: string
  username?: string
  months_subscribed?: number
  subscriptions_count?: number
  gifted_usernames?: string[]
  quantity_gifted?: number
}

interface KickGiftPayload {
  gifter_username?: string
  gifted_usernames?: string[]
  number_gifted?: number
}

// ── Adapter ───────────────────────────────────────────────────────────────

export class KickChatAdapter implements ChatAdapter {
  private pusher: Pusher | null = null
  private messageCallback: ((msg: ChatMessage) => void) | null = null
  private alertCallback: ((alert: AlertEvent) => void) | null = null
  private statusCallback: ((status: 'connected' | 'disconnected' | 'reconnecting') => void) | null = null

  onMessage(callback: (msg: ChatMessage) => void): void {
    this.messageCallback = callback
  }

  onAlert(callback: (alert: AlertEvent) => void): void {
    this.alertCallback = callback
  }

  onStatusChange(callback: (status: 'connected' | 'disconnected' | 'reconnecting') => void): void {
    this.statusCallback = callback
  }

  connect(channelSlug: string): void {
    this._connect(channelSlug).catch(err => {
      console.error('[KickChatAdapter] connect failed:', err)
      this.statusCallback?.('disconnected')
    })
  }

  disconnect(): void {
    this.pusher?.disconnect()
    this.pusher = null
  }

  private async _connect(channelSlug: string): Promise<void> {
    const { chatroomId, channelId } = await resolveChannelIds(channelSlug)
    console.log(`[KickChatAdapter] resolved ${channelSlug} → chatroomId=${chatroomId}, channelId=${channelId}`)

    this.pusher = new Pusher(PUSHER_APP_KEY, { cluster: PUSHER_CLUSTER })

    this.pusher.connection.bind('state_change', ({ current }: { current: string }) => {
      if (!this.statusCallback) return
      if (current === 'connected') {
        this.statusCallback('connected')
      } else if (current === 'disconnected' || current === 'failed') {
        this.statusCallback('disconnected')
      } else {
        this.statusCallback('reconnecting')
      }
    })

    // ── Chat channel ───────────────────────────────────────────────────────
    const chatChannel = this.pusher.subscribe(`chatrooms.${chatroomId}.v2`)

    chatChannel.bind('App\\Events\\ChatMessageEvent', (raw: unknown) => {
      if (!this.messageCallback) return
      const data = raw as KickChatPayload
      const { badges, badges_v2 } = data.sender.identity
      // Merge legacy badges (moderator/verified) + badges_v2 (level etc.)
      const allBadges = [
        ...badges.map(b => b.type),
        ...badges_v2.map(b => b.name),
      ]
      this.messageCallback({
        id: data.id,
        platform: 'kick',
        username: data.sender.username,
        color: data.sender.identity.color || undefined,
        message: data.content,
        timestamp: Date.now(),
        badges: allBadges.length > 0 ? allBadges : undefined,
      })
    })

    // ── chatrooms.{id} (no .v2) — may carry sub/gift events for viewers ────
    // Kick's frontend subscribes to this alongside .v2; log everything to
    // discover what event names actually appear here.
    const chatroomBaseChannel = this.pusher.subscribe(`chatrooms.${chatroomId}`)
    chatroomBaseChannel.bind_global((eventName: string, data: unknown) => {
      if (eventName.startsWith('pusher:')) return
      console.log('[KickChatAdapter] chatroom-base event:', eventName, data)
    })

    // ── channel.{id} — kept for sub/gift events ────────────────────────────
    const alertChannel = this.pusher.subscribe(`channel.${channelId}`)

    alertChannel.bind('pusher:subscription_succeeded', () => {
      console.log(`[KickChatAdapter] channel.${channelId} subscription OK`)
    })
    alertChannel.bind('pusher:subscription_error', (err: unknown) => {
      console.error(`[KickChatAdapter] channel.${channelId} subscription FAILED — may require auth:`, err)
    })

    // Log every event on this channel — names are undocumented.
    // Inspect these in the console to confirm actual event names Kick sends.
    alertChannel.bind_global((eventName: string, data: unknown) => {
      if (eventName.startsWith('pusher:')) return
      console.log('[KickChatAdapter] channel event:', eventName, data)
    })

    // Regular subscription / renewal
    alertChannel.bind('App\\Events\\SubscriptionEvent', (raw: unknown) => {
      if (!this.alertCallback) return
      const data = raw as KickSubPayload
      if (data.gifted_usernames && data.gifted_usernames.length > 0) {
        this.alertCallback({
          id: data.id ?? crypto.randomUUID(),
          platform: 'kick',
          type: 'gift_sub',
          username: data.username ?? 'unknown',
          giftedUsers: data.gifted_usernames,
          quantityGifted: data.quantity_gifted,
          timestamp: Date.now(),
        })
      } else if (data.subscriptions_count != null) {
        this.alertCallback({
          id: data.id ?? crypto.randomUUID(),
          platform: 'kick',
          type: 'subscription',
          username: data.username ?? 'unknown',
          monthsSubscribed: data.months_subscribed,
          timestamp: Date.now(),
        })
      }
    })

    // Gift subs — Kick may emit under this name instead of / alongside SubscriptionEvent
    alertChannel.bind('App\\Events\\LuckyUsersWhoGotGiftSubscriptionsEvent', (raw: unknown) => {
      if (!this.alertCallback) return
      const data = raw as KickGiftPayload
      this.alertCallback({
        id: crypto.randomUUID(),
        platform: 'kick',
        type: 'gift_sub',
        username: data.gifter_username ?? 'unknown',
        giftedUsers: data.gifted_usernames ?? [],
        quantityGifted: data.number_gifted,
        timestamp: Date.now(),
      })
    })

    // Alternative gift sub event name seen in some community captures
    alertChannel.bind('App\\Events\\GiftedSubscriptionsEvent', (raw: unknown) => {
      if (!this.alertCallback) return
      const data = raw as KickGiftPayload
      this.alertCallback({
        id: crypto.randomUUID(),
        platform: 'kick',
        type: 'gift_sub',
        username: data.gifter_username ?? 'unknown',
        giftedUsers: data.gifted_usernames ?? [],
        quantityGifted: data.number_gifted,
        timestamp: Date.now(),
      })
    })

    // Follow events are NOT available on this public channel — confirmed by live test.
    // Kick sends follow notifications only to the streamer's authenticated session
    // (likely via a private Pusher channel). Requires Kick OAuth to receive.
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

async function resolveChannelIds(slug: string): Promise<{ chatroomId: number; channelId: number }> {
  const res = await fetch(`https://kick.com/api/v2/channels/${slug}`)
  if (!res.ok) throw new Error(`[KickChat] Channel not found: ${slug}`)
  const data = await res.json() as KickChannelResponse
  return { chatroomId: data.chatroom.id, channelId: data.id }
}
