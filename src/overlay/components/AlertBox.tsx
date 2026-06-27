import { Show, type Component, createEffect, createSignal, onCleanup } from 'solid-js'
import type { AlertEvent, WidgetStyle } from '../../shared/types'
import { alertStore } from '../../shared/messageStore'
import { widgetStyleToCSS, animationClass } from '../../shared/useWidgetStyle'

const ALERT_DURATION_MS = 5_000
const EXIT_DURATION_MS = 300

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

  createEffect(() => {
    if (current() !== null) return
    const next = alertStore.alerts.find(a => !displayed.has(a.id))
    if (!next) return
    displayed.add(next.id)
    setCurrent(next)
  })

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
    // Outer div holds the reserved position/size — invisible when no alert is active
    <div style={widgetStyleToCSS(props.style)}>
      <Show when={current()}>
        {(alert) => (
          // Animate the whole alert (background + text) together on entry/exit
          <div class={containerClass()} style={{ position: 'absolute', inset: '0' }}>
            {/* Background layer — opacity only affects this div, not the text */}
            <div style={{
              position: 'absolute', inset: '0',
              'background-color': 'var(--bg-color)',
              opacity: 'var(--bg-opacity)',
              'border-radius': 'var(--border-radius)',
            }} aria-hidden="true" />

            {/* Content layer — sits above background, full opacity */}
            <div style={{
              position: 'relative', height: '100%',
              display: 'flex', 'align-items': 'center', 'justify-content': 'center',
              padding: '12px', 'text-align': 'center', color: 'var(--text-color)',
            }}>
              <span style={{ 'font-size': '1.15em', 'font-weight': '700', color: 'var(--accent-color)' }}>
                {alertText(alert())}
              </span>
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}

export default AlertBox
