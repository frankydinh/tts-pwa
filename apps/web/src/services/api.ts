const API_BASE = '/api';

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) {
    throw new Error(`Failed to fetch documents: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
