import Link from "next/link";

export default function ArchivePortalAdminPage() {
  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin is not available</h1>
      <p className="mt-3 max-w-xl text-gray-600">
        Archive portal administration is not implemented. This page is an honest placeholder, not an admin console.
      </p>
      <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
        Back to archive portal
      </Link>
    </main>
  );
}
