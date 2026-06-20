import { type Component } from 'solid-js'

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Widgets', href: '/#widgets' },
  { label: 'Support', href: '/support.html' },
  { label: 'Feature Request', href: '/feature-request.html' },
]

const FAQ = [
  {
    q: 'Does Streamlite cost anything?',
    a: 'No. Every feature is completely free during early access. No account, no credit card, no limits.',
  },
  {
    q: 'How do I add the overlay to OBS?',
    a: 'Open the builder, set up your widgets, then copy the overlay link from the bottom bar. In OBS, add a Browser Source and paste the link. Set width to 1920 and height to 1080.',
  },
  {
    q: 'Does it work with Twitch or YouTube?',
    a: 'The overlay itself works anywhere. Chat and alert widgets are currently Kick-only. Twitch and YouTube support is on the roadmap.',
  },
  {
    q: 'Where is my overlay data saved?',
    a: 'Everything is encoded in the overlay URL itself — there is no server or database. Your overlay link is your save file. Bookmark it or share it freely.',
  },
  {
    q: 'How do I connect Spotify?',
    a: 'Enable the Spotify widget in the builder, then click "Connect Spotify". You\'ll be prompted to log in and grant read access to your currently playing track. No data is stored on our end.',
  },
  {
    q: 'My overlay shows a blank page / isn\'t updating.',
    a: 'Make sure the overlay URL is complete (it can be very long). In OBS, try right-clicking the browser source and selecting "Refresh". If using Kick chat, double-check your channel slug.',
  },
]

const Support: Component = () => {
  const cardStyle = {
    background: 'var(--grad-surface)', 'border-radius': 'var(--radius-xl)',
    border: '1px solid var(--border-default)', padding: '28px 32px',
  }

  return (
    <div style={{
      'min-height': '100vh', background: 'var(--bg-app)',
      'background-image': 'radial-gradient(100% 50% at 50% -5%, rgba(134,59,255,0.14) 0%, rgba(8,6,13,0) 55%)',
      'font-family': 'var(--font-sans)', color: 'var(--text-body)',
      display: 'flex', 'flex-direction': 'column',
    }}>

      {/* Nav */}
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
        <div style={{ display: 'flex', 'align-items': 'center', gap: '24px' }}>
          {NAV_LINKS.map(l => (
            <a href={l.href} style={{
              'font-size': '14px', color: l.href === '/support.html' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              'font-weight': '500', 'text-decoration': 'none',
            }}>{l.label}</a>
          ))}
        </div>
        <a href="/builder.html" style={{
          display: 'inline-flex', 'align-items': 'center', gap: '6px',
          'font-size': '14px', 'font-weight': '600', color: '#fff',
          'text-decoration': 'none', padding: '8px 18px',
          'border-radius': 'var(--radius-md)', background: 'var(--grad-brand)',
          'box-shadow': 'var(--glow-violet)',
        }}>Start free →</a>
      </nav>

      <div style={{ flex: '1', 'max-width': '900px', margin: '0 auto', padding: '60px 32px 80px', width: '100%' }}>

        <div class="sl-eyebrow" style={{ 'margin-bottom': '12px' }}>Support</div>
        <h1 style={{
          'font-size': 'clamp(32px, 5vw, 48px)', 'font-weight': '700',
          'letter-spacing': '-0.03em', color: 'var(--text-primary)',
          'font-family': 'var(--font-display)', margin: '0 0 10px',
        }}>We're here to help.</h1>
        <p style={{ 'font-size': '16px', color: 'var(--text-tertiary)', margin: '0 0 52px', 'line-height': '1.6' }}>
          Streamlite is built and maintained by one person. Response times may vary, but every message is read.
        </p>

        {/* Cards row */}
        <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '16px', 'margin-bottom': '52px' }}>

          {/* Ko-fi card */}
          <div style={{
            ...cardStyle,
            'border-color': 'rgba(255,94,91,0.3)',
            'background-image': 'radial-gradient(80% 80% at 50% 0%, rgba(255,94,91,0.10) 0%, transparent 70%)',
          }}>
            <div style={{ 'font-size': '32px', 'margin-bottom': '14px' }}>☕</div>
            <h2 style={{
              'font-size': '18px', 'font-weight': '700', color: 'var(--text-primary)',
              'font-family': 'var(--font-display)', margin: '0 0 10px',
            }}>Support the project</h2>
            <p style={{ 'font-size': '14px', color: 'var(--text-tertiary)', margin: '0 0 22px', 'line-height': '1.55' }}>
              Streamlite is free and always will be. If it's saved you time or made your stream look better,
              a coffee goes a long way toward keeping it alive and improving it.
            </p>
            <a
              href="https://ko-fi.com/YOUR_KOFI_USERNAME"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', 'align-items': 'center', gap: '8px',
                'font-size': '14px', 'font-weight': '600', color: '#ff5e5b',
                'text-decoration': 'none', padding: '9px 20px',
                'border-radius': 'var(--radius-md)',
                border: '1px solid rgba(255,94,91,0.35)',
                background: 'rgba(255,94,91,0.10)',
              }}
            >☕ Buy me a coffee on Ko-fi</a>
          </div>

          {/* Feature request card */}
          <div style={{
            ...cardStyle,
            'border-color': 'var(--border-violet)',
            'background-image': 'radial-gradient(80% 80% at 50% 0%, rgba(134,59,255,0.12) 0%, transparent 70%)',
          }}>
            <div style={{ 'font-size': '32px', 'margin-bottom': '14px' }}>💡</div>
            <h2 style={{
              'font-size': '18px', 'font-weight': '700', color: 'var(--text-primary)',
              'font-family': 'var(--font-display)', margin: '0 0 10px',
            }}>Request a feature</h2>
            <p style={{ 'font-size': '14px', color: 'var(--text-tertiary)', margin: '0 0 22px', 'line-height': '1.55' }}>
              Got an idea for a new widget, integration, or improvement?
              Submit a request and it'll go straight to the top of the roadmap consideration.
            </p>
            <a
              href="/feature-request.html"
              style={{
                display: 'inline-flex', 'align-items': 'center', gap: '8px',
                'font-size': '14px', 'font-weight': '600', color: 'var(--violet-300)',
                'text-decoration': 'none', padding: '9px 20px',
                'border-radius': 'var(--radius-md)',
                border: '1px solid var(--border-violet)',
                background: 'rgba(134,59,255,0.10)',
              }}
            >Submit a request →</a>
          </div>

        </div>

        {/* FAQ */}
        <h2 style={{
          'font-size': '22px', 'font-weight': '700', color: 'var(--text-primary)',
          'font-family': 'var(--font-display)', margin: '0 0 24px',
        }}>Frequently asked questions</h2>

        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '12px' }}>
          {FAQ.map(item => (
            <div style={{ ...cardStyle, padding: '20px 24px' }}>
              <div style={{
                'font-size': '15px', 'font-weight': '600', color: 'var(--text-primary)',
                'margin-bottom': '8px',
              }}>{item.q}</div>
              <div style={{ 'font-size': '14px', color: 'var(--text-tertiary)', 'line-height': '1.6' }}>{item.a}</div>
            </div>
          ))}
        </div>

        {/* Still stuck */}
        <div style={{
          'margin-top': '40px', 'text-align': 'center',
          padding: '28px', 'border-radius': 'var(--radius-xl)',
          border: '1px solid var(--border-default)', background: 'var(--surface-1)',
        }}>
          <div style={{ 'font-size': '15px', 'font-weight': '600', color: 'var(--text-secondary)', 'margin-bottom': '6px' }}>
            Still stuck?
          </div>
          <p style={{ 'font-size': '14px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
            Send a message directly and we'll sort it out.
          </p>
          <a
            href="mailto:subrotonaik@gmail.com?subject=Streamlite Support"
            style={{
              display: 'inline-flex', 'align-items': 'center', gap: '7px',
              'font-size': '14px', 'font-weight': '600', color: 'var(--text-secondary)',
              'text-decoration': 'none', padding: '9px 20px',
              'border-radius': 'var(--radius-md)',
              border: '1px solid var(--border-default)', background: 'var(--surface-2)',
            }}
          >Email us →</a>
        </div>

      </div>
    </div>
  )
}

export default Support
