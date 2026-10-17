import React from 'react';
import { useStudioStore } from '../../stores/useStudioStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUserStore } from '../../stores/useUserStore';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Maximize2,
  Volume2,
  VolumeX,
  Sliders
} from 'lucide-react';

export const MiniPlayer = () => {
  const isMiniPlayerOpen = useStudioStore((s) => s.isMiniPlayerOpen);
  const toggleMiniPlayer = useStudioStore((s) => s.toggleMiniPlayer);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const setFullscreenOpen = usePlayerStore((s) => s.setFullscreenOpen);

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);

  if (!isMiniPlayerOpen) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = currentTrack ? isLiked(currentTrack.id) : false;

  const formatTime = (sec) => {
    const sInt = Math.floor(Number(sec) || 0);
    const m = Math.floor(sInt / 60);
    const s = sInt % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScrubberClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(pos * duration);
  };

  return (
    <div className="fixed bottom-20 right-4 w-76 bg-dawSurface border border-dawBorderBright rounded shadow-2xl z-50 overflow-hidden font-mono select-none animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* HUD Header */}
      <div className="daw-header daw-header-cyan h-7 px-2 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-dawCyan animate-pulse" />
          <span className="text-white">HUD // MINI-PLAYER</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFullscreenOpen(true)}
            className="p-0.5 text-dawMuted hover:text-white"
            title="Theater / Fullscreen (F)"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={toggleMiniPlayer}
            className="p-0.5 text-dawMuted hover:text-dawRed"
            title="Close Mini-Player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Mini Body */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <img
            src={currentTrack?.thumbnail || `https://i.ytimg.com/vi/${currentTrack?.id}/mqdefault.jpg`}
            alt=""
            referrerPolicy="no-referrer"
            onError={(e) => {
              if (currentTrack?.id) e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
            }}
            className="w-12 h-12 rounded object-cover bg-dawBg border border-dawBorder shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {currentTrack?.title || 'No Track Selected'}
            </div>
            <div className="text-[10px] text-dawMuted truncate">
              {currentTrack?.artist || 'Unknown Artist'}
            </div>
          </div>
          <button
            onClick={() => currentTrack && toggleLike(currentTrack)}
            className={`p-1 ${liked ? 'text-dawRed' : 'text-dawMuted hover:text-white'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-dawRed' : ''}`} />
          </button>
        </div>

        {/* Scrubber Bar */}
        <div className="space-y-1">
          <div
            onClick={handleScrubberClick}
            className="h-1.5 w-full bg-dawBg rounded-full overflow-hidden cursor-pointer border border-dawBorder"
          >
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-dawCyan transition-all duration-150"
            />
          </div>
          <div className="flex items-center justify-between text-[9px] text-dawMuted">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={toggleMute}
            className="p-1 text-dawMuted hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-dawRed" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="p-1 text-dawMuted hover:text-white transition-colors"
            >
              <SkipBack className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              disabled={!currentTrack}
              className="w-7 h-7 rounded bg-dawGreen text-black flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
            </button>
            <button
              onClick={next}
              className="p-1 text-dawMuted hover:text-white transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('nonimsong:open-equalizer'))}
            className="p-1 text-dawMuted hover:text-dawCyan transition-colors"
            title="Equalizer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
