"use client";

const footerLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "mailto:hello@trystrideai.com" },
];

// link colors for the dark panel
const LINK = "#8aa89c";
const LINK_HOVER = "#f0f0ec";

export default function StrideFooter() {
  const hoverIn = (e: React.MouseEvent<HTMLAnchorElement>) =>
    (e.currentTarget.style.color = LINK_HOVER);
  const hoverOut = (e: React.MouseEvent<HTMLAnchorElement>) =>
    (e.currentTarget.style.color = LINK);

  return (
    <footer
      className="w-full px-6 md:px-12 pt-16 md:pt-[140px] pb-10"
      style={{ background: "#10221c", overflow: "hidden" }}
    >
      {/* Top row — links + small meta */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {footerLinks.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="transition-colors duration-300"
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: LINK,
                textDecoration: "none",
              }}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              {l.name}
            </a>
          ))}
        </nav>

        <div
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "13px",
            fontWeight: 300,
            color: "#6a8a7e",
            lineHeight: 1.6,
          }}
        >
          <p>Focus intelligence</p>
          <p>Est. 2026 ©</p>
        </div>
      </div>

      {/* Giant wordmark */}
      <div
        aria-hidden
        style={{
          fontFamily: "'Lora', serif",
          fontWeight: 600,
          fontSize: "clamp(96px, 26vw, 460px)",
          lineHeight: 0.8,
          letterSpacing: "-0.04em",
          color: "#f0f0ec",
          marginTop: "64px",
          marginBottom: "-0.08em",
          whiteSpace: "nowrap",
        }}
      >
        stride
      </div>

      {/* Bottom row — copyright + legal links */}
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{
          borderTop: "0.5px solid #2a4a3e",
          paddingTop: "24px",
          marginTop: "32px",
        }}
      >
        <span
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "12px",
            fontWeight: 300,
            color: "#6a8a7e",
          }}
        >
          © {new Date().getFullYear()} Stride. All rights reserved.
        </span>

        <div
          className="flex items-center gap-6"
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "12px",
            fontWeight: 300,
          }}
        >
          <a
            href="/privacy"
            className="transition-colors duration-300"
            style={{ color: LINK, textDecoration: "none" }}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="transition-colors duration-300"
            style={{ color: LINK, textDecoration: "none" }}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            Terms
          </a>
          <a
            href="mailto:hello@trystrideai.com"
            className="transition-colors duration-300"
            style={{ color: LINK, textDecoration: "none" }}
            onMouseEnter={hoverIn}
            onMouseLeave={hoverOut}
          >
            hello@trystrideai.com
          </a>
        </div>
      </div>
    </footer>
  );
}