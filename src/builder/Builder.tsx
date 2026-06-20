import { Show, For, createEffect, createSignal, onCleanup, onMount, type Component } from 'solid-js'
import type { LayoutConfig } from '../shared/types'
import { builderConfig, setBuilderConfig, setKickChannelSlug } from './store/builderConfigStore'
import { createChatAdapter } from '../shared/adapters'
import { addAlert, addMessage } from '../shared/messageStore'
import { savedOverlays, saveOverlay, deleteOverlay } from './store/overlayLibrary'
import { unwrap } from 'solid-js/store'
import WidgetSelector from './components/WidgetSelector'
import WidgetStyleForm from './components/WidgetStyleForm'
import LinkOutput from './components/LinkOutput'
import ChatBox from '../overlay/components/ChatBox'
import AlertBox from '../overlay/components/AlertBox'
import FollowerGoal from '../overlay/components/FollowerGoal'
import ViewerCount from '../overlay/components/ViewerCount'
import ClockWidget from '../overlay/components/ClockWidget'
import RecentEvents from '../overlay/components/RecentEvents'
import SubCount from '../overlay/components/SubCount'
import CountdownTimer from '../overlay/components/CountdownTimer'
import Ticker from '../overlay/components/Ticker'
import TodoList from '../overlay/components/TodoList'
import QRCode from '../overlay/components/QRCode'
import SpotifyWidget from '../overlay/components/SpotifyWidget'
import { handleOAuthCallback } from '../shared/spotifyAuth'
import { mergeWithDefaults } from '../shared/stateEncoder'
import DateTime from '../overlay/components/DateTime'

// ── Overlay library panel ─────────────────────────────────────────────────

function loadConfig(config: LayoutConfig): void {
  setBuilderConfig(() => mergeWithDefaults(structuredClone(config)))
}

function OverlayLibrary() {
  const [name, setName] = createSignal('My Overlay')
  const [saved, setSaved] = createSignal(false)

  const handleSave = () => {
    saveOverlay(name(), unwrap(builderConfig) as LayoutConfig)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div style={{ 'border-bottom': '1px solid var(--border-default)' }}>
      {/* Save row */}
      <div style={{ padding: '10px 14px 8px' }}>
        <span class="sl-eyebrow" style={{ display: 'block', 'margin-bottom': '8px' }}>Overlays</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Overlay name"
            style={{
              flex: '1', 'min-width': '0', background: 'var(--surface-2)',
              border: '1px solid var(--border-default)', 'border-radius': 'var(--radius-md)',
              padding: '5px 9px', 'font-size': '12px', color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSave}
            style={{
              'flex-shrink': '0', padding: '5px 12px',
              'border-radius': 'var(--radius-md)', border: 'none',
              cursor: 'pointer', 'font-size': '12px', 'font-weight': '600',
              background: saved() ? 'var(--green-600)' : 'var(--grad-brand)',
              color: '#fff', transition: 'background var(--dur-fast)',
            }}
          >{saved() ? '✓ Saved' : 'Save'}</button>
        </div>
      </div>

      {/* Saved list */}
      <Show when={savedOverlays().length > 0}>
        <div class="sl-scroll" style={{ 'max-height': '130px', 'overflow-y': 'auto', padding: '0 14px 10px' }}>
          <For each={savedOverlays()}>
            {(overlay) => (
              <div style={{
                display: 'flex', 'align-items': 'center', gap: '6px',
                padding: '5px 8px', 'border-radius': 'var(--radius-md)',
                'margin-bottom': '2px',
                background: 'var(--surface-2)', border: '1px solid var(--border-default)',
              }}>
                <span style={{
                  flex: '1', 'min-width': '0', 'font-size': '12px',
                  color: 'var(--text-secondary)', overflow: 'hidden',
                  'text-overflow': 'ellipsis', 'white-space': 'nowrap',
                }}>{overlay.name}</span>
                <button
                  onClick={() => { loadConfig(overlay.config); setName(overlay.name) }}
                  style={{
                    'flex-shrink': '0', padding: '3px 8px',
                    'border-radius': 'var(--radius-sm)', border: '1px solid var(--border-violet)',
                    cursor: 'pointer', 'font-size': '11px', 'font-weight': '600',
                    background: 'rgba(134,59,255,0.12)', color: 'var(--violet-300)',
                  }}
                >Load</button>
                <button
                  onClick={() => deleteOverlay(overlay.id)}
                  style={{
                    'flex-shrink': '0', padding: '3px 7px',
                    'border-radius': 'var(--radius-sm)', border: '1px solid var(--border-default)',
                    cursor: 'pointer', 'font-size': '11px',
                    background: 'transparent', color: 'var(--text-muted)',
                  }}
                  title="Delete"
                >✕</button>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

// ── Builder ───────────────────────────────────────────────────────────────

const Builder: Component = () => {
  const [selectedWidget, setSelectedWidget] = createSignal<keyof LayoutConfig['widgets']>('chat')
  const [chatStatus, setChatStatus] = createSignal<'connected' | 'disconnected' | 'reconnecting' | ''>('')

  // Handle Spotify OAuth popup callback — popup lands here with ?code=, exchanges
  // it for tokens, messages the opener, then closes itself.
  onMount(() => {
    void handleOAuthCallback()
  })

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
    <div style={{
      height: '100vh', display: 'flex', 'flex-direction': 'column',
      background: 'var(--bg-app)', overflow: 'hidden',
      'font-family': 'var(--font-sans)', color: 'var(--text-body)',
    }}>

      {/* Header */}
      <header style={{
        height: 'var(--header-h)', 'flex-shrink': '0',
        'border-bottom': '1px solid var(--border-default)',
        background: 'var(--bg-base)',
        display: 'flex', 'align-items': 'center', 'justify-content': 'space-between',
        padding: '0 18px',
      }}>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '11px' }}>
          <img src="/logo-mark.svg" alt="Streamlite" style={{ width: '26px', height: '26px' }} />
          <span style={{
            'font-family': 'var(--font-display)', 'font-size': '18px',
            'font-weight': '700', 'letter-spacing': '-0.02em', color: 'var(--text-primary)',
          }}>Streamlite</span>
          <span style={{ color: 'var(--text-muted)', 'font-size': '14px' }}>/</span>
          <span style={{ 'font-size': '14px', color: 'var(--text-tertiary)', 'font-weight': '500' }}>Builder</span>
        </div>
        <Show when={chatStatus() === 'connected'}>
          <span style={{
            display: 'inline-flex', 'align-items': 'center', gap: '6px',
            'font-size': '12px', 'font-weight': '500', color: 'var(--green-500)',
            background: 'rgba(83,252,24,0.10)', padding: '4px 10px',
            'border-radius': 'var(--radius-pill)', border: '1px solid rgba(83,252,24,0.22)',
          }}>
            <span class="anim-pulse" style={{
              width: '7px', height: '7px', 'border-radius': '50%',
              background: 'var(--green-500)', 'flex-shrink': '0',
            }} />
            Live preview
          </span>
        </Show>
        <Show when={chatStatus() === 'reconnecting'}>
          <span style={{
            display: 'inline-flex', 'align-items': 'center', gap: '6px',
            'font-size': '12px', 'font-weight': '500', color: 'var(--warning)',
            background: 'rgba(255,194,61,0.10)', padding: '4px 10px',
            'border-radius': 'var(--radius-pill)', border: '1px solid rgba(255,194,61,0.22)',
          }}>
            <span style={{ width: '7px', height: '7px', 'border-radius': '50%', background: 'var(--warning)', 'flex-shrink': '0' }} />
            Reconnecting
          </span>
        </Show>
      </header>

      {/* Body */}
      <div style={{ flex: '1', display: 'flex', overflow: 'hidden' }}>

        {/* Left sidebar */}
        <aside style={{
          width: 'var(--sidebar-w)', 'flex-shrink': '0',
          'border-right': '1px solid var(--border-default)',
          background: 'var(--surface-1)',
          display: 'flex', 'flex-direction': 'column', overflow: 'hidden',
        }}>

          {/* Channel connect */}
          <div style={{ padding: '14px 14px 12px', 'border-bottom': '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'margin-bottom': '8px' }}>
              <span class="sl-eyebrow">Channel</span>
            </div>
            <div style={{
              display: 'flex', 'align-items': 'center',
              background: 'var(--surface-2)', 'border-radius': 'var(--radius-md)',
              border: '1px solid var(--border-default)', overflow: 'hidden',
            }}>
              <span style={{
                padding: '0 10px', 'font-size': '12px', color: 'var(--text-muted)',
                'font-family': 'var(--font-mono)', 'white-space': 'nowrap',
                'border-right': '1px solid var(--border-default)',
                height: '34px', display: 'flex', 'align-items': 'center',
              }}>kick.com/</span>
              <input
                type="text"
                placeholder="channelslug"
                style={{
                  flex: '1', 'min-width': '0', background: 'transparent',
                  border: 'none', outline: 'none',
                  padding: '0 10px', 'font-size': '13px', height: '34px',
                  color: 'var(--text-primary)', 'font-family': 'var(--font-mono)',
                }}
                value={builderConfig.kickChannelSlug ?? ''}
                onInput={(e) => setKickChannelSlug(e.currentTarget.value.trim())}
              />
            </div>
          </div>

          {/* Overlay library */}
          <OverlayLibrary />

          {/* Widget picker — compact 2-col grid, capped height, own scroll */}
          <div class="sl-scroll" style={{
            'flex-shrink': '0', 'max-height': '240px', 'overflow-y': 'auto',
            'border-bottom': '1px solid var(--border-default)',
          }}>
            <WidgetSelector selected={selectedWidget()} onSelect={setSelectedWidget} />
          </div>

          {/* Customize header — pinned between the two panels */}
          <div style={{
            'flex-shrink': '0', padding: '8px 14px 6px',
            'border-bottom': '1px solid var(--border-default)',
            background: 'var(--surface-1)',
            display: 'flex', 'align-items': 'center', 'justify-content': 'space-between',
          }}>
            <span class="sl-eyebrow">Customize</span>
            <span style={{ 'font-size': '11px', 'font-weight': '600', color: 'var(--violet-400)' }}>
              {selectedWidget()}
            </span>
          </div>

          {/* Style form — fills remaining space, own scroll */}
          <div class="sl-scroll" style={{ flex: '1', 'min-height': '0', 'overflow-y': 'auto' }}>
            <WidgetStyleForm widgetKey={selectedWidget()} />
          </div>

        </aside>

        {/* Preview canvas */}
        <main style={{
          flex: '1', 'min-width': '0',
          display: 'flex', 'flex-direction': 'column',
          background: 'var(--bg-canvas)',
          'background-image': 'var(--grad-canvas-glow)',
          overflow: 'hidden',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', 'align-items': 'center', 'justify-content': 'space-between',
            padding: '10px 20px 6px', 'flex-shrink': '0',
          }}>
            <span class="sl-eyebrow">Preview · 1920 × 1080</span>
            <span style={{
              display: 'inline-flex', 'align-items': 'center', gap: '6px',
              'font-size': '11px', color: 'var(--text-muted)',
            }}>
              <span style={{ width: '10px', height: '10px', 'border-radius': '3px', display: 'inline-block' }} class="sl-checkerboard" />
              Transparent canvas (OBS)
            </span>
          </div>

          {/* Canvas wrapper — fills remaining space, constrains by both width and height */}
          <div style={{
            flex: '1', 'min-height': '0',
            display: 'flex', 'align-items': 'center', 'justify-content': 'center',
            padding: '4px 20px 16px',
          }}>
            <div
              class="sl-checkerboard"
              style={{
                position: 'relative',
                'aspect-ratio': '16 / 9',
                width: '100%',
                'max-height': '100%',
                'border-radius': 'var(--radius-xl)',
                overflow: 'hidden',
                border: '1px solid var(--border-strong)',
                'box-shadow': 'var(--shadow-xl)',
              }}
            >
              <ChatBox      style={builderConfig.widgets.chat} />
              <AlertBox     style={builderConfig.widgets.alert} />
              <FollowerGoal style={builderConfig.widgets.followerGoal} />
              <ViewerCount  style={builderConfig.widgets.viewerCount} />
              <ClockWidget  style={builderConfig.widgets.clock} />
              <RecentEvents style={builderConfig.widgets.recentEvents} />
              <SubCount     style={builderConfig.widgets.subCount} />
              <CountdownTimer style={builderConfig.widgets.countdown} />
              <Ticker       style={builderConfig.widgets.ticker} />
              <TodoList     style={builderConfig.widgets.todoList} />
              <QRCode         style={builderConfig.widgets.qrCode} />
              <SpotifyWidget  style={builderConfig.widgets.spotify} />
              <DateTime       style={builderConfig.widgets.dateTime} />
            </div>
          </div>
        </main>

      </div>

      {/* Footer — overlay link */}
      <footer style={{
        'flex-shrink': '0',
        'border-top': '1px solid var(--border-default)',
        background: 'var(--bg-base)',
      }}>
        <LinkOutput />
      </footer>

    </div>
  )
}

export default Builder
