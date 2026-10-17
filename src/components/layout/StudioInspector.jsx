import React from 'react';
import { useStudioStore } from '../../stores/useStudioStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useQueueStore } from '../../stores/useQueueStore';
import { useUserStore } from '../../stores/useUserStore';
import { LyricsPanel } from '../player/LyricsPanel';
import {
  PanelRightClose,
  PanelRightOpen,
  Music,
  Mic2,
  ListMusic,
  Heart,
  Activity,
  Sliders,
  Maximize2,
  Trash2,
  Play
} from 'lucide-react';

export const StudioInspector = () => {
  const isInspectorOpen = useStudioStore((s) => s.isInspectorOpen);
  const toggleInspector = useStudioStore((s) => s.toggleInspector);
  const inspectorTab = useStudioStore((s) => s.inspectorTab);
  const setInspectorTab = useStudioStore((s) => s.setInspectorTab);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setFullscreenOpen = usePlayerStore((s) => s.setFullscreenOpen);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const userQueue = useQueueStore((s) => s.userQueue);
  const removeFromUserQueue = useQueueStore((s) => s.removeFromUserQueue);
  const clearUserQueue = useQueueStore((s) => s.clearUserQueue);

  const isLiked = useUserStore((s) => s.isLiked);
  const toggleLike = useUserStore((s) => s.toggleLike);

  if (!isInspectorOpen) {
    return (
      <aside className="hidden lg:flex flex-col items-center justify-between py-4 w-11 bg-dawSurface border-l border-dawBorder select-none z-20">
        <button
          onClick={toggleInspector}
          className="p-2 text-dawMuted hover:text-dawCyan hover:bg-dawHover rounded transition-colors"
          title="Expand Studio Inspector (Ctrl+I)"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-3">
          {isPlaying && (
            <div className="flex flex-col items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-dawGreen animate-ping" />
              <div className="daw-meter-bar">
                <span className="daw-meter-col" />
                <span className="daw-meter-col" />
                <span className="daw-meter-col" />
              </div>
            </div>
          )}
          <span className="text-[9px] uppercase tracking-widest text-dawMuted rotate-90 whitespace-nowrap mt-4 font-mono">
            INSPECTOR
          </span>
        </div>

        <div className="w-4 h-4" />
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-88 bg-dawSurface border-l border-dawBorder select-none z-20 h-full overflow-hidden transition-all duration-200">
      {/* Studio Header Bar */}
      <div className="daw-header daw-header-amber shrink-0">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-dawAmber" />
          <span className="text-white font-mono text-[11px]">STUDIO INSPECTOR</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleInspector}
            className="p-1 rounded text-dawMuted hover:text-white hover:bg-dawHover transition-colors"
            title="Collapse Inspector (Ctrl+I)"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Module Segmented Tab Switcher */}
      <div className="p-2 border-b border-dawBorder bg-dawBg/60 shrink-0">
        <div className="grid grid-cols-3 gap-1 bg-dawBg p-0.5 rounded border border-dawBorder">
          {[
            { id: 'now-playing', label: 'Monitor', icon: Music },
            { id: 'lyrics', label: 'Lyrics', icon: Mic2 },
            { id: 'queue', label: 'Queue', icon: ListMusic },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = inspectorTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setInspectorTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                  active
                    ? 'bg-dawPanel text-dawCyan shadow-sm border border-dawBorderBright'
                    : 'text-dawMuted hover:text-white hover:bg-dawHover/50'
                }`}
              >
                <Icon className={`w-3 h-3 ${active ? 'text-dawCyan' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-dawBorder scrollbar-track-transparent">
        {/* 1. MONITOR / NOW PLAYING TAB */}
        {inspectorTab === 'now-playing' && (
          <div className="p-4 space-y-4">
            {currentTrack ? (
              <>
                {/* Artwork Box */}
                <div className="relative group rounded border border-dawBorder overflow-hidden bg-dawBg shadow-lg">
                  <img
                    src={currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                    }}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <button
                      onClick={() => setFullscreenOpen(true)}
                      className="p-1.5 rounded bg-black/60 text-white hover:bg-dawCyan hover:text-black transition-colors"
                      title="Fullscreen Player (F)"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleLike(currentTrack)}
                      className="p-1.5 rounded bg-black/60 hover:bg-black/90 transition-colors"
                      title="Like song (L)"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLiked(currentTrack.id) ? 'text-dawRed fill-dawRed' : 'text-white'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Track Title & Artist */}
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white tracking-tight line-clamp-2">
                    {currentTrack.title}
                  </div>
                  <div className="text-xs text-dawMuted font-medium line-clamp-1">
                    {currentTrack.artist}
                  </div>
                </div>

                {/* Audio Telemetry Box (Ableton/DAW Spec) */}
                <div className="p-2.5 rounded bg-dawBg border border-dawBorder space-y-2 font-mono">
                  <div className="flex items-center justify-between text-[10px] text-dawMuted">
                    <span>AUDIO ENGINE</span>
                    <span className="text-dawGreen font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-dawGreen animate-pulse" />
                      LIVE D-OUT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-dawBorder">
                    <div>
                      <span className="text-dawMuted">CODEC:</span>{' '}
                      <span className="text-white font-bold">OPUS/AAC</span>
                    </div>
                    <div>
                      <span className="text-dawMuted">RATE:</span>{' '}
                      <span className="text-white font-bold">48.0 kHz</span>
                    </div>
                    <div>
                      <span className="text-dawMuted">BIT DEPTH:</span>{' '}
                      <span className="text-white font-bold">24-BIT</span>
                    </div>
                    <div>
                      <span className="text-dawMuted">STATUS:</span>{' '}
                      <span className={isPlaying ? 'text-dawGreen font-bold' : 'text-dawAmber'}>
                        {isPlaying ? 'ACTIVE' : 'IDLE'}
                      </span>
                    </div>
                  </div>

                  {/* Frequency Level Simulation Meters */}
                  <div className="pt-2 border-t border-dawBorder space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-dawMuted">
                      <span>CH 1/2 PEAK</span>
                      <span className="text-dawCyan font-bold">{isPlaying ? '-6.2 dB' : '-INF'}</span>
                    </div>
                    <div className="h-2 rounded bg-black/40 overflow-hidden flex gap-0.5 p-0.5 border border-dawBorder">
                      <div
                        className={`h-full rounded-sm transition-all duration-150 ${
                          isPlaying ? 'w-3/4 bg-gradient-to-r from-dawGreen via-dawAmber to-dawRed' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Deck Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('nonimsong:open-equalizer'))}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-dawPanel hover:bg-dawHover border border-dawBorder text-xs font-mono text-dawMuted hover:text-white transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-dawCyan" />
                    <span>EQ MASTER</span>
                  </button>
                  <button
                    onClick={() => setFullscreenOpen(true)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-dawPanel hover:bg-dawHover border border-dawBorder text-xs font-mono text-dawMuted hover:text-white transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-dawAmber" />
                    <span>THEATER</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                <Music className="w-8 h-8 text-dawMuted/40" />
                <span className="text-xs font-mono text-dawMuted">NO TRACK LOADED</span>
              </div>
            )}
          </div>
        )}

        {/* 2. LYRICS TAB */}
        {inspectorTab === 'lyrics' && (
          <div className="h-full flex flex-col">
            <LyricsPanel className="flex-1 p-3" />
          </div>
        )}

        {/* 3. QUEUE TAB */}
        {inspectorTab === 'queue' && (
          <div className="p-3 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs pb-2 border-b border-dawBorder">
              <span className="text-dawMuted uppercase">UP NEXT ({userQueue.length})</span>
              {userQueue.length > 0 && (
                <button
                  onClick={clearUserQueue}
                  className="flex items-center gap-1 text-[10px] text-dawRed hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>CLEAR</span>
                </button>
              )}
            </div>

            {userQueue.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-dawMuted space-y-1">
                <div>QUEUE IS EMPTY</div>
                <div className="text-[10px] opacity-60">Add songs from track list</div>
              </div>
            ) : (
              <div className="space-y-1">
                {userQueue.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-dawHover group border border-transparent hover:border-dawBorder transition-all"
                  >
                    <span className="w-4 text-center text-[10px] font-mono text-dawMuted">
                      {idx + 1}
                    </span>
                    <img
                      src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                      alt=""
                      className="w-7 h-7 rounded object-cover bg-dawBg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-dawCyan transition-colors">
                        {track.title}
                      </div>
                      <div className="text-[10px] text-dawMuted truncate">{track.artist}</div>
                    </div>
                    <button
                      onClick={() => playTrack(track)}
                      className="p-1 text-dawMuted hover:text-dawGreen opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Play"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromUserQueue(idx)}
                      className="p-1 text-dawMuted hover:text-dawRed opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
