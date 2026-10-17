import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';
import { useLyricsStore } from '../../stores/useLyricsStore';
import { LyricsPanel } from './LyricsPanel';
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
  Mic2,
  Activity,
  Maximize2
} from 'lucide-react';

export const FullscreenPlayer = () => {
  const isOpen = usePlayerStore((s) => s.isFullscreenOpen);
  const setOpen = usePlayerStore((s) => s.setFullscreenOpen);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const isShuffle = usePlayerStore((s) => s.isShuffle);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);

  const lyrics = useLyricsStore((s) => s.lyrics);
  const plainLyrics = useLyricsStore((s) => s.plainLyrics);

  // ALL HOOKS UNCONDITIONALLY AT THE TOP BEFORE ANY RETURN
  const [showLyrics, setShowLyrics] = useState(false);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);
  const [scrubberDragPercent, setScrubberDragPercent] = useState(null);
  const scrubberTrackRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setOpen]);

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

  // Safe early return ONLY AFTER all hooks are called
  if (!isOpen || !currentTrack) return null;

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
  const liked = currentTrack?.id ? isLiked(currentTrack.id) : false;
  const displayScrubberPercent =
    isDraggingScrubber && scrubberDragPercent !== null ? scrubberDragPercent : progressPercent;

  const trackThumbnail =
    currentTrack.thumbnailHQ ||
    currentTrack.thumbnail ||
    `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`;

  return (
    <div
      style={{ backgroundColor: 'var(--color-bg)' }}
      className="fixed inset-0 z-[100] dot-grid-bg flex flex-col justify-between p-6 md:p-12 animate-in fade-in zoom-in-95 duration-200 select-none overflow-hidden text-text-main"
    >
      {/* Blurred Ambient Album Art Glow */}
      <div
        style={{ backgroundImage: `url(${trackThumbnail})` }}
        className="absolute inset-0 bg-cover bg-center blur-[120px] opacity-25 scale-125 pointer-events-none"
      />
      {/* Dark overlay ensuring 100% opacity over the underlying page */}
      <div className="absolute inset-0 bg-[#08090c]/85 pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="traffic-light red" onClick={() => setOpen(false)} />
            <div className="traffic-light yellow" />
            <div className="traffic-light green" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-text-main ml-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
            Theater Mode
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold hidden sm:inline">
            Live Stream
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Lyrics Toggle */}
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              showLyrics
                ? 'bg-primary/15 text-primary border-primary/30 shadow-[var(--shadow-warm)] font-semibold'
                : 'bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-text-main border-border'
            }`}
            title="Toggle Live Lyrics"
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          {/* Exit / Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-muted hover:text-text-main text-xs font-medium transition-colors cursor-pointer"
            title="Close Theater Mode (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="text-[10px] font-mono text-text-muted">ESC</span>
          </button>
        </div>
      </div>

      {/* Center Main Stage */}
      <div className="relative z-10 my-auto max-w-5xl mx-auto w-full flex-1 flex items-center min-h-0 py-6">
        {showLyrics ? (
          /* Lyrics Mode: Artwork small left + Live Lyrics right */
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 w-full h-full max-h-[65vh]">
            {/* Small Artwork + Info */}
            <div className="flex flex-col items-center gap-4 shrink-0 md:w-72 justify-center">
              <div className="p-2 rounded-2xl card-elev border border-border shadow-elevated">
                <img
                  src={trackThumbnail}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                  }}
                  className={`w-48 h-48 md:w-60 md:h-60 rounded-xl object-cover bg-surface-3 ${
                    isPlaying ? 'border border-primary/50 shadow-[var(--shadow-warm)]' : 'opacity-80'
                  }`}
                />
              </div>
              <div className="text-center space-y-1 max-w-[16rem]">
                <div className="text-base font-bold text-text-main leading-tight truncate">
                  {currentTrack.title}
                </div>
                <div className="text-xs text-text-muted font-medium truncate">
                  {currentTrack.artist}
                </div>
              </div>
            </div>

            {/* Lyrics Panel Card */}
            <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-border bg-surface/85 backdrop-blur-xl p-4 shadow-elevated">
              <LyricsPanel className="h-full" />
            </div>
          </div>
        ) : (
          /* Standard Mode: Big Artwork + Telemetry + Info */
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full">
            <div className="p-3 rounded-3xl card-elev border border-border shadow-elevated shrink-0 group">
              <img
                src={trackThumbnail}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                }}
                className={`w-64 h-64 md:w-88 md:h-88 rounded-2xl object-cover transition-all duration-300 bg-surface-3 ${
                  isPlaying ? 'border border-primary/40 shadow-[var(--shadow-warm)] scale-[1.01]' : 'opacity-85'
                }`}
              />
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md space-y-5">
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase font-bold text-primary tracking-widest flex items-center gap-2 justify-center md:justify-start">
                  <span className={`w-1.5 h-1.5 rounded-full bg-primary ${isPlaying ? 'animate-pulse' : ''}`} />
                  Now Playing
                </span>
                <div className="text-2xl md:text-4xl font-extrabold text-text-main leading-tight tracking-tight">
                  {currentTrack.title}
                </div>
                <div className="text-sm md:text-base text-text-muted font-medium">
                  {currentTrack.artist}
                </div>
              </div>

              {/* 9Router Telemetry Spec Card */}
              <div className="w-full p-4 rounded-2xl card-soft border border-border space-y-2.5 text-xs shadow-soft">
                <div className="flex items-center justify-between text-text-muted">
                  <span className="font-medium">Audio Engine</span>
                  <span className="text-text-main font-semibold">Opus / Lossless 48kHz</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span className="font-medium">Bitrate Quality</span>
                  <span className="text-primary font-mono font-semibold">HQ Studio DSP</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span className="font-medium">Playback State</span>
                  <span className={`font-semibold ${isPlaying ? 'text-primary' : 'text-text-muted'}`}>
                    {isPlaying ? 'Live Streaming' : 'Paused'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleLike(currentTrack)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-soft ${
                  liked
                    ? 'bg-red-500/15 border-red-500/30 text-red-500'
                    : 'bg-surface-2 border-border text-text-muted hover:text-text-main hover:bg-surface-3'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                <span>{liked ? 'Saved to Liked Songs' : 'Save to Liked Songs'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Transport Controls */}
      <div className="relative z-10 max-w-2xl mx-auto w-full space-y-3 border-t border-border pt-4">
        {/* Scrubber */}
        <div className="space-y-1">
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
            className="py-2 cursor-pointer select-none group touch-none relative flex items-center"
          >
            <div className="w-full h-1.5 hover:h-2 bg-surface-2 border border-border rounded-full relative transition-all overflow-hidden">
              <div
                style={{ width: `${displayScrubberPercent}%` }}
                className="bg-primary shadow-[0_0_12px_var(--color-primary)] absolute left-0 top-0 bottom-0 rounded-full pointer-events-none"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-text-muted font-mono">
            <span className="font-bold text-text-main">
              {formatTime(
                isDraggingScrubber && scrubberDragPercent !== null
                  ? (scrubberDragPercent / 100) * duration
                  : currentTime
              )}
            </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isShuffle ? 'text-primary bg-primary/15 border border-primary/25 shadow-[var(--shadow-warm)]' : 'text-text-muted hover:text-text-main hover:bg-surface-2'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prev}
            className="text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-[var(--shadow-warm)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>

          <button
            onClick={next}
            className="text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              repeatMode > 0 ? 'text-primary bg-primary/15 border border-primary/25 shadow-[var(--shadow-warm)]' : 'text-text-muted hover:text-text-main hover:bg-surface-2'
            }`}
            title="Repeat"
          >
            {repeatMode === 2 ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
