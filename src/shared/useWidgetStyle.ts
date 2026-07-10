import type { WidgetStyle } from "./types";

const FONT_STACKS: Record<WidgetStyle["fontFamily"], string> = {
  inter: "'Inter', system-ui, sans-serif",
  roboto: "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
  mono: "'Fira Code', 'Courier New', monospace",
};

// WHY: background opacity is expressed via CSS variables rather than applying
// `opacity` to the container - container opacity cascades to all children,
// fading text alongside the background. Components render a dedicated
// background layer div (position: absolute, inset: 0) that reads --bg-color
// and --bg-opacity so only the surface fades, never the content.
export function widgetStyleToCSS(style: WidgetStyle): Record<string, string> {
  return {
    display: style.enabled ? "block" : "none",
    position: "absolute",
    left: `${style.x}%`,
    top: `${style.y}%`,
    width: `${style.width}%`,
    height: `${style.height}%`,
    "box-sizing": "border-box",
    overflow: "hidden",
    "--bg-color": style.backgroundColor,
    "--bg-opacity": String(style.backgroundOpacity),
    "--text-color": style.textColor,
    "--accent-color": style.accentColor,
    "--border-radius": `${style.borderRadius}px`,
    "--font-family": FONT_STACKS[style.fontFamily],
    "font-size": `${style.fontSize}px`,
    "font-family": FONT_STACKS[style.fontFamily],
    "border-radius": `${style.borderRadius}px`,
  };
}

export function animationClass(animation: WidgetStyle["animation"]): string {
  if (animation === "fade") return "anim-fade";
  if (animation === "slide") return "anim-slide";
  if (animation === "bounce") return "anim-bounce";
  return "";
}
