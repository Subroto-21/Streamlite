import { Show, type Component, type Accessor } from "solid-js";

export type ConnState = "connecting" | "connected" | "reconnecting" | "error";

interface Props {
  state: Accessor<ConnState>;
  visible: Accessor<boolean>;
  slug?: string;
}

const STYLES: Record<
  ConnState,
  { dot: string; text: string; label: (slug?: string) => string }
> = {
  connecting: {
    dot: "#ffc23d",
    text: "#ffe6a8",
    label: (s) => `Connecting to ${s ?? "channel"}…`,
  },
  connected: {
    dot: "#53fc18",
    text: "#c9ffb0",
    label: (s) => `Connected · ${s}`,
  },
  reconnecting: {
    dot: "#ffc23d",
    text: "#ffe6a8",
    label: () => "Reconnecting…",
  },
  error: {
    dot: "#ff5470",
    text: "#ffc4cf",
    label: () => "No channel set - check your overlay URL",
  },
};

// Setup-time only: OBS caches the page, so this toast appears when the source is
// first added, confirms the connection, then auto-hides so nothing is burned into
// the live stream. Error / not-connected states persist on purpose - that's when
// the streamer needs to notice and fix the URL.
const ConnectionStatus: Component<Props> = (props) => {
  const s = () => STYLES[props.state()];
  return (
    <Show when={props.visible()}>
      <div
        style={{
          position: "fixed",
          bottom: "14px",
          left: "14px",
          "z-index": "9999",
          display: "inline-flex",
          "align-items": "center",
          gap: "8px",
          padding: "7px 12px",
          "border-radius": "999px",
          background: "rgba(10,12,11,0.82)",
          "backdrop-filter": "blur(6px)",
          border: "1px solid rgba(255,255,255,0.12)",
          "font-family": "'Inter', system-ui, sans-serif",
          "font-size": "12px",
          "font-weight": "600",
          color: s().text,
          "box-shadow": "0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        <span
          class={
            props.state() === "connecting" || props.state() === "reconnecting"
              ? "anim-pulse"
              : ""
          }
          style={{
            width: "8px",
            height: "8px",
            "border-radius": "50%",
            background: s().dot,
            "flex-shrink": "0",
          }}
        />
        {s().label(props.slug)}
      </div>
    </Show>
  );
};

export default ConnectionStatus;
