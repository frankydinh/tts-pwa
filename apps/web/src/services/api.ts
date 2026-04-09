import type { DocumentDto, PlaylistDto, UploadResponseDto } from '@tech-audiobook/shared-types';

const API_BASE = '/api';

export async function fetchDocuments(): Promise<DocumentDto[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) {
    throw new Error(`Failed to fetch documents: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<DocumentDto[]>;
}

export async function uploadDocument(file: File): Promise<UploadResponseDto> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<UploadResponseDto>;
}

export async function fetchPlaylist(documentId: string): Promise<PlaylistDto> {
  const res = await fetch(`${API_BASE}/documents/${documentId}/playlist`);
  if (!res.ok) {
    throw new Error(`Failed to fetch playlist: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<PlaylistDto>;
}

