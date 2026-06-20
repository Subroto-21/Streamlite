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

        {/* Support cards */}
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '16px', 'margin-bottom': '52px' }}>

          {/* PayPal + GPay row */}
          <div style={{ display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '16px' }}>

            {/* PayPal card */}
            <div style={{
              ...cardStyle,
              'border-color': 'rgba(0,112,240,0.3)',
              'background-image': 'radial-gradient(80% 80% at 50% 0%, rgba(0,112,240,0.10) 0%, transparent 70%)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" style={{ 'margin-bottom': '14px' }}>
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082H9.825l-1.197 7.573h3.174c.458 0 .845-.332.917-.784l.038-.196.727-4.613.047-.252c.072-.452.46-.784.917-.784h.578c3.741 0 6.671-1.52 7.526-5.916.36-1.847.174-3.389-.376-4.823z" fill="#009cde"/>
              </svg>
              <h2 style={{
                'font-size': '18px', 'font-weight': '700', color: 'var(--text-primary)',
                'font-family': 'var(--font-display)', margin: '0 0 10px',
              }}>PayPal</h2>
              <p style={{ 'font-size': '14px', color: 'var(--text-tertiary)', margin: '0 0 22px', 'line-height': '1.55' }}>
                Send any amount directly via PayPal — one-time, no strings attached. Works from anywhere in the world.
              </p>
              <a
                href="https://paypal.me/YOUR_PAYPAL_USERNAME"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', 'align-items': 'center', gap: '8px',
                  'font-size': '14px', 'font-weight': '600', color: '#009cde',
                  'text-decoration': 'none', padding: '9px 20px',
                  'border-radius': 'var(--radius-md)',
                  border: '1px solid rgba(0,112,240,0.35)',
                  background: 'rgba(0,112,240,0.10)',
                }}
              >Tip via PayPal →</a>
            </div>

            {/* GPay / UPI card */}
            <div style={{
              ...cardStyle,
              'border-color': 'rgba(52,168,83,0.3)',
              'background-image': 'radial-gradient(80% 80% at 50% 0%, rgba(52,168,83,0.10) 0%, transparent 70%)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" style={{ 'margin-bottom': '14px' }}>
                <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.618 9.48l-5.84 8.72a.72.72 0 0 1-1.207-.033L7.4 13.72a.72.72 0 0 1 1.2-.79l2.54 3.85 5.24-7.82a.72.72 0 0 1 1.238.52z" fill="#34A853"/>
              </svg>
              <h2 style={{
                'font-size': '18px', 'font-weight': '700', color: 'var(--text-primary)',
                'font-family': 'var(--font-display)', margin: '0 0 10px',
              }}>GPay / UPI</h2>
              <p style={{ 'font-size': '14px', color: 'var(--text-tertiary)', margin: '0 0 16px', 'line-height': '1.55' }}>
                In India? Send directly via GPay, PhonePe, or any UPI app — instant and free.
              </p>
              <div style={{
                background: 'var(--surface-2)', 'border-radius': 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                padding: '10px 14px', 'margin-bottom': '16px',
                'font-family': 'var(--font-mono)', 'font-size': '14px',
                color: 'var(--text-primary)', 'letter-spacing': '0.02em',
              }}>
                YOUR_UPI_ID@bank
              </div>
              <p style={{ 'font-size': '12px', color: 'var(--text-muted)', margin: '0' }}>
                Open any UPI app → Send money → paste the ID above
              </p>
            </div>

          </div>

          {/* Feature request card — full width */}
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
