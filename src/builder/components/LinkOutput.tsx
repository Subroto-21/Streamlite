import { createEffect, createSignal, onCleanup, type Component } from 'solid-js'
import LZString from 'lz-string'
import { builderConfig } from '../store/builderConfigStore'

const LinkOutput: Component = () => {
  const [overlayUrl, setOverlayUrl] = createSignal('')
  const [copied, setCopied] = createSignal(false)
  let debounceTimer: ReturnType<typeof setTimeout>
  let copyTimer: ReturnType<typeof setTimeout>

  createEffect(() => {
    // JSON.stringify reads through the SolidJS store proxy, registering reactive
    // dependencies on every property. The effect re-runs on any config change.
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
    <div class="flex items-center gap-3 px-6 py-3">
      <span class="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">Overlay URL</span>
      <input
        type="text"
        readOnly
        class="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 font-mono min-w-0"
        value={overlayUrl()}
        onClick={(e) => e.currentTarget.select()}
      />
      <button
        class={`px-4 py-1.5 rounded text-sm font-medium flex-shrink-0 transition-colors ${
          copied()
            ? 'bg-green-700 text-green-200'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
        onClick={copy}
      >
        {copied() ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

export default LinkOutput
