'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('==================== GLOBAL FATAL RUNTIME ERROR ====================');
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    console.error('Digest:', error?.digest);
    console.error('Full Error:', error);
    console.error('====================================================================');
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: 'sans-serif', padding: '40px', background: '#0f172a', color: '#fff' }}>
        <h2 style={{ color: '#ef4444' }}>Fatal Runtime Error (500 Diagnostics)</h2>
        <p style={{ color: '#94a3b8' }}>{error?.message || 'An uncaught error occurred at server runtime.'}</p>
        {error?.digest && <p style={{ fontSize: '12px', color: '#64748b' }}>Digest: {error.digest}</p>}
        {error?.stack && (
          <pre style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', color: '#f87171' }}>
            {error.stack}
          </pre>
        )}
        <button
          onClick={() => reset()}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
