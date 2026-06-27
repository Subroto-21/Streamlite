import type { Env } from './types'
import { getAppToken } from './auth'

const WEBHOOK_EVENTS = [
  { name: 'channel.followed', version: 1 },
  { name: 'channel.subscription.new', version: 1 },
  { name: 'channel.subscription.renewal', version: 1 },
  { name: 'channel.subscription.gifts', version: 1 },
]

const WORKER_WEBHOOK_URL = 'https://streamlite-worker.subrotonaik.workers.dev/webhook/kick'

export async function ensureWebhookSubscribed(env: Env, channelId: number): Promise<void> {
  const kvKey = `webhook_sub:${channelId}`
  const existing = await env.KV.get(kvKey)
  if (existing) return

  const token = await getAppToken(env)
  const res = await fetch(`${env.KICK_API_BASE}/events/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      broadcaster_user_id: channelId,
      events: WEBHOOK_EVENTS,
      method: 'webhook',
      webhook_url: WORKER_WEBHOOK_URL,
      secret: env.KICK_WEBHOOK_SECRET,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Kick webhook subscription failed: ${res.status} ${text}`)
  }

  const data = await res.json<{ data?: { id?: string } }>()
  const subId = data.data?.id ?? 'ok'

  // Store subscription for 30 days — re-subscribe if Kick expires it
  await env.KV.put(kvKey, subId, { expirationTtl: 60 * 60 * 24 * 30 })
}
