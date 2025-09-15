import { useState } from 'react';
import AdminLayout from './AdminLayout';

const UploadAdminPage = () => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped]);
  };

  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...picked]);
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
        </div>
      )}
    </AdminLayout>
  );
};

export default UploadAdminPage;


