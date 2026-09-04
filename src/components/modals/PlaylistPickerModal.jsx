import React from 'react';
import { usePlaylistStore } from '../../stores/usePlaylistStore';
import { useToastStore } from '../../stores/useToastStore';
import { X, Plus, Music, Check } from 'lucide-react';

export const PlaylistPickerModal = () => {
  const isOpen = usePlaylistStore((s) => s.isPickerModalOpen);
  const track = usePlaylistStore((s) => s.pickerTrack);
  const closePickerModal = usePlaylistStore((s) => s.closePickerModal);
  const close = closePickerModal;
  const playlists = usePlaylistStore((s) => s.playlists);
  const addTrack = usePlaylistStore((s) => s.addTrackToPlaylist);
  const openCreateModal = usePlaylistStore((s) => s.openCreateModal);
  const showToast = useToastStore((s) => s.showToast);

  if (!isOpen || !track) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-modal-backdrop-in"
      onClick={(e) => { if (e.target === e.currentTarget) closePickerModal(); }}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-modal-card-in">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h2 className="text-base font-bold text-white font-syne">Add to Playlist</h2>
          <button onClick={close} className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors ios-btn-icon ios-btn-spring cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto mb-4 pr-1">
          {playlists.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500 font-syne">
              No playlists found. Create one below!
            </div>
          ) : (
            playlists.map((pl) => {
              const alreadyHas = pl.tracks?.some((t) => t.id === track.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => {
                    if (alreadyHas) {
                      showToast(`Already in "${pl.name}"`, 'info');
                    } else {
                      addTrack(pl.id, track);
                      showToast(`Added to "${pl.name}"`, 'success');
                      close();
                    }
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group ios-btn-spring"
                >
                  <div
                    style={{ background: pl.color || '#7928ca' }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-md"
                  >
                    <Music className="w-5 h-5 text-white/90" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate font-syne group-hover:text-emerald-400 transition-colors">
                      {pl.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-syne">{pl.tracks?.length || 0} songs</div>
                  </div>
                  {alreadyHas && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Added
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => {
            close();
            openCreateModal();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors font-syne ios-btn-spring cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          Create new playlist
        </button>
      </div>
    </div>
  );
};
