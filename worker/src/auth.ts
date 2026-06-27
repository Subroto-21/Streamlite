import type { Env, KickTokenResponse } from './types'

const TOKEN_KV_KEY = 'kick_app_token'
const TOKEN_EXPIRY_BUFFER = 60 // refresh 60s before expiry

export async function getAppToken(env: Env): Promise<string> {
  const cached = await env.KV.get<{ token: string; expiresAt: number }>(TOKEN_KV_KEY, 'json')
  if (cached && cached.expiresAt > Date.now() / 1000 + TOKEN_EXPIRY_BUFFER) {
    return cached.token
  }
  return fetchNewToken(env)
}

async function fetchNewToken(env: Env): Promise<string> {
  const res = await fetch(env.KICK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.KICK_CLIENT_ID,
      client_secret: env.KICK_CLIENT_SECRET,
    }),
  })

  if (!res.ok) {
    throw new Error(`Kick token fetch failed: ${res.status}`)
  }

  const data = await res.json<KickTokenResponse>()
  const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in

  await env.KV.put(TOKEN_KV_KEY, JSON.stringify({ token: data.access_token, expiresAt }), {
    expirationTtl: data.expires_in,
  })

  return data.access_token
}
