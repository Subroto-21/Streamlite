import type { Env, StreamEvent } from './types'

function eventsKey(channelId: string) {
  return `events:${channelId}`
}

export async function pushEvent(env: Env, channelId: string, event: StreamEvent): Promise<void> {
  const maxEvents = parseInt(env.MAX_EVENTS, 10)
  const existing = await env.KV.get<StreamEvent[]>(eventsKey(channelId), 'json') ?? []
  const updated = [event, ...existing].slice(0, maxEvents)
  await env.KV.put(eventsKey(channelId), JSON.stringify(updated), { expirationTtl: 86400 })
}

export async function getEvents(env: Env, channelId: string, since?: number): Promise<StreamEvent[]> {
  const events = await env.KV.get<StreamEvent[]>(eventsKey(channelId), 'json') ?? []
  if (since) return events.filter(e => e.timestamp > since)
  return events
}
