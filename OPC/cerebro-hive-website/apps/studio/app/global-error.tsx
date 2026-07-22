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
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center flex-col gap-6 text-center px-4">
          <h2 className="text-4xl font-space font-bold">System Exception</h2>
          <p className="text-text-secondary max-w-md">
            A critical error occurred while attempting to render this page. Our engineering team has been notified.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary-accent text-background font-bold rounded-lg"
          >
            Attempt Recovery
          </button>
        </div>
      </body>
    </html>
  );
}
