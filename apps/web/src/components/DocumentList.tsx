import { useEffect, useRef, useState } from 'react';
import type { DocumentDto, PlaylistDto } from '@tech-audiobook/shared-types';
import { DocumentStatus } from '@tech-audiobook/shared-types';
import { fetchDocuments, fetchPlaylist, uploadDocument } from '../services/api';

interface DocumentListProps {
  onPlaylistSelect: (playlist: PlaylistDto) => void;
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
  [DocumentStatus.UPLOADED]: '📤 Uploaded',
  [DocumentStatus.EXTRACTING]: '📖 Extracting…',
  [DocumentStatus.CLEANING]: '🧹 Cleaning…',
  [DocumentStatus.CHUNKING]: '✂️ Chunking…',
  [DocumentStatus.SYNTHESIZING]: '🔊 Synthesizing…',
  [DocumentStatus.COMPLETED]: '✅ Ready',
  [DocumentStatus.FAILED]: '❌ Failed',
};

const STATUS_COLOR: Record<DocumentStatus, string> = {
  [DocumentStatus.UPLOADED]: 'text-blue-400',
  [DocumentStatus.EXTRACTING]: 'text-yellow-400',
  [DocumentStatus.CLEANING]: 'text-yellow-400',
  [DocumentStatus.CHUNKING]: 'text-yellow-400',
  [DocumentStatus.SYNTHESIZING]: 'text-yellow-400',
  [DocumentStatus.COMPLETED]: 'text-green-400',
  [DocumentStatus.FAILED]: 'text-red-400',
};

export function DocumentList({ onPlaylistSelect }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to load documents', e);
    }
  };

  useEffect(() => {
    void loadDocuments();
    // Poll for status updates every 5 seconds
    const interval = setInterval(() => void loadDocuments(), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      await uploadDocument(file);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePlay = async (doc: DocumentDto) => {
    if (doc.status !== DocumentStatus.COMPLETED) return;
    try {
      const playlist = await fetchPlaylist(doc.id);
      onPlaylistSelect(playlist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-xl">📚 My Library</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {uploading ? (
            <>
              <span className="animate-spin">⏳</span> Uploading…
            </>
          ) : (
            <>📄 Upload PDF</>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
        />
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-500 text-red-300 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-4xl mb-2">📂</p>
          <p>No documents yet. Upload a PDF to get started!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-white text-sm font-medium truncate max-w-xs">{doc.filename}</p>
                <p className={`text-xs mt-0.5 ${STATUS_COLOR[doc.status]}`}>
                  {STATUS_LABEL[doc.status]}
                </p>
              </div>
              <button
                onClick={() => void handlePlay(doc)}
                disabled={doc.status !== DocumentStatus.COMPLETED}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                ▶ Play
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

