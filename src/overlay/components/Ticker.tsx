import { createSignal, onCleanup, onMount, type Component, Show, For } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['ticker']
}

const Ticker: Component<Props> = (props) => {
  let containerEl!: HTMLDivElement
  let trackEl!: HTMLDivElement
  let raf = 0
  let pos = 0       // offset from the right edge; 0 = text starts just off-screen right
  let lastTime = 0
  const [copies, setCopies] = createSignal(4)

  const text = () => {
    const items = props.style.items ?? []
    return items.length > 0 ? items.join('   •   ') : ''
  }

  const speed = () => Math.max(10, props.style.speed)

  const tick = (t: number) => {
    raf = requestAnimationFrame(tick)
    if (!trackEl || !containerEl) return
    // Skip first frame — just capture baseline timestamp
    if (lastTime === 0) { lastTime = t; return }

    const dt = (t - lastTime) / 1000
    lastTime = t

    const W = containerEl.offsetWidth
    const N = copies()
    const copyW = N > 0 ? trackEl.scrollWidth / N : 300  // one copy width

    pos -= speed() * dt

    // When copy 1 has scrolled fully off the left edge, reset by one copy-width.
    // Because all copies are identical, the visual is seamless — copy 2's
    // position after reset matches copy 1's position before reset.
    if (pos <= -(W + copyW)) pos += copyW

    trackEl.style.transform = `translateX(${W + pos}px)`
  }

  onMount(() => {
    // First rAF: let the browser lay out the text so we can measure it
    raf = requestAnimationFrame(() => {
      if (!containerEl || !trackEl) return

      const W = containerEl.offsetWidth
      const N = copies()
      const oneW = trackEl.scrollWidth / N

      // Need enough copies so the track is always wider than the container
      // during the loop phase (when translateX swings between 0 and -copyW).
      // Condition: N * copyW >= W + copyW  →  N >= W/copyW + 1
      const needed = Math.max(2, Math.ceil(W / oneW) + 2)

      pos = 0
      lastTime = 0

      if (needed !== N) setCopies(needed)

      // Start animating on the next frame (after SolidJS flushes the copy count update)
      raf = requestAnimationFrame(tick)
    })
  })

  onCleanup(() => cancelAnimationFrame(raf))

  return (
    <div ref={containerEl} style={widgetStyleToCSS(props.style)}>
      <div style={{
        position: 'absolute', inset: '0',
        'background-color': 'var(--bg-color)',
        opacity: 'var(--bg-opacity)',
        'border-radius': 'var(--border-radius)',
      }} aria-hidden="true" />

      <div style={{
        position: 'relative', height: '100%',
        display: 'flex', 'align-items': 'center',
        overflow: 'hidden',
      }}>
        <Show
          when={text()}
          fallback={
            <span style={{ color: 'var(--text-color)', opacity: '0.4', padding: '0 12px', 'font-size': '0.85em' }}>
              Add ticker messages in the builder...
            </span>
          }
        >
          <div ref={trackEl} style={{ 'white-space': 'nowrap', 'will-change': 'transform' }}>
            <For each={Array.from({ length: copies() })}>
              {() => (
                <span style={{ 'padding-right': '80px', color: 'var(--text-color)', 'font-weight': '500' }}>
                  {text()}
                </span>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default Ticker
