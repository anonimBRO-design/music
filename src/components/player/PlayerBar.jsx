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

export const PlayerBar = ({ isSidebarCollapsed = false }) => {
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
    <footer
      className={`fixed bottom-[74px] md:bottom-3 left-3.5 right-3.5 ${
        isSidebarCollapsed ? 'md:left-[96px] md:right-6' : 'md:left-[276px] md:right-6'
      } h-14 md:h-[78px] ios-glass-dock rounded-[22px] md:rounded-[26px] z-40 px-3 md:px-5 flex items-center justify-between font-syne select-none transition-all duration-300 shadow-2xl overflow-hidden`}
    >
      {/* Mobile Top Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/10 md:hidden overflow-hidden">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-gradient-to-r from-iosBlue to-iosEmerald rounded-full transition-all"
        />
      </div>

      {/* 1. Track Info (Left) */}
      <div className="flex items-center gap-2.5 md:gap-3 flex-1 md:w-48 lg:w-60 md:flex-initial min-w-0">
        {currentTrack ? (
          <>
            <div
              onClick={() => setFullscreenOpen(true)}
              className="relative group shrink-0 cursor-pointer"
            >
              <img
                src={currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                }}
                className={`w-9 h-9 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover shadow-md transition-all duration-300 bg-zinc-900 ${
                  isPlaying
                    ? 'ring-2 ring-iosEmerald/60 shadow-[0_0_20px_rgba(48,209,88,0.35)] scale-100'
                    : 'opacity-85'
                }`}
              />
            </div>
            <div
              onClick={() => setFullscreenOpen(true)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <div className="text-xs md:text-sm font-bold text-white truncate hover:text-iosEmerald transition-colors">
                {currentTrack.title}
              </div>
              <div className="text-[10px] md:text-xs text-zinc-400 truncate hover:text-zinc-200">
                {currentTrack.artist}
              </div>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="text-zinc-400 hover:text-white p-1 md:p-1.5 rounded-full hover:bg-white/5 ios-btn-spring transition-colors shrink-0 hidden sm:block"
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart
                className={`w-4 h-4 md:w-5 md:h-5 ${liked ? 'text-iosPink fill-iosPink' : 'text-zinc-400'}`}
              />
            </button>
          </>
        ) : (
          <div className="text-xs text-zinc-500 italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-700 animate-pulse" />
            No track selected
          </div>
        )}
      </div>

      {/* Mobile Right Controls (Play/Pause + Next) */}
      <div className="flex items-center gap-2 md:hidden shrink-0">
        <button
          onClick={() => toggleLike(currentTrack)}
          className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 ios-btn-spring transition-colors shrink-0"
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            className={`w-4 h-4 ${liked ? 'text-iosPink fill-iosPink' : 'text-zinc-400'}`}
          />
        </button>

        <button
          onClick={togglePlay}
          disabled={!currentTrack}
          className="w-9 h-9 rounded-full bg-white text-black hover:scale-105 active:scale-90 transition-all flex items-center justify-center shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ios-btn-spring cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={next}
          className="text-zinc-300 hover:text-white p-1.5 rounded-full hover:bg-white/5 ios-btn-spring transition-colors cursor-pointer"
          title="Next"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* 2. Desktop Playback Controls & Scrubber (Center - Hidden on Mobile) */}
      <div className="hidden md:flex flex-col items-center gap-1.5 max-w-sm lg:max-w-lg flex-1 px-2 lg:px-6">
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full ios-btn-spring transition-colors ${
              isShuffle ? 'text-iosEmerald bg-iosEmerald/10' : 'text-zinc-400 hover:text-white'
            }`}
            title="Smart Shuffle"
          >
            <Shuffle className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>

          <button
            onClick={prev}
            className="text-zinc-300 hover:text-white p-1.5 rounded-full hover:bg-white/5 ios-btn-spring transition-colors cursor-pointer"
            title="Previous"
          >
            <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full bg-white text-black hover:scale-105 active:scale-90 transition-all flex items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed ios-btn-spring cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            ) : (
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="text-zinc-300 hover:text-white p-1.5 rounded-full hover:bg-white/5 ios-btn-spring transition-colors cursor-pointer"
            title="Next"
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded-full ios-btn-spring transition-colors ${
              repeatMode > 0 ? 'text-iosEmerald bg-iosEmerald/10' : 'text-zinc-400 hover:text-white'
            }`}
            title="Repeat"
          >
            {repeatMode === 2 ? <Repeat1 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </button>
        </div>

        {/* iOS Fluid Scrubber Progress Bar */}
        <div className="w-full flex items-center gap-2 text-[10px] md:text-[11px] text-zinc-400 font-mono">
          <span className="w-7 md:w-8 text-right">{formatTime(currentTime)}</span>
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
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-iosBlue to-iosEmerald rounded-full transition-all"
            />
            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span className="w-7 md:w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Desktop Volume & Extras (Right - Hidden on Mobile) */}
      <div className="hidden md:flex items-center justify-end gap-1.5 lg:gap-2.5 md:w-44 lg:w-60 min-w-0 shrink-0">
        {/* Lyrics Button */}
        <button
          onClick={() => {
            usePlayerStore.getState().setFullscreenOpen(true);
          }}
          className="text-zinc-400 hover:text-white p-1.5 lg:p-2 rounded-full hover:bg-white/5 ios-btn-spring transition-colors hidden xl:block"
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Sleep Timer Button */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('nonimsong:open-sleep-timer'));
          }}
          className={`relative p-1.5 lg:p-2 rounded-full hover:bg-white/5 ios-btn-spring transition-colors hidden sm:block ${
            sleepTimerActive ? 'text-iosIndigo bg-iosIndigo/10' : 'text-zinc-400 hover:text-white'
          }`}
          title="Sleep Timer"
        >
          <Moon className="w-4 h-4" />
          {sleepTimerActive && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-iosIndigo animate-pulse" />
          )}
        </button>

        {/* Queue */}
        <button
          onClick={toggleQueue}
          className={`relative p-1.5 lg:p-2 rounded-2xl ios-btn-spring transition-colors ${
            isQueueOpen ? 'text-iosEmerald bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
          title="Queue"
        >
          <ListMusic className="w-4 h-4 md:w-5 md:h-5" />
          {userQueue.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-iosEmerald shadow-sm animate-pulse" />
          )}
        </button>

        {/* Fullscreen */}
        <button
          onClick={() => setFullscreenOpen(true)}
          className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/5 ios-btn-spring transition-colors hidden sm:block"
          title="Fullscreen Player"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* iOS Pill Volume Slider */}
        <div className="flex items-center gap-1.5 ml-1">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white p-1 ios-btn-spring">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-iosPink" />
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
            className="w-16 md:w-20 lg:w-24 h-1.5 bg-white/10 hover:h-2 rounded-full cursor-pointer transition-all relative group"
          >
            <div
              style={{ width: `${isMuted ? 0 : volume}%` }}
              className="absolute left-0 top-0 bottom-0 bg-white/80 group-hover:bg-iosEmerald rounded-full transition-colors"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
