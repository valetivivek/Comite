import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';

type SignUploadResponse = {
  uploadUrl: string;
  publicUrl: string;
};

const SUPPORTED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ADMIN_UPLOAD_SECRET = import.meta.env.VITE_ADMIN_SHARED_SECRET ?? '';

const getResponseError = async (response: Response, fallback: string) => {
  try {
    const data = await response.json() as { error?: string };
    return typeof data.error === 'string' ? data.error : fallback;
  } catch {
    return fallback;
  }
};

const UploadAdminPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{ name: string; url: string }[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked]);
  };

  const uploadAll = async () => {
    if (!isAdmin && user?.role !== 'editor' && user?.role !== 'owner') return;
    if (files.length === 0) return;
    if (!ADMIN_UPLOAD_SECRET) {
      setUploadError('VITE_ADMIN_SHARED_SECRET is not configured.');
      return;
    }

    setUploadError(null);
    setResults([]);
    setIsUploading(true);

    try {
      const out: { name: string; url: string }[] = [];

      for (const file of files) {
        if (!SUPPORTED_UPLOAD_TYPES.has(file.type)) {
          continue;
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const objectKey = `uploads/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const signResponse = await fetch('/api/sign-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-comite-role': user?.role || 'user',
            'x-comite-secret': ADMIN_UPLOAD_SECRET
          },
          body: JSON.stringify({
            contentType: file.type,
            objectKey,
            contentLength: file.size
          })
        });

        if (!signResponse.ok) {
          throw new Error(await getResponseError(signResponse, 'Failed to sign upload.'));
        }

        const { uploadUrl, publicUrl } = await signResponse.json() as SignUploadResponse;
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload to R2 failed.');
        }

        out.push({ name: file.name, url: publicUrl });
      }

      if (out.length === 0) {
        throw new Error('Select JPG, PNG, or WebP files to upload.');
      }

      setResults(out);
      setFiles([]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-manga-text mb-4">Upload Assets</h1>
      <div
        className="card p-6 text-center border-dashed border-2 border-manga-border"
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={onDrop}
        role="region"
        aria-label="Drag and drop files to upload"
      >
        <p className="text-manga-muted mb-3">Drag and drop JPG, PNG, or WebP files here</p>
        <label className="btn-primary inline-block">
          Browse Files
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={onBrowse}
          />
        </label>
      </div>

      {uploadError && (
        <div className="card p-4 mt-4 border border-manga-danger/30 text-manga-danger" role="alert">
          {uploadError}
        </div>
      )}

      {files.length > 0 && (
        <div className="card p-4 mt-4">
          <h2 className="font-semibold text-manga-text mb-2">Selected Files</h2>
          <ul className="text-sm text-manga-muted space-y-1">
            {files.map((file, index) => (
              <li key={index}>
                {file.name} - {(file.size / 1024).toFixed(1)} KB
              </li>
            ))}
          </ul>
          <button
            className="btn-primary mt-3"
            onClick={uploadAll}
            disabled={isUploading || (!isAdmin && user?.role !== 'editor' && user?.role !== 'owner')}
          >
            {isUploading ? 'Uploading...' : 'Upload to R2'}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="card p-4 mt-4">
          <h2 className="font-semibold text-manga-text mb-2">Uploaded</h2>
          <ul className="text-sm space-y-1">
            {results.map((result, index) => (
              <li key={index}>
                <a href={result.url} target="_blank" rel="noreferrer" className="text-manga-accent">
                  {result.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminLayout>
  );
};

export default UploadAdminPage;
