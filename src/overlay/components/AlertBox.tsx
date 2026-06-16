import { Show, type Component, createEffect, createSignal, onCleanup } from 'solid-js'
import type { AlertEvent, WidgetStyle } from '../../shared/types'
import { alertStore } from '../../shared/messageStore'
import { widgetStyleToCSS, animationClass } from '../../shared/useWidgetStyle'

// WHY: one alert at a time — stacking multiple alerts simultaneously is
// visually noisy and the OBS canvas has limited space. Alerts queue up
// in alertStore (capped at 10) and are consumed one-by-one as each dismisses.
const ALERT_DURATION_MS = 5_000
const EXIT_DURATION_MS = 200

interface Props {
  style: WidgetStyle
}

function alertText(alert: AlertEvent): string {
  if (alert.type === 'follow') return `${alert.username} followed!`
  if (alert.type === 'subscription')
    return `${alert.username} subscribed! (${alert.monthsSubscribed ?? 1} months)`
  return `${alert.username} gifted ${alert.quantityGifted ?? alert.giftedUsers?.length ?? 1} subs!`
}

const AlertBox: Component<Props> = (props) => {
  const [current, setCurrent] = createSignal<AlertEvent | null>(null)
  const [exiting, setExiting] = createSignal(false)
  const displayed = new Set<string>()

  // Pick up the next undisplayed alert whenever the slot is free
  createEffect(() => {
    if (current() !== null) return
    const next = alertStore.alerts.find(a => !displayed.has(a.id))
    if (!next) return
    displayed.add(next.id)
    setCurrent(next)
  })

  // Auto-dismiss after ALERT_DURATION_MS, play exit animation first
  createEffect(() => {
    if (!current()) return
    const dismissTimer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => {
        setCurrent(null)
        setExiting(false)
      }, EXIT_DURATION_MS)
    }, ALERT_DURATION_MS)
    onCleanup(() => clearTimeout(dismissTimer))
  })

  const containerClass = () => exiting()
    ? 'anim-exit'
    : animationClass(props.style.animation)

  return (
    <div style={widgetStyleToCSS(props.style)}>
      <div style={{
        position: 'absolute', inset: '0',
        'background-color': 'var(--bg-color)',
        opacity: 'var(--bg-opacity)',
        'border-radius': 'var(--border-radius)',
      }} aria-hidden="true" />

      <Show when={current()}>
        {(alert) => (
          <div
            class={containerClass()}
            style={{
              position: 'relative',
              height: '100%',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              padding: '12px',
              color: 'var(--text-color)',
              'text-align': 'center',
            }}
          >
            <span style={{
              'font-size': '1.15em',
              'font-weight': '700',
              color: 'var(--accent-color)',
            }}>
              {alertText(alert())}
            </span>
          </div>
        )}
      </Show>
    </div>
  )
}

export default AlertBox
