/**
 * Stride logo: the drift line that wanders, then settles into the check-in dot.
 * Drawn on a 24px grid, one colour (currentColor) so it works on any ground.
 *
 *   <LogoMark size={20} />          mark only
 *   <Logo size={20} />              mark + "Stride" wordmark (Geist)
 */

export const LOGO_PATH = "M2.8 16.5 C4.8 16.5 5.3 9.8 7.8 9.8 S10.8 16.5 12.8 14.2 L17.2 10.4";
export const LOGO_DOT = { cx: 19.6, cy: 8.4, r: 2.3 };

export function LogoMark({ size = 20, className, title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d={LOGO_PATH} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle {...LOGO_DOT} fill="currentColor" />
    </svg>
  );
}

/** Mark + wordmark. The wordmark is sized from the mark so the pair always balances. */
export function Logo({ size = 20, className, markClassName }: { size?: number; className?: string; markClassName?: string }) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: size * 0.36, lineHeight: 1 }}
    >
      <LogoMark size={size} className={markClassName} />
      <span style={{ fontSize: size * 0.92, fontWeight: 590, letterSpacing: "-0.035em" }}>Stride</span>
    </span>
  );
}

export default Logo;
