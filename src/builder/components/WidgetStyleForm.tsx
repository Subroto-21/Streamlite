import { Show, For, createSignal, onCleanup, type Component } from 'solid-js'
import type { LayoutConfig, WidgetStyle, TodoItem, StreamLabelItem, StreamLabelType } from '../../shared/types'
import { builderConfig, setBuilderConfig } from '../store/builderConfigStore'
import { applyConfigPatch } from '../../shared/applyConfigPatch'
import { clientIdConfigured } from '../../shared/spotifyAuth'
import { addAlert } from '../../shared/messageStore'

// ── Sub-components ────────────────────────────────────────────────────────

function SectionLabel(p: { children: string }) {
  return (
    <div class="sl-eyebrow" style={{ margin: '16px 0 8px' }}>{p.children}</div>
  )
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}

function SliderField(p: SliderProps) {
  return (
    <div style={{ 'margin-bottom': '10px' }}>
      <div style={{
        display: 'flex', 'justify-content': 'space-between',
        'font-size': '12px', 'margin-bottom': '5px',
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
        <span style={{ color: 'var(--text-tertiary)', 'font-family': 'var(--font-mono)', 'font-size': '11px' }}>
          {p.value}{p.unit ?? ''}
        </span>
      </div>
      <input
        type="range"
        style={{ width: '100%', 'accent-color': 'var(--brand-500)', cursor: 'pointer' }}
        min={p.min} max={p.max} step={p.step ?? 1}
        value={p.value}
        onInput={(e) => p.onChange(+e.currentTarget.value)}
      />
    </div>
  )
}

interface ColorProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function ColorField(p: ColorProps) {
  return (
    <div style={{
      display: 'flex', 'align-items': 'center', 'justify-content': 'space-between',
      'margin-bottom': '10px',
    }}>
      <span style={{ 'font-size': '12px', color: 'var(--text-secondary)' }}>{p.label}</span>
      <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
        <span style={{ 'font-size': '11px', color: 'var(--text-muted)', 'font-family': 'var(--font-mono)' }}>
          {p.value}
        </span>
        <div style={{
          position: 'relative', width: '28px', height: '28px',
          'border-radius': 'var(--radius-sm)', overflow: 'hidden',
          border: '1px solid var(--border-strong)', cursor: 'pointer',
        }}>
          <div style={{ position: 'absolute', inset: '0', background: p.value }} />
          <input
            type="color"
            value={p.value}
            style={{
              position: 'absolute', inset: '-4px', opacity: '0',
              cursor: 'pointer', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)',
            }}
            onInput={(e) => p.onChange(e.currentTarget.value)}
          />
        </div>
      </div>
    </div>
  )
}

// ── Form component ────────────────────────────────────────────────────────

interface Props {
  widgetKey: keyof LayoutConfig['widgets']
}

type WidgetPatch = Parameters<typeof applyConfigPatch>[1]

const selectStyle = {
  width: '100%', background: 'var(--surface-2)',
  border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)',
  padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)',
  outline: 'none', cursor: 'pointer', 'margin-bottom': '10px',
}

const STREAM_LABEL_OPTIONS: Array<{ value: StreamLabelType; label: string }> = [
  { value: 'latestFollower', label: 'Latest Follower' },
  { value: 'latestSub', label: 'Latest Sub' },
  { value: 'latestGiftSub', label: 'Latest Gift Sub' },
  { value: 'topGifter', label: 'Top Gifter' },
  { value: 'followerCount', label: 'Follower Count' },
  { value: 'subCount', label: 'Sub Count' },
  { value: 'viewerCount', label: 'Viewer Count' },
]

const testAlertButtonStyle = {
  flex: '1', background: 'rgba(83,252,24,0.12)', border: '1px solid var(--border-brand)',
  'border-radius': 'var(--radius-sm)', padding: '5px 8px',
  cursor: 'pointer', 'font-size': '11px', 'font-weight': '600',
  color: 'var(--brand-300)',
}

const WidgetStyleForm: Component<Props> = (props) => {
  const widget = () => builderConfig.widgets[props.widgetKey] as WidgetStyle

  const p = (field: string, value: unknown) =>
    applyConfigPatch(
      setBuilderConfig,
      { [props.widgetKey]: { [field]: value } } as WidgetPatch,
    )

  return (
    <div style={{ padding: '4px 14px 24px' }}>

      <SectionLabel>Position</SectionLabel>
      <SliderField label="X" value={widget().x} min={0} max={95} unit="%" onChange={(v) => p('x', v)} />
      <SliderField label="Y" value={widget().y} min={0} max={95} unit="%" onChange={(v) => p('y', v)} />

      <SectionLabel>Size</SectionLabel>
      <SliderField label="Width"  value={widget().width}  min={5} max={100} unit="%" onChange={(v) => p('width', v)} />
      <SliderField label="Height" value={widget().height} min={5} max={100} unit="%" onChange={(v) => p('height', v)} />

      <SectionLabel>Background</SectionLabel>
      <ColorField label="Color" value={widget().backgroundColor} onChange={(v) => p('backgroundColor', v)} />
      <SliderField label="Opacity" value={widget().backgroundOpacity} min={0} max={1} step={0.05} onChange={(v) => p('backgroundOpacity', v)} />

      <SectionLabel>Color</SectionLabel>
      <ColorField label="Text"   value={widget().textColor}   onChange={(v) => p('textColor', v)} />
      <ColorField label="Accent" value={widget().accentColor} onChange={(v) => p('accentColor', v)} />

      <SectionLabel>Shape & Type</SectionLabel>
      <SliderField label="Corner radius" value={widget().borderRadius} min={0} max={40} unit="px" onChange={(v) => p('borderRadius', v)} />
      <SliderField label="Font size"     value={widget().fontSize}     min={10} max={72} unit="px" onChange={(v) => p('fontSize', v)} />

      <div style={{ 'margin-bottom': '2px' }}>
        <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Font</span>
        <select
          style={selectStyle}
          value={widget().fontFamily}
          onChange={(e) => p('fontFamily', e.currentTarget.value)}
        >
          <option value="inter">Inter</option>
          <option value="roboto">Roboto</option>
          <option value="poppins">Poppins</option>
          <option value="mono">Mono</option>
        </select>
      </div>

      <Show when={props.widgetKey === 'chat' || props.widgetKey === 'alert'}>
        <div style={{ 'margin-bottom': '2px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Animation</span>
          <select
            style={selectStyle}
            value={widget().animation}
            onChange={(e) => p('animation', e.currentTarget.value)}
          >
            <option value="none">None</option>
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="bounce">Bounce</option>
          </select>
        </div>
      </Show>

      <Show when={props.widgetKey === 'alert'}>
        <SectionLabel>Test Alerts</SectionLabel>
        <div style={{ display: 'flex', gap: '6px', 'margin-bottom': '10px' }}>
          <button
            onClick={() => addAlert({ id: crypto.randomUUID(), platform: 'kick', type: 'follow', username: 'TestFollower', timestamp: Date.now() })}
            title="Fire a fake follow alert to test the Alert Box"
            style={testAlertButtonStyle}
          >Follow</button>
          <button
            onClick={() => addAlert({ id: crypto.randomUUID(), platform: 'kick', type: 'subscription', username: 'TestSubscriber', monthsSubscribed: 3, timestamp: Date.now() })}
            title="Fire a fake subscription alert to test the Alert Box"
            style={testAlertButtonStyle}
          >Sub</button>
          <button
            onClick={() => addAlert({ id: crypto.randomUUID(), platform: 'kick', type: 'gift_sub', username: 'TestGifter', quantityGifted: 5, giftedUsers: ['Fan1', 'Fan2', 'Fan3', 'Fan4', 'Fan5'], timestamp: Date.now() })}
            title="Fire a fake gift-sub alert to test the Alert Box"
            style={testAlertButtonStyle}
          >Gift</button>
        </div>

        <SectionLabel>Media & Sound</SectionLabel>
        <SliderField
          label="Duration"
          value={builderConfig.widgets.alert.alertDurationMs}
          min={2000} max={15000} step={500} unit="ms"
          onChange={(v) => applyConfigPatch(setBuilderConfig, { alert: { alertDurationMs: v } })}
        />
        <For each={[
          { label: 'Follow', mediaField: 'followMediaUrl', soundField: 'followSoundUrl' },
          { label: 'Subscription', mediaField: 'subMediaUrl', soundField: 'subSoundUrl' },
          { label: 'Gift Sub', mediaField: 'giftMediaUrl', soundField: 'giftSoundUrl' },
        ] as const}>
          {(group) => (
            <div style={{ 'margin-bottom': '10px' }}>
              <span style={{ display: 'block', 'font-size': '11px', 'font-weight': '600', color: 'var(--text-tertiary)', 'margin-bottom': '5px' }}>{group.label}</span>
              <input
                type="url"
                placeholder="Image or GIF URL"
                style={{ width: '100%', 'margin-bottom': '5px', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none', 'box-sizing': 'border-box' }}
                value={builderConfig.widgets.alert[group.mediaField]}
                onInput={(e) => applyConfigPatch(setBuilderConfig, { alert: { [group.mediaField]: e.currentTarget.value } })}
              />
              <input
                type="url"
                placeholder="Sound URL"
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none', 'box-sizing': 'border-box' }}
                value={builderConfig.widgets.alert[group.soundField]}
                onInput={(e) => applyConfigPatch(setBuilderConfig, { alert: { [group.soundField]: e.currentTarget.value } })}
              />
            </div>
          )}
        </For>
      </Show>

      <Show when={props.widgetKey === 'recentEvents'}>
        <SectionLabel>Recent Events</SectionLabel>
        <SliderField
          label="Max items"
          value={builderConfig.widgets.recentEvents.maxItems}
          min={1} max={10}
          onChange={(v) => applyConfigPatch(setBuilderConfig, { recentEvents: { maxItems: v } })}
        />
      </Show>

      <Show when={props.widgetKey === 'streamLabels'}>
        <SectionLabel>Stream Labels</SectionLabel>
        {(() => {
          const [newType, setNewType] = createSignal<StreamLabelType>('latestFollower')
          const addItem = () => {
            const items: StreamLabelItem[] = [
              ...builderConfig.widgets.streamLabels.items,
              { id: crypto.randomUUID(), type: newType() },
            ]
            applyConfigPatch(setBuilderConfig, { streamLabels: { items } })
          }
          return (
            <>
              <div style={{ display: 'flex', gap: '6px', 'margin-bottom': '10px' }}>
                <select
                  style={{ ...selectStyle, flex: '1', 'margin-bottom': '0' }}
                  value={newType()}
                  onChange={(e) => setNewType(e.currentTarget.value as StreamLabelType)}
                >
                  {STREAM_LABEL_OPTIONS.map((opt) => <option value={opt.value}>{opt.label}</option>)}
                </select>
                <button
                  onClick={addItem}
                  style={{ 'flex-shrink': '0', padding: '5px 10px', 'border-radius': 'var(--radius-md)', border: '1px solid var(--border-brand)', cursor: 'pointer', 'font-size': '12px', 'font-weight': '600', background: 'transparent', color: 'var(--green-500)' }}
                >+</button>
              </div>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
                <For each={builderConfig.widgets.streamLabels.items}>
                  {(item) => (
                    <div style={{ display: 'flex', 'align-items': 'center', gap: '6px', padding: '5px 8px', 'border-radius': 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border-default)' }}>
                      <span style={{ flex: '1', 'min-width': '0', 'font-size': '12px', color: 'var(--text-secondary)' }}>
                        {STREAM_LABEL_OPTIONS.find(o => o.value === item.type)?.label}
                      </span>
                      <button
                        onClick={() => {
                          const items = builderConfig.widgets.streamLabels.items.filter(i => i.id !== item.id)
                          applyConfigPatch(setBuilderConfig, { streamLabels: { items } })
                        }}
                        style={{ 'flex-shrink': '0', padding: '2px 6px', 'border-radius': 'var(--radius-sm)', border: '1px solid var(--border-default)', cursor: 'pointer', 'font-size': '11px', background: 'transparent', color: 'var(--text-muted)' }}
                      >✕</button>
                    </div>
                  )}
                </For>
              </div>
            </>
          )
        })()}
      </Show>

      <Show when={props.widgetKey === 'followerGoal'}>
        <SectionLabel>Goal</SectionLabel>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Label</span>
          <input
            type="text"
            style={{
              width: '100%', background: 'var(--surface-2)',
              border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)',
              padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)',
              outline: 'none',
            }}
            value={builderConfig.widgets.followerGoal.goalLabel}
            onInput={(e) =>
              applyConfigPatch(setBuilderConfig, { followerGoal: { goalLabel: e.currentTarget.value } })
            }
          />
        </div>
        <SliderField
          label="Target"
          value={builderConfig.widgets.followerGoal.goalTarget}
          min={10} max={10000} step={10}
          onChange={(v) => applyConfigPatch(setBuilderConfig, { followerGoal: { goalTarget: v } })}
        />
      </Show>

      <Show when={props.widgetKey === 'subGoal'}>
        <SectionLabel>Goal</SectionLabel>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Label</span>
          <input
            type="text"
            style={{
              width: '100%', background: 'var(--surface-2)',
              border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)',
              padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)',
              outline: 'none',
            }}
            value={builderConfig.widgets.subGoal.goalLabel}
            onInput={(e) =>
              applyConfigPatch(setBuilderConfig, { subGoal: { goalLabel: e.currentTarget.value } })
            }
          />
        </div>
        <SliderField
          label="Target"
          value={builderConfig.widgets.subGoal.goalTarget}
          min={5} max={5000} step={5}
          onChange={(v) => applyConfigPatch(setBuilderConfig, { subGoal: { goalTarget: v } })}
        />
      </Show>

      <Show when={props.widgetKey === 'clock'}>
        <SectionLabel>Clock</SectionLabel>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Format</span>
          <select
            style={selectStyle}
            value={builderConfig.widgets.clock.format}
            onChange={(e) => applyConfigPatch(setBuilderConfig, { clock: { format: e.currentTarget.value as '12h' | '24h' } })}
          >
            <option value="24h">24-hour (14:30)</option>
            <option value="12h">12-hour (2:30 PM)</option>
          </select>
        </div>
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'margin-bottom': '10px' }}>
          <span style={{ 'font-size': '12px', color: 'var(--text-secondary)' }}>Show seconds</span>
          <button
            onClick={() => applyConfigPatch(setBuilderConfig, { clock: { showSeconds: !builderConfig.widgets.clock.showSeconds } })}
            style={{
              width: '32px', height: '18px', 'border-radius': 'var(--radius-pill)',
              border: 'none', cursor: 'pointer', position: 'relative', padding: '0',
              background: builderConfig.widgets.clock.showSeconds ? 'var(--green-500)' : 'var(--surface-4)',
              transition: 'background var(--dur-base)',
            }}
          >
            <span style={{
              position: 'absolute', top: '2px',
              left: builderConfig.widgets.clock.showSeconds ? 'calc(100% - 16px)' : '2px',
              width: '14px', height: '14px', 'border-radius': '50%', background: '#fff',
              transition: 'left var(--dur-base) var(--ease-spring)',
              'box-shadow': '0 1px 3px rgba(0,0,0,0.4)',
            }} />
          </button>
        </div>
      </Show>

      <Show when={props.widgetKey === 'countdown'}>
        <SectionLabel>Countdown</SectionLabel>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Label</span>
          <input
            type="text"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none' }}
            value={builderConfig.widgets.countdown.label}
            onInput={(e) => applyConfigPatch(setBuilderConfig, { countdown: { label: e.currentTarget.value } })}
          />
        </div>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Target date & time</span>
          <input
            type="datetime-local"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none', 'color-scheme': 'dark' }}
            value={builderConfig.widgets.countdown.targetDate}
            onChange={(e) => applyConfigPatch(setBuilderConfig, { countdown: { targetDate: e.currentTarget.value } })}
          />
        </div>
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'margin-bottom': '10px' }}>
          <span style={{ 'font-size': '12px', color: 'var(--text-secondary)' }}>Show days</span>
          <button
            onClick={() => applyConfigPatch(setBuilderConfig, { countdown: { showDays: !builderConfig.widgets.countdown.showDays } })}
            style={{ width: '32px', height: '18px', 'border-radius': 'var(--radius-pill)', border: 'none', cursor: 'pointer', position: 'relative', padding: '0', background: builderConfig.widgets.countdown.showDays ? 'var(--green-500)' : 'var(--surface-4)', transition: 'background var(--dur-base)' }}
          >
            <span style={{ position: 'absolute', top: '2px', left: builderConfig.widgets.countdown.showDays ? 'calc(100% - 16px)' : '2px', width: '14px', height: '14px', 'border-radius': '50%', background: '#fff', transition: 'left var(--dur-base) var(--ease-spring)', 'box-shadow': '0 1px 3px rgba(0,0,0,0.4)' }} />
          </button>
        </div>
      </Show>

      <Show when={props.widgetKey === 'ticker'}>
        <SectionLabel>Ticker</SectionLabel>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Messages (one per line)</span>
          <textarea
            style={{ width: '100%', 'min-height': '80px', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', 'box-sizing': 'border-box', 'font-family': 'var(--font-sans)' }}
            value={builderConfig.widgets.ticker.items.join('\n')}
            onInput={(e) => {
              const lines = e.currentTarget.value.split('\n').filter(l => l.trim())
              applyConfigPatch(setBuilderConfig, { ticker: { items: lines } })
            }}
          />
        </div>
        <SliderField
          label="Scroll speed"
          value={builderConfig.widgets.ticker.speed}
          min={10} max={200} step={5} unit="px/s"
          onChange={(v) => applyConfigPatch(setBuilderConfig, { ticker: { speed: v } })}
        />
      </Show>

      <Show when={props.widgetKey === 'todoList'}>
        <SectionLabel>Goals / To-Do</SectionLabel>
        {(() => {
          const [newItem, setNewItem] = createSignal('')
          const addItem = () => {
            const text = newItem().trim()
            if (!text) return
            const items: TodoItem[] = [...builderConfig.widgets.todoList.items, { id: crypto.randomUUID(), text, done: false }]
            applyConfigPatch(setBuilderConfig, { todoList: { items } })
            setNewItem('')
          }
          return (
            <>
              <div style={{ 'margin-bottom': '10px' }}>
                <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Title</span>
                <input
                  type="text"
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none' }}
                  value={builderConfig.widgets.todoList.title}
                  onInput={(e) => applyConfigPatch(setBuilderConfig, { todoList: { title: e.currentTarget.value } })}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', 'margin-bottom': '8px' }}>
                <input
                  type="text"
                  placeholder="Add item…"
                  style={{ flex: '1', 'min-width': '0', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '5px 9px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none' }}
                  value={newItem()}
                  onInput={(e) => setNewItem(e.currentTarget.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addItem() }}
                />
                <button
                  onClick={addItem}
                  style={{ 'flex-shrink': '0', padding: '5px 10px', 'border-radius': 'var(--radius-md)', border: '1px solid var(--border-brand)', cursor: 'pointer', 'font-size': '12px', 'font-weight': '600', background: 'transparent', color: 'var(--green-500)' }}
                >+</button>
              </div>
              <div style={{ display: 'flex', 'flex-direction': 'column', gap: '4px' }}>
                <For each={builderConfig.widgets.todoList.items}>
                  {(item) => (
                    <div style={{ display: 'flex', 'align-items': 'center', gap: '6px', padding: '5px 8px', 'border-radius': 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border-default)' }}>
                      <input
                        type="checkbox"
                        checked={item.done}
                        style={{ 'accent-color': 'var(--brand-500)', 'flex-shrink': '0' }}
                        onChange={() => {
                          const items = builderConfig.widgets.todoList.items.map(i => i.id === item.id ? { ...i, done: !i.done } : i)
                          applyConfigPatch(setBuilderConfig, { todoList: { items } })
                        }}
                      />
                      <span style={{ flex: '1', 'min-width': '0', 'font-size': '12px', color: 'var(--text-secondary)', 'text-decoration': item.done ? 'line-through' : 'none', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>{item.text}</span>
                      <button
                        onClick={() => {
                          const items = builderConfig.widgets.todoList.items.filter(i => i.id !== item.id)
                          applyConfigPatch(setBuilderConfig, { todoList: { items } })
                        }}
                        style={{ 'flex-shrink': '0', padding: '2px 6px', 'border-radius': 'var(--radius-sm)', border: '1px solid var(--border-default)', cursor: 'pointer', 'font-size': '11px', background: 'transparent', color: 'var(--text-muted)' }}
                      >✕</button>
                    </div>
                  )}
                </For>
              </div>
            </>
          )
        })()}
      </Show>

      <Show when={props.widgetKey === 'qrCode'}>
        <SectionLabel>QR Code</SectionLabel>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>URL to encode</span>
          <input
            type="url"
            placeholder="https://kick.com/yourchannel"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none' }}
            value={builderConfig.widgets.qrCode.qrUrl}
            onInput={(e) => applyConfigPatch(setBuilderConfig, { qrCode: { qrUrl: e.currentTarget.value } })}
          />
        </div>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Caption (optional)</span>
          <input
            type="text"
            placeholder="Scan to follow!"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none' }}
            value={builderConfig.widgets.qrCode.label}
            onInput={(e) => applyConfigPatch(setBuilderConfig, { qrCode: { label: e.currentTarget.value } })}
          />
        </div>
      </Show>

      <Show when={props.widgetKey === 'spotify'}>
        {(() => {
          const [connected, setConnected] = createSignal(!!localStorage.getItem('sl_spotify_access_token'))
          const onStorage = (e: StorageEvent) => {
            if (e.key === 'sl_spotify_access_token') setConnected(!!e.newValue)
          }
          window.addEventListener('storage', onStorage)
          onCleanup(() => window.removeEventListener('storage', onStorage))

          return (
            <>
              <SectionLabel>Spotify</SectionLabel>
              <Show when={!clientIdConfigured}>
                <div style={{
                  background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.3)',
                  'border-radius': 'var(--radius-md)', padding: '10px 12px', 'margin-bottom': '8px',
                }}>
                  <p style={{ 'font-size': '12px', 'font-weight': '600', color: 'var(--warning)', margin: '0 0 6px' }}>
                    VITE_SPOTIFY_CLIENT_ID not set
                  </p>
                  <p style={{ 'font-size': '11px', color: 'var(--text-muted)', margin: '0 0 8px', 'line-height': '1.5' }}>
                    Create a <code style={{ 'font-family': 'var(--font-mono)', background: 'var(--surface-3)', padding: '1px 4px', 'border-radius': '3px' }}>.env</code> file in the project root:
                  </p>
                  <div style={{
                    background: 'var(--surface-3)', 'border-radius': 'var(--radius-sm)',
                    padding: '8px 10px', 'font-size': '11px', 'font-family': 'var(--font-mono)',
                    color: 'var(--text-secondary)', 'user-select': 'all',
                  }}>
                    VITE_SPOTIFY_CLIENT_ID=your_client_id
                  </div>
                  <p style={{ 'font-size': '11px', color: 'var(--text-muted)', margin: '6px 0 0', 'line-height': '1.5' }}>
                    Then restart the dev server.
                  </p>
                </div>
              </Show>
              <Show when={clientIdConfigured && !connected()}>
                <button
                  onClick={() => { import('../../shared/spotifyAuth').then(m => { void m.connectSpotify() }) }}
                  style={{
                    width: '100%', padding: '9px', 'border-radius': 'var(--radius-md)',
                    border: 'none', cursor: 'pointer', 'font-size': '13px', 'font-weight': '700',
                    background: '#1DB954', color: '#fff', 'margin-bottom': '8px',
                  }}
                >
                  Connect Spotify
                </button>
              </Show>
              <Show when={connected()}>
                <div style={{ display: 'flex', gap: '8px', 'align-items': 'center', 'margin-bottom': '8px' }}>
                  <div style={{
                    flex: '1', display: 'flex', 'align-items': 'center', gap: '6px',
                    background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.3)',
                    'border-radius': 'var(--radius-md)', padding: '8px 10px',
                    'font-size': '12px', 'font-weight': '600', color: '#1DB954',
                  }}>
                    <span style={{ width: '7px', height: '7px', 'border-radius': '50%', background: '#1DB954', 'flex-shrink': '0', display: 'inline-block' }} />
                    Connected
                  </div>
                  <button
                    onClick={() => { import('../../shared/spotifyAuth').then(m => { m.clearTokens(); setConnected(false) }) }}
                    style={{
                      'flex-shrink': '0', padding: '7px 12px', 'border-radius': 'var(--radius-md)',
                      border: '1px solid var(--border-default)', cursor: 'pointer',
                      'font-size': '11px', background: 'transparent', color: 'var(--text-muted)',
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              </Show>
            </>
          )
        })()}
      </Show>

      <Show when={props.widgetKey === 'dateTime'}>
        <SectionLabel>Date & Time</SectionLabel>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Date format</span>
          <select
            style={selectStyle}
            value={builderConfig.widgets.dateTime.dateFormat}
            onChange={(e) => applyConfigPatch(setBuilderConfig, { dateTime: { dateFormat: e.currentTarget.value } })}
          >
            <option value="short">Short (Mon, Jun 17)</option>
            <option value="medium">Medium (Mon, Jun 17, 2026)</option>
            <option value="long">Long (Monday, June 17, 2026)</option>
          </select>
        </div>
      </Show>

      <Show when={props.widgetKey === 'weather'}>
        <SectionLabel>Weather</SectionLabel>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>City (leave empty for auto-detect)</span>
          <input
            type="text"
            placeholder="London, New York, Tokyo…"
            style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)', padding: '6px 10px', 'font-size': '12px', color: 'var(--text-primary)', outline: 'none' }}
            value={builderConfig.widgets.weather.city}
            onInput={(e) => applyConfigPatch(setBuilderConfig, { weather: { city: e.currentTarget.value } })}
          />
        </div>
        <div style={{ 'margin-bottom': '10px' }}>
          <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Unit</span>
          <select
            style={selectStyle}
            value={builderConfig.widgets.weather.unit}
            onChange={(e) => applyConfigPatch(setBuilderConfig, { weather: { unit: e.currentTarget.value as 'C' | 'F' } })}
          >
            <option value="C">Celsius (°C)</option>
            <option value="F">Fahrenheit (°F)</option>
          </select>
        </div>
      </Show>

    </div>
  )
}

export default WidgetStyleForm
