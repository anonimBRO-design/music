import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { PlaylistTable } from '../components/playlist/PlaylistTable';
import { Clock, Play } from 'lucide-react';

export const HistoryPage = ({ onOpenContextMenu }) => {
  const history = useUserStore((s) => s.history);
  const profile = useUserStore((s) => s.profile);
  const playCollection = usePlayerStore((s) => s.playCollection);

  return (
    <div className="space-y-8 p-6 md:p-8 font-syne select-none">
      {/* Header Hero */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-white/5">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl bg-gradient-to-br from-indigo-700 to-cyan-900 flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-900/30">
          <Clock className="w-24 h-24 text-white" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
            History
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">Listening History</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 font-medium">
            <span className="font-bold text-white">{profile.username || 'Listener'}</span>
            <span>•</span>
            <span>{history.length} played song{history.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={() => playCollection('history', 'history')}
              disabled={history.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 ios-btn-primary cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Play History
            </button>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      {history.length === 0 ? (
        <div className="text-center py-24 space-y-3">
          <Clock className="w-12 h-12 text-zinc-600 mx-auto stroke-1" />
          <h3 className="text-lg font-bold text-white">No history yet</h3>
          <p className="text-xs text-zinc-500">Songs you play will automatically appear here.</p>
        </div>
      ) : (
        <PlaylistTable
          tracks={history}
          collectionTitle="Listening History"
          onOpenContextMenu={onOpenContextMenu}
        />
      )}
    </div>
  );
};
