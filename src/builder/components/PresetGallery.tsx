import { createSignal, For, Show, type Component } from "solid-js";
import type { LayoutConfig } from "../../shared/types";
import {
  PRESETS,
  buildPresetConfig,
  buildCustomConfig,
  type OverlayPreset,
} from "../presets";

const DEFAULT_CUSTOM_COLORS = ["#53fc18", "#0e100f", "#fffce1"];
const MIN_CUSTOM_COLORS = 3;
const MAX_CUSTOM_COLORS = 5;

interface Props {
  onClose: () => void;
  onSelect: (config: LayoutConfig) => void;
}

function PresetSwatch(p: { preset: OverlayPreset }) {
  const t = p.preset.theme;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100px",
        "border-radius": "var(--radius-md)",
        overflow: "hidden",
        background: t.backgroundColor,
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Mini chat-bubble mockup */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          display: "flex",
          "flex-direction": "column",
          gap: "5px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "6px",
            "border-radius": `${Math.min(t.borderRadius, 6)}px`,
            background: t.textColor,
            opacity: "0.7",
          }}
        />
        <div
          style={{
            width: "42px",
            height: "6px",
            "border-radius": `${Math.min(t.borderRadius, 6)}px`,
            background: t.textColor,
            opacity: "0.5",
          }}
        />
      </div>
      {/* Mini alert-box mockup */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "64px",
          height: "26px",
          "border-radius": `${t.borderRadius}px`,
          background: t.accentColor,
          opacity: "0.85",
        }}
      />
    </div>
  );
}

function CustomPresetCard(p: { onSelect: (config: LayoutConfig) => void }) {
  const [colors, setColors] = createSignal<string[]>(DEFAULT_CUSTOM_COLORS);

  const setColorAt = (i: number, value: string) =>
    setColors(colors().map((c, idx) => (idx === i ? value : c)));
  const addColor = () => {
    if (colors().length >= MAX_CUSTOM_COLORS) return;
    setColors([...colors(), "#888888"]);
  };
  const removeColor = (i: number) => {
    if (colors().length <= MIN_CUSTOM_COLORS) return;
    setColors(colors().filter((_, idx) => idx !== i));
  };

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-default)",
        "border-radius": "var(--radius-lg)",
        padding: "14px",
        display: "flex",
        "align-items": "center",
        gap: "16px",
        "flex-wrap": "wrap",
      }}
    >
      <div style={{ flex: "1", "min-width": "180px" }}>
        <span
          style={{
            "font-size": "13px",
            "font-weight": "700",
            color: "var(--text-primary)",
            display: "block",
            "margin-bottom": "2px",
          }}
        >
          Custom
        </span>
        <span
          style={{
            "font-size": "11px",
            color: "var(--text-tertiary)",
            "line-height": "1.4",
          }}
        >
          Pick {MIN_CUSTOM_COLORS}–{MAX_CUSTOM_COLORS} colors - we'll build the
          theme (darkest → background, lightest → text, most vivid → accent)
        </span>
      </div>

      <div
        style={{
          display: "flex",
          "align-items": "center",
          gap: "14px",
          "flex-wrap": "wrap",
          padding: "6px 4px",
        }}
      >
        <For each={colors()}>
          {(color, i) => (
            <div
              style={{
                position: "relative",
                width: "32px",
                height: "32px",
                "flex-shrink": "0",
              }}
            >
              <input
                type="color"
                class="sl-color-swatch"
                value={color}
                onInput={(e) => setColorAt(i(), e.currentTarget.value)}
                style={{
                  width: "32px",
                  height: "32px",
                  border: "2px solid var(--surface-4)",
                  "border-radius": "var(--radius-sm)",
                  cursor: "pointer",
                  overflow: "hidden",
                  "box-shadow": "0 1px 3px rgba(0,0,0,0.5)",
                }}
              />
              <Show when={colors().length > MIN_CUSTOM_COLORS}>
                <button
                  onClick={() => removeColor(i())}
                  title="Remove color"
                  style={{
                    position: "absolute",
                    top: "-7px",
                    right: "-7px",
                    width: "16px",
                    height: "16px",
                    "border-radius": "var(--radius-xs)",
                    border: "1px solid var(--surface-2)",
                    cursor: "pointer",
                    padding: "0",
                    background: "var(--danger)",
                    color: "#fff",
                    "font-size": "9px",
                    "font-weight": "700",
                    "line-height": "14px",
                    "text-align": "center",
                    "box-shadow": "0 1px 4px rgba(0,0,0,0.6)",
                  }}
                >
                  ✕
                </button>
              </Show>
            </div>
          )}
        </For>
        <Show when={colors().length < MAX_CUSTOM_COLORS}>
          <button
            onClick={addColor}
            title="Add color"
            style={{
              width: "32px",
              height: "32px",
              "border-radius": "var(--radius-sm)",
              border: "2px dashed var(--border-brand)",
              cursor: "pointer",
              background: "transparent",
              color: "var(--green-500)",
              "font-size": "16px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
            }}
          >
            +
          </button>
        </Show>
      </div>

      <button
        onClick={() => p.onSelect(buildCustomConfig(colors()))}
        style={{
          "flex-shrink": "0",
          padding: "9px 16px",
          "border-radius": "var(--radius-md)",
          border: "1px solid var(--border-brand)",
          cursor: "pointer",
          "font-size": "12px",
          "font-weight": "600",
          background: "transparent",
          color: "var(--green-500)",
        }}
      >
        Generate & Use
      </button>
    </div>
  );
}

const PresetGallery: Component<Props> = (props) => {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
      style={{
        position: "fixed",
        inset: "0",
        "z-index": "100",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      }}
    >
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border-default)",
          "border-radius": "var(--radius-xl)",
          padding: "20px 22px",
          "box-shadow": "var(--shadow-xl)",
          width: "640px",
          "max-width": "92vw",
        }}
      >
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
            "margin-bottom": "16px",
          }}
        >
          <span
            style={{
              "font-size": "16px",
              "font-weight": "700",
              color: "var(--text-primary)",
            }}
          >
            Overlay Presets
          </span>
          <button
            onClick={props.onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              "font-size": "18px",
              "line-height": "1",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          <For each={PRESETS}>
            {(preset) => (
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-default)",
                  "border-radius": "var(--radius-lg)",
                  padding: "10px",
                  display: "flex",
                  "flex-direction": "column",
                  gap: "8px",
                }}
              >
                <PresetSwatch preset={preset} />
                <span
                  style={{
                    "font-size": "13px",
                    "font-weight": "700",
                    color: "var(--text-primary)",
                  }}
                >
                  {preset.name}
                </span>
                <span
                  style={{
                    "font-size": "11px",
                    color: "var(--text-tertiary)",
                    "line-height": "1.4",
                    flex: "1",
                  }}
                >
                  {preset.description}
                </span>
                <button
                  onClick={() => props.onSelect(buildPresetConfig(preset))}
                  style={{
                    padding: "7px",
                    "border-radius": "var(--radius-md)",
                    border: "1px solid var(--border-brand)",
                    cursor: "pointer",
                    "font-size": "12px",
                    "font-weight": "600",
                    background: "transparent",
                    color: "var(--green-500)",
                  }}
                >
                  Use this
                </button>
              </div>
            )}
          </For>
        </div>

        <div style={{ "margin-top": "12px" }}>
          <CustomPresetCard onSelect={props.onSelect} />
        </div>
      </div>
    </div>
  );
};

export default PresetGallery;
