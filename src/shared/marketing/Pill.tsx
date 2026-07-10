import type { JSX } from "solid-js";

// GSAP-style button language: outlined-only, no filled backgrounds.
// `primary` is the one chromatic exception - a gradient-stroked ghost pill,
// reserved for the site's single recurring "start using it" action (and each
// page's own singular form-submit action). Everything else is `outline`.
// `ghost` drops the border entirely, for nav links.

interface Props {
  children: JSX.Element;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  iconRight?: boolean;
  fullWidth?: boolean;
  target?: string;
  rel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const IconArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Pill = (props: Props) => {
  const size = () => props.size ?? "md";
  const variant = () => props.variant ?? "outline";

  const pad = () =>
    variant() === "ghost"
      ? "10px 4px"
      : size() === "lg"
        ? "15px 28px"
        : size() === "sm"
          ? "10px 18px"
          : "13px 24px";
  const fontSize = () =>
    size() === "lg" ? "18px" : size() === "sm" ? "14px" : "16px";

  const style = (): JSX.CSSProperties => {
    const base: JSX.CSSProperties = {
      display: "inline-flex",
      "align-items": "center",
      gap: "8px",
      "justify-content": props.fullWidth ? "center" : "flex-start",
      padding: pad(),
      "border-radius": "var(--mkt-radius-pill)",
      cursor: "pointer",
      "font-size": fontSize(),
      "font-weight": "600",
      "font-family": "var(--mkt-font)",
      "text-decoration": "none",
      "white-space": "nowrap",
      width: props.fullWidth ? "100%" : undefined,
      border: "none",
      background: "transparent",
      color: "var(--mkt-cream)",
      transition: "opacity 150ms ease",
      opacity: props.disabled ? "0.6" : "1",
      cursor: props.disabled ? "not-allowed" : "pointer",
    };
    if (variant() === "primary") {
      base.background =
        "linear-gradient(var(--mkt-canvas), var(--mkt-canvas)) padding-box, var(--mkt-grad-green) border-box";
      base.border = "1.5px solid transparent";
    } else if (variant() === "outline") {
      base.border = "1px solid var(--mkt-cream)";
    } else {
      base.color = "var(--mkt-muted)";
    }
    return base;
  };

  const onMouseEnter = (e: MouseEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "0.8";
  };
  const onMouseLeave = (e: MouseEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
  };

  if (props.href) {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        style={style()}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {props.children}
        {props.iconRight && <IconArrow />}
      </a>
    );
  }
  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      style={style()}
      onMouseEnter={(e) => !props.disabled && onMouseEnter(e)}
      onMouseLeave={onMouseLeave}
    >
      {props.children}
      {props.iconRight && <IconArrow />}
    </button>
  );
};

export default Pill;
