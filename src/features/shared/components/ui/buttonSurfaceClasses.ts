/** Fuchsia gradient fill + gradient border (no text color, no hover/shadow). */
export const fuchsiaGradientSurfaceClass =
  "border-[0.75px] border-transparent [--btn-fill:linear-gradient(180deg,#C026D3_0%,#86198F_100%)] [background:var(--btn-fill,linear-gradient(180deg,#C026D3_0%,#86198F_100%))_padding-box,linear-gradient(180deg,#EF72FF_3%,#61006E_100%)_border-box]";

/** Default button surface (gradient + hover/shadow) — shared with toggles */
export const buttonDefaultSurfaceClass = `${fuchsiaGradientSurfaceClass} shadow-md hover:brightness-90 hover:shadow-lg transition-all`;

/** Secondary button surface (no text color) — e.g. switch off state */
export const buttonSecondarySurfaceClass =
  "border border-white/10 bg-white/5 shadow-sm backdrop-blur-sm hover:bg-white/10 transition-all";
