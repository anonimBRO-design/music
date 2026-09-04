import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useLyricsStore } from '../../stores/useLyricsStore';
import { Mic2, MicOff, Loader2 } from 'lucide-react';

export const LyricsPanel = ({ className = '' }) => {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const lyrics = useLyricsStore((s) => s.lyrics);
  const plainLyrics = useLyricsStore((s) => s.plainLyrics);
  const isLoading = useLyricsStore((s) => s.isLoading);
  const error = useLyricsStore((s) => s.error);

  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Find active line index
  let activeLine = -1;
  if (lyrics.length > 0) {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        activeLine = i;
        break;
      }
    }
  }

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLine]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full gap-3 ${className}`}>
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-xs text-zinc-400 font-medium">Searching lyrics...</span>
      </div>
    );
  }

  // Synced lyrics available
  if (lyrics.length > 0) {
    return (
      <div
        ref={containerRef}
        className={`overflow-y-auto h-full px-4 py-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${className}`}
      >
        <div className="space-y-1 pb-32 pt-16">
          {lyrics.map((line, idx) => {
            const isActive = idx === activeLine;
            const isPast = idx < activeLine;

            return (
              <button
                key={`${idx}-${line.time}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => seekTo(line.time)}
                className={`block w-full text-left px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/5 active:scale-[0.98] ${
                  isActive
                    ? 'text-white text-xl md:text-2xl font-extrabold scale-[1.02] bg-white/[0.03]'
                    : isPast
                    ? 'text-zinc-600 text-base md:text-lg font-semibold'
                    : 'text-zinc-500 text-base md:text-lg font-semibold hover:text-zinc-300'
                }`}
              >
                {line.text}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Plain lyrics (unsynced) available
  if (plainLyrics) {
    return (
      <div
        ref={containerRef}
        className={`overflow-y-auto h-full px-6 py-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${className}`}
      >
        <div className="space-y-0.5 pb-32 pt-8">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
            <MicOff className="w-3.5 h-3.5" />
            <span>Unsynced lyrics — timestamps not available</span>
          </div>
          {plainLyrics.split('\n').map((line, idx) => (
            <p key={idx} className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed py-1">
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // No lyrics
  return (
    <div className={`flex flex-col items-center justify-center h-full gap-4 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
        <Mic2 className="w-8 h-8 text-zinc-600" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-sm font-bold text-zinc-400">No lyrics available</h3>
        <p className="text-xs text-zinc-600 max-w-xs">
          {error || "We couldn't find lyrics for this track. Try another song!"}
        </p>
      </div>
    </div>
  );
};
