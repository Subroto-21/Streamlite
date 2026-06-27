import { type Component, createSignal, createMemo, onCleanup, Show } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['countdown']
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function getTimeLeft(targetDate: string): TimeLeft {
  if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false }
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const totalSecs = Math.floor(diff / 1000)
  const days = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const minutes = Math.floor((totalSecs % 3600) / 60)
  const seconds = totalSecs % 60
  return { days, hours, minutes, seconds, expired: false }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

const CountdownTimer: Component<Props> = (props) => {
  const [now, setNow] = createSignal(Date.now())
  const interval = setInterval(() => setNow(Date.now()), 1000)
  onCleanup(() => clearInterval(interval))

  const timeLeft = createMemo(() => {
    void now()
    return getTimeLeft(props.style.targetDate)
  })

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
        'align-items': 'center', 'justify-content': 'center',
        gap: '4px', padding: '8px',
      }}>
        <Show when={props.style.label}>
          <div style={{
            'font-size': '0.75em', color: 'var(--text-color)', opacity: '0.7',
            'text-transform': 'uppercase', 'letter-spacing': '0.08em', 'font-weight': '600',
          }}>
            {props.style.label}
          </div>
        </Show>

        <Show
          when={!timeLeft().expired}
          fallback={
            <div style={{ color: 'var(--accent-color)', 'font-weight': '700', 'font-size': '1.1em' }}>
              Started!
            </div>
          }
        >
          <div style={{
            display: 'flex', 'align-items': 'baseline', gap: '4px',
            color: 'var(--accent-color)', 'font-weight': '700',
            'font-family': 'var(--font-family)',
          }}>
            <Show when={props.style.showDays}>
              <span style={{ 'font-size': '1.1em' }}>{pad(timeLeft().days)}</span>
              <span style={{ 'font-size': '0.65em', opacity: '0.7', 'margin-right': '2px' }}>d</span>
            </Show>
            <span style={{ 'font-size': '1.1em' }}>{pad(timeLeft().hours)}</span>
            <span style={{ 'font-size': '0.65em', opacity: '0.7' }}>h</span>
            <span style={{ 'font-size': '1.1em' }}>{pad(timeLeft().minutes)}</span>
            <span style={{ 'font-size': '0.65em', opacity: '0.7' }}>m</span>
            <span style={{ 'font-size': '1.1em' }}>{pad(timeLeft().seconds)}</span>
            <span style={{ 'font-size': '0.65em', opacity: '0.7' }}>s</span>
          </div>
        </Show>

        <Show when={!props.style.targetDate}>
          <div style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em' }}>
            No date set
          </div>
        </Show>
      </div>
    </div>
  )
}

export default CountdownTimer
