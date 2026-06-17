import { type Component, Show } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['ticker']
}

const Ticker: Component<Props> = (props) => {
  const text = () => {
    const items = props.style.items
    if (!items || items.length === 0) return 'Add ticker items in the builder...'
    return items.join('   •   ')
  }

  // Duration in seconds: text scrolls at `speed` px/s across the container.
  // We use a fixed 2000px assumed content width for a smooth loop.
  const duration = () => Math.max(5, Math.round(2000 / Math.max(1, props.style.speed)))

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
        overflow: 'hidden',
      }}>
        <Show when={props.style.items?.length > 0} fallback={
          <span style={{ color: 'var(--text-color)', opacity: '0.4', padding: '0 12px', 'font-size': '0.85em' }}>
            Add ticker items in the builder...
          </span>
        }>
          {/* Duplicate content for seamless loop */}
          <div style={{
            display: 'flex', 'align-items': 'center', gap: '0',
            'white-space': 'nowrap',
            animation: `sl-ticker ${duration()}s linear infinite`,
          }}>
            <span style={{ 'padding-right': '60px', color: 'var(--text-color)', 'font-weight': '500' }}>
              {text()}
            </span>
            <span style={{ 'padding-right': '60px', color: 'var(--text-color)', 'font-weight': '500' }}>
              {text()}
            </span>
          </div>
        </Show>
      </div>

      <style>{`
        @keyframes sl-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

export default Ticker
