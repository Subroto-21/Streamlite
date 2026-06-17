import { type Component, Show } from 'solid-js'
import type { WidgetStyle } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'
import { viewerCount, hasReceivedCount } from '../../shared/viewerCountStore'

interface Props {
  style: WidgetStyle
}

const ViewerCount: Component<Props> = (props) => {
  return (
    <div style={widgetStyleToCSS(props.style)}>
      <div style={{
        position: 'absolute', inset: '0',
        'background-color': 'var(--bg-color)',
        opacity: 'var(--bg-opacity)',
        'border-radius': 'var(--border-radius)',
      }} aria-hidden="true" />

      <div style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        gap: '6px',
        color: 'var(--text-color)',
        'font-weight': '600',
      }}>
        {/* Eye icon — inline SVG, no library dependency, fill follows accentColor */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.1em" height="1.1em"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-color)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>

        <Show
          when={hasReceivedCount()}
          fallback={<span style={{ color: 'var(--text-color)', opacity: '0.5' }}>— viewers</span>}
        >
          <span>{viewerCount().toLocaleString()} viewers</span>
        </Show>
      </div>
    </div>
  )
}

export default ViewerCount
