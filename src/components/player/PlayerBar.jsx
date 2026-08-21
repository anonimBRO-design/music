import React from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';
import { useUserStore } from '../../stores/useUserStore';
import { useSleepTimerStore } from '../../stores/useSleepTimerStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  Mic2,
  Moon
} from 'lucide-react';

export const PlayerBar = () => {
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
  const setFullscreenOpen = usePlayerStore((s) => s.setFullscreenOpen);

  const isQueueOpen = useQueueStore((s) => s.isQueueOpen);
  const toggleQueue = useQueueStore((s) => s.toggleQueue);
  const userQueue = useQueueStore((s) => s.userQueue);

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);

  const sleepTimerActive = useSleepTimerStore((s) => s.isActive);

  const formatTime = (sec) => {
    const sInt = Math.floor(Number(sec) || 0);
    if (sInt >= 3600) {
      const h = Math.floor(sInt / 3600);
      const m = Math.floor((sInt % 3600) / 60);
      const s = sInt % 60;
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    const m = Math.floor(sInt / 60);
    const s = sInt % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = currentTrack ? isLiked(currentTrack.id) : false;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 px-4 md:px-6 z-40 flex items-center justify-between font-syne select-none">
      {/* 1. Track Info (Left) */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px]">
        {currentTrack ? (
          <>
            <div className="relative group shrink-0">
              <img
                src={currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                }}
                className={`w-14 h-14 rounded-xl object-cover shadow-lg transition-transform bg-zinc-900 ${
                  isPlaying ? 'ring-2 ring-emerald-400/40 scale-100' : 'opacity-90'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </div>
              <div className="text-xs text-zinc-400 truncate hover:text-zinc-200 cursor-pointer">
                {currentTrack.artist}
              </div>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="text-zinc-400 hover:text-white p-1 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${liked ? 'text-pink-500 fill-pink-500' : 'text-zinc-400'}`}
              />
            </button>
          </>
        ) : (
          <div className="text-xs text-zinc-500 italic">No track selected</div>
        )}
      </div>

      {/* 2. Playback Controls & Scrubber (Center) */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-full px-4">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 transition-colors ${
              isShuffle ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
            title="Smart Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prev}
            className="text-zinc-300 hover:text-white p-1.5 transition-colors"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="text-zinc-300 hover:text-white p-1.5 transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1.5 transition-colors ${
              repeatMode > 0 ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
            }`}
            title="Repeat"
          >
            {repeatMode === 2 ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seekTo(pos * duration);
            }}
            className="relative flex-1 h-1.5 bg-white/10 hover:h-2 rounded-full cursor-pointer transition-all group"
          >
            <div
              style={{ width: `${progressPercent}%` }}
              className="absolute left-0 top-0 bottom-0 bg-emerald-400 group-hover:bg-emerald-300 rounded-full transition-all"
            />
            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Volume & Extras (Right) */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        {/* Lyrics Button */}
        <button
          onClick={() => {
            usePlayerStore.getState().setFullscreenOpen(true);
          }}
          className="text-zinc-400 hover:text-white p-2 transition-colors hidden sm:block"
          title="Lyrics (F for Fullscreen)"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Sleep Timer Button */}
        <button
          onClick={() => {
            // Dispatch custom event to open sleep timer modal
            window.dispatchEvent(new CustomEvent('nonimsong:open-sleep-timer'));
          }}
          className={`relative p-2 transition-colors hidden sm:block ${
            sleepTimerActive ? 'text-indigo-400' : 'text-zinc-400 hover:text-white'
          }`}
          title="Sleep Timer"
        >
          <Moon className="w-4 h-4" />
          {sleepTimerActive && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          )}
        </button>

        {/* Queue */}
        <button
          onClick={toggleQueue}
          className={`relative p-2 rounded-xl transition-colors ${
            isQueueOpen ? 'text-emerald-400 bg-white/5' : 'text-zinc-400 hover:text-white'
          }`}
          title="Queue"
        >
          <ListMusic className="w-5 h-5" />
          {userQueue.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-sm animate-pulse" />
          )}
        </button>

        {/* Fullscreen */}
        <button
          onClick={() => setFullscreenOpen(true)}
          className="text-zinc-400 hover:text-white p-2 transition-colors hidden sm:block"
          title="Fullscreen Player"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white p-1">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setVolume(Math.round(pos * 100));
            }}
            className="w-20 md:w-24 h-1.5 bg-white/10 hover:h-2 rounded-full cursor-pointer transition-all relative group"
          >
            <div
              style={{ width: `${isMuted ? 0 : volume}%` }}
              className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-emerald-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
