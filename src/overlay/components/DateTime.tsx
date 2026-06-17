import { type Component, createSignal, onCleanup, onMount, Show } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['dateTime']
}

interface WeatherData {
  temperature: number
  weathercode: number
}

const WMO_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '❄️',
  80: '🌦️', 81: '🌦️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

function wmoIcon(code: number): string {
  return WMO_ICONS[code] ?? '🌡️'
}

function formatDate(date: Date, format: string): string {
  if (format === 'long') {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
  if (format === 'medium') {
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }
  // short (default)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json() as { current_weather?: { temperature: number; weathercode: number } }
    if (!data.current_weather) return null
    return { temperature: data.current_weather.temperature, weathercode: data.current_weather.weathercode }
  } catch {
    return null
  }
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json() as { results?: Array<{ latitude: number; longitude: number }> }
    const r = data.results?.[0]
    if (!r) return null
    return { lat: r.latitude, lon: r.longitude }
  } catch {
    return null
  }
}

const DateTime: Component<Props> = (props) => {
  const [now, setNow] = createSignal(new Date())
  const [weather, setWeather] = createSignal<WeatherData | null>(null)

  const tick = setInterval(() => setNow(new Date()), 1000)
  onCleanup(() => clearInterval(tick))

  const loadWeather = async () => {
    if (!props.style.showWeather) return
    let coords: { lat: number; lon: number } | null = null

    if (props.style.city?.trim()) {
      coords = await geocodeCity(props.style.city.trim())
    } else {
      coords = await new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 5000 },
        )
      })
    }

    if (coords) {
      const w = await fetchWeather(coords.lat, coords.lon)
      setWeather(w)
    }
  }

  onMount(() => { void loadWeather() })
  // Refresh weather every 10 minutes
  const weatherTimer = setInterval(() => { void loadWeather() }, 600_000)
  onCleanup(() => clearInterval(weatherTimer))

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
        display: 'flex', 'flex-direction': 'column',
        'align-items': 'center', 'justify-content': 'center',
        gap: '2px', padding: '6px 10px',
      }}>
        <div style={{
          'font-weight': '700', color: 'var(--accent-color)',
          'font-family': "'Fira Code', monospace", 'font-size': '1.15em',
        }}>
          {now().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ 'font-size': '0.8em', color: 'var(--text-color)', opacity: '0.75', 'font-weight': '500' }}>
          {formatDate(now(), props.style.dateFormat)}
        </div>
        <Show when={props.style.showWeather && weather()}>
          <div style={{
            'font-size': '0.8em', color: 'var(--text-color)', opacity: '0.65',
            display: 'flex', 'align-items': 'center', gap: '4px', 'margin-top': '2px',
          }}>
            <span>{wmoIcon(weather()!.weathercode)}</span>
            <span>{Math.round(weather()!.temperature)}°C</span>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default DateTime
