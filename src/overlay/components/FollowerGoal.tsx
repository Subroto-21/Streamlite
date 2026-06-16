import { type Component, createEffect, createSignal } from 'solid-js'
import type { WidgetStyle } from '../../shared/types'
import { alertStore } from '../../shared/messageStore'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: WidgetStyle & { goalTarget: number; goalLabel: string }
}

const FollowerGoal: Component<Props> = (props) => {
  // WHY: follower count is session-local and resets on OBS refresh.
  // Kick's public Pusher channels don't emit follow events to viewers —
  // only to the streamer's authenticated session (requires OAuth).
  // This counter increments on follow AlertEvents received since mount.
  // A persistent count would need Kick's official API or localStorage,
  // both out of scope for v1.
  const counted = new Set<string>()
  const [followCount, setFollowCount] = createSignal(0)

  createEffect(() => {
    for (const alert of alertStore.alerts) {
      if (alert.type === 'follow' && !counted.has(alert.id)) {
        counted.add(alert.id)
        setFollowCount(c => c + 1)
      }
    }
  })

  const percent = () =>
    Math.min(100, (followCount() / (props.style.goalTarget || 1)) * 100)

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
          <span>{followCount()} / {props.style.goalTarget}</span>
        </div>

        {/* Track */}
        <div style={{
          width: '100%',
          height: '8px',
          'background-color': 'var(--bg-color)',
          'border-radius': '4px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          {/* Fill */}
          <div style={{
            width: `${percent()}%`,
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

export default FollowerGoal
