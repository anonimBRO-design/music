import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { PlaylistTable } from '../components/playlist/PlaylistTable';
import { Clock, Play, Sparkles } from 'lucide-react';

export const HistoryPage = ({ onOpenContextMenu }) => {
  const history = useUserStore((s) => s.history);
  const profile = useUserStore((s) => s.profile);
  const playCollection = usePlayerStore((s) => s.playCollection);

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto select-none font-sans">
      {/* Header Hero */}
      <div className="relative card-elev p-6 sm:p-8 rounded-2xl border border-border overflow-hidden">
        {/* Ambient primary glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 p-[2px] shrink-0 shadow-[var(--shadow-warm)]">
            <div className="w-full h-full rounded-[14px] bg-surface flex items-center justify-center">
              <Clock className="w-20 h-20 text-primary" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary" />
              Chronological Log
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main tracking-tight leading-tight">
              Session History
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-text-muted font-medium">
              <span className="font-bold text-text-main">{profile.username || 'Studio Listener'}</span>
              <span>•</span>
              <span className="font-mono">{history.length} track{history.length !== 1 ? 's' : ''} logged</span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={() => playCollection('history', 'history')}
                disabled={history.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-[var(--shadow-warm)] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Play History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      {history.length === 0 ? (
        <div className="text-center py-24 space-y-3 card-soft border border-border p-8 rounded-2xl">
          <Clock className="w-12 h-12 text-text-subtle mx-auto stroke-1" />
          <h3 className="text-base font-bold text-text-main">No history yet</h3>
          <p className="text-xs text-text-muted">Songs you stream will automatically appear in your chronological session log.</p>
        </div>
      ) : (
        <div className="card-soft border border-border rounded-2xl overflow-hidden p-2 sm:p-4">
          <PlaylistTable
            tracks={history}
            collectionTitle="Listening History"
            onOpenContextMenu={onOpenContextMenu}
          />
        </div>
      )}
    </div>
  );
};
