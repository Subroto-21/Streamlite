import { createSignal, Show, type Component } from "solid-js";
import Nav from "../shared/marketing/Nav";
import Pill from "../shared/marketing/Pill";
import Eyebrow from "../shared/marketing/Eyebrow";
import { sendFeedback } from "../shared/feedback";

const CATEGORIES = [
  "New Widget",
  "Builder / UI",
  "Spotify / Music",
  "Alerts",
  "Performance",
  "Other",
];

const FeatureRequest: Component = () => {
  const [title, setTitle] = createSignal("");
  const [category, setCategory] = createSignal(CATEGORIES[0]);
  const [description, setDescription] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (submitting()) return;
    setError("");
    setSubmitting(true);
    try {
      await sendFeedback({
        subject: `[Feature Request] ${title()}`,
        from_name: "Streamlite Feature Request",
        email: email() || undefined,
        Category: category(),
        Title: title(),
        Description: description(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong — please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setCategory(CATEGORIES[0]);
    setDescription("");
    setEmail("");
    setError("");
    setSubmitted(false);
  };

  const inputStyle = {
    width: "100%",
    "box-sizing": "border-box" as const,
    background: "var(--mkt-offblack)",
    border: "1px solid var(--mkt-hairline)",
    "border-radius": "var(--mkt-radius-card)",
    padding: "10px 14px",
    "font-size": "14px",
    color: "var(--mkt-cream)",
    "font-family": "var(--mkt-font)",
    outline: "none",
    transition: "border-color 150ms ease",
  };

  return (
    <div
      style={{
        "min-height": "100vh",
        background: "var(--mkt-canvas)",
        "font-family": "var(--mkt-font)",
        color: "var(--mkt-cream)",
        display: "flex",
        "flex-direction": "column",
      }}
    >
      <Nav activeHref="/feature-request.html" ctaLabel="Open Builder" />

      {/* Content */}
      <div
        style={{
          flex: "1",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          padding: "48px 24px",
        }}
      >
        <div style={{ width: "100%", "max-width": "560px" }}>
          <Eyebrow>Feature Request</Eyebrow>
          <h1
            style={{
              "font-size": "var(--mkt-text-subheading)",
              "font-weight": "600",
              "letter-spacing": "var(--mkt-ls-subheading)",
              color: "var(--mkt-cream)",
              "font-family": "var(--mkt-font)",
              margin: "10px 0 10px",
            }}
          >
            What should we build next?
          </h1>
          <p
            style={{
              "font-size": "15px",
              color: "var(--mkt-muted)",
              margin: "0 0 36px",
              "line-height": "1.6",
            }}
          >
            Got an idea for a widget, feature, or improvement? We'd love to hear
            it. Every request is read personally.
          </p>

          {submitted() ? (
            <div
              style={{
                background: "var(--mkt-offblack)",
                "border-radius": "var(--mkt-radius-card)",
                padding: "32px",
                "text-align": "center",
              }}
            >
              <div
                style={{
                  "font-size": "32px",
                  "margin-bottom": "12px",
                  color: "var(--mkt-green)",
                }}
              >
                ✓
              </div>
              <div
                style={{
                  "font-size": "16px",
                  "font-weight": "600",
                  color: "var(--mkt-green)",
                  "margin-bottom": "8px",
                }}
              >
                Request sent — thank you!
              </div>
              <div style={{ "font-size": "14px", color: "var(--mkt-muted)" }}>
                We read every one personally and will follow up if you left an
                email.
              </div>
              <div style={{ "margin-top": "20px" }}>
                <Pill variant="outline" size="sm" onClick={resetForm}>
                  Submit another
                </Pill>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "18px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    "font-size": "13px",
                    "font-weight": "600",
                    color: "var(--mkt-cream)",
                    "margin-bottom": "7px",
                  }}
                >
                  Category
                </label>
                <select
                  value={category()}
                  onChange={(e) => setCategory(e.currentTarget.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {CATEGORIES.map((c) => (
                    <option value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    "font-size": "13px",
                    "font-weight": "600",
                    color: "var(--mkt-cream)",
                    "margin-bottom": "7px",
                  }}
                >
                  Feature title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Support for Twitch clip alerts"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--mkt-cream)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--mkt-hairline)")
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    "font-size": "13px",
                    "font-weight": "600",
                    color: "var(--mkt-cream)",
                    "margin-bottom": "7px",
                  }}
                >
                  Description
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe the feature - what problem does it solve? How would it work?"
                  value={description()}
                  onInput={(e) => setDescription(e.currentTarget.value)}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    "min-height": "120px",
                    "line-height": "1.55",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--mkt-cream)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--mkt-hairline)")
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    "font-size": "13px",
                    "font-weight": "600",
                    color: "var(--mkt-cream)",
                    "margin-bottom": "7px",
                  }}
                >
                  Your email{" "}
                  <span style={{ color: "var(--mkt-muted)", "font-weight": "400" }}>
                    (optional — so we can reply)
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--mkt-cream)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--mkt-hairline)")
                  }
                />
              </div>

              <Show when={error()}>
                <div
                  style={{
                    "font-size": "13px",
                    color: "#ff6b81",
                    background: "rgba(255,107,129,0.08)",
                    border: "1px solid rgba(255,107,129,0.28)",
                    "border-radius": "var(--mkt-radius-card)",
                    padding: "10px 14px",
                  }}
                >
                  {error()}
                </div>
              </Show>

              <Pill
                variant="primary"
                size="lg"
                fullWidth
                type="submit"
                disabled={submitting()}
              >
                {submitting() ? "Sending…" : "Send request →"}
              </Pill>

              <p
                style={{
                  "font-size": "12px",
                  color: "var(--mkt-muted)",
                  margin: "0",
                }}
              >
                Sent straight to us — no email app required.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureRequest;
