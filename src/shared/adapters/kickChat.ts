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
 * ⚠️  Viewer count       Primary: REST polling of /api/v2/channels/{slug} (60 s).
 *                        Pusher bindings for suspected event names are in place;
 *                        bind_global on channel.{id} will surface any actual
 *                        viewer count events in the console during live testing.
 *                        If viewer count silently stops updating, check the raw
 *                        Pusher frames in the Network > WS tab before assuming
 *                        a code bug — the event name or payload shape may have
 *                        changed, or Kick may have started routing it differently.
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
import type { AlertEvent, ChatAdapter, ChatMessage, MessageBadge, ReplyContext, ViewerCountUpdate } from '../types'
import { derivePrimaryRole, getBadgeFallback, getBadgeLabel } from '../badgeUtils'

const PUSHER_APP_KEY = '32cbd69e4b950bf97679'
const PUSHER_CLUSTER = 'us2'

// ── Kick API response shape ───────────────────────────────────────────────

interface KickChannelResponse {
  id: number
  chatroom: {
    id: number
  }
  followers_count?: number
  viewer_count?: number
  livestream?: {
    viewer_count?: number
  }
  subscriber_badges?: Array<{
    months: number
    badge_image: { src: string }
  }>
}

// Sorted ascending by months; lookup picks the highest tier ≤ user's month count
type SubscriberBadgeTier = { months: number; imageUrl: string }

interface KickViewerCountPayload {
  viewers_count?: number
  viewer_count?: number
  count?: number
}

// ── Kick Pusher payload shapes (community-reverse-engineered, may drift) ──

interface KickChatPayload {
  id: string
  content: string
  sender: {
    username: string
    identity: {
      color: string
      badges: Array<{
        type: string
        text: string
        count?: number
        sort_order?: number
      }>
      badges_v2: Array<{
        name: string
        badge_type: string
        image_url?: string
        metadata?: Record<string, unknown>
        selected?: boolean
        sort_order?: number
      }>
    }
  }
  type?: string
  created_at?: string
  thread_parent_id?: string | null
  metadata?: {
    original_sender?: { id: number; username: string }
    original_message?: { id: string; content: string }
    message_ref?: string
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
  private subscriberBadgeTiers: SubscriberBadgeTier[] = []
  private viewerCountCallback: ((update: ViewerCountUpdate) => void) | null = null
  private followerCountCallback: ((count: number) => void) | null = null
  private statusCallback: ((status: 'connected' | 'disconnected' | 'reconnecting') => void) | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private channelSlug: string | null = null

  onMessage(callback: (msg: ChatMessage) => void): void {
    this.messageCallback = callback
  }

  onAlert(callback: (alert: AlertEvent) => void): void {
    this.alertCallback = callback
  }

  onViewerCountUpdate(callback: (update: ViewerCountUpdate) => void): void {
    this.viewerCountCallback = callback
  }

  onFollowerCountUpdate(callback: (count: number) => void): void {
    this.followerCountCallback = callback
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
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
    this.channelSlug = null
    this.pusher?.disconnect()
    this.pusher = null
  }

  private resolveLegacyBadge(
    type: string,
    text: string,
    count?: number,
  ): { imageUrl: string; label: string } {
    if (type === 'subscriber' && this.subscriberBadgeTiers.length > 0) {
      const months = count ?? 1
      // Find highest tier whose months threshold the user has reached
      let best: SubscriberBadgeTier | undefined
      for (const tier of this.subscriberBadgeTiers) {  // already sorted ascending
        if (tier.months <= months) best = tier
        else break
      }
      if (best) return { imageUrl: best.imageUrl, label: `${months}-month Subscriber` }
    }
    return getBadgeFallback(type, text)
  }

  private async pollChannelStats(): Promise<void> {
    if (!this.channelSlug) return
    try {
      const res = await fetch(`https://kick.com/api/v2/channels/${this.channelSlug}`)
      if (!res.ok) return
      const data = await res.json() as KickChannelResponse
      const viewers = data.livestream?.viewer_count ?? data.viewer_count
      if (typeof viewers === 'number') {
        this.viewerCountCallback?.({ count: viewers, timestamp: Date.now() })
      }
      if (typeof data.followers_count === 'number') {
        this.followerCountCallback?.(data.followers_count)
      }
    } catch {
      // Network error — non-critical, next poll will retry
    }
  }

  private async _connect(channelSlug: string): Promise<void> {
    this.channelSlug = channelSlug
    const { chatroomId, channelId, initialViewerCount, initialFollowerCount, subscriberBadgeTiers } = await resolveChannelIds(channelSlug)
    this.subscriberBadgeTiers = subscriberBadgeTiers
    console.log(`[KickChatAdapter] resolved ${channelSlug} → chatroomId=${chatroomId}, channelId=${channelId}`)

    // Seed viewer + follower counts from the connect-time API response, then
    // poll every 60 s. Both values come from the same endpoint so one request
    // covers both — no extra network cost vs. the previous viewer-only poll.
    if (typeof initialViewerCount === 'number') {
      this.viewerCountCallback?.({ count: initialViewerCount, timestamp: Date.now() })
    }
    if (typeof initialFollowerCount === 'number') {
      this.followerCountCallback?.(initialFollowerCount)
    }
    this.pollTimer = setInterval(() => { void this.pollChannelStats() }, 60_000)

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

      let replyTo: ReplyContext | undefined
      if (data.thread_parent_id && data.metadata?.original_sender && data.metadata?.original_message) {
        replyTo = {
          parentId: data.thread_parent_id,
          username: data.metadata.original_sender.username,
          content: data.metadata.original_message.content,
        }
      }

      // badges_v2 carries image_url directly (confirmed from live payload).
      // badges (legacy role array) has no image_url; use local SVG fallback.
      // Sort by Kick's sort_order so display matches the order Kick intends.
      type Sortable = { badge: MessageBadge; order: number }

      // Only render badges_v2 entries the user has chosen to display.
      // selected: false means they have the badge but opted not to show it.
      const v2Items: Sortable[] = badges_v2.filter(b => b.selected !== false).map(b => ({
        badge: {
          type: b.name,
          imageUrl: b.image_url ?? getBadgeFallback(b.name).imageUrl,
          label: getBadgeLabel(b.name, b.metadata),
        },
        order: b.sort_order ?? 999,
      }))

      const legacyItems: Sortable[] = badges.map(b => ({
        badge: {
          type: b.type,
          ...this.resolveLegacyBadge(b.type, b.text, b.count),
        },
        order: b.sort_order ?? 500,
      }))

      const allBadges: MessageBadge[] = [...v2Items, ...legacyItems]
        .sort((a, b) => a.order - b.order)
        .map(s => s.badge)

      this.messageCallback({
        id: data.id,
        platform: 'kick',
        username: data.sender.username,
        color: data.sender.identity.color || undefined,
        message: data.content,
        timestamp: Date.now(),
        badges: allBadges,
        primaryRole: derivePrimaryRole(allBadges.map(b => b.type)),
        replyTo,
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

    // Viewer count via Pusher — unverified event names (no live traffic confirmed
    // these during Phase 2). bind_global above will log them if they exist.
    // These bindings are no-ops if Kick doesn't send them; REST polling (above)
    // is the reliable fallback. Bind multiple candidate names since community
    // captures disagree on which one fires.
    const handleViewerCountPayload = (raw: unknown) => {
      if (!this.viewerCountCallback) return
      const data = raw as KickViewerCountPayload
      const count = data.viewers_count ?? data.viewer_count ?? data.count
      if (typeof count === 'number') {
        this.viewerCountCallback({ count, timestamp: Date.now() })
      }
    }
    alertChannel.bind('App\\Events\\ViewerCountUpdatedEvent', handleViewerCountPayload)
    alertChannel.bind('App\\Events\\ChatroomViewerCountEvent', handleViewerCountPayload)

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

async function resolveChannelIds(slug: string): Promise<{
  chatroomId: number
  channelId: number
  initialViewerCount?: number
  initialFollowerCount?: number
  subscriberBadgeTiers: SubscriberBadgeTier[]
}> {
  const res = await fetch(`https://kick.com/api/v2/channels/${slug}`)
  if (!res.ok) throw new Error(`[KickChat] Channel not found: ${slug}`)
  const data = await res.json() as KickChannelResponse

  const subscriberBadgeTiers: SubscriberBadgeTier[] = (data.subscriber_badges ?? [])
    .map(b => ({ months: b.months, imageUrl: b.badge_image.src }))
    .sort((a, b) => a.months - b.months)

  return {
    chatroomId: data.chatroom.id,
    channelId: data.id,
    initialViewerCount: data.livestream?.viewer_count ?? data.viewer_count,
    initialFollowerCount: data.followers_count,
    subscriberBadgeTiers,
  }
}
