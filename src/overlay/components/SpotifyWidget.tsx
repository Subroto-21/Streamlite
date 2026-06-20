import { type Component, createSignal, onCleanup, Show } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'
import { getValidToken } from '../../shared/spotifyAuth'

interface Props {
  style: LayoutConfig['widgets']['spotify']
}

interface Track {
  name: string
  artist: string
  albumArt: string
  isPlaying: boolean
}

async function fetchCurrentlyPlaying(): Promise<Track | 'auth' | null> {
  const token = await getValidToken()
  if (!token) return 'auth'
  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 204) return null
    if (res.status === 401) return 'auth'
    if (!res.ok) return null
    const data = await res.json() as {
      is_playing: boolean
      item: {
        name: string
        artists: { name: string }[]
        album: { images: { url: string }[] }
      } | null
    }
    if (!data?.item) return null
    return {
      name: data.item.name,
      artist: data.item.artists.map(a => a.name).join(', '),
      albumArt: data.item.album.images[1]?.url ?? data.item.album.images[0]?.url ?? '',
      isPlaying: data.is_playing,
    }
  } catch {
    return null
  }
}

const SpotifyWidget: Component<Props> = (props) => {
  const [track, setTrack] = createSignal<Track | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [needsAuth, setNeedsAuth] = createSignal(false)

  const refresh = async () => {
    const result = await fetchCurrentlyPlaying()
    if (result === 'auth') {
      setNeedsAuth(true)
    } else {
      setNeedsAuth(false)
      setTrack(result)
    }
    setLoading(false)
  }

  void refresh()
  const interval = setInterval(() => { void refresh() }, 10_000)
  onCleanup(() => clearInterval(interval))

  return (
    <div style={widgetStyleToCSS(props.style)}>
      <div style={{
        position: 'absolute', inset: '0',
        'background-color': 'var(--bg-color)',
        opacity: 'var(--bg-opacity)',
        'border-radius': 'var(--border-radius)',
      }} aria-hidden="true" />

      <div style={{
        position: 'relative', height: '100%',
        display: 'flex', 'align-items': 'center',
        gap: '8px', padding: '6px 10px', overflow: 'hidden',
      }}>
        <Show when={needsAuth() && !loading()}>
          <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em' }}>
            Connect Spotify in the builder
          </span>
        </Show>

        <Show when={!needsAuth() || loading()}>
          <Show when={loading()}>
            <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em' }}>Loading…</span>
          </Show>

          <Show when={!loading() && needsAuth()}>
            <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em' }}>
              Reconnect Spotify in the builder
            </span>
          </Show>

          <Show when={!loading() && !needsAuth() && !track()}>
            <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em' }}>
              Nothing playing
            </span>
          </Show>

          <Show when={!loading() && !needsAuth() && track()}>
            <Show when={track()!.albumArt}>
              <img
                src={track()!.albumArt}
                alt="Album art"
                style={{
                  width: '40px', height: '40px', 'flex-shrink': '0',
                  'border-radius': '4px', 'object-fit': 'cover',
                }}
              />
            </Show>

            <div style={{ flex: '1', 'min-width': '0', display: 'flex', 'flex-direction': 'column', gap: '2px' }}>
              <div style={{
                'font-size': '0.78em', 'font-weight': '600',
                color: track()!.isPlaying ? '#1DB954' : 'var(--text-color)',
                opacity: '0.85', 'text-transform': 'uppercase', 'letter-spacing': '0.06em',
              }}>
                {track()!.isPlaying ? '♫ Now Playing' : '♫ Paused'}
              </div>
              <div style={{
                'font-size': '0.95em', 'font-weight': '700',
                color: 'var(--text-color)', overflow: 'hidden',
                'text-overflow': 'ellipsis', 'white-space': 'nowrap',
              }}>
                {track()!.name}
              </div>
              <div style={{
                'font-size': '0.82em', color: 'var(--text-color)', opacity: '0.6',
                overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap',
              }}>
                {track()!.artist}
              </div>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  )
}

export default SpotifyWidget
