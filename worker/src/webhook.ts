import type { Env, StreamEvent } from './types'
import { pushEvent } from './events'

export async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const signature = request.headers.get('Kick-Event-Signature')
  const body = await request.text()

  if (!await verifySignature(body, signature, env.KICK_WEBHOOK_SECRET)) {
    return new Response('Unauthorized', { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(body)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const eventType = request.headers.get('Kick-Event-Type') ?? ''
  const channelId = extractChannelId(payload)

  if (!channelId) return new Response('OK')

  const event = mapKickEvent(eventType, payload)
  if (event) await pushEvent(env, channelId, event)

  return new Response('OK')
}

async function verifySignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expected = 'sha256=' + Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
  return expected === signature
}

function extractChannelId(payload: Record<string, unknown>): string | null {
  const data = payload.data as Record<string, unknown> | undefined
  const id = data?.broadcaster_user_id ?? data?.channel_id
  return id ? String(id) : null
}

function mapKickEvent(eventType: string, payload: Record<string, unknown>): StreamEvent | null {
  const data = payload.data as Record<string, unknown> ?? {}
  const timestamp = Date.now()

  switch (eventType) {
    case 'channel.followed':
      return {
        type: 'follow',
        username: String(data.user_username ?? data.username ?? 'Unknown'),
        timestamp,
      }
    case 'channel.subscription.new':
      return {
        type: 'sub',
        username: String(data.user_username ?? 'Unknown'),
        timestamp,
        data: { tier: data.tier },
      }
    case 'channel.subscription.renewal':
      return {
        type: 'resub',
        username: String(data.user_username ?? 'Unknown'),
        timestamp,
        data: { tier: data.tier, months: data.months },
      }
    case 'channel.subscription.gifts':
      return {
        type: 'giftsub',
        username: String(data.gifter_username ?? 'Unknown'),
        timestamp,
        data: { count: data.giftees_count },
      }
    default:
      return null
  }
}
