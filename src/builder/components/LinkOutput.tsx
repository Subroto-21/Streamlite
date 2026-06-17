import { createEffect, createSignal, onCleanup, type Component } from 'solid-js'
import LZString from 'lz-string'
import { builderConfig } from '../store/builderConfigStore'

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="11" height="11" rx="2"/>
    <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

const LinkOutput: Component = () => {
  const [overlayUrl, setOverlayUrl] = createSignal('')
  const [copied, setCopied] = createSignal(false)
  let debounceTimer: ReturnType<typeof setTimeout>
  let copyTimer: ReturnType<typeof setTimeout>

  createEffect(() => {
    const json = JSON.stringify(builderConfig)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const compressed = LZString.compressToEncodedURIComponent(json)
      setOverlayUrl(`${window.location.origin}/overlay.html?c=${compressed}`)
    }, 150)
    onCleanup(() => clearTimeout(debounceTimer))
  })

  const copy = async () => {
    if (!overlayUrl()) return
    await navigator.clipboard.writeText(overlayUrl())
    setCopied(true)
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      display: 'flex', 'align-items': 'center', gap: '10px',
      padding: '10px 16px',
    }}>
      <span style={{
        display: 'inline-flex', 'align-items': 'center', gap: '6px',
        'font-size': '12px', 'font-weight': '500', color: 'var(--violet-400)',
        'flex-shrink': '0', 'white-space': 'nowrap',
      }}>
        <BoltIcon />
        Overlay URL
      </span>

      <input
        type="text"
        readonly
        style={{
          flex: '1', 'min-width': '0',
          background: 'var(--surface-2)',
          border: '1px solid var(--border-default)',
          'border-radius': 'var(--radius-md)',
          padding: '7px 12px',
          'font-size': '12px',
          'font-family': 'var(--font-mono)',
          color: 'var(--text-tertiary)',
          outline: 'none',
          cursor: 'text',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
        }}
        value={overlayUrl()}
        onClick={(e) => e.currentTarget.select()}
      />

      <button
        onClick={copy}
        style={{
          display: 'inline-flex', 'align-items': 'center', gap: '6px',
          'flex-shrink': '0', padding: '7px 14px',
          'border-radius': 'var(--radius-md)', border: 'none', cursor: 'pointer',
          'font-size': '13px', 'font-weight': '600',
          transition: 'background var(--dur-fast), box-shadow var(--dur-fast)',
          background: copied() ? 'var(--green-600)' : 'var(--grad-brand)',
          color: copied() ? 'var(--text-on-green)' : 'var(--text-on-violet)',
          'box-shadow': copied() ? 'var(--glow-green)' : 'var(--glow-violet)',
        }}
      >
        {copied() ? <CheckIcon /> : <CopyIcon />}
        {copied() ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}

export default LinkOutput
