'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadResponse {
  uploadId: string;
  documentId: string;
  versionId: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
}

export function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('requesting');
    setErrorMsg('');

    try {
      // 1. Request presigned URL from API
      const res = await fetch('http://localhost:3000/api/v1/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          tenantId: 'tenant_default'
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to request upload session');
      }

      const data: UploadResponse = await res.json();

      // 2. Upload file to storage (MinIO/S3)
      setStatus('uploading');
      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: data.requiredHeaders,
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // 3. (Optional) Complete upload callback to API can be added here
      // await fetch(`http://localhost:3000/api/v1/uploads/${data.uploadId}/complete`, { method: 'POST' });

      setStatus('success');
    } catch (error: unknown) {
      console.error(error);
      setStatus('error');
      setErrorMsg(error instanceof Error ? error.message : 'An error occurred during upload.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg border border-gray-100">
      <div className="text-center mb-6">
        <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-2" />
        <h2 className="text-xl font-semibold text-gray-800">Upload to CerebroArchive</h2>
        <p className="text-sm text-gray-500">Upload PDF, text, or markdown files for knowledge ingestion</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept=".pdf,.txt,.md,.docx"
        />
      </div>

      {file && (
        <div className="mt-4 p-4 bg-gray-50 rounded flex items-center justify-between">
          <div className="truncate pr-4 text-sm font-medium text-gray-700">{file.name}</div>
          <div className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded flex items-center text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {errorMsg}
        </div>
      )}

      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded flex items-center text-sm">
          <CheckCircle className="w-4 h-4 mr-2" />
          File uploaded successfully!
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || status === 'requesting' || status === 'uploading' || status === 'success'}
        className="mt-6 w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'requesting' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {status === 'uploading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {status === 'requesting' ? 'Requesting...' : status === 'uploading' ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
}
