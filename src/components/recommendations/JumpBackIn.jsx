import React from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Play, RotateCcw } from 'lucide-react';

export const JumpBackIn = ({ tracks = [] }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);

  if (!tracks || tracks.length === 0) return null;

  const displayTracks = tracks.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-primary" />
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">Jump Back In</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayTracks.map((track, i) => (
          <div
            key={`${track.id || track.trackId}-${i}`}
            onClick={() => playTrack(track, displayTracks, { type: 'jump_back', title: 'Jump Back In' })}
            className="flex items-center gap-3 p-2.5 rounded-xl card-soft hover:bg-surface-2 border border-border cursor-pointer group shadow-soft transition-all"
          >
            <img
              src={track.thumbnail || `https://i.ytimg.com/vi/${track.id || track.trackId}/mqdefault.jpg`}
              alt=""
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = `https://i.ytimg.com/vi/${track.id || track.trackId}/mqdefault.jpg`;
              }}
              className="w-12 h-12 rounded-lg object-cover shrink-0 shadow bg-surface-3"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-text-main truncate group-hover:text-primary transition-colors">
                {track.title}
              </div>
              <div className="text-[11px] text-text-muted truncate">{track.artist}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playTrack(track, displayTracks, { type: 'jump_back', title: 'Jump Back In' });
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-[var(--shadow-warm)] opacity-0 group-hover:opacity-100 transition-all shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
