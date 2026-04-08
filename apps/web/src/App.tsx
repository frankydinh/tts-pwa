import { useState } from 'react';
import type { PlaylistDto } from '@tech-audiobook/shared-types';
import { AudioPlayer } from './components/AudioPlayer';
import { DocumentList } from './components/DocumentList';

function App() {
  const [playlist, setPlaylist] = useState<PlaylistDto | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="text-3xl">🎧</span>
          <div>
            <h1 className="text-xl font-bold">Tech Audiobook</h1>
            <p className="text-gray-400 text-sm">Convert technical PDFs to high-quality audio</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <AudioPlayer playlist={playlist} />
        <DocumentList onPlaylistSelect={setPlaylist} />
      </main>
    </div>
  );
}

export default App;

