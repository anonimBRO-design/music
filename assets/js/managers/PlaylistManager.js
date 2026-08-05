// Playlist Manager - Handle playlists with public/unlisted/private visibility

import { eventBus } from '../core/events.js';
import { store } from '../core/store.js';
import { STORAGE_KEYS, PLAYLIST_VISIBILITY } from '../core/constants.js';
import { generateId, formatNumber, deepClone } from '../core/utils.js';

class PlaylistManager {
  constructor() {
    this.playlists = [];
    this.init();
  }

  init() {
    this.load();
    // Listen for track like to add to "Liked Songs" virtual playlist
    eventBus.subscribe('track:liked', (track) => this.addToLikedSongs(track));
    eventBus.subscribe('track:unliked', (track) => this.removeFromLikedSongs(track));
  }

  /**
   * Load playlists from storage
   */
  load() {
    const stored = store.get(STORAGE_KEYS.PLAYLISTS);
    if (stored === null) {
      this.playlists = [];
      this.save();
    } else {
      this.playlists = stored;
    }
    // Migrate old playlists to new schema
    this.migrate();
  }

  /**
   * Get default playlists (None automatically generated)
   */
  getDefaults() {
    return [];
  }

  /**
   * Migrate old playlist format to new schema
   */
  migrate() {
    let changed = false;
    this.playlists.forEach(pl => {
      if (!pl.visibility) {
        pl.visibility = PLAYLIST_VISIBILITY.PRIVATE;
        changed = true;
      }
      if (!pl.description) {
        pl.description = '';
        changed = true;
      }
      if (!pl.coverImage) {
        pl.coverImage = null;
        changed = true;
      }
      if (!pl.ownerId) {
        pl.ownerId = 'local';
        changed = true;
      }
      if (!pl.createdAt) {
        pl.createdAt = new Date().toISOString();
        changed = true;
      }
      if (!pl.updatedAt) {
        pl.updatedAt = new Date().toISOString();
        changed = true;
      }
      if (!pl.tracks) {
        pl.tracks = [];
        changed = true;
      }
    });
    if (changed) this.save();
  }

  /**
   * Save playlists to storage
   */
  save() {
    store.set(STORAGE_KEYS.PLAYLISTS, this.playlists);
    eventBus.publish('playlists:change', this.getAll());
  }

  /**
   * Get all playlists
   */
  getAll() {
    return deepClone(this.playlists);
  }

  /**
   * Get playlist by ID
   */
  get(id) {
    const playlist = this.playlists.find(p => p.id === id);
    return playlist ? deepClone(playlist) : null;
  }

  /**
   * Get playlists by visibility
   */
  getByVisibility(visibility) {
    return this.playlists.filter(p => p.visibility === visibility).map(p => deepClone(p));
  }

  /**
   * Get public playlists (for profile pages)
   */
  getPublic() {
    return this.getByVisibility(PLAYLIST_VISIBILITY.PUBLIC);
  }

  /**
   * Get user's playlists (owned + party playlists)
   */
  getUserPlaylists(userId = 'local') {
    return this.playlists
      .filter(p => p.ownerId === userId || (p.partyMembers?.includes(userId)))
      .map(p => deepClone(p));
  }

  /**
   * Create new playlist
   * @param {Object} data - Playlist data
   */
  create(data) {
    const colors = [
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
      'linear-gradient(135deg,#ec4899,#f472b6)',
      'linear-gradient(135deg,#f59e0b,#fbbf24)',
      'linear-gradient(135deg,#10b981,#34d399)',
      'linear-gradient(135deg,#ef4444,#f87171)',
      'linear-gradient(135deg,#3b82f6,#60a5fa)',
      'linear-gradient(135deg,#8b5cf6,#a78bfa)',
      'linear-gradient(135deg,#14b8a6,#2dd4bf)'
    ];

    const playlist = {
      id: `pl_${generateId(12)}`,
      name: data.name?.trim() || 'New Playlist',
      description: data.description?.trim() || '',
      coverColor: data.coverColor || colors[Math.floor(Math.random() * colors.length)],
      coverImage: data.coverImage || null,
      visibility: data.visibility || PLAYLIST_VISIBILITY.PRIVATE,
      ownerId: data.ownerId || 'local',
      partyMembers: data.partyMembers || [],
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystem: false
    };

    this.playlists.unshift(playlist);
    this.save();
    eventBus.publish('playlist:created', playlist);
    return deepClone(playlist);
  }

  /**
   * Update playlist
   */
  update(id, data) {
    const index = this.playlists.findIndex(p => p.id === id);
    if (index === -1) return null;

    const allowedFields = ['name', 'description', 'coverColor', 'coverImage', 'visibility', 'partyMembers'];
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        this.playlists[index][field] = data[field];
      }
    });

    this.playlists[index].updatedAt = new Date().toISOString();
    this.save();
    eventBus.publish('playlist:updated', this.playlists[index]);
    return deepClone(this.playlists[index]);
  }

  /**
   * Delete playlist
   */
  delete(id) {
    const index = this.playlists.findIndex(p => p.id === id);
    if (index === -1) return false;

    const playlist = this.playlists[index];
    // Don't allow deleting system playlists
    if (playlist.isSystem) return false;

    this.playlists.splice(index, 1);
    this.save();
    eventBus.publish('playlist:deleted', id);
    return true;
  }

  /**
   * Add track to playlist
   */
  addTrack(playlistId, track, addedBy = 'local') {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return false;

    // Check if already exists
    if (playlist.tracks.some(t => t.id === track.id)) {
      eventBus.publish('toast:show', { message: 'Already in playlist', type: 'info' });
      return false;
    }

    const trackWithMeta = {
      ...track,
      addedBy,
      addedAt: new Date().toISOString(),
      position: playlist.tracks.length
    };

    playlist.tracks.push(trackWithMeta);
    playlist.updatedAt = new Date().toISOString();
    this.save();
    eventBus.publish('playlist:trackAdded', { playlistId, track: trackWithMeta });
    eventBus.publish('toast:show', { message: `Added to "${playlist.name}"`, type: 'success' });
    return true;
  }

  /**
   * Remove track from playlist
   */
  removeTrack(playlistId, trackId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return false;

    const index = playlist.tracks.findIndex(t => t.id === trackId);
    if (index === -1) return false;

    const [removed] = playlist.tracks.splice(index, 1);
    // Re-index positions
    playlist.tracks.forEach((t, i) => t.position = i);
    playlist.updatedAt = new Date().toISOString();
    this.save();
    eventBus.publish('playlist:trackRemoved', { playlistId, trackId });
    eventBus.publish('toast:show', { message: 'Removed from playlist', type: 'info' });
    return removed;
  }

  /**
   * Reorder tracks in playlist
   */
  reorderTracks(playlistId, fromIndex, toIndex) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return false;

    if (fromIndex < 0 || fromIndex >= playlist.tracks.length) return false;
    if (toIndex < 0 || toIndex >= playlist.tracks.length) return false;

    const [track] = playlist.tracks.splice(fromIndex, 1);
    playlist.tracks.splice(toIndex, 0, track);
    playlist.tracks.forEach((t, i) => t.position = i);
    playlist.updatedAt = new Date().toISOString();
    this.save();
    eventBus.publish('playlist:reordered', playlistId);
    return true;
  }

  /**
   * Search within playlist
   */
  search(playlistId, query) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return [];

    const q = query.toLowerCase().trim();
    if (!q) return playlist.tracks;

    return playlist.tracks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.album && t.album.toLowerCase().includes(q))
    );
  }

  /**
   * Sort playlist tracks
   */
  sort(playlistId, sortBy) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return false;

    const sorters = {
      'a-z': (a, b) => a.title.localeCompare(b.title),
      'artist': (a, b) => a.artist.localeCompare(b.artist),
      'album': (a, b) => (a.album || '').localeCompare(b.album || ''),
      'recently-added': (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
      'duration': (a, b) => (a.durationMs || 0) - (b.durationMs || 0)
    };

    const sorter = sorters[sortBy];
    if (!sorter) return false;

    playlist.tracks.sort(sorter);
    playlist.tracks.forEach((t, i) => t.position = i);
    playlist.updatedAt = new Date().toISOString();
    this.save();
    eventBus.publish('playlist:sorted', { playlistId, sortBy });
    return true;
  }

  /**
   * Like/Unlike playlist (for public playlists)
   */
  toggleLike(playlistId, userId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return false;

    if (!playlist.likes) playlist.likes = [];
    const index = playlist.likes.indexOf(userId);

    if (index === -1) {
      playlist.likes.push(userId);
    } else {
      playlist.likes.splice(index, 1);
    }

    this.save();
    return playlist.likes.includes(userId);
  }

  /**
   * Check if user liked playlist
   */
  isLiked(playlistId, userId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    return playlist?.likes?.includes(userId) || false;
  }

  /**
   * Get playlist stats
   */
  getStats(playlistId) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (!playlist) return null;

    const totalDuration = playlist.tracks.reduce((sum, t) => sum + (t.durationMs || 0), 0);
    return {
      trackCount: playlist.tracks.length,
      totalDuration,
      totalDurationFormatted: this.formatDuration(totalDuration),
      likeCount: playlist.likes?.length || 0
    };
  }

  /**
   * Format duration from ms
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  /**
   * Add track to "Liked Songs" virtual playlist
   */
  addToLikedSongs(track) {
    let liked = this.playlists.find(p => p.id === 'liked-songs');
    if (!liked) {
      liked = {
        id: 'liked-songs',
        name: 'Liked Songs',
        description: 'Your liked tracks',
        coverColor: 'linear-gradient(135deg,#ff2d78,#ec4899)',
        coverImage: null,
        visibility: PLAYLIST_VISIBILITY.PRIVATE,
        ownerId: 'local',
        tracks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSystem: true,
        isVirtual: true
      };
      this.playlists.unshift(liked);
    }

    if (!liked.tracks.some(t => t.id === track.id)) {
      liked.tracks.unshift({ ...track, addedAt: new Date().toISOString() });
      liked.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  /**
   * Remove track from "Liked Songs"
   */
  removeFromLikedSongs(track) {
    const liked = this.playlists.find(p => p.id === 'liked-songs');
    if (!liked) return;

    liked.tracks = liked.tracks.filter(t => t.id !== track.id);
    liked.updatedAt = new Date().toISOString();
    this.save();
  }

  /**
   * Get Liked Songs playlist
   */
  getLikedSongs() {
    return this.playlists.find(p => p.id === 'liked-songs') || null;
  }

  /**
   * Duplicate playlist
   */
  duplicate(playlistId, newName) {
    const playlist = this.get(playlistId);
    if (!playlist) return null;

    const duplicate = this.create({
      name: newName || `${playlist.name} (Copy)`,
      description: playlist.description,
      coverColor: playlist.coverColor,
      coverImage: playlist.coverImage,
      visibility: PLAYLIST_VISIBILITY.PRIVATE,
      ownerId: 'local'
    });

    // Copy tracks
    if (duplicate) {
      duplicate.tracks = playlist.tracks.map(t => ({ ...t, addedAt: new Date().toISOString() }));
      this.save();
    }

    return duplicate;
  }

  /**
   * Export playlist as JSON
   */
  export(playlistId) {
    const playlist = this.get(playlistId);
    if (!playlist) return null;

    return JSON.stringify(playlist, null, 2);
  }

  /**
   * Import playlist from JSON
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return this.create({
        name: data.name,
        description: data.description,
        coverColor: data.coverColor,
        coverImage: data.coverImage,
        visibility: PLAYLIST_VISIBILITY.PRIVATE,
        ownerId: 'local'
      });
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const playlistManager = new PlaylistManager();