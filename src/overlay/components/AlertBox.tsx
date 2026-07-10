import {
  Show,
  type Component,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import type {
  AlertEvent,
  AlertMediaFields,
  WidgetStyle,
} from "../../shared/types";
import { alertStore } from "../../shared/messageStore";
import { widgetStyleToCSS, animationClass } from "../../shared/useWidgetStyle";

const EXIT_DURATION_MS = 300;

interface Props {
  style: WidgetStyle & Partial<AlertMediaFields>;
}

function alertText(alert: AlertEvent): string {
  if (alert.type === "follow")
    return alert.username ? `${alert.username} followed!` : "New follower!";
  if (alert.type === "subscription")
    return `${alert.username} subscribed! (${alert.monthsSubscribed ?? 1} months)`;
  return `${alert.username} gifted ${alert.quantityGifted ?? alert.giftedUsers?.length ?? 1} subs!`;
}

// Old saved overlays may not have these fields (mergeWithDefaults only
// backfills whole missing widget keys, not new fields on an existing key)
// so every field here must tolerate undefined.
function mediaFor(
  alert: AlertEvent,
  style: Props["style"],
): { mediaUrl: string; soundUrl: string } {
  if (alert.type === "follow")
    return {
      mediaUrl: style.followMediaUrl ?? "",
      soundUrl: style.followSoundUrl ?? "",
    };
  if (alert.type === "subscription")
    return {
      mediaUrl: style.subMediaUrl ?? "",
      soundUrl: style.subSoundUrl ?? "",
    };
  return {
    mediaUrl: style.giftMediaUrl ?? "",
    soundUrl: style.giftSoundUrl ?? "",
  };
}

// Heuristic: treat the URL as a video if its path (not query string) ends in
// a video extension, so `clip.mp4?token=...` and extensionless CDN URLs both
// fall through correctly to the img/video branch.
function isVideoUrl(url: string): boolean {
  try {
    const path = new URL(url, window.location.href).pathname.toLowerCase();
    return path.endsWith(".webm") || path.endsWith(".mp4");
  } catch {
    return false;
  }
}

const AlertBox: Component<Props> = (props) => {
  const [current, setCurrent] = createSignal<AlertEvent | null>(null);
  const [exiting, setExiting] = createSignal(false);
  const displayed = new Set<string>();
  let audioRef: HTMLAudioElement | undefined;

  createEffect(() => {
    if (current() !== null) return;
    const next = alertStore.alerts.find((a) => !displayed.has(a.id));
    if (!next) return;
    displayed.add(next.id);
    setCurrent(next);
  });

  createEffect(() => {
    if (!current()) return;
    const dismissTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        setCurrent(null);
        setExiting(false);
      }, EXIT_DURATION_MS);
    }, props.style.alertDurationMs ?? 5000);
    onCleanup(() => clearTimeout(dismissTimer));
  });

  // Plays alert sounds without a user gesture. Safe here: the only two
  // triggers are a click-driven test button and OBS's Chromium Embedded
  // Framework browser source, neither of which enforces the standalone-tab
  // autoplay-blocking policy - don't "fix" this defensively.
  createEffect(() => {
    const alert = current();
    if (!alert || !audioRef) {
      audioRef?.pause();
      return;
    }
    const { soundUrl } = mediaFor(alert, props.style);
    if (!soundUrl) return;
    audioRef.src = soundUrl;
    audioRef.currentTime = 0;
    void audioRef.play().catch(() => {});
  });

  const containerClass = () =>
    exiting() ? "anim-exit" : animationClass(props.style.animation);

  return (
    // Outer div holds the reserved position/size - invisible when no alert is active
    <div style={widgetStyleToCSS(props.style)}>
      <Show when={current()}>
        {(alert) => (
          // Animate the whole alert (background + text) together on entry/exit
          <div
            class={containerClass()}
            style={{ position: "absolute", inset: "0" }}
          >
            {/* Background layer - opacity only affects this div, not the text */}
            <div
              style={{
                position: "absolute",
                inset: "0",
                "background-color": "var(--bg-color)",
                opacity: "var(--bg-opacity)",
                "border-radius": "var(--border-radius)",
              }}
              aria-hidden="true"
            />

            {/* Content layer - sits above background, full opacity */}
            <div
              style={{
                position: "relative",
                height: "100%",
                display: "flex",
                "flex-direction": "column",
                gap: "6px",
                "align-items": "center",
                "justify-content": "center",
                padding: "12px",
                "text-align": "center",
                color: "var(--text-color)",
              }}
            >
              <Show when={mediaFor(alert(), props.style).mediaUrl}>
                {(mediaUrl) => (
                  <Show
                    when={isVideoUrl(mediaUrl())}
                    fallback={
                      <img
                        src={mediaUrl()}
                        alt=""
                        style={{
                          "max-height": "60%",
                          "max-width": "100%",
                          "object-fit": "contain",
                        }}
                      />
                    }
                  >
                    <video
                      src={mediaUrl()}
                      autoplay
                      muted
                      loop
                      style={{
                        "max-height": "60%",
                        "max-width": "100%",
                        "object-fit": "contain",
                      }}
                    />
                  </Show>
                )}
              </Show>
              <span
                style={{
                  "font-size": "1.15em",
                  "font-weight": "700",
                  color: "var(--accent-color)",
                }}
              >
                {alertText(alert())}
              </span>
            </div>
          </div>
        )}
      </Show>
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
};

export default AlertBox;
