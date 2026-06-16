import type { ChatAdapter } from '../types'
import { KickChatAdapter } from './kickChat'

export function createChatAdapter(platform: 'kick' | 'twitch' | 'youtube'): ChatAdapter {
  if (platform === 'kick') return new KickChatAdapter()
  throw new Error(`[Streamlite] Chat adapter for '${platform}' is not yet implemented`)
}
