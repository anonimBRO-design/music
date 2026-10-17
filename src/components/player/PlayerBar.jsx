import React, { useState, useRef, useCallback } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';
import { useUserStore } from '../../stores/useUserStore';
import { useSleepTimerStore } from '../../stores/useSleepTimerStore';
import { useStudioStore } from '../../stores/useStudioStore';
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
  Moon,
  AppWindow,
  Sliders
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

  // Volume state & smooth slide handlers
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const volumeTrackRef = useRef(null);

  const effectiveVolume = isMuted ? 0 : volume;

  const updateVolumeFromPointer = useCallback(
    (e) => {
      const el = volumeTrackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newVol = Math.round(pos * 100);
      setVolume(newVol);
    },
    [setVolume]
  );

  const handleVolumePointerDown = (e) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDraggingVolume(true);
    updateVolumeFromPointer(e);
  };

  const handleVolumePointerMove = (e) => {
    if (isDraggingVolume || e.buttons === 1) {
      updateVolumeFromPointer(e);
    }
  };

  const handleVolumePointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDraggingVolume(false);
  };

  const handleVolumeWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 5 : -5;
    setVolume(Math.min(100, Math.max(0, effectiveVolume + delta)));
  };

  const handleVolumeKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setVolume(Math.min(100, effectiveVolume + 5));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setVolume(Math.max(0, effectiveVolume - 5));
    }
  };

  // Scrubber state & smooth slide handlers
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);
  const [scrubberDragPercent, setScrubberDragPercent] = useState(null);
  const scrubberTrackRef = useRef(null);

  const displayScrubberPercent =
    isDraggingScrubber && scrubberDragPercent !== null ? scrubberDragPercent : progressPercent;

  const updateScrubberFromPointer = useCallback(
    (e) => {
      if (!duration) return 0;
      const el = scrubberTrackRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [duration]
  );

  const handleScrubberPointerDown = (e) => {
    if (!duration) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDraggingScrubber(true);
    const pos = updateScrubberFromPointer(e);
    setScrubberDragPercent(pos * 100);
  };

  const handleScrubberPointerMove = (e) => {
    if (isDraggingScrubber) {
      const pos = updateScrubberFromPointer(e);
      setScrubberDragPercent(pos * 100);
    }
  };

  const handleScrubberPointerUp = (e) => {
    if (!isDraggingScrubber) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const pos = updateScrubberFromPointer(e);
    seekTo(pos * duration);
    setIsDraggingScrubber(false);
    setScrubberDragPercent(null);
  };

  return (
    <footer
      className="fixed bottom-[60px] md:bottom-0 left-0 right-0 h-16 md:h-18 bg-dawSurface border-t border-dawBorder z-40 px-3 md:px-5 flex items-center justify-between font-mono select-none shadow-2xl overflow-hidden"
    >
      {/* Mobile Top Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-dawBg md:hidden overflow-hidden">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-dawGreen transition-all"
        />
      </div>

      {/* 1. Track Info (Left) */}
      <div className="flex items-center gap-2.5 md:gap-3 flex-1 md:w-56 lg:w-72 md:flex-initial min-w-0">
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
                className={`w-9 h-9 md:w-11 md:h-11 rounded object-cover border transition-all bg-dawBg ${
                  isPlaying ? 'border-dawGreen shadow-[0_0_10px_rgba(0,229,153,0.3)]' : 'border-dawBorder'
                }`}
              />
            </div>
            <div
              onClick={() => setFullscreenOpen(true)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <div className="text-xs font-bold text-white truncate hover:text-dawCyan transition-colors">
                {currentTrack.title}
              </div>
              <div className="text-[10px] text-dawMuted truncate flex items-center gap-1.5">
                <span>{currentTrack.artist}</span>
                <span className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-dawPanel border border-dawBorder text-dawAmber">
                  AAC
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="text-dawMuted hover:text-white p-1 rounded hover:bg-dawHover transition-colors shrink-0 hidden sm:block cursor-pointer"
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  liked ? 'text-dawRed fill-dawRed' : 'text-dawMuted hover:scale-110'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="text-xs text-dawMuted flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-dawMuted animate-pulse" />
            NO TRACK LOADED
          </div>
        )}
      </div>

      {/* Mobile Right Controls (Play/Pause + Next) */}
      <div className="flex items-center gap-2 md:hidden shrink-0">
        <button
          onClick={() => toggleLike(currentTrack)}
          className="text-dawMuted hover:text-white p-1 rounded shrink-0 cursor-pointer"
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'text-dawRed fill-dawRed' : 'text-dawMuted'}`} />
        </button>

        <button
          onClick={togglePlay}
          disabled={!currentTrack}
          className="w-8 h-8 rounded bg-dawGreen text-black flex items-center justify-center font-bold disabled:opacity-40 cursor-pointer"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
        </button>

        <button
          onClick={next}
          className="text-dawMuted hover:text-white p-1 cursor-pointer"
          title="Next"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* 2. Desktop Playback Controls & Scrubber (Center) */}
      <div className="hidden md:flex flex-col items-center gap-1 max-w-sm lg:max-w-lg flex-1 px-3 lg:px-6">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isShuffle ? 'text-dawGreen bg-dawGreen/15 border border-dawGreen/30' : 'text-dawMuted hover:text-white hover:bg-dawHover'
            }`}
            title="Smart Shuffle (S)"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={prev}
            className="text-dawMuted hover:text-white p-1.5 rounded hover:bg-dawHover transition-colors cursor-pointer"
            title="Previous (Shift+Left)"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-8 h-8 rounded bg-dawGreen text-black flex items-center justify-center hover:bg-[#12ffaa] shadow-md disabled:opacity-40 cursor-pointer transition-transform active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="text-dawMuted hover:text-white p-1.5 rounded hover:bg-dawHover transition-colors cursor-pointer"
            title="Next (Shift+Right)"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              repeatMode > 0 ? 'text-dawAmber bg-dawAmber/15 border border-dawAmber/30' : 'text-dawMuted hover:text-white hover:bg-dawHover'
            }`}
            title="Repeat (R)"
          >
            {repeatMode === 2 ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Precision Scrubber Progress Bar */}
        <div className="w-full flex items-center gap-2 text-[10px] text-dawMuted font-mono">
          <span className="w-8 text-right font-bold text-white">
            {formatTime(
              isDraggingScrubber && scrubberDragPercent !== null
                ? (scrubberDragPercent / 100) * duration
                : currentTime
            )}
          </span>
          <div
            ref={scrubberTrackRef}
            role="slider"
            tabIndex={0}
            aria-label="Track progress"
            aria-valuenow={Math.round(displayScrubberPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={handleScrubberPointerDown}
            onPointerMove={handleScrubberPointerMove}
            onPointerUp={handleScrubberPointerUp}
            onPointerCancel={handleScrubberPointerUp}
            className="relative py-2 flex-1 cursor-pointer select-none group touch-none flex items-center"
          >
            <div className="w-full h-1.5 hover:h-2 bg-dawBg border border-dawBorder rounded-full relative transition-all overflow-hidden">
              <div
                style={{ width: `${displayScrubberPercent}%` }}
                className="bg-dawCyan absolute left-0 top-0 bottom-0 rounded-full pointer-events-none"
              />
            </div>
          </div>
          <span className="w-8 text-dawMuted">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Desktop Volume & Extras (Right) */}
      <div className="hidden md:flex items-center justify-end gap-1.5 md:w-56 lg:w-72 min-w-0 shrink-0">
        {/* Mini-Player HUD Toggle */}
        <button
          onClick={() => useStudioStore.getState().toggleMiniPlayer()}
          className="text-dawMuted hover:text-dawCyan p-1.5 rounded hover:bg-dawHover transition-colors cursor-pointer"
          title="Toggle Floating Mini-Player HUD"
        >
          <AppWindow className="w-4 h-4" />
        </button>

        {/* Equalizer Toggle */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nonimsong:open-equalizer'))}
          className="text-dawMuted hover:text-white p-1.5 rounded hover:bg-dawHover transition-colors cursor-pointer"
          title="Studio Equalizer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Sleep Timer Button */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('nonimsong:open-sleep-timer'));
          }}
          className={`relative p-1.5 rounded hover:bg-dawHover transition-colors cursor-pointer ${
            sleepTimerActive ? 'text-dawAmber' : 'text-dawMuted hover:text-white'
          }`}
          title="Sleep Timer"
        >
          <Moon className="w-4 h-4" />
          {sleepTimerActive && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-dawAmber animate-pulse" />
          )}
        </button>

        {/* Theater / Fullscreen */}
        <button
          onClick={() => setFullscreenOpen(true)}
          className="text-dawMuted hover:text-white p-1.5 rounded hover:bg-dawHover transition-colors cursor-pointer"
          title="Fullscreen Mode (F)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Volume Slider & Telemetry readout */}
        <div className="flex items-center gap-1 ml-1" onWheel={handleVolumeWheel}>
          <button
            onClick={toggleMute}
            className="text-dawMuted hover:text-white p-1 cursor-pointer"
            title={isMuted || volume === 0 ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-dawRed" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div
            ref={volumeTrackRef}
            role="slider"
            tabIndex={0}
            aria-label="Volume slider"
            aria-valuenow={effectiveVolume}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={handleVolumePointerDown}
            onPointerMove={handleVolumePointerMove}
            onPointerUp={handleVolumePointerUp}
            onPointerCancel={handleVolumePointerUp}
            onKeyDown={handleVolumeKeyDown}
            className="relative py-2 w-14 lg:w-20 cursor-pointer select-none group touch-none flex items-center"
            title={`Volume: ${effectiveVolume}%`}
          >
            <div className="w-full h-1.5 bg-dawBg border border-dawBorder rounded-full relative overflow-hidden">
              <div
                style={{ width: `${effectiveVolume}%` }}
                className="bg-dawGreen absolute left-0 top-0 bottom-0 rounded-full pointer-events-none"
              />
            </div>
          </div>
          <span className="text-[10px] text-dawMuted font-mono w-7 text-right">
            {effectiveVolume}%
          </span>
        </div>
      </div>
    </footer>
  );
};
