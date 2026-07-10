import type { JSX } from "solid-js";

// The recurring "{ Section Name }" annotation - GSAP's typographic signature
// for introducing every section. No background, no border; the brackets
// themselves are the visual system.
interface Props {
  children: JSX.Element;
  style?: JSX.CSSProperties;
}

const Eyebrow = (props: Props) => (
  <div
    style={{
      "font-family": "var(--mkt-font)",
      "font-size": "17px",
      "font-weight": "400",
      color: "var(--mkt-cream)",
      ...props.style,
    }}
  >
    {"{ "}
    {props.children}
    {" }"}
  </div>
);

export default Eyebrow;
