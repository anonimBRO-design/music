import React, { useState, useEffect } from 'react';
import { usePlaylistStore, GRADIENT_PRESETS } from '../../stores/usePlaylistStore';
import { useToastStore } from '../../stores/useToastStore';
import { X, Music } from 'lucide-react';

export const PlaylistEditModal = () => {
  const isOpen = usePlaylistStore((s) => s.isEditModalOpen);
  const editingId = usePlaylistStore((s) => s.editingPlaylistId);
  const close = usePlaylistStore((s) => s.closeEditModal);
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const updateDetails = usePlaylistStore((s) => s.updatePlaylistDetails);
  const getPlaylist = usePlaylistStore((s) => s.getPlaylist);
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(GRADIENT_PRESETS[0]);

  useEffect(() => {
    if (isOpen) {
      if (editingId) {
        const pl = getPlaylist(editingId);
        if (pl) {
          setName(pl.name);
          setDesc(pl.description || '');
          setSelectedColor(pl.color || GRADIENT_PRESETS[0]);
        }
      } else {
        setName('');
        setDesc('');
        setSelectedColor(GRADIENT_PRESETS[0]);
      }
    }
  }, [isOpen, editingId, getPlaylist]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      showToast('Please enter a playlist name', 'error');
      return;
    }

    if (editingId) {
      updateDetails(editingId, cleanName, desc, selectedColor);
      showToast(`Playlist "${cleanName}" updated`, 'success');
    } else {
      createPlaylist(cleanName, desc, selectedColor);
      showToast(`Playlist "${cleanName}" created`, 'success');
    }
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h2 className="text-lg font-bold text-white font-syne">
            {editingId ? 'Edit Playlist Details' : 'Create New Playlist'}
          </h2>
          <button onClick={close} className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 items-center">
            <div
              style={{ background: selectedColor }}
              className="w-24 h-24 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            >
              <Music className="w-10 h-10 text-white/90" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Playlist Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors font-syne"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Give your playlist a catchy description..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none font-syne"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Cover Theme Palette
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENT_PRESETS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ background: color }}
                  className={`h-9 rounded-lg transition-transform ${
                    selectedColor === color ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 rounded-full text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors font-syne"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all font-syne shadow-lg shadow-emerald-500/20"
            >
              {editingId ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
