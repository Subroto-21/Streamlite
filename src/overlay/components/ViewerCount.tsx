import { type Component } from 'solid-js'
import type { WidgetStyle } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: WidgetStyle
}

// Viewer count requires polling Kick's API (not available via public Pusher).
// Rendered as a styled placeholder until a polling mechanism is added.
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
        'font-size': '0.9em',
      }}>
        <span style={{ color: 'var(--accent-color)', 'font-weight': '600' }}>●</span>
        <span>– viewers</span>
      </div>
    </div>
  )
}

export default ViewerCount
