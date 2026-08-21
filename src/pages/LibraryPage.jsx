import React from 'react';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useToastStore } from '../stores/useToastStore';
import { Plus, Music, Play, Edit3, Trash2 } from 'lucide-react';

export const LibraryPage = ({ onSelectPlaylist }) => {
  const playlists = usePlaylistStore((s) => s.playlists);
  const openCreateModal = usePlaylistStore((s) => s.openCreateModal);
  const openEditModal = usePlaylistStore((s) => s.openEditModal);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
  const playCollection = usePlayerStore((s) => s.playCollection);
  const showToast = useToastStore((s) => s.showToast);

  return (
    <div className="space-y-8 p-6 md:p-8 font-syne select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">Your Library</h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">Manage your custom playlists and albums.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-24 space-y-4 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-3xl shadow-inner">
            🎵
          </div>
          <h3 className="text-xl font-bold text-white">Create your first playlist</h3>
          <p className="text-xs text-zinc-400">Organize your favorite music into custom themes and vibes.</p>
          <button
            onClick={openCreateModal}
            className="px-6 py-2.5 rounded-full bg-emerald-400 text-black font-bold text-xs"
          >
            + Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group relative p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div
                  style={{ background: pl.color || '#7928ca' }}
                  className="relative aspect-square mb-3.5 rounded-xl flex items-center justify-center shadow-md overflow-hidden"
                >
                  <Music className="w-12 h-12 text-white/90" />
                  {pl.tracks?.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playCollection('playlist', pl.id);
                      }}
                      className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  )}
                </div>
                <div className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {pl.name}
                </div>
                <div className="text-xs text-zinc-400 truncate mt-0.5">
                  Playlist · {pl.tracks?.length || 0} songs
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-white/5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(pl.id);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Edit details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete playlist "${pl.name}"?`)) {
                      deletePlaylist(pl.id);
                      showToast(`Playlist "${pl.name}" deleted`, 'info');
                    }
                  }}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
