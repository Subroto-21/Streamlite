import { For, type Component } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { builderConfig, setBuilderConfig } from '../store/builderConfigStore'
import { applyConfigPatch } from '../../shared/applyConfigPatch'

const WIDGETS: Array<{ key: keyof LayoutConfig['widgets']; label: string }> = [
  { key: 'chat',         label: 'Chat' },
  { key: 'alert',        label: 'Alert' },
  { key: 'followerGoal', label: 'Follower Goal' },
  { key: 'viewerCount',  label: 'Viewer Count' },
]

interface Props {
  selected: keyof LayoutConfig['widgets']
  onSelect: (key: keyof LayoutConfig['widgets']) => void
}

const WidgetSelector: Component<Props> = (props) => (
  <div class="p-3 border-b border-gray-700">
    <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Widgets</p>
    <For each={WIDGETS}>
      {(w) => (
        <div class="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={builderConfig.widgets[w.key].enabled}
            onChange={(e) =>
              applyConfigPatch(setBuilderConfig, { [w.key]: { enabled: e.currentTarget.checked } })
            }
            class="accent-green-500"
          />
          <button
            class={`flex-1 text-left px-3 py-2 rounded text-sm transition-colors ${
              props.selected === w.key
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            onClick={() => props.onSelect(w.key)}
          >
            {w.label}
          </button>
        </div>
      )}
    </For>
  </div>
)

export default WidgetSelector
