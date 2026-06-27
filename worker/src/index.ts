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

    // GET /status/:channelId — debug: shows webhook subscription state + stored events
    if (request.method === 'GET' && path.startsWith('/status/')) {
      const channelId = path.slice('/status/'.length)
      const [subId, subError, events] = await Promise.all([
        env.KV.get(`webhook_sub:${channelId}`),
        env.KV.get(`webhook_sub_error:${channelId}`),
        getEvents(env, channelId),
      ])
      return json({
        channelId,
        webhookSubscribed: subId !== null,
        webhookSubId: subId,
        webhookSubError: subError,
        eventCount: events.length,
        events,
      }, 200)
    }

    // POST /inject/:channelId — debug: push a fake follow event to test the pipeline
    if (request.method === 'POST' && path.startsWith('/inject/')) {
      const channelId = path.slice('/inject/'.length)
      const { pushEvent } = await import('./events')
      await pushEvent(env, channelId, {
        type: 'follow',
        username: 'TestUser',
        timestamp: Date.now(),
      })
      return json({ ok: true, channelId, message: 'Test follow event injected' }, 200)
    }

    // POST /reset-sub/:channelId — debug: clear webhook sub so it re-subscribes next channel fetch
    if (request.method === 'POST' && path.startsWith('/reset-sub/')) {
      const channelId = path.slice('/reset-sub/'.length)
      await env.KV.delete(`webhook_sub:${channelId}`)
      return json({ ok: true, channelId, message: 'Webhook subscription cleared — will re-subscribe on next /channel/ request' }, 200)
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

    // Kick's official API uses broadcaster_user_id (not id) for the numeric channel ID
    const channelId = (channel.broadcaster_user_id ?? channel.id ?? channel.user_id) as number | undefined

    if (channelId) {
      const existingSub = await env.KV.get(`webhook_sub:${channelId}`)
      if (!existingSub) {
        await ensureWebhookSubscribed(env, channelId).catch(() => {})
      }
    }

    const stream = channel.stream as Record<string, unknown> | undefined
    return json({
      channelId,
      slug: channel.slug,
      subscriberCount: channel.active_subscribers_count ?? 0,
      followerCount: channel.followers_count ?? 0,
      viewerCount: stream?.viewer_count ?? 0,
      isLive: stream?.is_live ?? false,
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
