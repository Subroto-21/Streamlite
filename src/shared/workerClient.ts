const WORKER_BASE = 'https://streamlite-worker.subrotonaik.workers.dev'

export interface WorkerChannelInfo {
  channelId: number
  slug: string
  subscriberCount: number
  followerCount: number
  viewerCount: number
  isLive: boolean
}

export interface WorkerEvent {
  type: 'follow' | 'sub' | 'resub' | 'giftsub'
  username: string
  timestamp: number
  data?: Record<string, unknown>
}

export async function fetchWorkerChannel(slug: string): Promise<WorkerChannelInfo | null> {
  try {
    const res = await fetch(`${WORKER_BASE}/channel/${encodeURIComponent(slug)}`)
    if (!res.ok) return null
    return res.json() as Promise<WorkerChannelInfo>
  } catch {
    return null
  }
}

export async function fetchWorkerEvents(channelId: number, since: number): Promise<WorkerEvent[]> {
  try {
    const res = await fetch(`${WORKER_BASE}/events/${channelId}?since=${since}`)
    if (!res.ok) return []
    const data = await res.json() as { events: WorkerEvent[] }
    return data.events ?? []
  } catch {
    return []
  }
}
