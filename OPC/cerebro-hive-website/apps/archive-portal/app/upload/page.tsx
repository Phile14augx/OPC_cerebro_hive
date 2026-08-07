import { Uploader } from '../../components/Uploader';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Ingest Knowledge
        </h1>
        <Uploader />
      </div>
    </div>
  );
}
