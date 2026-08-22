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
          <div className="w-8 h-8 rounded-xl bg-iosPurple/15 flex items-center justify-center text-iosPurple shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{section.title}</h2>
            <p className="text-[11px] text-zinc-400">{section.subtitle || 'Fresh tracks matching your sonic vector'}</p>
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
            className="group relative p-3 rounded-2xl ios-card cursor-pointer shadow-lg flex flex-col justify-between ios-btn-spring"
          >
            <div className="relative aspect-square mb-2.5 overflow-hidden rounded-xl bg-zinc-900 shadow">
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
                className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>
            </div>
            <div>
              <div className="text-xs font-bold text-white truncate group-hover:text-iosEmerald transition-colors">
                {track.title}
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
