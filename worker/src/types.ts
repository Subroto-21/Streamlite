export interface Env {
  KV: KVNamespace
  KICK_CLIENT_ID: string
  KICK_CLIENT_SECRET: string
  KICK_WEBHOOK_SECRET: string
  KICK_API_BASE: string
  KICK_TOKEN_URL: string
  MAX_EVENTS: string
}

export interface StreamEvent {
  type: 'follow' | 'sub' | 'resub' | 'giftsub'
  username: string
  timestamp: number
  data?: Record<string, unknown>
}

export interface KickTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export interface KickChannelResponse {
  data: {
    id: number
    slug: string
    active_subscribers_count: number
    followers_count: number
    stream?: {
      viewer_count: number
      is_live: boolean
    }
  }[]
}
