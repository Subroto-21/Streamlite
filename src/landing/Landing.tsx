import { For, type Component } from 'solid-js'

// ── Icons ─────────────────────────────────────────────────────────────────

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
)

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

const IconBolt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z"/>
  </svg>
)

// ── Shared button styles ──────────────────────────────────────────────────

function Btn(p: {
  children: unknown
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  iconRight?: boolean
  fullWidth?: boolean
}) {
  const size = p.size ?? 'md'
  const variant = p.variant ?? 'primary'

  const pad = size === 'lg' ? '12px 26px' : size === 'sm' ? '6px 14px' : '9px 20px'
  const fontSize = size === 'lg' ? '16px' : size === 'sm' ? '13px' : '14px'

  const base: Record<string, string> = {
    display: 'inline-flex', 'align-items': 'center', gap: '7px',
    padding: pad, 'border-radius': 'var(--radius-md)', border: 'none',
    cursor: 'pointer', 'font-size': fontSize, 'font-weight': '600',
    'font-family': 'var(--font-sans)', transition: 'filter var(--dur-fast), box-shadow var(--dur-fast)',
    'text-decoration': 'none', 'white-space': 'nowrap',
    width: p.fullWidth ? '100%' : undefined as unknown as string,
    'justify-content': p.fullWidth ? 'center' : 'flex-start',
  }

  if (variant === 'primary') {
    base.background = 'var(--grad-brand)'
    base.color = '#fff'
    base['box-shadow'] = 'var(--glow-violet)'
  } else if (variant === 'secondary') {
    base.background = 'var(--surface-2)'
    base.color = 'var(--text-primary)'
    base.border = '1px solid var(--border-default)'
  } else {
    base.background = 'transparent'
    base.color = 'var(--text-secondary)'
    base.border = '1px solid transparent'
  }

  const el = p.href ? 'a' : 'button'
  return <Dynamic component={el} href={p.href} onClick={p.onClick} style={base}>{p.children}{p.iconRight && <IconArrow />}</Dynamic>
}

// Simple dynamic component helper
function Dynamic(p: { component: string; href?: string; onClick?: () => void; style: Record<string, string>; children: unknown }) {
  if (p.component === 'a') {
    return <a href={p.href ?? '#'} style={p.style}>{p.children as any}</a>
  }
  return <button onClick={p.onClick} style={p.style}>{p.children as any}</button>
}

// ── Nav ───────────────────────────────────────────────────────────────────

function Nav() {
  const links = ['Features', 'Widgets', 'Docs', 'Feature Request']
  return (
    <nav style={{
      position: 'sticky', top: '0', 'z-index': '20',
      display: 'flex', 'align-items': 'center', 'justify-content': 'space-between',
      padding: '0 32px', height: '60px',
      'border-bottom': '1px solid var(--border-subtle)',
      background: 'rgba(8,6,13,0.80)', 'backdrop-filter': 'blur(14px)',
    }}>
      <a href="/" style={{ display: 'flex', 'align-items': 'center', gap: '10px', 'text-decoration': 'none' }}>
        <img src="/logo-mark.svg" alt="" style={{ width: '26px', height: '26px' }} />
        <span style={{
          'font-family': 'var(--font-display)', 'font-size': '19px',
          'font-weight': '700', 'letter-spacing': '-0.02em', color: 'var(--text-primary)',
        }}>Streamlite</span>
      </a>

      <div style={{ display: 'flex', 'align-items': 'center', gap: '28px' }}>
        <For each={links}>
          {(l) => (
            <a
              href={l === 'Feature Request' ? '/feature-request.html' : `#${l.toLowerCase()}`}
              style={{
              'font-size': '14px', color: 'var(--text-tertiary)',
              'font-weight': '500', 'text-decoration': 'none',
              transition: 'color var(--dur-fast)',
            }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >{l}</a>
          )}
        </For>
      </div>

      <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
        <Btn variant="ghost" size="sm" href="/">Sign in</Btn>
        <Btn size="sm" href="/builder.html" iconRight>Start free</Btn>
      </div>
    </nav>
  )
}

// ── Product canvas (the widget motif hero) ────────────────────────────────

function ProductCanvas() {
  return (
    <div class="sl-checkerboard" style={{
      position: 'relative', width: '100%', 'aspect-ratio': '16 / 9',
      'border-radius': 'var(--radius-2xl)', overflow: 'hidden',
      border: '1px solid var(--border-strong)',
      'box-shadow': '0 40px 90px -30px rgba(0,0,0,0.8), var(--glow-violet)',
    }}>
      {/* Viewer count widget */}
      <div style={{
        position: 'absolute', left: '4%', top: '6%',
        background: 'rgba(11,8,16,0.72)', 'backdrop-filter': 'blur(8px)',
        'border-radius': '14px', padding: '7px 14px',
        display: 'flex', 'align-items': 'center', gap: '7px',
        color: '#ece7f6', 'font-size': '13px', 'font-weight': '500',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ color: '#ff4d63' }}>●</span>
        1,284 watching
      </div>

      {/* Alert widget */}
      <div style={{
        position: 'absolute', left: '50%', top: '9%',
        transform: 'translateX(-50%)',
        background: 'rgba(11,8,16,0.70)', 'backdrop-filter': 'blur(8px)',
        'border-radius': '16px', padding: '11px 24px', 'text-align': 'center',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{
          'font-family': 'var(--font-display)', 'font-weight': '700',
          color: '#53fc18', 'font-size': '17px',
        }}>Mira_Vex just subscribed!</span>
      </div>

      {/* Chat widget */}
      <div style={{
        position: 'absolute', left: '4%', bottom: '7%', width: '30%',
        background: 'rgba(8,6,13,0.72)', 'backdrop-filter': 'blur(8px)',
        'border-radius': '14px', padding: '11px 14px',
        display: 'flex', 'flex-direction': 'column', gap: '7px',
        color: '#ece7f6', 'font-size': '13px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div><span style={{ color: '#53fc18', 'font-weight': '600' }}>novareign</span>: this overlay is so clean 🔥</div>
        <div><span style={{ color: '#9c6bff', 'font-weight': '600' }}>kaistrom</span>: what tool is that??</div>
        <div><span style={{ color: '#4d7cff', 'font-weight': '600' }}>pixelwave</span>: built it in 2 min lol</div>
      </div>

      {/* Follower goal widget */}
      <div style={{
        position: 'absolute', right: '4%', bottom: '7%', width: '28%',
        background: 'rgba(8,6,13,0.72)', 'backdrop-filter': 'blur(8px)',
        'border-radius': '14px', padding: '11px 14px', color: '#ece7f6',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          display: 'flex', 'justify-content': 'space-between',
          'font-size': '12px', 'margin-bottom': '8px',
        }}>
          <span>Follower goal</span><span>340 / 500</span>
        </div>
        <div style={{
          height: '8px', background: 'rgba(255,255,255,0.12)',
          'border-radius': '4px', overflow: 'hidden',
        }}>
          <div style={{ width: '68%', height: '100%', background: '#863bff', 'border-radius': '4px' }} />
        </div>
      </div>
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      position: 'relative', padding: '72px 32px 48px',
      'max-width': '1320px', margin: '0 auto', 'text-align': 'center',
    }}>
      <div style={{ display: 'inline-flex', 'align-items': 'center', gap: '8px', 'margin-bottom': '24px' }}>
        <span style={{
          display: 'inline-flex', 'align-items': 'center', gap: '6px',
          'font-size': '12px', 'font-weight': '500', color: 'var(--violet-400)',
          background: 'rgba(134,59,255,0.12)', padding: '5px 12px',
          'border-radius': 'var(--radius-pill)', border: '1px solid var(--border-violet)',
        }}>
          No installs · works in OBS, Streamlabs & more
        </span>
      </div>

      <h1 style={{
        'font-size': 'clamp(38px, 6vw, 72px)', 'font-weight': '700',
        'letter-spacing': '-0.035em', 'line-height': '1.02',
        color: 'var(--text-primary)', 'max-width': '880px', margin: '0 auto',
        'font-family': 'var(--font-display)',
      }}>
        Stream brighter.<br />
        <span class="sl-grad-text">Overlays that look pro</span> in minutes.
      </h1>

      <p style={{
        'font-size': '19px', color: 'var(--text-secondary)',
        'max-width': '600px', margin: '22px auto 0', 'line-height': '1.6',
      }}>
        Drag in chat, alerts, goals and viewer counts. Tune them to your brand,
        copy one link into your broadcaster, and go live. Free to start — no account required.
      </p>

      <div style={{ display: 'flex', gap: '12px', 'justify-content': 'center', 'margin-top': '32px', 'flex-wrap': 'wrap' }}>
        <Btn size="lg" href="/builder.html" iconRight>Build your overlay</Btn>
        <Btn size="lg" variant="secondary" href="/builder.html">Open builder</Btn>
      </div>

      <div style={{ 'margin-top': '56px' }}>
        <ProductCanvas />
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────

const FEATURES = [
  { title: 'Drag-and-drop builder',   desc: 'Position every widget on a live 16:9 canvas. What you see is exactly what your viewers get.', accent: '#863bff' },
  { title: 'Themeable to your brand', desc: 'Colors, fonts, opacity, corner radius and entrance animations — per widget, in real time.',   accent: '#4d7cff' },
  { title: 'One link, any broadcaster', desc: 'Copy a single overlay URL into OBS, Streamlabs or Twitch Studio as a browser source.',      accent: '#53fc18' },
  { title: 'Chat-command control',    desc: 'Show or hide widgets mid-stream with !overlay commands — no alt-tabbing away.',               accent: '#863bff' },
  { title: 'Alerts that pop',         desc: 'Follows, subs and gifted subs with fade, slide and bounce animations out of the box.',        accent: '#ff8a3d' },
  { title: 'Goals & hype',            desc: 'Follower goals with animated progress bars to rally your community toward the next milestone.', accent: '#53fc18' },
]

function Features() {
  return (
    <section id="features" style={{ 'max-width': '1200px', margin: '0 auto', padding: '24px 32px 72px' }}>
      <div style={{ 'text-align': 'center', 'margin-bottom': '44px' }}>
        <div class="sl-eyebrow" style={{ 'margin-bottom': '12px' }}>Everything you need</div>
        <h2 style={{
          'font-size': 'clamp(26px, 4vw, 40px)', 'font-weight': '700',
          'letter-spacing': '-0.03em', color: 'var(--text-primary)',
          'font-family': 'var(--font-display)',
        }}>Built for every kind of streamer</h2>
      </div>
      <div style={{ display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '16px' }}>
        <For each={FEATURES}>
          {(f) => (
            <div
              style={{
                background: 'var(--grad-surface)', 'border-radius': 'var(--radius-xl)',
                border: '1px solid var(--border-default)', padding: '24px',
                transition: 'transform var(--dur-base), border-color var(--dur-base), box-shadow var(--dur-base)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.borderColor = 'var(--border-violet)'
                e.currentTarget.style.boxShadow = 'var(--glow-violet)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--border-default)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                width: '40px', height: '40px', 'border-radius': '11px',
                display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                background: f.accent + '22', color: f.accent, 'margin-bottom': '16px',
              }}>
                <IconBolt />
              </div>
              <h3 style={{
                'font-size': '16px', 'font-weight': '600', color: 'var(--text-primary)',
                'margin-bottom': '8px', 'font-family': 'var(--font-display)',
              }}>{f.title}</h3>
              <p style={{ 'font-size': '14px', color: 'var(--text-tertiary)', 'line-height': '1.55' }}>{f.desc}</p>
            </div>
          )}
        </For>
      </div>
    </section>
  )
}

// ── Free banner ───────────────────────────────────────────────────────────

const FREE_FEATS = [
  'All widgets, no limits',
  'Live drag-and-drop builder',
  'Unlimited overlay links',
  'Kick chat & alerts',
  'Spotify now playing',
  'No account required',
]

function FreeBanner() {
  return (
    <section style={{ 'max-width': '780px', margin: '0 auto', padding: '24px 32px 80px' }}>
      <div style={{
        background: 'var(--grad-surface)', 'border-radius': 'var(--radius-2xl)',
        border: '1px solid var(--border-violet)',
        'box-shadow': 'var(--glow-violet)',
        padding: '48px 40px', 'text-align': 'center',
        'background-image': 'radial-gradient(80% 100% at 50% 0%, rgba(134,59,255,0.18) 0%, transparent 70%)',
      }}>
        <span style={{
          display: 'inline-block', 'font-size': '12px', 'font-weight': '700',
          color: 'var(--green-500)', background: 'rgba(83,252,24,0.1)',
          border: '1px solid rgba(83,252,24,0.25)', 'border-radius': 'var(--radius-pill)',
          padding: '4px 14px', 'letter-spacing': '0.06em', 'text-transform': 'uppercase',
          'margin-bottom': '20px',
        }}>100% free</span>

        <h2 style={{
          'font-size': 'clamp(26px, 4vw, 38px)', 'font-weight': '700',
          'letter-spacing': '-0.03em', color: 'var(--text-primary)',
          'font-family': 'var(--font-display)', margin: '0 0 12px',
        }}>Everything included, always.</h2>

        <p style={{ 'font-size': '16px', color: 'var(--text-tertiary)', 'line-height': '1.55', margin: '0 0 32px' }}>
          No trial period. No credit card. No hidden tier.<br />
          Every feature ships free while we're in early access.
        </p>

        <div style={{
          display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '10px 32px',
          'text-align': 'left', 'max-width': '440px', margin: '0 auto 32px',
        }}>
          <For each={FREE_FEATS}>
            {(feat) => (
              <div style={{ display: 'flex', 'align-items': 'center', gap: '9px', 'font-size': '14px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--green-500)', 'flex-shrink': '0' }}><IconCheck /></span>
                {feat}
              </div>
            )}
          </For>
        </div>

        <Btn size="lg" href="/builder.html" iconRight>Build your overlay free</Btn>
      </div>
    </section>
  )
}

// ── Testimonial ───────────────────────────────────────────────────────────

function Testimonial() {
  return (
    <section style={{ 'max-width': '820px', margin: '0 auto', padding: '24px 32px 80px', 'text-align': 'center' }}>
      <div style={{
        display: 'flex', 'justify-content': 'center', 'align-items': 'center',
        width: '56px', height: '56px', 'border-radius': '50%',
        background: 'var(--grad-brand)', margin: '0 auto 22px',
        'font-family': 'var(--font-display)', 'font-size': '22px', 'font-weight': '700',
        color: '#fff',
      }}>N</div>
      <p style={{
        'font-family': 'var(--font-display)', 'font-size': 'clamp(20px, 3vw, 28px)',
        'font-weight': '600', 'letter-spacing': '-0.02em',
        color: 'var(--text-primary)', 'line-height': '1.38',
      }}>
        "I went from a blank canvas to a branded overlay before my intro music finished.
        My chat literally asked what software I switched to."
      </p>
      <div style={{ 'margin-top': '18px', 'font-size': '14px', color: 'var(--text-tertiary)' }}>
        Nova Reign · 12K followers on Kick
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section style={{ 'max-width': '1200px', margin: '0 auto 80px', padding: '0 32px' }}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        'border-radius': 'var(--radius-3xl)',
        border: '1px solid var(--border-violet)',
        background: 'var(--surface-1)',
        'background-image': 'radial-gradient(120% 140% at 50% 0%, rgba(134,59,255,0.28) 0%, rgba(8,6,13,0) 60%)',
        padding: '64px 32px', 'text-align': 'center',
      }}>
        <img src="/logo-mark.svg" alt="" style={{ width: '48px', height: '48px', 'margin-bottom': '20px' }} />
        <h2 style={{
          'font-size': 'clamp(28px, 4.5vw, 46px)', 'font-weight': '700',
          'letter-spacing': '-0.03em', color: 'var(--text-primary)',
          'max-width': '640px', margin: '0 auto', 'font-family': 'var(--font-display)',
        }}>Your next stream deserves a better overlay</h2>
        <p style={{ 'font-size': '17px', color: 'var(--text-secondary)', 'margin-top': '16px' }}>
          Free to start. Live in two minutes.
        </p>
        <div style={{ display: 'flex', gap: '12px', 'justify-content': 'center', 'margin-top': '28px' }}>
          <Btn size="lg" href="/builder.html" iconRight>Build your overlay</Btn>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      'border-top': '1px solid var(--border-subtle)',
      padding: '36px 32px',
      'max-width': '1320px', margin: '0 auto',
      display: 'flex', 'align-items': 'center', 'justify-content': 'space-between',
      'flex-wrap': 'wrap', gap: '20px',
    }}>
      <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
        <img src="/logo-mark.svg" alt="" style={{ width: '20px', height: '20px' }} />
        <span style={{ 'font-family': 'var(--font-display)', 'font-weight': '700', color: 'var(--text-secondary)' }}>
          Streamlite
        </span>
        <span style={{ 'font-size': '13px', color: 'var(--text-muted)', 'margin-left': '6px' }}>
          © 2026 · Stream brighter
        </span>
      </div>
      <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
        <a
          href="https://ko-fi.com/YOUR_KOFI_USERNAME"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', 'align-items': 'center', gap: '7px',
            'font-size': '13px', color: '#ff5e5b', 'text-decoration': 'none',
            padding: '6px 14px', 'border-radius': 'var(--radius-md)',
            border: '1px solid rgba(255,94,91,0.3)', background: 'rgba(255,94,91,0.08)',
            'font-weight': '500', transition: 'background var(--dur-fast)',
          }}
        >
          ☕ Support on Ko-fi
        </a>
        <a href="/builder.html" style={{
          'font-size': '13px', color: 'var(--text-tertiary)', 'text-decoration': 'none',
          padding: '6px 14px', 'border-radius': 'var(--radius-md)',
          border: '1px solid var(--border-default)', background: 'var(--surface-2)',
          'font-weight': '500',
        }}>Open Builder →</a>
      </div>
    </footer>
  )
}

// ── Landing page ──────────────────────────────────────────────────────────

const Landing: Component = () => {
  return (
    <div style={{
      'min-height': '100vh',
      background: 'var(--bg-app)',
      'background-image': 'radial-gradient(100% 50% at 50% -5%, rgba(134,59,255,0.14) 0%, rgba(8,6,13,0) 55%)',
      'font-family': 'var(--font-sans)',
      color: 'var(--text-body)',
    }}>
      <Nav />
      <Hero />
      <Features />
      <FreeBanner />
      <Testimonial />
      <CTA />
      <Footer />
    </div>
  )
}

export default Landing
