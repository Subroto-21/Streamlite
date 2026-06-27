import { type Component, createSignal, onCleanup } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['dateTime']
}

function formatDate(date: Date, format: string): string {
  if (format === 'long') {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }
  if (format === 'medium') {
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

const DateTime: Component<Props> = (props) => {
  const [now, setNow] = createSignal(new Date())
  const tick = setInterval(() => setNow(new Date()), 1000)
  onCleanup(() => clearInterval(tick))

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
          'font-family': 'var(--font-family)', 'font-size': '1.15em',
        }}>
          {now().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ 'font-size': '0.8em', color: 'var(--text-color)', opacity: '0.75', 'font-weight': '500' }}>
          {formatDate(now(), props.style.dateFormat)}
        </div>
      </div>
    </div>
  )
}

export default DateTime
