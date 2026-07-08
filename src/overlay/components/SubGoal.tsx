import { type Component, Show } from 'solid-js'
import type { WidgetStyle } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'
import { subCount, hasSubCount } from '../../shared/subCountStore'

interface Props {
  style: WidgetStyle & { goalTarget: number; goalLabel: string }
}

const SubGoal: Component<Props> = (props) => {
  const percent = () =>
    Math.min(100, (subCount() / (props.style.goalTarget || 1)) * 100)

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
        'flex-direction': 'column',
        'justify-content': 'center',
        padding: '8px 12px',
        gap: '6px',
        color: 'var(--text-color)',
      }}>
        <div style={{ display: 'flex', 'justify-content': 'space-between', 'font-size': '0.85em' }}>
          <span>{props.style.goalLabel}</span>
          <Show when={hasSubCount()} fallback={<span style={{ opacity: '0.4' }}>—</span>}>
            <span>{subCount().toLocaleString()} / {props.style.goalTarget.toLocaleString()}</span>
          </Show>
        </div>

        <div style={{
          width: '100%',
          height: '8px',
          'background-color': 'var(--bg-color)',
          'border-radius': '4px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{
            width: hasSubCount() ? `${percent()}%` : '0%',
            height: '100%',
            'background-color': 'var(--accent-color)',
            'border-radius': '4px',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>
    </div>
  )
}

export default SubGoal
