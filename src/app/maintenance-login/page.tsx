'use client';

/** Testing-mode gate, on the sign-in layout and app tokens (light / dark). Copy unchanged. */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import ThemeScript from '@/components/app/theme-script';
import '@/components/auth/auth.css';

export default function MaintenanceLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/maintenance/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/home');
        router.refresh();
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemeScript />
      <div className="app">
        <main className="auth">
          <div className="auth-col">
            <span className="auth-mark" aria-label="Stride">
              <Logo size={26} />
            </span>
            <h1 className="auth-title" style={{ marginBottom: 8 }}>We&apos;re Testing Something New</h1>
            <p className="auth-sent" style={{ marginBottom: 28 }}>
              Stride is currently in testing mode. We&apos;ll be back soon!
            </p>

            <form className="auth-buttons" onSubmit={handleSubmit}>
              <input
                className="auth-input"
                type="password"
                aria-label="Testing Access Code"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button type="submit" className="auth-btn auth-btn--primary" disabled={loading || !password}>
                {loading ? 'Checking...' : 'Access Testing'}
              </button>
            </form>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <p className="auth-legal">
              Want early access? <a href="mailto:hello@stride.app">Get in touch</a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
