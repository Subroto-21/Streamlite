import { Show, type Component } from 'solid-js'
import type { LayoutConfig, WidgetStyle } from '../../shared/types'
import { builderConfig, setBuilderConfig } from '../store/builderConfigStore'
import { applyConfigPatch } from '../../shared/applyConfigPatch'

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
        style={{ width: '100%', 'accent-color': 'var(--violet-500)', cursor: 'pointer' }}
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
      <SliderField label="Font size"     value={widget().fontSize}     min={10} max={32} unit="px" onChange={(v) => p('fontSize', v)} />

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

      <div>
        <span style={{ display: 'block', 'font-size': '12px', color: 'var(--text-secondary)', 'margin-bottom': '5px' }}>Entrance animation</span>
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

      <Show when={props.widgetKey === 'recentEvents'}>
        <SectionLabel>Events</SectionLabel>
        <SliderField
          label="Max events shown"
          value={builderConfig.widgets.recentEvents.maxEvents}
          min={1} max={10} step={1}
          onChange={(v) => applyConfigPatch(setBuilderConfig, { recentEvents: { maxEvents: v } })}
        />
      </Show>

    </div>
  )
}

export default WidgetStyleForm
