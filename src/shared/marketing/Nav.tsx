import { For } from 'solid-js'
import Pill from './Pill'

export const MARKETING_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Widgets', href: '/#widgets' },
  { label: 'Support', href: '/support.html' },
  { label: 'Feature Request', href: '/feature-request.html' },
]

interface Props {
  activeHref?: string
  links?: Array<{ label: string; href: string }>
  ctaLabel?: string
  ctaHref?: string
}

const Nav = (props: Props) => {
  const links = () => props.links ?? MARKETING_LINKS
  return (
    <nav style={{
      position: 'sticky', top: '0', 'z-index': '20',
      display: 'flex', 'align-items': 'center', 'justify-content': 'space-between',
      padding: '0 32px', height: '64px',
      'border-bottom': '1px solid var(--mkt-hairline)',
      background: 'rgba(14,16,15,0.85)', 'backdrop-filter': 'blur(14px)',
    }}>
      <a href="/" style={{ display: 'flex', 'align-items': 'center', gap: '10px', 'text-decoration': 'none' }}>
        <img src="/logo-mark.svg" alt="" style={{ width: '24px', height: '24px' }} />
        <span style={{
          'font-family': 'var(--mkt-font)', 'font-size': '18px',
          'font-weight': '700', 'letter-spacing': '-0.01em', color: 'var(--mkt-cream)',
        }}>Streamlite</span>
      </a>

      <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
        <For each={links()}>
          {(l) => (
            <Pill variant="ghost" href={l.href} size="sm">
              <span style={{ color: l.href === props.activeHref ? 'var(--mkt-cream)' : 'var(--mkt-muted)' }}>{l.label}</span>
            </Pill>
          )}
        </For>
      </div>

      <Pill variant="primary" size="sm" href={props.ctaHref ?? '/builder.html'} iconRight>
        {props.ctaLabel ?? 'Start free'}
      </Pill>
    </nav>
  )
}

export default Nav
