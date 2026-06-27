import { type Component, For, Show } from 'solid-js'
import type { WidgetStyle } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'
import { alertStore } from '../../shared/messageStore'

interface Props {
  style: WidgetStyle & { maxItems: number }
}

function eventIcon(type: string): string {
  if (type === 'follow') return '♥'
  if (type === 'subscription') return '★'
  if (type === 'gift_sub') return '🎁'
  return '•'
}

function eventLabel(alert: { type: string; username: string; monthsSubscribed?: number; quantityGifted?: number }): string {
  if (alert.type === 'follow') return `${alert.username} followed`
  if (alert.type === 'subscription') return `${alert.username} subscribed${alert.monthsSubscribed ? ` (${alert.monthsSubscribed}mo)` : ''}`
  if (alert.type === 'gift_sub') return `${alert.username} gifted ${alert.quantityGifted ?? 1} sub${(alert.quantityGifted ?? 1) !== 1 ? 's' : ''}`
  return alert.username
}

const RecentEvents: Component<Props> = (props) => {
  const recent = () => [...alertStore.alerts].reverse().slice(0, props.style.maxItems)

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
        padding: '10px 12px',
        gap: '6px',
        overflow: 'hidden',
      }}>
        <Show
          when={recent().length > 0}
          fallback={
            <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em', margin: 'auto' }}>
              No events yet
            </span>
          }
        >
          <For each={recent()}>
            {(alert) => (
              <div style={{
                display: 'flex',
                'align-items': 'center',
                gap: '8px',
                'font-size': '0.9em',
                color: 'var(--text-color)',
                overflow: 'hidden',
              }}>
                <span style={{ color: 'var(--accent-color)', 'flex-shrink': '0', 'font-size': '0.85em' }}>
                  {eventIcon(alert.type)}
                </span>
                <span style={{
                  flex: '1', 'min-width': '0',
                  overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap',
                }}>
                  {eventLabel(alert)}
                </span>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  )
}

export default RecentEvents
