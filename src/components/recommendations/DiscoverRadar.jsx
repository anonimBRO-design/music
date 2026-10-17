import React from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Sparkles, Play } from 'lucide-react';

export const DiscoverRadar = ({ section, onOpenContextMenu }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);

  if (!section || !section.tracks || section.tracks.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary shadow-soft">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-text-main tracking-tight">{section.title}</h2>
            <p className="text-[11px] text-text-muted">{section.subtitle || 'Fresh tracks matching your sonic vector'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {section.tracks.slice(0, 10).map((track) => (
          <div
            key={track.id}
            onClick={() => playTrack(track, section.tracks, { type: 'discover_radar', title: 'Discover Radar' })}
            onContextMenu={(e) => {
              e.preventDefault();
              if (onOpenContextMenu) onOpenContextMenu(e, track);
            }}
            className="group relative p-3 rounded-2xl card-soft hover:bg-surface-2 border border-border cursor-pointer shadow-soft flex flex-col justify-between transition-all"
          >
            <div className="relative aspect-square mb-2.5 overflow-hidden rounded-xl bg-surface-3 shadow">
              <img
                src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`;
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(track, section.tracks, { type: 'discover_radar', title: 'Discover Radar' });
                }}
                className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-[var(--shadow-warm)] opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            </div>
            <div>
              <div className="text-xs font-semibold text-text-main truncate group-hover:text-primary transition-colors">
                {track.title}
              </div>
              <div className="text-[11px] text-text-muted truncate mt-0.5">{track.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
