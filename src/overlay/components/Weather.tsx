import { type Component, createSignal, createEffect, onCleanup, Show } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['weather']
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

async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
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
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
    if (!res.ok) return null
    const data = await res.json() as { results?: Array<{ latitude: number; longitude: number }> }
    const r = data.results?.[0]
    if (!r) return null
    return { lat: r.latitude, lon: r.longitude }
  } catch {
    return null
  }
}

function getCoords(city: string): Promise<{ lat: number; lon: number } | null> {
  if (city.trim()) return geocodeCity(city.trim())
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 },
    )
  })
}

function toF(c: number): number {
  return Math.round(c * 9 / 5 + 32)
}

const Weather: Component<Props> = (props) => {
  const [weather, setWeather] = createSignal<WeatherData | null>(null)
  const [loading, setLoading] = createSignal(true)

  const load = async (city: string) => {
    setLoading(true)
    const coords = await getCoords(city)
    if (coords) setWeather(await fetchWeather(coords.lat, coords.lon))
    else setWeather(null)
    setLoading(false)
  }

  createEffect(() => {
    const city = props.style.city
    void load(city)
    const timer = setInterval(() => { void load(city) }, 600_000)
    onCleanup(() => clearInterval(timer))
  })

  const temp = () => {
    const w = weather()
    if (!w) return null
    return props.style.unit === 'F'
      ? `${toF(w.temperature)}°F`
      : `${Math.round(w.temperature)}°C`
  }

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
        display: 'flex', 'align-items': 'center', 'justify-content': 'center',
        gap: '8px', padding: '6px 12px', color: 'var(--text-color)',
      }}>
        <Show when={!loading()} fallback={
          <span style={{ opacity: '0.4', 'font-size': '0.85em' }}>Loading…</span>
        }>
          <Show when={weather()} fallback={
            <span style={{ opacity: '0.4', 'font-size': '0.85em' }}>No weather data</span>
          }>
            <span style={{ 'font-size': '1.4em' }}>{wmoIcon(weather()!.weathercode)}</span>
            <span style={{ 'font-weight': '700', color: 'var(--accent-color)', 'font-size': '1.1em' }}>
              {temp()}
            </span>
            <Show when={props.style.city.trim()}>
              <span style={{ 'font-size': '0.8em', opacity: '0.7' }}>{props.style.city.trim()}</span>
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  )
}

export default Weather
