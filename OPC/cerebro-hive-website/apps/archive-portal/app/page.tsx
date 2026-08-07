import Link from 'next/link';
import { Search, Upload, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">CerebroArchive</span>
          </div>
          <nav className="flex space-x-4">
            <Link href="/search" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Search</Link>
            <Link href="/upload" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Upload</Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Enterprise Knowledge Repository
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Intelligent search and knowledge extraction powered by multimodal AI.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link href="/search" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <Search className="w-5 h-5 mr-2" />
              Search Knowledge Base
            </Link>
            <Link href="/upload" className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Upload className="w-5 h-5 mr-2" />
              Upload Document
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
