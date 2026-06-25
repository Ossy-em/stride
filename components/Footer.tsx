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
      className="w-full px-6 md:px-12 pt-16 md:pt-[96px] pb-10"
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
          className="text-left md:text-right"
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

      <style>{`
        @keyframes strideShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: 0% 0; }
        }
      `}</style>

      {/* Giant wordmark container */}
      <div className="relative select-none pointer-events-none mt-10 md:mt-12">
        
        {/* The Ambient Light Pool (Behind the text) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[55%] -z-10 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(138, 168, 156, 0.18) 0%, rgba(16, 34, 28, 0) 70%)",
            filter: "blur(24px)",
          }}
        />

        {/* The Text */}
        <div
          aria-hidden
          style={{
            fontFamily: "'Lora', serif",
            fontWeight: 600,
            fontSize: "clamp(96px, 26vw, 460px)",
            lineHeight: 0.78, // Tightened to pull the text up into Lora's empty ascender space
            letterSpacing: "-0.04em",
            marginBottom: "-0.08em",
            whiteSpace: "nowrap",

            /* The 5-Stop Chrome Specular Shimmer */
            backgroundImage: "linear-gradient(110deg, #8aa89c 20%, #f0f0ec 45%, #ffffff 50%, #f0f0ec 55%, #8aa89c 80%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "strideShimmer 3.5s linear infinite",
          }}
        >
          stride
        </div>
      </div>

      {/* Bottom row — copyright + legal links */}
      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        style={{
          borderTop: "1px solid #2a4a3e",
          maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
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