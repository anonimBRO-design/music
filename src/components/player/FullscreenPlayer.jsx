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
    <div className="fixed inset-0 z-50 bg-dawBg/98 flex flex-col justify-between p-6 md:p-12 animate-in fade-in zoom-in-95 duration-200 font-mono select-none overflow-hidden">
      {/* Blurred Album Art Background Ambient Glow */}
      <div
        style={{ backgroundImage: `url(${trackThumbnail})` }}
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-15 scale-125 pointer-events-none"
      />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-dawBorder pb-4">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-sm bg-dawAmber" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            STUDIO THEATER // MONITOR
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-dawPanel border border-dawBorder text-dawGreen font-bold hidden sm:inline">
            LIVE 48.0 kHz
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Lyrics Toggle */}
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs transition-colors cursor-pointer ${
              showLyrics
                ? 'bg-dawCyan text-black border-dawCyan font-bold'
                : 'bg-dawPanel hover:bg-dawHover text-dawMuted hover:text-white border-dawBorder'
            }`}
            title="Toggle Live Lyrics"
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lyrics</span>
          </button>

          {/* Exit / Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-dawPanel hover:bg-dawHover border border-dawBorder text-dawMuted hover:text-white text-xs transition-colors cursor-pointer"
            title="Close Theater Mode (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="text-[10px] text-dawMuted">ESC</span>
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
              <div className="p-1 rounded bg-dawPanel border border-dawBorder shadow-2xl">
                <img
                  src={trackThumbnail}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                  }}
                  className={`w-48 h-48 md:w-60 md:h-60 rounded object-cover bg-dawBg ${
                    isPlaying ? 'border border-dawGreen/60' : 'opacity-80'
                  }`}
                />
              </div>
              <div className="text-center space-y-1 max-w-[16rem]">
                <div className="text-base font-bold text-white leading-tight truncate">
                  {currentTrack.title}
                </div>
                <div className="text-xs text-dawMuted font-medium truncate">
                  {currentTrack.artist}
                </div>
              </div>
            </div>

            {/* Lyrics Panel */}
            <div className="flex-1 min-h-0 overflow-hidden rounded border border-dawBorder bg-dawSurface/80 p-4">
              <LyricsPanel className="h-full" />
            </div>
          </div>
        ) : (
          /* Standard Mode: Big Artwork + Telemetry + Info */
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full">
            <div className="p-2 rounded bg-dawPanel border border-dawBorder shadow-2xl shrink-0">
              <img
                src={trackThumbnail}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                }}
                className={`w-64 h-64 md:w-88 md:h-88 rounded object-cover transition-all duration-300 bg-dawBg ${
                  isPlaying ? 'border-2 border-dawGreen shadow-[0_0_30px_rgba(0,229,153,0.2)]' : 'opacity-85'
                }`}
              />
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-md space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-dawAmber tracking-widest">
                  NOW PLAYING
                </span>
                <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {currentTrack.title}
                </div>
                <div className="text-sm md:text-base text-dawMuted font-semibold">
                  {currentTrack.artist}
                </div>
              </div>

              {/* Audio Telemetry Spec Card */}
              <div className="w-full p-3 rounded bg-dawPanel border border-dawBorder space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between text-dawMuted">
                  <span>STREAM TYPE</span>
                  <span className="text-white font-bold">OPUS STEREO</span>
                </div>
                <div className="flex items-center justify-between text-dawMuted">
                  <span>DSP BITRATE</span>
                  <span className="text-dawCyan font-bold">256 KBPS VBR</span>
                </div>
                <div className="flex items-center justify-between text-dawMuted">
                  <span>STATUS</span>
                  <span className={isPlaying ? 'text-dawGreen font-bold' : 'text-dawAmber'}>
                    {isPlaying ? 'ACTIVE MONITOR' : 'PAUSED'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleLike(currentTrack)}
                className={`flex items-center gap-2 px-4 py-2 rounded border text-xs font-bold transition-all cursor-pointer ${
                  liked
                    ? 'bg-dawRed/15 border-dawRed text-dawRed'
                    : 'bg-dawPanel border-dawBorder text-dawMuted hover:text-white hover:bg-dawHover'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-dawRed' : ''}`} />
                <span>{liked ? 'SAVED TO LIKED SONGS' : 'SAVE TO LIKED SONGS'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Transport Controls */}
      <div className="relative z-10 max-w-2xl mx-auto w-full space-y-3 border-t border-dawBorder pt-4">
        {/* Scrubber */}
        <div className="space-y-1 font-mono">
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
            <div className="w-full h-1.5 hover:h-2 bg-dawSurface border border-dawBorder rounded-full relative transition-all overflow-hidden">
              <div
                style={{ width: `${displayScrubberPercent}%` }}
                className="bg-dawCyan absolute left-0 top-0 bottom-0 rounded-full pointer-events-none"
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-dawMuted font-mono">
            <span className="font-bold text-white">
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
            className={`p-2 rounded transition-colors cursor-pointer ${
              isShuffle ? 'text-dawGreen bg-dawGreen/15 border border-dawGreen/30' : 'text-dawMuted hover:text-white hover:bg-dawHover'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prev}
            className="text-dawMuted hover:text-white p-2 rounded hover:bg-dawHover transition-colors cursor-pointer"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded bg-dawGreen text-black flex items-center justify-center font-bold hover:bg-[#12ffaa] shadow-lg cursor-pointer transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
          </button>

          <button
            onClick={next}
            className="text-dawMuted hover:text-white p-2 rounded hover:bg-dawHover transition-colors cursor-pointer"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2 rounded transition-colors cursor-pointer ${
              repeatMode > 0 ? 'text-dawAmber bg-dawAmber/15 border border-dawAmber/30' : 'text-dawMuted hover:text-white hover:bg-dawHover'
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
