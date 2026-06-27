import { createSignal, type Component } from 'solid-js'

const CATEGORIES = ['New Widget', 'Builder / UI', 'Spotify / Music', 'Alerts', 'Performance', 'Other']

const FeatureRequest: Component = () => {
  const [title, setTitle] = createSignal('')
  const [category, setCategory] = createSignal(CATEGORIES[0])
  const [description, setDescription] = createSignal('')
  const [submitted, setSubmitted] = createSignal(false)

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    const subject = encodeURIComponent(`[Feature Request] ${title()}`)
    const body = encodeURIComponent(
      `Category: ${category()}\n\nDescription:\n${description()}\n\n---\nSent from Streamlite feature request page`
    )
    window.location.href = `mailto:subrotonaik@gmail.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', 'box-sizing': 'border-box' as const,
    background: 'var(--surface-2)', border: '1px solid var(--border-default)',
    'border-radius': 'var(--radius-md)', padding: '10px 14px',
    'font-size': '14px', color: 'var(--text-primary)',
    'font-family': 'var(--font-sans)', outline: 'none',
    transition: 'border-color var(--dur-fast)',
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
        <a href="/builder.html" style={{
          'font-size': '14px', 'font-weight': '600', color: 'var(--text-tertiary)',
          'text-decoration': 'none', padding: '7px 16px',
          'border-radius': 'var(--radius-md)', border: '1px solid var(--border-default)',
          background: 'var(--surface-2)', transition: 'color var(--dur-fast)',
        }}>Open Builder →</a>
      </nav>

      {/* Content */}
      <div style={{ flex: '1', display: 'flex', 'align-items': 'center', 'justify-content': 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', 'max-width': '560px' }}>

          <div class="sl-eyebrow" style={{ 'margin-bottom': '12px' }}>Feature Request</div>
          <h1 style={{
            'font-size': 'clamp(28px, 4vw, 40px)', 'font-weight': '700',
            'letter-spacing': '-0.03em', color: 'var(--text-primary)',
            'font-family': 'var(--font-display)', margin: '0 0 10px',
          }}>What should we build next?</h1>
          <p style={{ 'font-size': '15px', color: 'var(--text-tertiary)', margin: '0 0 36px', 'line-height': '1.6' }}>
            Got an idea for a widget, feature, or improvement? We'd love to hear it.
            Every request is read personally.
          </p>

          {submitted() ? (
            <div style={{
              background: 'rgba(83,252,24,0.08)', border: '1px solid rgba(83,252,24,0.25)',
              'border-radius': 'var(--radius-xl)', padding: '32px', 'text-align': 'center',
            }}>
              <div style={{ 'font-size': '32px', 'margin-bottom': '12px' }}>✓</div>
              <div style={{ 'font-size': '16px', 'font-weight': '600', color: 'var(--green-500)', 'margin-bottom': '8px' }}>
                Your email client should open now
              </div>
              <div style={{ 'font-size': '14px', color: 'var(--text-tertiary)' }}>
                Just hit send — we'll get back to you soon.
              </div>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  'margin-top': '20px', background: 'transparent', border: '1px solid var(--border-default)',
                  'border-radius': 'var(--radius-md)', padding: '8px 18px', cursor: 'pointer',
                  color: 'var(--text-tertiary)', 'font-size': '13px', 'font-family': 'var(--font-sans)',
                }}
              >Submit another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', 'flex-direction': 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', 'font-size': '13px', 'font-weight': '600', color: 'var(--text-secondary)', 'margin-bottom': '7px' }}>
                  Category
                </label>
                <select
                  value={category()}
                  onChange={(e) => setCategory(e.currentTarget.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {CATEGORIES.map(c => <option value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', 'font-size': '13px', 'font-weight': '600', color: 'var(--text-secondary)', 'margin-bottom': '7px' }}>
                  Feature title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Support for Twitch clip alerts"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-violet)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', 'font-size': '13px', 'font-weight': '600', color: 'var(--text-secondary)', 'margin-bottom': '7px' }}>
                  Description
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe the feature — what problem does it solve? How would it work?"
                  value={description()}
                  onInput={(e) => setDescription(e.currentTarget.value)}
                  style={{ ...inputStyle, resize: 'vertical', 'min-height': '120px', 'line-height': '1.55' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-violet)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                />
              </div>

              <button
                type="submit"
                style={{
                  display: 'inline-flex', 'align-items': 'center', 'justify-content': 'center',
                  gap: '8px', padding: '12px 28px', 'border-radius': 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', 'font-size': '15px', 'font-weight': '600',
                  'font-family': 'var(--font-sans)', background: 'var(--grad-brand)', color: '#fff',
                  transition: 'filter var(--dur-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.12)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.filter = 'none'}
              >
                Send request →
              </button>

              <p style={{ 'font-size': '12px', color: 'var(--text-muted)', margin: '0' }}>
                This opens your email client with the form pre-filled.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeatureRequest
