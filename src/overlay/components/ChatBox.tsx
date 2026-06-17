import { For, Show, type Component } from 'solid-js'
import type { ChatMessage, WidgetStyle } from '../../shared/types'
import { messageStore } from '../../shared/messageStore'
import { widgetStyleToCSS, animationClass } from '../../shared/useWidgetStyle'
import { parseMessageContent, emoteUrl } from '../../shared/parseMessageContent'
import { ROLE_COLOR_FALLBACK } from '../../shared/badgeUtils'

interface Props {
  style: WidgetStyle
}

function nameColor(msg: ChatMessage, accentColor: string): string {
  return msg.color
    || ROLE_COLOR_FALLBACK[msg.primaryRole]
    || accentColor
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
              <Show when={msg.replyTo}>
                {(reply) => (
                  <div style={{
                    opacity: '0.5',
                    'font-size': '0.82em',
                    'margin-bottom': '1px',
                    overflow: 'hidden',
                    'white-space': 'nowrap',
                    'text-overflow': 'ellipsis',
                    display: 'flex',
                    'align-items': 'center',
                    gap: '3px',
                  }}>
                    <span>↳</span>
                    <span style={{ 'font-weight': '600' }}>{reply().username}</span>
                    <span>:</span>
                    <For each={parseMessageContent(reply().content)}>
                      {(part) => part.type === 'text'
                        ? <span>{part.content}</span>
                        : <img src={emoteUrl(part.id)} alt={part.name}
                               style={{ height: '1em', 'vertical-align': 'middle' }}
                               loading="lazy" />
                      }
                    </For>
                  </div>
                )}
              </Show>
              {/* Badges + username in an inline-flex container so badges sit
                  vertically centred with the name without breaking text flow */}
              <span style={{
                display: 'inline-flex',
                'align-items': 'center',
                gap: '3px',
                'vertical-align': 'middle',
                'margin-right': '1px',
              }}>
                <For each={msg.badges}>
                  {(badge) => (
                    <img
                      src={badge.imageUrl}
                      alt={badge.label}
                      title={badge.label}
                      style={{ height: '1.1em', width: '1.1em', 'flex-shrink': '0' }}
                      onError={(e) => {
                        // Hide broken badge image rather than show broken-image icon
                        (e.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                </For>
                <span style={{
                  color: nameColor(msg, props.style.accentColor),
                  'font-weight': '600',
                }}>
                  {msg.username}
                </span>
              </span>
              {': '}
              <For each={parseMessageContent(msg.message)}>
                {(part) => part.type === 'text'
                  ? <span>{part.content}</span>
                  : <img
                      src={emoteUrl(part.id)}
                      alt={part.name}
                      title={part.name}
                      class="inline-block h-[1.4em] align-middle"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget
                        const text = document.createTextNode(img.alt)
                        img.parentNode?.replaceChild(text, img)
                      }}
                    />
                }
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

export default ChatBox
