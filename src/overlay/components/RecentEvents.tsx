import { type Component, For, Show } from 'solid-js'
import type { AlertEvent, LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'
import { alertStore } from '../../shared/messageStore'

interface Props {
  style: LayoutConfig['widgets']['recentEvents']
}

function eventLabel(alert: AlertEvent): { icon: string; text: string } {
  if (alert.type === 'subscription') {
    const months = alert.monthsSubscribed
    return {
      icon: '⭐',
      text: months && months > 1
        ? `${alert.username} resubbed (${months}mo)`
        : `${alert.username} subscribed`,
    }
  }
  if (alert.type === 'gift_sub') {
    const qty = alert.quantityGifted ?? alert.giftedUsers?.length ?? 1
    return {
      icon: '🎁',
      text: `${alert.username} gifted ${qty} sub${qty > 1 ? 's' : ''}`,
    }
  }
  return { icon: '♥', text: `${alert.username} followed` }
}

const RecentEvents: Component<Props> = (props) => {
  const visible = () =>
    [...alertStore.alerts]
      .reverse()
      .slice(0, props.style.maxEvents)

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
        padding: '8px 10px', gap: '4px', overflow: 'hidden',
      }}>
        <Show
          when={visible().length > 0}
          fallback={
            <span style={{ color: 'var(--text-color)', opacity: '0.3', 'font-size': '0.85em', margin: 'auto' }}>
              Recent events
            </span>
          }
        >
          <For each={visible()}>
            {(alert) => {
              const { icon, text } = eventLabel(alert)
              return (
                <div style={{
                  display: 'flex', 'align-items': 'center', gap: '7px',
                  'font-size': '0.88em', color: 'var(--text-color)',
                  overflow: 'hidden', 'white-space': 'nowrap', 'text-overflow': 'ellipsis',
                  'flex-shrink': '0',
                }}>
                  <span style={{ 'font-size': '1em', 'flex-shrink': '0' }}>{icon}</span>
                  <span style={{
                    color: 'var(--accent-color)', 'font-weight': '600',
                    overflow: 'hidden', 'text-overflow': 'ellipsis',
                  }}>{text}</span>
                </div>
              )
            }}
          </For>
        </Show>
      </div>
    </div>
  )
}

export default RecentEvents
