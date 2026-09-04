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
    <div className="space-y-8 p-6 md:p-8 font-syne select-none">
      {/* Playlist Hero */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-white/5">
        <div
          style={{ background: playlist.color || '#7928ca' }}
          className="w-48 h-48 md:w-56 md:h-56 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl shadow-black/60"
        >
          <Music className="w-24 h-24 text-white/90" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 bg-white/10 px-3 py-1 rounded-full">
            Public Playlist
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight truncate">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl">{playlist.description}</p>
          )}
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 font-medium">
            <span className="font-bold text-white">{profile.username || 'Listener'}</span>
            <span>•</span>
            <span>
              {totalTracks} song{totalTracks !== 1 ? 's' : ''}
              {totalMinutes > 0 ? `, about ${totalMinutes} min` : ''}
            </span>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={() => playCollection('playlist', playlist.id)}
              disabled={totalTracks === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 ios-btn-primary cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Play
            </button>
            <button
              onClick={() => shuffleCollection('playlist', playlist.id)}
              disabled={totalTracks === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white font-bold text-xs border border-white/10 transition-all ios-btn-spring cursor-pointer"
            >
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
            <button
              onClick={() => openEditModal(playlist.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold border border-white/10 transition-all ios-btn-spring cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Details
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
                  deletePlaylist(playlist.id);
                  showToast(`Playlist "${playlist.name}" deleted`, 'info');
                  onNavigateLibrary();
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-rose-400 hover:bg-rose-500/15 text-xs font-bold border border-rose-500/30 transition-all ios-btn-spring cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

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
                className="px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs"
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
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
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
