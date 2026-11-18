import Link from "next/link";
import ThemeScript from "@/components/app/theme-script";
import "@/components/app/not-found.css";

/** 404 on the app tokens (light / dark / system): one quiet line, two actions. Copy unchanged. */
export default function NotFound() {
  return (
    <>
      <ThemeScript />
      <div className="app">
        <main className="nf">
          <div className="nf-line">
            <h1>404</h1>
            <span className="nf-rule" aria-hidden="true" />
            <p>We couldn&rsquo;t find that page. It may have moved, or the link is broken.</p>
          </div>
          <div className="nf-actions">
            <Link href="/" className="app-cta nf-btn">
              Back home
            </Link>
            <Link href="/session/start" className="app-ghost-btn nf-btn">
              Start a session
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
