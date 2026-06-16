import { Show, type Component } from 'solid-js'
import type { LayoutConfig, WidgetStyle } from '../../shared/types'
import { builderConfig, setBuilderConfig } from '../store/builderConfigStore'
import { applyConfigPatch } from '../../shared/applyConfigPatch'

// ── Reusable sub-components ───────────────────────────────────────────────

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
    <div class="mb-3">
      <div class="flex justify-between text-xs text-gray-400 mb-1">
        <span>{p.label}</span>
        <span>{p.value}{p.unit ?? ''}</span>
      </div>
      <input
        type="range"
        class="w-full accent-green-500"
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
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm text-gray-300">{p.label}</span>
      <input
        type="color"
        value={p.value}
        class="w-10 h-8 rounded cursor-pointer border border-gray-600 bg-transparent"
        onInput={(e) => p.onChange(e.currentTarget.value)}
      />
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────

interface Props {
  widgetKey: keyof LayoutConfig['widgets']
}

type WidgetPatch = Parameters<typeof applyConfigPatch>[1]

const WidgetStyleForm: Component<Props> = (props) => {
  const widget = () => builderConfig.widgets[props.widgetKey] as WidgetStyle

  const p = (field: string, value: unknown) =>
    applyConfigPatch(
      setBuilderConfig,
      { [props.widgetKey]: { [field]: value } } as WidgetPatch,
    )

  return (
    <div class="px-4 pb-6">

      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Position</p>
      <SliderField label="X" value={widget().x} min={0} max={95} unit="%" onChange={(v) => p('x', v)} />
      <SliderField label="Y" value={widget().y} min={0} max={95} unit="%" onChange={(v) => p('y', v)} />

      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Size</p>
      <SliderField label="Width"  value={widget().width}  min={5} max={100} unit="%" onChange={(v) => p('width', v)} />
      <SliderField label="Height" value={widget().height} min={5} max={100} unit="%" onChange={(v) => p('height', v)} />

      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Background</p>
      <ColorField label="Color" value={widget().backgroundColor} onChange={(v) => p('backgroundColor', v)} />
      <SliderField
        label="Opacity" value={widget().backgroundOpacity}
        min={0} max={1} step={0.05}
        onChange={(v) => p('backgroundOpacity', v)}
      />

      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Text</p>
      <ColorField label="Text color"   value={widget().textColor}   onChange={(v) => p('textColor', v)} />
      <ColorField label="Accent color" value={widget().accentColor} onChange={(v) => p('accentColor', v)} />

      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Shape</p>
      <SliderField label="Border radius" value={widget().borderRadius} min={0} max={40} unit="px" onChange={(v) => p('borderRadius', v)} />

      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Typography</p>
      <div class="mb-3">
        <p class="text-sm text-gray-400 mb-1">Font</p>
        <select
          class="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
          value={widget().fontFamily}
          onChange={(e) => p('fontFamily', e.currentTarget.value)}
        >
          <option value="inter">Inter</option>
          <option value="roboto">Roboto</option>
          <option value="poppins">Poppins</option>
          <option value="mono">Mono</option>
        </select>
      </div>
      <SliderField label="Font size" value={widget().fontSize} min={10} max={32} unit="px" onChange={(v) => p('fontSize', v)} />

      <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Animation</p>
      <select
        class="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white mb-3"
        value={widget().animation}
        onChange={(e) => p('animation', e.currentTarget.value)}
      >
        <option value="none">None</option>
        <option value="fade">Fade</option>
        <option value="slide">Slide</option>
        <option value="bounce">Bounce</option>
      </select>

      <Show when={props.widgetKey === 'followerGoal'}>
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">Goal</p>
        <div class="mb-3">
          <p class="text-sm text-gray-400 mb-1">Label</p>
          <input
            type="text"
            class="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            value={builderConfig.widgets.followerGoal.goalLabel}
            onInput={(e) =>
              applyConfigPatch(setBuilderConfig, { followerGoal: { goalLabel: e.currentTarget.value } })
            }
          />
        </div>
        <div class="mb-3">
          <p class="text-sm text-gray-400 mb-1">Target</p>
          <input
            type="number"
            min="1"
            class="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white"
            value={builderConfig.widgets.followerGoal.goalTarget}
            onInput={(e) =>
              applyConfigPatch(setBuilderConfig, { followerGoal: { goalTarget: +e.currentTarget.value } })
            }
          />
        </div>
      </Show>

    </div>
  )
}

export default WidgetStyleForm
