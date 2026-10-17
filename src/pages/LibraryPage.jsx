import React from 'react';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useToastStore } from '../stores/useToastStore';
import { useSpotifyImportStore } from '../stores/useSpotifyImportStore';
import { Download, Plus, Music, Play, Edit3, Trash2 } from 'lucide-react';

export const LibraryPage = ({ onSelectPlaylist }) => {
  const playlists = usePlaylistStore((s) => s.playlists);
  const openCreateModal = usePlaylistStore((s) => s.openCreateModal);
  const openEditModal = usePlaylistStore((s) => s.openEditModal);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
  const openSpotifyImport = useSpotifyImportStore((s) => s.open);
  const playCollection = usePlayerStore((s) => s.playCollection);
  const showToast = useToastStore((s) => s.showToast);

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto select-none font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-text-main tracking-tight">Your Audio Library</h1>
          <p className="text-xs md:text-sm text-text-muted mt-1">Manage custom playlist crates and studio collections.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openSpotifyImport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-main font-semibold text-xs border border-border transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-text-muted" /> Import Spotify
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-all shadow-[var(--shadow-warm)] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Playlist
          </button>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-24 space-y-4 max-w-sm mx-auto card-soft border border-border p-8 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto text-3xl shadow-inner border border-border">
            🎵
          </div>
          <h3 className="text-lg font-bold text-text-main">Create your first playlist</h3>
          <p className="text-xs text-text-muted">Organize your favorite music into custom themes and vibes.</p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs shadow-[var(--shadow-warm)] cursor-pointer"
          >
            + Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group relative p-4 rounded-2xl card-soft hover:card-elev hover:border-primary/40 border border-border transition-all cursor-pointer shadow-sm flex flex-col justify-between"
            >
              <div>
                <div
                  style={{ background: !pl.image ? (pl.color || 'var(--color-primary)') : 'transparent' }}
                  className="relative aspect-square mb-3.5 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-surface-2 border border-border"
                >
                  {pl.image ? (
                    <img src={pl.image} alt={pl.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-12 h-12 text-white/90" />
                  )}
                  {pl.tracks?.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playCollection('playlist', pl.id);
                      }}
                      className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-[var(--shadow-warm)] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  )}
                </div>
                <div className="text-sm font-bold text-text-main truncate group-hover:text-primary transition-colors">
                  {pl.name}
                </div>
                <div className="text-xs text-text-muted truncate mt-0.5 font-mono">
                  Playlist · {pl.tracks?.length || 0} songs
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-border">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(pl.id);
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors cursor-pointer"
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
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
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
