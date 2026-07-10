import type { LayoutConfig, WidgetStyle } from "../shared/types";
import { DEFAULT_CONFIG } from "../shared/stateEncoder";

export interface OverlayPreset {
  id: string;
  name: string;
  description: string;
  theme: Pick<
    WidgetStyle,
    | "backgroundColor"
    | "backgroundOpacity"
    | "textColor"
    | "accentColor"
    | "borderRadius"
    | "fontFamily"
    | "fontSize"
    | "animation"
  >;
  enabledWidgets: Array<keyof LayoutConfig["widgets"]>;
}

export const PRESETS: OverlayPreset[] = [
  {
    id: "neon",
    name: "Neon",
    description: "Bold violet & green, punchy animations",
    theme: {
      backgroundColor: "#0d0616",
      backgroundOpacity: 0.75,
      textColor: "#ffffff",
      accentColor: "#53fc18",
      borderRadius: 18,
      fontFamily: "poppins",
      fontSize: 16,
      animation: "bounce",
    },
    enabledWidgets: [
      "chat",
      "alert",
      "followerGoal",
      "viewerCount",
      "recentEvents",
    ],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, quiet, and out of the way",
    theme: {
      backgroundColor: "#000000",
      backgroundOpacity: 0.35,
      textColor: "#f5f5f5",
      accentColor: "#e5e5e5",
      borderRadius: 6,
      fontFamily: "inter",
      fontSize: 13,
      animation: "fade",
    },
    enabledWidgets: ["chat", "alert"],
  },
  {
    id: "retro",
    name: "Retro",
    description: "Warm terminal vibes for a nostalgic stream",
    theme: {
      backgroundColor: "#1a0f00",
      backgroundOpacity: 0.8,
      textColor: "#ffe0b3",
      accentColor: "#ff6b35",
      borderRadius: 2,
      fontFamily: "mono",
      fontSize: 14,
      animation: "slide",
    },
    enabledWidgets: ["chat", "alert", "recentEvents", "clock"],
  },
];

// Presets only vary cosmetic style fields + which widgets are enabled -
// position/size and per-widget extra fields (goalTarget, items, format, …)
// stay at DEFAULT_CONFIG's values to avoid hand-tuning layouts per preset.
export function buildPresetConfig(preset: OverlayPreset): LayoutConfig {
  const config = structuredClone(DEFAULT_CONFIG);
  for (const key in config.widgets) {
    const k = key as keyof LayoutConfig["widgets"];
    Object.assign(config.widgets[k], preset.theme, {
      enabled: preset.enabledWidgets.includes(k),
    });
  }
  return config;
}

// ── Custom preset - user picks 3-5 colors, we derive a theme from them ────

const CUSTOM_ENABLED_WIDGETS: Array<keyof LayoutConfig["widgets"]> = [
  "chat",
  "alert",
  "followerGoal",
  "viewerCount",
  "recentEvents",
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// Perceived brightness (ITU-R BT.601) - used to pick the darkest color for
// the background and the lightest for text, so contrast is never a guess.
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function saturation(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  if (max === min) return 0;
  const l = (max + min) / 2;
  return (max - min) / (1 - Math.abs(2 * l - 1));
}

export function buildCustomConfig(colors: string[]): LayoutConfig {
  const sorted = [...colors].sort((a, b) => luminance(a) - luminance(b));
  const backgroundColor = sorted[0];
  const textColor = sorted[sorted.length - 1];
  // Accent = the most saturated of the remaining colors (falls back to the
  // full set if only 2 unique brightness levels were given), so a vivid
  // brand color picked anywhere in the middle still becomes the accent
  // rather than being averaged away.
  const middle = sorted.slice(1, -1);
  const accentPool = middle.length > 0 ? middle : sorted;
  const accentColor = [...accentPool].sort(
    (a, b) => saturation(b) - saturation(a),
  )[0];

  const theme = {
    backgroundColor,
    backgroundOpacity: 0.65,
    textColor,
    accentColor,
    borderRadius: 12,
    fontFamily: "inter" as const,
    fontSize: 14,
    animation: "fade" as const,
  };
  const config = structuredClone(DEFAULT_CONFIG);
  for (const key in config.widgets) {
    const k = key as keyof LayoutConfig["widgets"];
    Object.assign(config.widgets[k], theme, {
      enabled: CUSTOM_ENABLED_WIDGETS.includes(k),
    });
  }
  return config;
}
