'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="centerState">
      <h1>Twin Studio could not load</h1>
      <p>The server returned an unexpected error. No changes were applied.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
