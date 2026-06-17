import { type Component, createSignal, onCleanup } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['clock']
}

function formatTime(date: Date, format: '12h' | '24h', showSeconds: boolean): string {
  if (format === '24h') {
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    if (showSeconds) {
      const s = String(date.getSeconds()).padStart(2, '0')
      return `${h}:${m}:${s}`
    }
    return `${h}:${m}`
  }
  let h = date.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  const m = String(date.getMinutes()).padStart(2, '0')
  if (showSeconds) {
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s} ${ampm}`
  }
  return `${h}:${m} ${ampm}`
}

const ClockWidget: Component<Props> = (props) => {
  const [now, setNow] = createSignal(new Date())

  const interval = setInterval(() => setNow(new Date()), 1000)
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
        display: 'flex', 'align-items': 'center', 'justify-content': 'center',
        color: 'var(--text-color)', 'font-weight': '700',
        'font-family': 'var(--font-family, "Fira Code", monospace)',
        'letter-spacing': '0.03em',
      }}>
        <span style={{ color: 'var(--accent-color)' }}>
          {formatTime(now(), props.style.format, props.style.showSeconds)}
        </span>
      </div>
    </div>
  )
}

export default ClockWidget
