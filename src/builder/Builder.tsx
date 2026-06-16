import { Show, createEffect, createSignal, onCleanup, type Component } from 'solid-js'
import type { LayoutConfig } from '../shared/types'
import { builderConfig, setKickChannelSlug } from './store/builderConfigStore'
import { createChatAdapter } from '../shared/adapters'
import { addAlert, addMessage } from '../shared/messageStore'
import WidgetSelector from './components/WidgetSelector'
import WidgetStyleForm from './components/WidgetStyleForm'
import LinkOutput from './components/LinkOutput'
import ChatBox from '../overlay/components/ChatBox'
import AlertBox from '../overlay/components/AlertBox'
import FollowerGoal from '../overlay/components/FollowerGoal'
import ViewerCount from '../overlay/components/ViewerCount'

const Builder: Component = () => {
  const [selectedWidget, setSelectedWidget] = createSignal<keyof LayoutConfig['widgets']>('chat')
  const [chatStatus, setChatStatus] = createSignal<'connected' | 'disconnected' | 'reconnecting' | ''>('')

  // WHY Option A: render actual overlay components directly (same components as
  // OBS uses, fed by builderConfigStore). An iframe would require re-encoding
  // the full URL on every slider tick and triggering a navigation — far worse
  // than sharing the component tree within the same Vite page.

  // Reconnect whenever kickChannelSlug changes. onCleanup tears down the previous
  // adapter so we never hold multiple Pusher sockets for the same channel.
  createEffect(() => {
    const slug = builderConfig.kickChannelSlug
    if (!slug) {
      setChatStatus('')
      return
    }
    const adapter = createChatAdapter('kick')
    adapter.onMessage(addMessage)
    adapter.onAlert(addAlert)
    adapter.onStatusChange((s) => setChatStatus(s as typeof chatStatus extends () => infer R ? R : never))
    adapter.connect(slug)
    onCleanup(() => adapter.disconnect())
  })

  return (
    <div class="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">

      {/* Header */}
      <header class="border-b border-gray-700 px-6 py-3 flex-shrink-0 flex items-center gap-2">
        <h1 class="text-lg font-semibold tracking-tight">Streamlite</h1>
        <span class="text-gray-500 text-sm">/ Builder</span>
      </header>

      {/* Body: left panel + preview canvas */}
      <div class="flex-1 flex overflow-hidden">

        {/* Left panel */}
        <aside class="w-80 flex-shrink-0 border-r border-gray-700 flex flex-col overflow-hidden">

          {/* Channel slug */}
          <div class="p-4 border-b border-gray-700">
            <label class="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">
              Kick Channel
            </label>
            <div class="flex items-center gap-2">
              <input
                type="text"
                placeholder="channelslug"
                class="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                value={builderConfig.kickChannelSlug ?? ''}
                onInput={(e) => setKickChannelSlug(e.currentTarget.value.trim())}
              />
              <Show when={chatStatus()}>
                <span
                  class={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                    chatStatus() === 'connected'
                      ? 'bg-green-900 text-green-400'
                      : chatStatus() === 'reconnecting'
                      ? 'bg-yellow-900 text-yellow-400'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {chatStatus()}
                </span>
              </Show>
            </div>
          </div>

          {/* Widget tabs with enabled toggles */}
          <WidgetSelector selected={selectedWidget()} onSelect={setSelectedWidget} />

          {/* Style form (scrollable) */}
          <div class="flex-1 overflow-y-auto">
            <WidgetStyleForm widgetKey={selectedWidget()} />
          </div>

        </aside>

        {/* Right: live preview */}
        <main class="flex-1 flex items-center justify-center p-6 bg-gray-950 overflow-hidden">
          <div
            class="relative overflow-hidden w-full"
            style={{
              'aspect-ratio': '16/9',
              'max-height': '100%',
              /* Checkerboard signals transparency — same as OBS transparent canvas */
              'background-color': '#0d0d0d',
              'background-image':
                'repeating-conic-gradient(#1a1a1a 0% 25%, #0d0d0d 0% 50%)',
              'background-size': '20px 20px',
            }}
          >
            <ChatBox    style={builderConfig.widgets.chat} />
            <AlertBox   style={builderConfig.widgets.alert} />
            <FollowerGoal style={builderConfig.widgets.followerGoal} />
            <ViewerCount  style={builderConfig.widgets.viewerCount} />
          </div>
        </main>

      </div>

      {/* Bottom: overlay link */}
      <footer class="border-t border-gray-700 flex-shrink-0">
        <LinkOutput />
      </footer>

    </div>
  )
}

export default Builder
