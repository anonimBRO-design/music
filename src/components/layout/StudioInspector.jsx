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
      <aside className="hidden lg:flex flex-col items-center justify-between py-4 w-12 bg-sidebar/90 backdrop-blur-2xl border-l border-border select-none z-20">
        <button
          onClick={toggleInspector}
          className="p-2 text-text-muted hover:text-primary hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="Expand Studio Inspector (Ctrl+I)"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-3">
          {isPlaying && (
            <div className="flex flex-col items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-pulse" />
              <div className="daw-meter-bar">
                <span className="daw-meter-col" />
                <span className="daw-meter-col" />
                <span className="daw-meter-col" />
              </div>
            </div>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted/60 rotate-90 whitespace-nowrap mt-6">
            Inspector
          </span>
        </div>

        <div className="w-4 h-4" />
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-80 xl:w-92 bg-sidebar/90 backdrop-blur-2xl border-l border-border select-none z-20 h-full overflow-hidden transition-all duration-200">
      {/* 9Router Header Bar */}
      <div className="h-13 px-4 border-b border-border flex items-center justify-between shrink-0 bg-surface/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-main">
            Studio Inspector
          </h2>
        </div>
        <button
          onClick={toggleInspector}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors cursor-pointer"
          title="Collapse Inspector (Ctrl+I)"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* 9Router Pill Segmented Tab Switcher */}
      <div className="p-3 border-b border-border shrink-0 bg-surface/20">
        <div className="grid grid-cols-3 gap-1 bg-surface-2 p-1 rounded-xl border border-border-subtle">
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
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-primary/15 text-primary border border-primary/25 shadow-[var(--shadow-warm)] font-semibold'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-3 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* 1. MONITOR / NOW PLAYING TAB */}
        {inspectorTab === 'now-playing' && (
          <div className="p-4 space-y-4">
            {currentTrack ? (
              <>
                {/* Modern Card Artwork with floating actions */}
                <div className="relative group rounded-2xl border border-border overflow-hidden bg-surface shadow-elevated">
                  <img
                    src={currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`;
                    }}
                    className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                    <button
                      onClick={() => setFullscreenOpen(true)}
                      className="p-2 rounded-xl bg-surface/80 backdrop-blur-md text-white hover:bg-primary hover:text-white transition-all shadow-md cursor-pointer border border-border"
                      title="Theater Mode (T)"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleLike(currentTrack)}
                      className="p-2 rounded-xl bg-surface/80 backdrop-blur-md text-white hover:bg-surface transition-all shadow-md cursor-pointer border border-border"
                      title="Like track (L)"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked(currentTrack.id) ? 'text-red-500 fill-red-500' : 'text-white'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Track Title & Artist */}
                <div className="space-y-1">
                  <div className="text-base font-bold text-text-main tracking-tight line-clamp-2">
                    {currentTrack.title}
                  </div>
                  <div className="text-xs text-text-muted font-medium line-clamp-1">
                    {currentTrack.artist}
                  </div>
                </div>

                {/* 9Router Telemetry & Specs Card */}
                <div className="card-soft p-3.5 border border-border rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-main flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      Audio Stream
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full bg-primary ${isPlaying ? 'animate-pulse' : ''}`} />
                      {isPlaying ? 'ACTIVE' : 'STANDBY'}
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border-subtle">
                    <div className="bg-surface-2 p-2 rounded-lg border border-border-subtle">
                      <span className="text-[10px] text-text-subtle uppercase block font-semibold">Codec</span>
                      <span className="text-text-main font-semibold">Opus / HQ</span>
                    </div>
                    <div className="bg-surface-2 p-2 rounded-lg border border-border-subtle">
                      <span className="text-[10px] text-text-subtle uppercase block font-semibold">Sampling</span>
                      <span className="text-text-main font-semibold">48.0 kHz • 24b</span>
                    </div>
                  </div>

                  {/* Real-time Spectrum Peak Meter */}
                  <div className="pt-2 border-t border-border-subtle space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span>Stereo Output Peak</span>
                      <span className="font-mono text-primary font-semibold">{isPlaying ? '-4.8 dB' : '-INF'}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-2 border border-border-subtle overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-200 bg-gradient-to-r from-primary to-primary-hover shadow-[0_0_8px_var(--color-primary)] ${
                          isPlaying ? 'w-4/5' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Deck Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('nonimsong:open-equalizer'))}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-main font-medium transition-all hover:border-primary/40 cursor-pointer shadow-soft"
                  >
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    <span>Master EQ</span>
                  </button>
                  <button
                    onClick={() => setFullscreenOpen(true)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-main font-medium transition-all hover:border-primary/40 cursor-pointer shadow-soft"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-primary" />
                    <span>Theater</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-text-subtle">
                  <Music className="w-6 h-6" />
                </div>
                <span className="text-xs text-text-muted font-medium">No track selected</span>
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
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
              <span className="font-semibold text-text-main uppercase tracking-wider text-[11px]">
                Up Next ({userQueue.length})
              </span>
              {userQueue.length > 0 && (
                <button
                  onClick={clearUserQueue}
                  className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {userQueue.length === 0 ? (
              <div className="py-14 text-center text-xs text-text-muted space-y-1">
                <div className="font-medium">Queue is empty</div>
                <div className="text-[11px] text-text-subtle">Add songs from track list</div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {userQueue.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-2 group border border-transparent hover:border-border transition-all cursor-pointer"
                  >
                    <span className="w-4 text-center text-xs font-mono text-text-subtle">
                      {idx + 1}
                    </span>
                    <img
                      src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover bg-surface-3 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-text-main truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">{track.artist}</div>
                    </div>
                    <button
                      onClick={() => playTrack(track)}
                      className="p-1.5 text-text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Play"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromUserQueue(idx)}
                      className="p-1.5 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
