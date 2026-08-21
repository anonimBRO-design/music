import React from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX
} from 'lucide-react';

export const FullscreenPlayer = () => {
  const isOpen = usePlayerStore((s) => s.isFullscreenOpen);
  const setOpen = usePlayerStore((s) => s.setFullscreenOpen);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffle = usePlayerStore((s) => s.isShuffle);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);

  if (!isOpen || !currentTrack) return null;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60) || 0;
    const s = Math.floor(sec % 60) || 0;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between p-6 md:p-12 animate-in fade-in zoom-in-95 duration-300 font-syne select-none overflow-hidden">
      {/* Blurred Album Art Background */}
      <div
        style={{ backgroundImage: `url(${currentTrack.thumbnailHQ || currentTrack.thumbnail})` }}
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-125 pointer-events-none"
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
            Now Playing
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Artwork & Info */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 my-auto max-w-4xl mx-auto w-full">
        <div className="relative group">
          <img
            src={currentTrack.thumbnailHQ || currentTrack.thumbnail}
            alt=""
            className={`w-64 h-64 md:w-80 md:h-80 rounded-3xl object-cover shadow-2xl transition-all duration-500 ${
              isPlaying ? 'scale-100 shadow-emerald-500/20 ring-4 ring-emerald-500/20' : 'scale-95 opacity-80'
            }`}
          />
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md">
          <div className="text-2xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
            {currentTrack.title}
          </div>
          <div className="text-base md:text-lg text-zinc-400 font-semibold mb-6">
            {currentTrack.artist}
          </div>
          <button
            onClick={() => toggleLike(currentTrack)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold transition-colors ${
              liked
                ? 'bg-pink-500/10 border-pink-500/40 text-pink-400'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
            {liked ? 'Saved to Liked Songs' : 'Save to Liked Songs'}
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 max-w-2xl mx-auto w-full space-y-4">
        {/* Scrubber */}
        <div className="space-y-1.5 font-mono">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seekTo(pos * duration);
            }}
            className="h-2 bg-white/10 hover:h-2.5 rounded-full cursor-pointer transition-all relative group"
          >
            <div
              style={{ width: `${progressPercent}%` }}
              className="absolute left-0 top-0 bottom-0 bg-emerald-400 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${isShuffle ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button onClick={prev} className="text-zinc-300 hover:text-white p-2">
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-2xl"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>

          <button onClick={next} className="text-zinc-300 hover:text-white p-2">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2 transition-colors ${repeatMode > 0 ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
          >
            {repeatMode === 2 ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
