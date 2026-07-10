import { For, Show, createSignal, onCleanup, type Component } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { builderConfig, setBuilderConfig } from '../store/builderConfigStore'
import { applyConfigPatch } from '../../shared/applyConfigPatch'
import { WIDGET_LABELS } from './WidgetSelector'

type WidgetKey = keyof LayoutConfig['widgets']

interface Props {
  selected: WidgetKey
  onSelect: (key: WidgetKey) => void
}

// Drag math is captured once at pointer-down: the canvas doesn't resize
// mid-drag, so we snapshot its pixel size and the widget's starting %-geometry
// and convert pointer deltas (px) into %-deltas against that fixed canvas.
interface DragState {
  key: WidgetKey
  mode: 'move' | 'resize'
  startPointerX: number
  startPointerY: number
  startX: number
  startY: number
  startW: number
  startH: number
  canvasW: number
  canvasH: number
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
const round = (v: number) => Math.round(v)

const CanvasDragLayer: Component<Props> = (props) => {
  let root: HTMLDivElement | undefined
  const [drag, setDrag] = createSignal<DragState | null>(null)

  const enabledKeys = () =>
    (Object.keys(builderConfig.widgets) as WidgetKey[]).filter(
      (k) => builderConfig.widgets[k].enabled,
    )

  const onPointerMove = (e: PointerEvent) => {
    const d = drag()
    if (!d) return
    const dxPct = ((e.clientX - d.startPointerX) / d.canvasW) * 100
    const dyPct = ((e.clientY - d.startPointerY) / d.canvasH) * 100
    if (d.mode === 'move') {
      // Keep the widget fully inside the canvas: x maxes out at 100 - width.
      const x = clamp(d.startX + dxPct, 0, Math.max(0, 100 - d.startW))
      const y = clamp(d.startY + dyPct, 0, Math.max(0, 100 - d.startH))
      applyConfigPatch(setBuilderConfig, { [d.key]: { x: round(x), y: round(y) } })
    } else {
      const width = clamp(d.startW + dxPct, 5, 100 - d.startX)
      const height = clamp(d.startH + dyPct, 5, 100 - d.startY)
      applyConfigPatch(setBuilderConfig, { [d.key]: { width: round(width), height: round(height) } })
    }
  }

  const endDrag = () => {
    setDrag(null)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
  }

  const startDrag = (key: WidgetKey, mode: DragState['mode'], e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    props.onSelect(key)
    const rect = root!.getBoundingClientRect()
    const w = builderConfig.widgets[key]
    setDrag({
      key, mode,
      startPointerX: e.clientX, startPointerY: e.clientY,
      startX: w.x, startY: w.y, startW: w.width, startH: w.height,
      canvasW: rect.width, canvasH: rect.height,
    })
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
  }

  onCleanup(endDrag)

  return (
    // Layer fills the canvas; only the boxes/handles capture pointer events so
    // clicks on empty canvas fall through and keep the current selection.
    <div ref={root} style={{ position: 'absolute', inset: '0', 'pointer-events': 'none' }}>
      <For each={enabledKeys()}>
        {(key) => {
          const w = () => builderConfig.widgets[key]
          const isSelected = () => props.selected === key
          return (
            <div
              class="sl-drag-box"
              data-selected={isSelected() ? 'true' : 'false'}
              onPointerDown={(e) => startDrag(key, 'move', e)}
              style={{
                left: `${w().x}%`, top: `${w().y}%`,
                width: `${w().width}%`, height: `${w().height}%`,
              }}
            >
              <Show when={isSelected()}>
                <span class="sl-drag-label">{WIDGET_LABELS[key]}</span>
                <span
                  class="sl-drag-handle"
                  onPointerDown={(e) => startDrag(key, 'resize', e)}
                  title="Drag to resize"
                />
              </Show>
            </div>
          )
        }}
      </For>
    </div>
  )
}

export default CanvasDragLayer
