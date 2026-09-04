import React from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { Play, Pause, Disc } from 'lucide-react';

const GRADIENTS = [
  'from-indigo-600 via-purple-600 to-pink-600',
  'from-emerald-600 via-teal-600 to-cyan-700',
  'from-amber-500 via-rose-600 to-purple-700'
];

export const DailyMix = ({ mix, index = 0 }) => {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  if (!mix || !mix.tracks || mix.tracks.length === 0) return null;

  const topTracks = mix.tracks.slice(0, 4);
  const firstTrack = mix.tracks[0];
  const gradient = GRADIENTS[index % GRADIENTS.length];
  
  const currentId = currentTrack?.id || currentTrack?.trackId;
  const isCurrentMixTrack = Boolean(currentId && mix.tracks.some((t) => (t.id || t.trackId) === currentId));
  const isMixPlaying = isPlaying && isCurrentMixTrack;

  const handlePlayAll = (e) => {
    if (e) e.stopPropagation();
    if (isCurrentMixTrack) {
      togglePlay();
      return;
    }
    if (firstTrack) {
      const normalizedTrack = { ...firstTrack, id: firstTrack.id || firstTrack.trackId };
      playTrack(normalizedTrack, mix.tracks, { type: 'daily_mix', id: mix.id, title: mix.title });
    }
  };

  return (
    <div className="relative group p-4 md:p-5 rounded-[26px] ios-card flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Dynamic Background Glow - pointer-events-none to prevent blocking clicks */}
      <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-3xl group-hover:opacity-35 transition-opacity pointer-events-none`} />

      <div className="relative z-10">
        {/* Header Title & Play Pill */}
        <div className="flex items-start justify-between gap-2.5 mb-3.5">
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-iosEmerald mb-1">
              <Disc className="w-3.5 h-3.5 shrink-0" />
              <span>Personalized</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
              {mix.title}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{mix.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={handlePlayAll}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-xl ios-btn-spring transition-all shrink-0 cursor-pointer relative z-20 ${
              isMixPlaying
                ? 'bg-iosEmerald text-black scale-105'
                : 'bg-white text-black hover:scale-105 hover:bg-zinc-200'
            }`}
            title={isMixPlaying ? 'Pause Mix' : 'Play Mix'}
          >
            {isMixPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* 4-Track Collage Preview */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
          {topTracks.map((t, idx) => {
            const trackId = t.id || t.trackId;
            const isThisTrackPlaying = isPlaying && currentId === trackId;
            return (
              <div
                key={`${trackId}-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(t, mix.tracks, { type: 'daily_mix', id: mix.id, title: mix.title });
                }}
                className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group/item ios-btn-spring min-w-0 ${
                  isThisTrackPlaying ? 'bg-white/[0.08]' : ''
                }`}
              >
                <img
                  src={t.thumbnail || `https://i.ytimg.com/vi/${trackId}/mqdefault.jpg`}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${trackId}/mqdefault.jpg`;
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover bg-zinc-900 shrink-0 shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] sm:text-xs font-bold truncate transition-colors ${
                    isThisTrackPlaying ? 'text-iosEmerald' : 'text-white group-hover/item:text-iosEmerald'
                  }`}>
                    {t.title}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-zinc-400 truncate">{t.artist}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
        <span>{mix.tracks.length} tracks</span>
        <button
          type="button"
          onClick={handlePlayAll}
          className="text-xs font-bold text-white hover:text-iosEmerald transition-colors cursor-pointer ios-btn-spring"
        >
          {isMixPlaying ? 'Pause mix' : 'Play full mix →'}
        </button>
      </div>
    </div>
  );
};
