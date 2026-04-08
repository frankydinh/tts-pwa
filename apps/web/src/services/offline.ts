import localforage from 'localforage';

const audioStore = localforage.createInstance({
  name: 'tech-audiobook',
  storeName: 'audio-chunks',
});

/**
 * Save an audio blob to IndexedDB for offline playback.
 * @param key  Storage key, e.g. `${documentId}-${index}`
 * @param blob  Audio file as Blob
 */
export async function saveAudioOffline(key: string, blob: Blob): Promise<void> {
  await audioStore.setItem(key, blob);
}

/**
 * Retrieve an audio blob from IndexedDB.
 * Returns null if not cached.
 */
export async function getAudioOffline(key: string): Promise<Blob | null> {
  return audioStore.getItem<Blob>(key);
}

/**
 * Remove all cached audio for a document.
 */
export async function clearDocumentCache(documentId: string): Promise<void> {
  const keys = await audioStore.keys();
  for (const k of keys) {
    if (k.startsWith(documentId)) {
      await audioStore.removeItem(k);
    }
  }
}

/**
 * Fetch audio from network and cache it for offline use.
 * Returns an object URL that can be assigned to an <audio> src.
 */
export async function fetchAndCacheAudio(url: string, cacheKey: string): Promise<string> {
  const cached = await getAudioOffline(cacheKey);
  if (cached) {
    return URL.createObjectURL(cached);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  await saveAudioOffline(cacheKey, blob);
  return URL.createObjectURL(blob);
}
