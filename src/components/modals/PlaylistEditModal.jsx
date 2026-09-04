import React, { useState, useEffect, useRef } from 'react';
import { usePlaylistStore, GRADIENT_PRESETS } from '../../stores/usePlaylistStore';
import { useToastStore } from '../../stores/useToastStore';
import { X, Music, Camera, Trash2 } from 'lucide-react';

export const PlaylistEditModal = () => {
  const isOpen = usePlaylistStore((s) => s.isEditModalOpen);
  const editingId = usePlaylistStore((s) => s.editingPlaylistId);
  const closeEditModal = usePlaylistStore((s) => s.closeEditModal);
  const close = closeEditModal;
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const updateDetails = usePlaylistStore((s) => s.updatePlaylistDetails);
  const getPlaylist = usePlaylistStore((s) => s.getPlaylist);
  const showToast = useToastStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedColor, setSelectedColor] = useState(GRADIENT_PRESETS[0]);
  const [image, setImage] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingId) {
        const pl = getPlaylist(editingId);
        if (pl) {
          setName(pl.name);
          setDesc(pl.description || '');
          setSelectedColor(pl.color || GRADIENT_PRESETS[0]);
          setImage(pl.image || null);
        }
      } else {
        setName('');
        setDesc('');
        setSelectedColor(GRADIENT_PRESETS[0]);
        setImage(null);
      }
    }
  }, [isOpen, editingId, getPlaylist]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400; // Resize to max 400x400 to save localStorage quota
        let width = img.width;
        let height = img.height;

        // Crop to square
        const minDim = Math.min(width, height);
        const sx = (width - minDim) / 2;
        const sy = (height - minDim) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);
        
        // Compress to JPEG (0.7 quality)
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        setImage(base64);
        
        // Clear input value so same file can be re-selected if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      showToast('Please enter a playlist name', 'error');
      return;
    }

    if (editingId) {
      updateDetails(editingId, cleanName, desc, selectedColor, image);
      showToast(`Playlist "${cleanName}" updated`, 'success');
    } else {
      createPlaylist(cleanName, desc, selectedColor, image);
      showToast(`Playlist "${cleanName}" created`, 'success');
    }
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-modal-backdrop-in"
      onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-modal-card-in">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h2 className="text-lg font-bold text-white font-syne">
            {editingId ? 'Edit Playlist Details' : 'Create New Playlist'}
          </h2>
          <button onClick={close} className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors ios-btn-icon ios-btn-spring cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ background: !image ? selectedColor : 'transparent' }}
              className="w-24 h-24 rounded-xl flex items-center justify-center shrink-0 shadow-lg relative group overflow-hidden cursor-pointer ios-btn-spring"
            >
              {image ? (
                <img src={image} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <Music className="w-10 h-10 text-white/90" />
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wider text-center px-1 leading-tight">
                  {image ? 'Change Photo' : 'Upload Photo'}
                </span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Cover Theme Palette
              </label>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="flex items-center gap-1 text-[10px] font-bold text-iosPink hover:text-red-400 uppercase tracking-wider transition-colors ios-btn-spring cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove Photo
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENT_PRESETS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setImage(null); // Switching back to gradient
                  }}
                  style={{ background: color }}
                  className={`h-9 rounded-lg transition-all ios-pill-spring ${
                    selectedColor === color && !image ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 rounded-full text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors font-syne ios-btn-spring cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all font-syne shadow-lg shadow-emerald-500/20 ios-btn-primary cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
