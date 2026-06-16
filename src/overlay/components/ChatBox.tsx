import { For, type Component } from 'solid-js'
import type { WidgetStyle } from '../../shared/types'
import { messageStore } from '../../shared/messageStore'
import { widgetStyleToCSS, animationClass } from '../../shared/useWidgetStyle'

interface Props {
  style: WidgetStyle
}

const ChatBox: Component<Props> = (props) => {
  const anim = () => animationClass(props.style.animation)

  return (
    <div style={widgetStyleToCSS(props.style)}>
      {/* WHY: background layer is separate so opacity doesn't cascade to text */}
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
        'justify-content': 'flex-end',
        padding: '10px',
        gap: '4px',
        color: 'var(--text-color)',
        overflow: 'hidden',
      }}>
        <For each={messageStore.messages}>
          {(msg) => (
            <div class={anim()} style={{ 'line-height': '1.4', 'word-break': 'break-word' }}>
              <span style={{
                color: msg.color ?? 'var(--accent-color)',
                'font-weight': '600',
              }}>
                {msg.username}
              </span>
              {': '}
              <span>{msg.message}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export default ChatBox
