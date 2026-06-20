import { type Component, createMemo, Show } from 'solid-js'
import type { LayoutConfig } from '../../shared/types'
import { widgetStyleToCSS } from '../../shared/useWidgetStyle'

interface Props {
  style: LayoutConfig['widgets']['qrCode']
}

const QRCode: Component<Props> = (props) => {
  const qrSrc = createMemo(() => {
    const url = props.style.qrUrl?.trim()
    if (!url) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=000000&color=ffffff&margin=4`
  })

  return (
    <div style={widgetStyleToCSS(props.style)}>
      <div style={{
        position: 'absolute', inset: '0',
        'background-color': 'var(--bg-color)',
        opacity: 'var(--bg-opacity)',
        'border-radius': 'var(--border-radius)',
      }} aria-hidden="true" />

      <div style={{
        position: 'relative', height: '100%',
        display: 'flex', 'flex-direction': 'column',
        'align-items': 'center', 'justify-content': 'center',
        gap: '6px', padding: '6px', 'box-sizing': 'border-box',
      }}>
        <Show
          when={qrSrc()}
          fallback={
            <span style={{ color: 'var(--text-color)', opacity: '0.4', 'font-size': '0.85em', 'text-align': 'center' }}>
              Set a URL in the builder
            </span>
          }
        >
          <img
            src={qrSrc()}
            alt="QR Code"
            style={{
              flex: '1', 'min-height': '0', width: '100%',
              'object-fit': 'contain', 'border-radius': '4px',
            }}
          />
          <Show when={props.style.label}>
            <span style={{
              'font-size': '0.78em', color: 'var(--text-color)', 'font-weight': '500',
              'text-align': 'center', 'flex-shrink': '0',
            }}>
              {props.style.label}
            </span>
          </Show>
        </Show>
      </div>
    </div>
  )
}

export default QRCode
