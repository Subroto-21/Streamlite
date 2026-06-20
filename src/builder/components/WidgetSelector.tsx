import { For, type Component } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { builderConfig, setBuilderConfig } from '../store/builderConfigStore'
import { applyConfigPatch } from '../../shared/applyConfigPatch'

const WIDGET_ICONS: Record<string, string> = {
  chat:         `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  alert:        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
  followerGoal: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`,
  viewerCount:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/></svg>`,
  clock:        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  recentEvents: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  subCount:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  countdown:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 1 .586 1.414L12 12l4.414-4.414A2 2 0 0 1 17 6.172V2"/></svg>`,
  ticker:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  todoList:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  qrCode:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="6" y="6" width="1" height="1" fill="currentColor"/><rect x="17" y="6" width="1" height="1" fill="currentColor"/><rect x="6" y="17" width="1" height="1" fill="currentColor"/></svg>`,
  spotify:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 11.973c2.5-1.473 5.5-.973 7.5.527M9 15c1.667-1 4.333-.667 6 .5M10 18c1.167-.5 2.833-.5 4 0"/></svg>`,
  dateTime:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
}

const WIDGETS: Array<{ key: keyof LayoutConfig['widgets']; label: string }> = [
  { key: 'chat',         label: 'Chat' },
  { key: 'alert',        label: 'Alerts' },
  { key: 'followerGoal', label: 'Follower Goal' },
  { key: 'viewerCount',  label: 'Viewer Count' },
  { key: 'clock',        label: 'Clock' },
  { key: 'recentEvents', label: 'Recent Events' },
  { key: 'subCount',     label: 'Sub Count' },
  { key: 'countdown',    label: 'Countdown' },
  { key: 'ticker',       label: 'Ticker' },
  { key: 'todoList',     label: 'Goals / To-Do' },
  { key: 'qrCode',       label: 'QR Code' },
  { key: 'spotify',      label: 'Spotify' },
  { key: 'dateTime',     label: 'Date & Time' },
]

interface Props {
  selected: keyof LayoutConfig['widgets']
  onSelect: (key: keyof LayoutConfig['widgets']) => void
}

const WidgetSelector: Component<Props> = (props) => (
  <div>
    <p class="sl-eyebrow" style={{ padding: '8px 12px 6px' }}>Widgets</p>
    <div style={{
      display: 'grid',
      'grid-template-columns': '1fr 1fr',
      gap: '4px',
      padding: '0 8px 10px',
    }}>
      <For each={WIDGETS}>
        {(w) => {
          const active = () => props.selected === w.key
          const enabled = () => builderConfig.widgets[w.key].enabled
          return (
            <div
              onClick={() => props.onSelect(w.key)}
              style={{
                display: 'flex', 'align-items': 'center', gap: '7px',
                padding: '7px 8px', 'border-radius': 'var(--radius-md)',
                cursor: 'pointer', 'user-select': 'none',
                background: active() ? 'rgba(134,59,255,0.14)' : 'var(--surface-2)',
                border: `1px solid ${active() ? 'var(--border-violet)' : 'var(--border-default)'}`,
                transition: 'background var(--dur-base), border-color var(--dur-base)',
              }}
            >
              {/* Icon box */}
              <span style={{
                display: 'inline-flex', 'flex-shrink': '0',
                width: '20px', height: '20px', 'border-radius': '5px',
                'align-items': 'center', 'justify-content': 'center',
                background: active() ? 'var(--grad-brand)' : 'var(--surface-3)',
                color: active() ? '#fff' : 'var(--text-tertiary)',
              }} innerHTML={WIDGET_ICONS[w.key]} />

              {/* Label */}
              <span style={{
                flex: '1', 'min-width': '0',
                'font-size': '11px', 'font-weight': '600', 'line-height': '1.2',
                color: active() ? 'var(--text-primary)' : 'var(--text-secondary)',
                overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap',
              }}>{w.label}</span>

              {/* Enable toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  applyConfigPatch(setBuilderConfig, { [w.key]: { enabled: !enabled() } })
                }}
                title={enabled() ? 'Disable' : 'Enable'}
                style={{
                  'flex-shrink': '0', width: '28px', height: '16px',
                  'border-radius': 'var(--radius-pill)', border: 'none',
                  cursor: 'pointer', padding: '0', position: 'relative',
                  background: enabled() ? 'var(--green-500)' : 'var(--surface-4)',
                  transition: 'background var(--dur-base)',
                }}
              >
                <span style={{
                  position: 'absolute', top: '2px',
                  left: enabled() ? 'calc(100% - 14px)' : '2px',
                  width: '12px', height: '12px', 'border-radius': '50%',
                  background: '#fff',
                  transition: 'left var(--dur-base) var(--ease-spring)',
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
