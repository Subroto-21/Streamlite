import type { ChatMessage } from './types'

// Kick.com uses Pusher (us2 cluster) for chat delivery.
// Channel format: chatrooms.<chatroomId>.v2
// Message event: App\Events\ChatMessageEvent

export interface KickChatOptions {
  channelSlug: string
  onMessage: (msg: ChatMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

interface PusherMessage {
  event: string
  channel: string
  data: string
}

interface KickChatMessageData {
  id: string
  content: string
  sender: {
    username: string
    identity: {
      color: string
      badges: Array<{ type: string; text: string }>
    }
  }
}

const PUSHER_APP_KEY = '32cbd69e4b950bf97679'
const PUSHER_CLUSTER = 'us2'
const PUSHER_WS_URL = `wss://ws-${PUSHER_CLUSTER}.pusher.com/app/${PUSHER_APP_KEY}?protocol=7&client=js&version=7.6.0`

export class KickChatClient {
  private ws: WebSocket | null = null
  private chatroomId: number | null = null
  private opts: KickChatOptions
  private pingInterval: ReturnType<typeof setInterval> | null = null

  constructor(opts: KickChatOptions) {
    this.opts = opts
  }

  async connect(): Promise<void> {
    this.chatroomId = await resolveChatroomId(this.opts.channelSlug)
    this.ws = new WebSocket(PUSHER_WS_URL)

    this.ws.onopen = () => {
      this.subscribe()
      this.startPing()
      this.opts.onConnect?.()
    }

    this.ws.onmessage = (ev: MessageEvent<string>) => {
      this.handleMessage(JSON.parse(ev.data) as PusherMessage)
    }

    this.ws.onclose = () => {
      this.stopPing()
      this.opts.onDisconnect?.()
    }
  }

  disconnect(): void {
    this.stopPing()
    this.ws?.close()
    this.ws = null
  }

  private subscribe(): void {
    if (!this.ws || !this.chatroomId) return
    this.ws.send(JSON.stringify({
      event: 'pusher:subscribe',
      data: { auth: '', channel: `chatrooms.${this.chatroomId}.v2` },
    }))
  }

  private handleMessage(msg: PusherMessage): void {
    if (msg.event !== 'App\\Events\\ChatMessageEvent') return
    const data = JSON.parse(msg.data) as KickChatMessageData
    const chatMsg: ChatMessage = {
      id: data.id,
      platform: 'kick',
      username: data.sender.username,
      color: data.sender.identity.color || undefined,
      badges: data.sender.identity.badges.map(b => ({ type: b.type, imageUrl: '', label: b.text })),
      primaryRole: 'user' as const,
      message: data.content,
      timestamp: Date.now(),
    }
    this.opts.onMessage(chatMsg)
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.ws?.send(JSON.stringify({ event: 'pusher:ping', data: {} }))
    }, 30_000)
  }

  private stopPing(): void {
    if (this.pingInterval) clearInterval(this.pingInterval)
    this.pingInterval = null
  }
}

async function resolveChatroomId(slug: string): Promise<number> {
  const res = await fetch(`https://kick.com/api/v2/channels/${slug}`)
  if (!res.ok) throw new Error(`[KickChat] Channel not found: ${slug}`)
  const data = await res.json() as { chatroom: { id: number } }
  return data.chatroom.id
}
