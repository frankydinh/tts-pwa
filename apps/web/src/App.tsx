import { AudioPlayer } from './components/AudioPlayer';
import { DocumentList } from './components/DocumentList';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎧 Tech Audiobook</h1>
        <p>Convert technical PDFs to high-quality audio</p>
      </header>
      <main>
        <DocumentList />
        <AudioPlayer />
      </main>
    </div>
  );
}

export default App;
