import React from 'react';
import { useUserStore } from '../stores/useUserStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { PlaylistTable } from '../components/playlist/PlaylistTable';
import { Heart, Play, Shuffle } from 'lucide-react';

export const LikedPage = ({ onOpenContextMenu }) => {
  const likedSongs = useUserStore((s) => s.likedSongs);
  const profile = useUserStore((s) => s.profile);
  const playCollection = usePlayerStore((s) => s.playCollection);
  const shuffleCollection = usePlayerStore((s) => s.shuffleCollection);

  return (
    <div className="space-y-8 p-6 md:p-8 font-syne select-none">
      {/* Header Hero */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-white/5">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl bg-gradient-to-br from-pink-600 to-purple-800 flex items-center justify-center shrink-0 shadow-2xl shadow-pink-900/30">
          <Heart className="w-24 h-24 text-white fill-white" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
            Collection
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">Liked Songs</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 font-medium">
            <span className="font-bold text-white">{profile.username || 'Listener'}</span>
            <span>•</span>
            <span>{likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={() => playCollection('liked', 'liked')}
              disabled={likedSongs.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-current" /> Play
            </button>
            <button
              onClick={() => shuffleCollection('liked', 'liked')}
              disabled={likedSongs.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white font-bold text-xs border border-white/10 transition-all"
            >
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      {likedSongs.length === 0 ? (
        <div className="text-center py-24 space-y-3">
          <Heart className="w-12 h-12 text-zinc-600 mx-auto stroke-1" />
          <h3 className="text-lg font-bold text-white">Songs you like will appear here</h3>
          <p className="text-xs text-zinc-500">Save songs by tapping the heart icon on any track.</p>
        </div>
      ) : (
        <PlaylistTable
          tracks={likedSongs}
          collectionTitle="Liked Songs"
          onOpenContextMenu={onOpenContextMenu}
        />
      )}
    </div>
  );
};
