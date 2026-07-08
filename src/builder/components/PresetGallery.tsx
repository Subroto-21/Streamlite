import { For, type Component } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { PRESETS, buildPresetConfig, type OverlayPreset } from '../presets'

interface Props {
  onClose: () => void
  onSelect: (config: LayoutConfig) => void
}

function PresetSwatch(p: { preset: OverlayPreset }) {
  const t = p.preset.theme
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100px',
      'border-radius': 'var(--radius-md)', overflow: 'hidden',
      background: t.backgroundColor, border: '1px solid var(--border-default)',
    }}>
      {/* Mini chat-bubble mockup */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', 'flex-direction': 'column', gap: '5px' }}>
        <div style={{ width: '60px', height: '6px', 'border-radius': `${Math.min(t.borderRadius, 6)}px`, background: t.textColor, opacity: '0.7' }} />
        <div style={{ width: '42px', height: '6px', 'border-radius': `${Math.min(t.borderRadius, 6)}px`, background: t.textColor, opacity: '0.5' }} />
      </div>
      {/* Mini alert-box mockup */}
      <div style={{
        position: 'absolute', bottom: '10px', right: '10px',
        width: '64px', height: '26px', 'border-radius': `${t.borderRadius}px`,
        background: t.accentColor, opacity: '0.85',
      }} />
    </div>
  )
}

const PresetGallery: Component<Props> = (props) => {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) props.onClose() }}
      style={{
        position: 'fixed', inset: '0', 'z-index': '100',
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', 'align-items': 'center', 'justify-content': 'center',
      }}
    >
      <div style={{
        background: 'var(--surface-1)', border: '1px solid var(--border-default)',
        'border-radius': 'var(--radius-xl)', padding: '20px 22px',
        'box-shadow': 'var(--shadow-xl)', width: '640px', 'max-width': '92vw',
      }}>
        <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'margin-bottom': '16px' }}>
          <span style={{ 'font-size': '16px', 'font-weight': '700', color: 'var(--text-primary)' }}>Overlay Presets</span>
          <button
            onClick={props.onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', 'font-size': '18px', 'line-height': '1', padding: '4px',
            }}
          >✕</button>
        </div>

        <div style={{ display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '12px' }}>
          <For each={PRESETS}>
            {(preset) => (
              <div style={{
                background: 'var(--surface-2)', border: '1px solid var(--border-default)',
                'border-radius': 'var(--radius-lg)', padding: '10px', display: 'flex',
                'flex-direction': 'column', gap: '8px',
              }}>
                <PresetSwatch preset={preset} />
                <span style={{ 'font-size': '13px', 'font-weight': '700', color: 'var(--text-primary)' }}>{preset.name}</span>
                <span style={{ 'font-size': '11px', color: 'var(--text-tertiary)', 'line-height': '1.4', flex: '1' }}>{preset.description}</span>
                <button
                  onClick={() => props.onSelect(buildPresetConfig(preset))}
                  style={{
                    padding: '7px', 'border-radius': 'var(--radius-md)',
                    border: '1px solid var(--border-brand)',
                    cursor: 'pointer', 'font-size': '12px', 'font-weight': '600',
                    background: 'transparent', color: 'var(--green-500)',
                  }}
                >Use this</button>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}

export default PresetGallery
