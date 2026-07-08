import { createSignal, type Component } from 'solid-js'
import Nav from '../shared/marketing/Nav'
import Pill from '../shared/marketing/Pill'
import Eyebrow from '../shared/marketing/Eyebrow'

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
    background: 'var(--mkt-offblack)', border: '1px solid var(--mkt-hairline)',
    'border-radius': 'var(--mkt-radius-card)', padding: '10px 14px',
    'font-size': '14px', color: 'var(--mkt-cream)',
    'font-family': 'var(--mkt-font)', outline: 'none',
    transition: 'border-color 150ms ease',
  }

  return (
    <div style={{
      'min-height': '100vh', background: 'var(--mkt-canvas)',
      'font-family': 'var(--mkt-font)', color: 'var(--mkt-cream)',
      display: 'flex', 'flex-direction': 'column',
    }}>

      <Nav activeHref="/feature-request.html" ctaLabel="Open Builder" />

      {/* Content */}
      <div style={{ flex: '1', display: 'flex', 'align-items': 'center', 'justify-content': 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', 'max-width': '560px' }}>

          <Eyebrow>Feature Request</Eyebrow>
          <h1 style={{
            'font-size': 'var(--mkt-text-subheading)', 'font-weight': '600',
            'letter-spacing': 'var(--mkt-ls-subheading)', color: 'var(--mkt-cream)',
            'font-family': 'var(--mkt-font)', margin: '10px 0 10px',
          }}>What should we build next?</h1>
          <p style={{ 'font-size': '15px', color: 'var(--mkt-muted)', margin: '0 0 36px', 'line-height': '1.6' }}>
            Got an idea for a widget, feature, or improvement? We'd love to hear it.
            Every request is read personally.
          </p>

          {submitted() ? (
            <div style={{
              background: 'var(--mkt-offblack)',
              'border-radius': 'var(--mkt-radius-card)', padding: '32px', 'text-align': 'center',
            }}>
              <div style={{ 'font-size': '32px', 'margin-bottom': '12px', color: 'var(--mkt-green)' }}>✓</div>
              <div style={{ 'font-size': '16px', 'font-weight': '600', color: 'var(--mkt-green)', 'margin-bottom': '8px' }}>
                Your email client should open now
              </div>
              <div style={{ 'font-size': '14px', color: 'var(--mkt-muted)' }}>
                Just hit send — we'll get back to you soon.
              </div>
              <div style={{ 'margin-top': '20px' }}>
                <Pill variant="outline" size="sm" onClick={() => setSubmitted(false)}>Submit another</Pill>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', 'flex-direction': 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', 'font-size': '13px', 'font-weight': '600', color: 'var(--mkt-cream)', 'margin-bottom': '7px' }}>
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
                <label style={{ display: 'block', 'font-size': '13px', 'font-weight': '600', color: 'var(--mkt-cream)', 'margin-bottom': '7px' }}>
                  Feature title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Support for Twitch clip alerts"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--mkt-cream)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--mkt-hairline)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', 'font-size': '13px', 'font-weight': '600', color: 'var(--mkt-cream)', 'margin-bottom': '7px' }}>
                  Description
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe the feature — what problem does it solve? How would it work?"
                  value={description()}
                  onInput={(e) => setDescription(e.currentTarget.value)}
                  style={{ ...inputStyle, resize: 'vertical', 'min-height': '120px', 'line-height': '1.55' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--mkt-cream)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--mkt-hairline)'}
                />
              </div>

              <Pill variant="primary" size="lg" fullWidth type="submit">
                Send request →
              </Pill>

              <p style={{ 'font-size': '12px', color: 'var(--mkt-muted)', margin: '0' }}>
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
