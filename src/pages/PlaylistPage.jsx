import React, { useState } from 'react';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUserStore } from '../stores/useUserStore';
import { useToastStore } from '../stores/useToastStore';
import { PlaylistTable } from '../components/playlist/PlaylistTable';
import { YouTubeAPI } from '../services/youtubeApi';
import { Play, Shuffle, Edit3, Trash2, Search, Plus, Music } from 'lucide-react';

export const PlaylistPage = ({ playlistId, onNavigateLibrary, onOpenContextMenu }) => {
  const getPlaylist = usePlaylistStore((s) => s.getPlaylist);
  const openEditModal = usePlaylistStore((s) => s.openEditModal);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
  const reorderTracks = usePlaylistStore((s) => s.reorderPlaylistTracks);
  const addTrack = usePlaylistStore((s) => s.addTrackToPlaylist);

  const playCollection = usePlayerStore((s) => s.playCollection);
  const shuffleCollection = usePlayerStore((s) => s.shuffleCollection);
  const profile = useUserStore((s) => s.profile);
  const showToast = useToastStore((s) => s.showToast);

  const [filterQuery, setFilterQuery] = useState('');
  const [inlineSearch, setInlineSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const playlist = getPlaylist(playlistId);

  if (!playlist) {
    return (
      <div className="p-12 text-center text-zinc-500 font-syne">
        Playlist not found.
      </div>
    );
  }

  const totalTracks = playlist.tracks?.length || 0;
  const totalSeconds = (playlist.tracks || []).reduce((acc, t) => acc + (t.duration || 180), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const displayedTracks = filterQuery
    ? (playlist.tracks || []).filter(
        (t) =>
          t.title?.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.artist?.toLowerCase().includes(filterQuery.toLowerCase()) ||
          t.genre?.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : playlist.tracks || [];

  const handleInlineSearch = async (e) => {
    e.preventDefault();
    if (!inlineSearch.trim()) return;
    setSearchLoading(true);
    const res = await YouTubeAPI.search(inlineSearch.trim(), 5);
    setSearchResults(res.items || []);
    setSearchLoading(false);
  };

  const quickPicks = [
    { id: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', artist: 'Lofi Girl', thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg', genre: 'Lo-Fi' },
    { id: '4xDzrJKXOOY', title: 'SYNTHWAVE RADIO - 24/7 Chill Synth / Retro Beats', artist: 'Lofi Girl Synthwave', thumbnail: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg', genre: 'Synthwave' },
    { id: '1fueZCTYkpA', title: 'Aesthetic Phonk / Night Drift Vibes', artist: 'Phonk Nation', thumbnail: 'https://i.ytimg.com/vi/1fueZCTYkpA/hqdefault.jpg', genre: 'Phonk' }
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto select-none font-sans">
      {/* Playlist Hero */}
      <div className="relative card-elev p-6 sm:p-8 rounded-2xl border border-border overflow-hidden">
        {/* Ambient primary glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div
            style={{ background: !playlist.image ? (playlist.color || 'var(--color-primary)') : 'transparent' }}
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl flex items-center justify-center shrink-0 shadow-[var(--shadow-warm)] overflow-hidden bg-surface-2 border border-border"
          >
            {playlist.image ? (
              <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-20 h-20 text-white/90" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              User Playlist
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-main leading-tight truncate tracking-tight">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-xs md:text-sm text-text-muted max-w-2xl">{playlist.description}</p>
            )}
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-text-muted font-medium">
              <span className="font-bold text-text-main">{profile.username || 'Studio Listener'}</span>
              <span>•</span>
              <span className="font-mono">
                {totalTracks} track{totalTracks !== 1 ? 's' : ''}
                {totalMinutes > 0 ? `, about ${totalMinutes} min` : ''}
              </span>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              <button
                onClick={() => playCollection('playlist', playlist.id)}
                disabled={totalTracks === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-white font-semibold text-xs transition-all shadow-[var(--shadow-warm)] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Play
              </button>
              <button
                onClick={() => shuffleCollection('playlist', playlist.id)}
                disabled={totalTracks === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 disabled:opacity-40 text-text-main font-semibold text-xs border border-border transition-all cursor-pointer shadow-sm"
              >
                <Shuffle className="w-4 h-4 text-text-muted" /> Shuffle
              </button>
              <button
                onClick={() => openEditModal(playlist.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-main text-xs font-semibold border border-border transition-all cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-text-muted" /> Edit Details
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
                    deletePlaylist(playlist.id);
                    showToast(`Playlist "${playlist.name}" deleted`, 'info');
                    onNavigateLibrary();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-semibold border border-red-500/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>

            {totalTracks > 0 && (
              <div className="relative ml-auto w-full md:w-56 mt-2 md:mt-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter in playlist..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Content */}
      {totalTracks === 0 ? (
        <div className="p-8 md:p-12 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Let's find something for your playlist</h3>
            <p className="text-xs text-zinc-400">Search YouTube to add your favorite songs.</p>
            <form onSubmit={handleInlineSearch} className="flex gap-2 pt-2">
              <input
                type="text"
                value={inlineSearch}
                onChange={(e) => setInlineSearch(e.target.value)}
                placeholder="Search songs, artists, or keywords..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs ios-btn-spring cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Quick Recommendations / Search results */}
          <div className="max-w-xl mx-auto text-left space-y-2 pt-4 border-t border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {searchResults.length > 0 ? 'Search Results' : 'Recommended Quick Add'}
            </div>

            <div className="space-y-1.5">
              {(searchResults.length > 0 ? searchResults : quickPicks).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                >
                  <img
                    src={t.thumbnail || `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`;
                    }}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-900"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{t.title}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{t.artist}</div>
                  </div>
                  <button
                    onClick={() => {
                      addTrack(playlist.id, t);
                      showToast(`Added to "${playlist.name}"`, 'success');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors ios-btn-spring cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <PlaylistTable
          tracks={displayedTracks}
          playlistId={playlist.id}
          collectionTitle={playlist.name}
          onReorder={(fromIdx, toIdx) => reorderTracks(playlist.id, fromIdx, toIdx)}
          onOpenContextMenu={onOpenContextMenu}
        />
      )}
    </div>
  );
};
