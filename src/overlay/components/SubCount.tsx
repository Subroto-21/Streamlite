import { type Component, Show } from 'solid-js'
import type { WidgetStyle } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'
import { subCount, hasSubCount } from '../../shared/subCountStore'

interface Props {
  style: WidgetStyle
}

const SubCount: Component<Props> = (props) => {
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
        gap: '6px', color: 'var(--text-color)', 'font-weight': '600',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1.1em"
          viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <Show
          when={hasSubCount()}
          fallback={<span style={{ color: 'var(--text-color)', opacity: '0.5' }}>— subs</span>}
        >
          <span>{subCount().toLocaleString()} subs</span>
        </Show>
      </div>
    </div>
  )
}

export default SubCount
