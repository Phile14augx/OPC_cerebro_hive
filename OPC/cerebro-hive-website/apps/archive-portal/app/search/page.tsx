import Link from "next/link";

export default function ArchivePortalSearchPage() {
  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-gray-900">Search is not available</h1>
      <p className="mt-3 max-w-xl text-gray-600">
        The archive portal search route exists so navigation does not 404, but it is not connected to a live index in this release.
      </p>
      <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
        Back to archive portal
      </Link>
    </main>
  );
}
