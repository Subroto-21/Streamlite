import { type Component, For, Show } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['todoList']
}

const TodoList: Component<Props> = (props) => {
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
        padding: '8px 10px', overflow: 'hidden',
      }}>
        <Show when={props.style.title}>
          <div style={{
            'font-size': '0.8em', 'font-weight': '700',
            color: 'var(--accent-color)',
            'text-transform': 'uppercase', 'letter-spacing': '0.07em',
            'margin-bottom': '6px', 'flex-shrink': '0',
          }}>
            {props.style.title}
          </div>
        </Show>

        <Show
          when={props.style.items?.length > 0}
          fallback={
            <span style={{ color: 'var(--text-color)', opacity: '0.3', 'font-size': '0.85em', margin: 'auto' }}>
              No items yet
            </span>
          }
        >
          <div style={{ 'overflow-y': 'hidden', display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
            <For each={props.style.items}>
              {(item) => (
                <div style={{
                  display: 'flex', 'align-items': 'center', gap: '7px',
                  'font-size': '0.9em',
                  color: item.done ? 'var(--accent-color)' : 'var(--text-color)',
                  opacity: item.done ? '0.6' : '1',
                  'flex-shrink': '0',
                }}>
                  <span style={{
                    width: '14px', height: '14px', 'flex-shrink': '0',
                    'border-radius': '3px', display: 'inline-flex',
                    'align-items': 'center', 'justify-content': 'center',
                    border: item.done ? '2px solid var(--accent-color)' : '2px solid var(--text-color)',
                    background: item.done ? 'var(--accent-color)' : 'transparent',
                    opacity: item.done ? '0.7' : '0.5',
                  }}>
                    <Show when={item.done}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </Show>
                  </span>
                  <span style={{
                    overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap',
                    'text-decoration': item.done ? 'line-through' : 'none',
                  }}>
                    {item.text}
                  </span>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default TodoList
