import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';

const UploadAdminPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{ name: string; url: string }[]>([]);
  const { user, isAdmin } = useAuth();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...picked]);
  };

  const uploadAll = async () => {
    if (!isAdmin && user?.role !== 'editor' && user?.role !== 'owner') return;
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const out: { name: string; url: string }[] = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        // Generate object key: images/{timestamp}-{random}-{filename}
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const objectKey = `uploads/${new Date().toISOString().slice(0,10)}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeName}`;
        const resp = await fetch('/api/sign-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-comite-role': user?.role || 'user',
            'x-comite-secret': (import.meta as any).env?.VITE_ADMIN_SHARED_SECRET || ''
          },
          body: JSON.stringify({ contentType: file.type, objectKey, contentLength: file.size })
        });
        if (!resp.ok) throw new Error('Failed to sign');
        const { uploadUrl, publicUrl } = await resp.json();
        const put = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
          body: file
        });
        if (!put.ok) throw new Error('Upload failed');
        out.push({ name: file.name, url: publicUrl });
      }
      setResults(out);
      setFiles([]);
    } catch (e) {
      // noop: show minimal UI in free tier
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-manga-text mb-4">Upload Assets</h1>
      <div
        className="card p-6 text-center border-dashed border-2 border-manga-border"
        onDragOver={(e)=>{e.preventDefault();}}
        onDrop={onDrop}
        role="region"
        aria-label="Drag and drop files to upload"
      >
        <p className="text-manga-muted mb-3">Drag and drop files here</p>
        <label className="btn-primary inline-block">
          Browse Files
          <input type="file" multiple className="hidden" onChange={onBrowse} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="card p-4 mt-4">
          <h2 className="font-semibold text-manga-text mb-2">Selected Files</h2>
          <ul className="text-sm text-manga-muted space-y-1">
            {files.map((f,i)=>(<li key={i}>{f.name} — {(f.size/1024).toFixed(1)} KB</li>))}
          </ul>
          <button className="btn-primary mt-3" onClick={uploadAll} disabled={isUploading || (!isAdmin && user?.role !== 'editor' && user?.role !== 'owner')}>
            {isUploading ? 'Uploading...' : 'Upload to R2'}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="card p-4 mt-4">
          <h2 className="font-semibold text-manga-text mb-2">Uploaded</h2>
          <ul className="text-sm space-y-1">
            {results.map((r,i)=>(
              <li key={i}>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-manga-accent">{r.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminLayout>
  );
};

export default UploadAdminPage;


