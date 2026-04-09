import { useEffect, useRef, useState } from 'react';
import type { AudioChunkDto, PlaylistDto } from '@tech-audiobook/shared-types';
import { fetchAndCacheAudio } from '../services/offline';

interface AudioPlayerProps {
  playlist: PlaylistDto | null;
}

export function AudioPlayer({ playlist }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  const chunks: AudioChunkDto[] = playlist?.chunks ?? [];
  const currentChunk = chunks[currentIndex];

  useEffect(() => {
    if (!currentChunk) return;

    let objectUrl: string | null = null;

    const loadAudio = async () => {
      const cacheKey = `${currentChunk.documentId}-${currentChunk.index}`;
      const src = await fetchAndCacheAudio(currentChunk.url, cacheKey);
      objectUrl = src;
      setCurrentSrc(src);
    };

    loadAudio().catch(console.error);

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [currentChunk]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSrc) return;
    audio.src = currentSrc;
    audio.playbackRate = playbackRate;
    if (isPlaying) audio.play().catch(console.error);
  }, [currentSrc]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = playbackRate;
  }, [playbackRate]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    if (currentIndex < chunks.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
    setDuration(audio.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const pct = parseFloat(e.target.value);
    audio.currentTime = (pct / 100) * audio.duration;
    setProgress(pct);
  };

  const handleDownloadAll = async () => {
    if (!playlist) return;
    for (const chunk of playlist.chunks) {
      const cacheKey = `${chunk.documentId}-${chunk.index}`;
      setDownloading((prev) => new Set(prev).add(cacheKey));
      try {
        await fetchAndCacheAudio(chunk.url, cacheKey);
      } finally {
        setDownloading((prev) => {
          const next = new Set(prev);
          next.delete(cacheKey);
          return next;
        });
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!playlist) {
    return (
      <section className="bg-gray-800 rounded-2xl p-6 text-center text-gray-400">
        <p className="text-lg">🎵 Select a document to start listening</p>
      </section>
    );
  }

  return (
    <section className="bg-gray-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">{playlist.title}</h2>
          <p className="text-gray-400 text-sm">
            Chunk {currentIndex + 1} / {chunks.length}
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          disabled={downloading.size > 0}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {downloading.size > 0 ? 'Downloading…' : '📥 Download for Offline'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={handleSeek}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime((progress / 100) * duration)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors text-2xl"
          aria-label="Previous chunk"
        >
          ⏮
        </button>

        <button
          onClick={handlePlayPause}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-2xl flex items-center justify-center transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={() => setCurrentIndex((i) => Math.min(chunks.length - 1, i + 1))}
          disabled={currentIndex >= chunks.length - 1}
          className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors text-2xl"
          aria-label="Next chunk"
        >
          ⏭
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-gray-400 text-sm">Speed:</span>
        {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
          <button
            key={rate}
            onClick={() => setPlaybackRate(rate)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              playbackRate === rate
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {rate}×
          </button>
        ))}
      </div>

      {/* Chunk list */}
      {chunks.length > 0 && (
        <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
          {chunks.map((chunk, idx) => (
            <button
              key={chunk.id}
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlaying(true);
              }}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                idx === currentIndex
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Chunk {chunk.index + 1}
            </button>
          ))}
        </div>
      )}

      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </section>
  );
}

