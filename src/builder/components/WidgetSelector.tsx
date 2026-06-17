import { For, type Component } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { builderConfig, setBuilderConfig } from '../store/builderConfigStore'
import { applyConfigPatch } from '../../shared/applyConfigPatch'

const WIDGET_ICONS: Record<string, string> = {
  chat: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
  followerGoal: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`,
  viewerCount: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/></svg>`,
  clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  recentEvents: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
}

const WIDGETS: Array<{ key: keyof LayoutConfig['widgets']; label: string; desc: string }> = [
  { key: 'chat',         label: 'Chat',           desc: 'Live messages' },
  { key: 'alert',        label: 'Alerts',          desc: 'Follows & subs' },
  { key: 'followerGoal', label: 'Follower Goal',   desc: 'Progress bar' },
  { key: 'viewerCount',  label: 'Viewer Count',    desc: 'Live audience' },
  { key: 'clock',        label: 'Clock',           desc: 'Live time' },
  { key: 'recentEvents', label: 'Recent Events',   desc: 'Last subs & gifts' },
]

interface Props {
  selected: keyof LayoutConfig['widgets']
  onSelect: (key: keyof LayoutConfig['widgets']) => void
}

const WidgetSelector: Component<Props> = (props) => (
  <div style={{ padding: '10px 10px 6px', 'border-bottom': '1px solid var(--border-default)' }}>
    <p class="sl-eyebrow" style={{ 'margin-bottom': '8px', 'padding-left': '2px' }}>Widgets</p>
    <div style={{ display: 'flex', 'flex-direction': 'column', gap: '2px' }}>
      <For each={WIDGETS}>
        {(w) => {
          const active = () => props.selected === w.key
          const enabled = () => builderConfig.widgets[w.key].enabled
          return (
            <div
              onClick={() => props.onSelect(w.key)}
              style={{
                display: 'flex', 'align-items': 'center', gap: '10px',
                padding: '8px 10px', 'border-radius': 'var(--radius-md)',
                cursor: 'pointer',
                background: active() ? 'rgba(134,59,255,0.14)' : 'transparent',
                border: `1px solid ${active() ? 'var(--border-violet)' : 'transparent'}`,
                transition: 'background var(--dur-base), border-color var(--dur-base)',
              }}
            >
              {/* Icon box */}
              <span style={{
                display: 'inline-flex', width: '28px', height: '28px',
                'border-radius': '7px', 'align-items': 'center', 'justify-content': 'center',
                background: active() ? 'var(--grad-brand)' : 'var(--surface-3)',
                color: active() ? '#fff' : 'var(--text-tertiary)',
                'flex-shrink': '0',
              }} innerHTML={WIDGET_ICONS[w.key]} />

              {/* Label + desc */}
              <div style={{ flex: '1', 'min-width': '0' }}>
                <div style={{
                  'font-size': '13px', 'font-weight': '600',
                  color: active() ? 'var(--text-primary)' : 'var(--text-secondary)',
                  'line-height': '1.2',
                }}>{w.label}</div>
                <div style={{ 'font-size': '11px', color: 'var(--text-muted)', 'margin-top': '1px' }}>{w.desc}</div>
              </div>

              {/* Enable toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  applyConfigPatch(setBuilderConfig, { [w.key]: { enabled: !enabled() } })
                }}
                style={{
                  'flex-shrink': '0', width: '32px', height: '18px',
                  'border-radius': 'var(--radius-pill)', border: 'none',
                  cursor: 'pointer', transition: 'background var(--dur-base)',
                  background: enabled() ? 'var(--green-500)' : 'var(--surface-4)',
                  position: 'relative', padding: '0',
                }}
                title={enabled() ? 'Disable widget' : 'Enable widget'}
              >
                <span style={{
                  position: 'absolute', top: '2px',
                  left: enabled() ? 'calc(100% - 16px)' : '2px',
                  width: '14px', height: '14px', 'border-radius': '50%',
                  background: '#fff', transition: 'left var(--dur-base) var(--ease-spring)',
                  'box-shadow': '0 1px 3px rgba(0,0,0,0.4)',
                }} />
              </button>
            </div>
          )
        }}
      </For>
    </div>
  </div>
)

export default WidgetSelector
