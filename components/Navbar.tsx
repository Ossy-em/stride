"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const links = [
  { name: "How it works", href: "#how-it-works" },
  { name: "Stories", href: "#stories" },
  { name: "Contact", href: "mailto:hello@trystrideai.com" },
];

export default function StrideNavbar() {
  // "top" = at the very top (initial state), "down" = scrolling down, "up" = scrolling up
  const [scrollState, setScrollState] = useState<"top" | "down" | "up">("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      if (y <= 24) {
        setScrollState("top");
      } else if (y > lastY.current) {
        setScrollState("up");
      } else if (y < lastY.current) {
        setScrollState("down");
      }

      lastY.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only "stride" shows (no bg) when scrolling up. Full nav + green border when scrolling down.
  // At top, keep the original first-visit look.
  const isUp = scrollState === "up";
  const isDown = scrollState === "down";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: isDown ? "rgba(255,255,255,0.8)" : "transparent",
        backdropFilter: isDown ? "blur(10px)" : "none",
        WebkitBackdropFilter: isDown ? "blur(10px)" : "none",
        borderBottom: isDown
          ? "0.5px solid #10b981"
          : "0.5px solid transparent",
      }}
    >
      <nav className="flex items-center justify-between py-4 px-6 md:px-12">
        {/* Wordmark — always visible */}
        <a
          href="#"
          style={{
            fontFamily: "'Lora', serif",
            fontWeight: 600,
            fontSize: "20px",
            color: "#1a1a17",
            letterSpacing: "-0.01em",
            textDecoration: "none",
          }}
        >
          stride
        </a>

        {/* Desktop links — hidden while scrolling up */}
        <div
          className="hidden md:flex items-center gap-7 transition-all duration-300"
          style={{
            opacity: isUp ? 0 : 1,
            pointerEvents: isUp ? "none" : "auto",
          }}
        >
          {links.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="transition-colors duration-300"
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                color: "#5a5a50",
                letterSpacing: "0.01em",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a17")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5a50")}
            >
              {l.name}
            </a>
          ))}
          <Link
            href="/signin"
            className="transition-colors duration-500 hover:bg-[#0c2518]"
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "0.01em",
              color: "#ffffff",
              background: "#1a1a17",
              padding: "9px 22px",
              borderRadius: "100px",
              textDecoration: "none",
            }}
          >
            Start a session
          </Link>
        </div>

        {/* Mobile toggle — hidden while scrolling up */}
        <button
          className="md:hidden flex flex-col justify-center items-end gap-[5px] transition-opacity duration-300"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            width: "26px",
            height: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            opacity: isUp ? 0 : 1,
            pointerEvents: isUp ? "none" : "auto",
          }}
        >
          <span
            style={{
              display: "block",
              height: "1.5px",
              width: "22px",
              background: "#1a1a17",
              transition: "transform 0.3s ease, opacity 0.3s ease",
              transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              height: "1.5px",
              width: "22px",
              background: "#1a1a17",
              transition: "opacity 0.2s ease",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              height: "1.5px",
              width: "22px",
              background: "#1a1a17",
              transition: "transform 0.3s ease",
              transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: menuOpen && !isUp ? "320px" : "0px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: menuOpen && !isUp ? "0.5px solid #0c2518" : "none",
        }}
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          {links.map((l) => (
            <a
              key={l.name}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#1a1a17",
                textDecoration: "none",
                padding: "12px 0",
                borderBottom: "0.5px solid #e6e6de",
              }}
            >
              {l.name}
            </a>
          ))}
          <Link
            href="/signin"
            onClick={() => setMenuOpen(false)}
            className="text-center"
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#ffffff",
              background: "#1a1a17",
              padding: "12px 22px",
              borderRadius: "100px",
              textDecoration: "none",
              marginTop: "16px",
            }}
          >
            Start a session
          </Link>
        </div>
      </div>
    </header>
  );
}
