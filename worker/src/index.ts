import type { Env } from './types'
import { getAppToken } from './auth'
import { getEvents } from './events'
import { handleWebhook } from './webhook'
import { ensureWebhookSubscribed } from './subscribe'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const path = url.pathname

    // POST /webhook/kick — receives Kick webhook events
    if (request.method === 'POST' && path === '/webhook/kick') {
      return handleWebhook(request, env)
    }

    // GET /channel/:slug — returns sub count + channel info
    if (request.method === 'GET' && path.startsWith('/channel/')) {
      const slug = path.slice('/channel/'.length)
      return handleChannel(slug, env)
    }

    // GET /events/:channelId — returns recent events for overlay to poll
    if (request.method === 'GET' && path.startsWith('/events/')) {
      const channelId = path.slice('/events/'.length)
      const since = url.searchParams.get('since')
      const events = await getEvents(env, channelId, since ? parseInt(since, 10) : undefined)
      return json({ events }, 200)
    }

    return new Response('Not Found', { status: 404 })
  },
}

async function handleChannel(slug: string, env: Env): Promise<Response> {
  if (!slug) return new Response('Bad Request', { status: 400 })

  try {
    const token = await getAppToken(env)
    const res = await fetch(`${env.KICK_API_BASE}/channels?slug=${encodeURIComponent(slug)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      return new Response(`Kick API error: ${res.status}`, { status: res.status })
    }

    const data = await res.json<{ data: unknown[] }>()
    const channel = data.data?.[0] as Record<string, unknown> | undefined

    if (!channel) return json({ error: 'Channel not found' }, 404)

    // Fire-and-forget — don't block the response if subscription fails
    const channelId = channel.id as number
    env.KV.get(`webhook_sub:${channelId}`).then(existing => {
      if (!existing) ensureWebhookSubscribed(env, channelId).catch(() => {})
    })

    return json({
      channelId: channel.id,
      slug: channel.slug,
      subscriberCount: channel.active_subscribers_count,
      followerCount: channel.followers_count,
      viewerCount: (channel.stream as Record<string, unknown> | undefined)?.viewer_count ?? 0,
      isLive: (channel.stream as Record<string, unknown> | undefined)?.is_live ?? false,
    }, 200)
  } catch (err) {
    return new Response(`Internal error: ${String(err)}`, { status: 500 })
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
