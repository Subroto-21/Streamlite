import { For, type Component } from 'solid-js'
import Nav from '../shared/marketing/Nav'
import Pill from '../shared/marketing/Pill'
import Eyebrow from '../shared/marketing/Eyebrow'

// ── Icons ─────────────────────────────────────────────────────────────────

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const IconBolt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12z" />
  </svg>
)

// ── Category color-coding — GSAP's discipline-label taxonomy, reused for
// Streamlite's own widget/feature groupings. Green stays reserved for the
// brand/CTA gradient stroke, never used here. ──────────────────────────────

type Category = 'chat' | 'alerts' | 'info' | 'integration'

const CATEGORY_COLOR: Record<Category, string> = {
  chat: 'var(--mkt-pink)',
  alerts: 'var(--mkt-orange)',
  info: 'var(--warning)',
  integration: 'var(--mkt-blue)',
}

const CATEGORY_LABEL: Record<Category, string> = {
  chat: 'Chat',
  alerts: 'Alerts',
  info: 'Info',
  integration: 'Integration',
}

// ── Showcase Card — near-black surface, 8px radius, no border/shadow ──────

function ShowcaseCard(p: { children: unknown; style?: Record<string, string> }) {
  return (
    <div style={{
      background: 'var(--mkt-offblack)', 'border-radius': 'var(--mkt-radius-card)',
      padding: '24px', ...p.style,
    }}>
      {p.children as any}
    </div>
  )
}

// ── Product canvas (the widget motif hero) ────────────────────────────────

function ProductCanvas() {
  return (
    <div class="sl-checkerboard" style={{
      position: 'relative', width: '100%', 'aspect-ratio': '16 / 9',
      'border-radius': 'var(--mkt-radius-card)', overflow: 'hidden',
      border: '1px solid var(--mkt-hairline)',
    }}>
      {/* Viewer count widget */}
      <div style={{
        position: 'absolute', left: '4%', top: '6%',
        background: 'rgba(14,16,15,0.8)', 'backdrop-filter': 'blur(8px)',
        'border-radius': '14px', padding: '7px 14px',
        display: 'flex', 'align-items': 'center', gap: '7px',
        color: 'var(--mkt-cream)', 'font-size': '13px', 'font-weight': '500',
        border: '1px solid var(--mkt-hairline)',
      }}>
        <span style={{ color: 'var(--warning)' }}>●</span>
        1,284 watching
      </div>

      {/* Alert widget */}
      <div style={{
        position: 'absolute', left: '50%', top: '9%',
        transform: 'translateX(-50%)',
        background: 'rgba(14,16,15,0.8)', 'backdrop-filter': 'blur(8px)',
        'border-radius': '16px', padding: '11px 24px', 'text-align': 'center',
        border: '1px solid var(--mkt-hairline)',
      }}>
        <span style={{
          'font-family': 'var(--mkt-font)', 'font-weight': '700',
          color: 'var(--mkt-green)', 'font-size': '17px',
        }}>Mira_Vex just subscribed!</span>
      </div>

      {/* Chat widget */}
      <div style={{
        position: 'absolute', left: '4%', bottom: '7%', width: '30%',
        background: 'rgba(14,16,15,0.8)', 'backdrop-filter': 'blur(8px)',
        'border-radius': '14px', padding: '11px 14px',
        display: 'flex', 'flex-direction': 'column', gap: '7px',
        color: 'var(--mkt-cream)', 'font-size': '13px',
        border: '1px solid var(--mkt-hairline)',
      }}>
        <div><span style={{ color: 'var(--mkt-pink)', 'font-weight': '600' }}>novareign</span>: this overlay is so clean 🔥</div>
        <div><span style={{ color: 'var(--warning)', 'font-weight': '600' }}>kaistrom</span>: what tool is that??</div>
        <div><span style={{ color: 'var(--mkt-blue)', 'font-weight': '600' }}>pixelwave</span>: built it in 2 min lol</div>
      </div>

      {/* Follower goal widget */}
      <div style={{
        position: 'absolute', right: '4%', bottom: '7%', width: '28%',
        background: 'rgba(14,16,15,0.8)', 'backdrop-filter': 'blur(8px)',
        'border-radius': '14px', padding: '11px 14px', color: 'var(--mkt-cream)',
        border: '1px solid var(--mkt-hairline)',
      }}>
        <div style={{
          display: 'flex', 'justify-content': 'space-between',
          'font-size': '12px', 'margin-bottom': '8px',
        }}>
          <span>Follower goal</span><span>340 / 500</span>
        </div>
        <div style={{
          height: '8px', background: 'var(--mkt-hairline)',
          'border-radius': '4px', overflow: 'hidden',
        }}>
          <div style={{ width: '68%', height: '100%', background: 'var(--mkt-orange)', 'border-radius': '4px' }} />
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
      'max-width': '1280px', margin: '0 auto', 'text-align': 'center',
    }}>
      <div style={{ 'margin-bottom': '24px' }}>
        <Eyebrow>No installs · works in OBS, Streamlabs & more</Eyebrow>
      </div>

      {/* Edge-bleeding display headline — no max-width cap on the h1 itself,
          only the section column is constrained, per DESIGN.md's Hero
          Display Headline spec. Size is clamped well below the doc's literal
          224px so the layout survives real viewports with a subhead, two
          CTAs, and a product screenshot below it. */}
      <h1 style={{
        'font-size': 'clamp(40px, 8vw, 128px)', 'font-weight': '600',
        'letter-spacing': '-0.02em', 'line-height': '0.95',
        color: 'var(--mkt-cream)', margin: '0 auto',
        'font-family': 'var(--mkt-font)',
      }}>
        Stream brighter.<br />
        <span style={{ color: 'var(--mkt-green)' }}>Overlays that look pro</span> in minutes.
      </h1>

      <p style={{
        'font-size': 'var(--mkt-text-body-lg)', color: 'var(--mkt-muted)',
        'max-width': '600px', margin: '22px auto 0', 'line-height': 'var(--mkt-lh-body-lg)',
      }}>
        Pick your widgets, position them on a live 16:9 canvas, tune them to your brand,
        copy one link into your broadcaster, and go live. Free to start — no account required.
      </p>

      <div style={{ display: 'flex', gap: '12px', 'justify-content': 'center', 'margin-top': '32px', 'flex-wrap': 'wrap' }}>
        <Pill size="lg" variant="primary" href="/builder.html" iconRight>Build your overlay</Pill>
        <Pill size="lg" variant="outline" href="/builder.html">Open builder</Pill>
      </div>

      <div style={{ 'margin-top': '56px' }}>
        <ProductCanvas />
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────────

const FEATURES: Array<{ title: string; desc: string; category: Category }> = [
  { title: 'Live visual builder',      desc: 'Position every widget on a live 16:9 canvas using precise controls. What you see is exactly what your viewers get.', category: 'info' },
  { title: 'Themeable to your brand',  desc: 'Colors, fonts, opacity, corner radius and entrance animations — per widget, in real time.',   category: 'info' },
  { title: 'One link, any broadcaster', desc: 'Copy a single overlay URL into OBS, Streamlabs or Twitch Studio as a browser source.',      category: 'integration' },
  { title: 'Chat-command control',     desc: 'Show or hide widgets mid-stream with !overlay commands — no alt-tabbing away.',               category: 'chat' },
  { title: 'Alerts that pop',          desc: 'Follows, subs and gifted subs with fade, slide and bounce animations out of the box.',        category: 'alerts' },
  { title: 'Goals & hype',             desc: 'Follower goals with animated progress bars to rally your community toward the next milestone.', category: 'alerts' },
]

function Features() {
  return (
    <section id="features" style={{ 'max-width': '1280px', margin: '0 auto', padding: '32px 32px 76px' }}>
      <div style={{ 'margin-bottom': '32px' }}>
        <Eyebrow>Why Streamlite</Eyebrow>
        <h2 style={{
          'font-size': 'var(--mkt-text-heading-sm)', 'font-weight': '600',
          'letter-spacing': 'var(--mkt-ls-heading-sm)', color: 'var(--mkt-cream)',
          'font-family': 'var(--mkt-font)', margin: '8px 0 0',
        }}>Built for every kind of streamer</h2>
      </div>
      <div style={{ display: 'grid', 'grid-template-columns': 'repeat(3, 1fr)', gap: '16px' }}>
        <For each={FEATURES}>
          {(f) => (
            <ShowcaseCard>
              <div style={{
                width: '40px', height: '40px', 'border-radius': '10px',
                display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                background: 'rgba(255,252,225,0.06)', color: CATEGORY_COLOR[f.category], 'margin-bottom': '16px',
              }}>
                <IconBolt />
              </div>
              <span style={{
                display: 'block', 'font-size': '13px', 'font-weight': '600',
                color: CATEGORY_COLOR[f.category], 'margin-bottom': '6px',
                'font-family': 'var(--mkt-font)',
              }}>{CATEGORY_LABEL[f.category]}</span>
              <h3 style={{
                'font-size': '17px', 'font-weight': '600', color: 'var(--mkt-cream)',
                'margin-bottom': '8px', 'font-family': 'var(--mkt-font)',
              }}>{f.title}</h3>
              <p style={{ 'font-size': '15px', color: 'var(--mkt-muted)', 'line-height': '1.55' }}>{f.desc}</p>
            </ShowcaseCard>
          )}
        </For>
      </div>
    </section>
  )
}

// ── Widgets showcase ──────────────────────────────────────────────────────

const WIDGETS: Array<{ name: string; emoji: string; desc: string; category: Category }> = [
  { name: 'Chat Box', emoji: '💬', desc: 'Live Kick chat displayed over your stream. Fully styled, scrollable, and chat-command aware.', category: 'chat' },
  { name: 'Alert Box', emoji: '🔔', desc: 'Pop-up notifications for new followers, subscribers, and gifted subs — with smooth animations.', category: 'alerts' },
  { name: 'Follower / Sub Goal', emoji: '🎯', desc: 'Animated progress bars showing your community how close you are to the next milestone.', category: 'alerts' },
  { name: 'Viewer Count', emoji: '👁️', desc: 'Live viewer count pulled from Kick. A quiet but powerful social proof widget.', category: 'info' },
  { name: 'Sub Count', emoji: '⭐', desc: 'Display your total subscriber count. Great for celebrating growth milestones mid-stream.', category: 'info' },
  { name: 'Countdown Timer', emoji: '⏱️', desc: 'Customisable countdown for stream start, segment end, or any timed event you want to hype.', category: 'info' },
  { name: 'Clock', emoji: '🕐', desc: 'Real-time clock in your choice of timezone. Useful for international audiences.', category: 'info' },
  { name: 'Date & Time', emoji: '📅', desc: 'Full date and time display with flexible formatting options for any locale.', category: 'info' },
  { name: 'Ticker', emoji: '📰', desc: 'A horizontal scrolling ticker for announcements, social handles, or sponsor shoutouts.', category: 'chat' },
  { name: 'Todo List', emoji: '✅', desc: "Show your stream's to-do list on screen. Knock items off live and keep chat engaged.", category: 'info' },
  { name: 'Recent Events', emoji: '📋', desc: 'A live log of recent follows and subscriptions — keeps the energy high between alerts.', category: 'chat' },
  { name: 'Stream Labels', emoji: '🏷️', desc: 'Latest follower, latest sub, top gifter, follower/sub/viewer counts — pick and arrange.', category: 'alerts' },
  { name: 'QR Code', emoji: '📷', desc: 'Auto-generated QR code from any URL. Perfect for pointing viewers to socials or a link-in-bio.', category: 'info' },
  { name: 'Spotify', emoji: '🎵', desc: 'Shows your currently playing track in Spotify Green. One-click OAuth — no API key needed.', category: 'integration' },
]

function Widgets() {
  return (
    <>
      <div style={{ 'max-width': '1280px', margin: '0 auto', height: '1px', background: 'var(--mkt-hairline)' }} />
      <section id="widgets" style={{ 'max-width': '1280px', margin: '0 auto', padding: '32px 32px 76px' }}>
        <div style={{ 'margin-bottom': '32px' }}>
          <Eyebrow>Widgets</Eyebrow>
          <h2 style={{
            'font-size': 'var(--mkt-text-heading-sm)', 'font-weight': '600',
            'letter-spacing': 'var(--mkt-ls-heading-sm)', color: 'var(--mkt-cream)',
            'font-family': 'var(--mkt-font)', margin: '8px 0 0',
          }}>14 widgets, zero configuration</h2>
          <p style={{ 'font-size': 'var(--mkt-text-body-sm)', color: 'var(--mkt-muted)', margin: '12px 0 0', 'max-width': '500px', 'line-height': '1.6' }}>
            Drop any widget onto your canvas and it works immediately. No accounts, no API keys for most, no setup headaches.
          </p>
        </div>

        <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          <For each={WIDGETS}>
            {(w) => (
              <ShowcaseCard style={{ display: 'flex', 'flex-direction': 'column', gap: '10px', padding: '20px 22px' }}>
                <div style={{ display: 'flex', 'align-items': 'center', gap: '11px' }}>
                  <span style={{
                    width: '38px', height: '38px', 'border-radius': '10px', 'flex-shrink': '0',
                    display: 'flex', 'align-items': 'center', 'justify-content': 'center',
                    background: 'rgba(255,252,225,0.06)', 'font-size': '19px',
                  }}>{w.emoji}</span>
                  <span style={{
                    'font-size': '15px', 'font-weight': '600', color: 'var(--mkt-cream)',
                    'font-family': 'var(--mkt-font)',
                  }}>{w.name}</span>
                </div>
                <span style={{ 'font-size': '12px', 'font-weight': '600', color: CATEGORY_COLOR[w.category] }}>{CATEGORY_LABEL[w.category]}</span>
                <p style={{ 'font-size': '13px', color: 'var(--mkt-muted)', 'line-height': '1.55', margin: '0' }}>
                  {w.desc}
                </p>
              </ShowcaseCard>
            )}
          </For>
        </div>

        <div style={{ 'text-align': 'center', 'margin-top': '36px' }}>
          <Pill variant="outline" href="/builder.html" iconRight>Try all widgets free</Pill>
        </div>
      </section>
    </>
  )
}

// ── Free banner ───────────────────────────────────────────────────────────

const FREE_FEATS = [
  'All widgets, no limits',
  'Live visual builder',
  'Unlimited overlay links',
  'Kick chat & alerts',
  'Spotify now playing',
  'No account required',
]

function FreeBanner() {
  return (
    <section style={{ 'max-width': '780px', margin: '0 auto', padding: '24px 32px 80px' }}>
      <div style={{
        background: 'var(--mkt-canvas)', 'border-radius': 'var(--mkt-radius-card)',
        border: '1px solid var(--mkt-cream)', padding: '48px 40px', 'text-align': 'center',
      }}>
        <div style={{ display: 'flex', 'justify-content': 'center', 'margin-bottom': '20px' }}>
          <Eyebrow>100% free</Eyebrow>
        </div>

        <h2 style={{
          'font-size': 'var(--mkt-text-subheading)', 'font-weight': '600',
          'letter-spacing': 'var(--mkt-ls-subheading)', color: 'var(--mkt-cream)',
          'font-family': 'var(--mkt-font)', margin: '0 0 12px',
        }}>Everything included, always.</h2>

        <p style={{ 'font-size': 'var(--mkt-text-body-sm)', color: 'var(--mkt-muted)', 'line-height': '1.55', margin: '0 0 32px' }}>
          No trial period. No credit card. No hidden tier.<br />
          Every feature ships free while we're in early access.
        </p>

        <div style={{
          display: 'grid', 'grid-template-columns': '1fr 1fr', gap: '10px 32px',
          'text-align': 'left', 'max-width': '440px', margin: '0 auto 32px',
        }}>
          <For each={FREE_FEATS}>
            {(feat) => (
              <div style={{ display: 'flex', 'align-items': 'center', gap: '9px', 'font-size': '14px', color: 'var(--mkt-cream)' }}>
                <span style={{ color: 'var(--mkt-green)', 'flex-shrink': '0' }}><IconCheck /></span>
                {feat}
              </div>
            )}
          </For>
        </div>

        <Pill size="lg" variant="primary" href="/builder.html" iconRight>Build your overlay free</Pill>
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
        background: 'var(--mkt-grad-green)', margin: '0 auto 22px',
        'font-family': 'var(--mkt-font)', 'font-size': '22px', 'font-weight': '700',
        color: 'var(--mkt-canvas)',
      }}>N</div>
      <p style={{
        'font-family': 'var(--mkt-font)', 'font-size': 'clamp(20px, 3vw, 28px)',
        'font-weight': '600', 'letter-spacing': '-0.01em',
        color: 'var(--mkt-cream)', 'line-height': '1.38',
      }}>
        "I went from a blank canvas to a branded overlay before my intro music finished.
        My chat literally asked what software I switched to."
      </p>
      <div style={{ 'margin-top': '18px', 'font-size': '14px', color: 'var(--mkt-muted)' }}>
        Nova Reign · 12K followers on Kick
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section style={{ 'max-width': '1280px', margin: '0 auto 80px', padding: '0 32px' }}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        'border-radius': 'var(--mkt-radius-card)',
        border: '1px solid var(--mkt-hairline)',
        background: 'var(--mkt-canvas)',
        padding: '64px 32px', 'text-align': 'center',
      }}>
        <img src="/logo-mark.svg" alt="" style={{ width: '44px', height: '44px', 'margin-bottom': '20px' }} />
        <h2 style={{
          'font-size': 'var(--mkt-text-heading)', 'font-weight': '600',
          'letter-spacing': 'var(--mkt-ls-heading)', color: 'var(--mkt-cream)',
          'max-width': '640px', margin: '0 auto', 'font-family': 'var(--mkt-font)',
        }}>Your next stream deserves a better overlay</h2>
        <p style={{ 'font-size': '17px', color: 'var(--mkt-muted)', 'margin-top': '16px' }}>
          Free to start. Live in two minutes.
        </p>
        <div style={{ display: 'flex', gap: '12px', 'justify-content': 'center', 'margin-top': '28px' }}>
          <Pill size="lg" variant="primary" href="/builder.html" iconRight>Build your overlay</Pill>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      background: 'var(--mkt-offblack)',
      'border-top': '1px solid var(--mkt-hairline)',
      padding: '60px 32px',
    }}>
      <div style={{
        'max-width': '1280px', margin: '0 auto',
        display: 'flex', 'align-items': 'center', 'justify-content': 'space-between',
        'flex-wrap': 'wrap', gap: '20px',
      }}>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '10px' }}>
          <img src="/logo-mark.svg" alt="" style={{ width: '20px', height: '20px' }} />
          <span style={{ 'font-family': 'var(--mkt-font)', 'font-weight': '700', color: 'var(--mkt-cream)' }}>
            Streamlite
          </span>
          <span style={{ 'font-size': '13px', color: 'var(--mkt-muted)', 'margin-left': '6px' }}>
            © 2026 · Stream brighter
          </span>
        </div>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '4px' }}>
          <Pill variant="ghost" size="sm" href="/support.html">Support</Pill>
          <Pill variant="ghost" size="sm" href="/feature-request.html">Feature Request</Pill>
          <Pill variant="ghost" size="sm" href="/builder.html" iconRight>Open Builder</Pill>
        </div>
      </div>
    </footer>
  )
}

// ── Landing page ──────────────────────────────────────────────────────────

const Landing: Component = () => {
  return (
    <div style={{
      'min-height': '100vh',
      background: 'var(--mkt-canvas)',
      'font-family': 'var(--mkt-font)',
      color: 'var(--mkt-cream)',
    }}>
      <Nav activeHref="/" />
      <Hero />
      <Features />
      <Widgets />
      <FreeBanner />
      <Testimonial />
      <CTA />
      <Footer />
    </div>
  )
}

export default Landing
