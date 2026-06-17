import { type Component, createSignal, onCleanup, Show } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['nowPlaying']
}

interface Track {
  name: string
  artist: string
  album: string
  image: string
  isNowPlaying: boolean
}

async function fetchNowPlaying(apiKey: string, user: string): Promise<Track | null> {
  if (!apiKey || !user) return null
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(apiKey)}&limit=1&format=json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json() as {
      recenttracks?: {
        track?: Array<{
          name: string
          artist: { '#text': string }
          album: { '#text': string }
          image: Array<{ '#text': string; size: string }>
          '@attr'?: { nowplaying?: string }
        }>
      }
    }
    const track = data.recenttracks?.track?.[0]
    if (!track) return null
    const images = track.image ?? []
    const img = images.find(i => i.size === 'medium')?.['#text'] ?? images[images.length - 1]?.['#text'] ?? ''
    return {
      name: track.name,
      artist: track.artist?.['#text'] ?? '',
      album: track.album?.['#text'] ?? '',
      image: img,
      isNowPlaying: track['@attr']?.nowplaying === 'true',
    }
  } catch {
    return null
  }
}

const NowPlaying: Component<Props> = (props) => {
  const [track, setTrack] = createSignal<Track | null>(null)
  const [loading, setLoading] = createSignal(true)

  const refresh = async () => {
    const t = await fetchNowPlaying(props.style.lastfmApiKey, props.style.lastfmUser)
    setTrack(t)
    setLoading(false)
  }

  void refresh()
  const interval = setInterval(() => { void refresh() }, 30_000)
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
        <Show when={!props.style.lastfmApiKey || !props.style.lastfmUser}>
          <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em' }}>
            Set Last.fm key & user in builder
          </span>
        </Show>

        <Show when={props.style.lastfmApiKey && props.style.lastfmUser}>
          <Show when={loading()}>
            <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em' }}>Loading...</span>
          </Show>

          <Show when={!loading() && !track()}>
            <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em' }}>Nothing playing</span>
          </Show>

          <Show when={!loading() && track()}>
            {/* Album art */}
            <Show when={track()!.image}>
              <img
                src={track()!.image}
                alt="Album art"
                style={{
                  width: '40px', height: '40px', 'flex-shrink': '0',
                  'border-radius': '4px', 'object-fit': 'cover',
                }}
              />
            </Show>

            {/* Track info */}
            <div style={{ flex: '1', 'min-width': '0', display: 'flex', 'flex-direction': 'column', gap: '2px' }}>
              <div style={{
                'font-size': '0.78em', 'font-weight': '600',
                color: track()!.isNowPlaying ? 'var(--accent-color)' : 'var(--text-color)',
                opacity: '0.7', 'text-transform': 'uppercase', 'letter-spacing': '0.06em',
              }}>
                {track()!.isNowPlaying ? '♫ Now Playing' : '♫ Last Played'}
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

export default NowPlaying
