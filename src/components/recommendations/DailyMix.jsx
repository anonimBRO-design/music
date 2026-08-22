import React from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Play, Sparkles, Disc } from 'lucide-react';

const GRADIENTS = [
  'from-indigo-600 via-purple-600 to-pink-600',
  'from-emerald-600 via-teal-600 to-cyan-700',
  'from-amber-500 via-rose-600 to-purple-700'
];

export const DailyMix = ({ mix, index = 0 }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  if (!mix || !mix.tracks || mix.tracks.length === 0) return null;

  const topTracks = mix.tracks.slice(0, 4);
  const firstTrack = mix.tracks[0];
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const isMixPlaying = isPlaying && mix.tracks.some((t) => t.id === currentTrack?.id);

  const handlePlayAll = () => {
    if (firstTrack) {
      playTrack(firstTrack, mix.tracks, { type: 'daily_mix', id: mix.id, title: mix.title });
    }
  };

  return (
    <div className="relative group p-4 md:p-5 rounded-[26px] ios-card flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-3xl group-hover:opacity-35 transition-opacity`} />

      <div>
        {/* Header Title & Play Pill */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-iosEmerald mb-1">
              <Disc className="w-3.5 h-3.5" />
              <span>Personalized</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight line-clamp-1">
              {mix.title}
            </h3>
            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{mix.subtitle}</p>
          </div>

          <button
            onClick={handlePlayAll}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg ios-btn-spring transition-all shrink-0 ${
              isMixPlaying
                ? 'bg-iosEmerald text-black scale-105'
                : 'bg-white text-black hover:scale-105 hover:bg-zinc-200'
            }`}
            title="Play Mix"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        </div>

        {/* 4-Track Collage Preview */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {topTracks.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              onClick={() => playTrack(t, mix.tracks, { type: 'daily_mix', id: mix.id, title: mix.title })}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group/item ios-btn-spring"
            >
              <img
                src={t.thumbnail || `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`;
                }}
                className="w-9 h-9 rounded-lg object-cover bg-zinc-900 shrink-0 shadow"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover/item:text-iosEmerald transition-colors">
                  {t.title}
                </div>
                <div className="text-[10px] text-zinc-400 truncate">{t.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
        <span>{mix.tracks.length} tracks</span>
        <button
          onClick={handlePlayAll}
          className="text-xs font-bold text-white hover:text-iosEmerald transition-colors"
        >
          Play full mix →
        </button>
      </div>
    </div>
  );
};
