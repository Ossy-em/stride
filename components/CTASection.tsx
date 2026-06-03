"use client";

export default function StrideCTA() {
  return (
    <section
      className="w-full px-6 py-16 md:px-12 md:py-[140px] flex flex-col items-center justify-center text-center"
      style={{ background: "#ffffff" }}
    >
      <h2
        style={{
          fontFamily: "'Lora', serif",
          fontWeight: 500,
          fontSize: "clamp(36px, 5.5vw, 68px)",
          lineHeight: 1.06,
          letterSpacing: "-0.02em",
          color: "#1a1a17",
          maxWidth: "720px",
          marginBottom: "40px",
        }}
      >
        Start before you drift.
      </h2>

      <button
        className="cursor-pointer transition-colors duration-500 hover:bg-[#0c2518]"
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: "13px",
          fontWeight: 400,
          letterSpacing: "0.01em",
          color: "#ffffff",
          background: "#1a1a17",
          border: "none",
          padding: "11px 28px",
          borderRadius: "100px",
        }}
      >
        Start a session
      </button>
    </section>
  );
}