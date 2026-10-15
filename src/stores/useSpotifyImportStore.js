import { create } from 'zustand';
import { GRADIENT_PRESETS, usePlaylistStore } from './usePlaylistStore';
import {
  beginSpotifyAuth,
  clearSpotifySession,
  getSpotifyPlaylist,
  getSpotifyPlaylistTracks,
  handleSpotifyCallback,
  hasSpotifySession,
  matchSpotifyTracks,
  parseSpotifyPlaylistId
} from '../services/spotifyApi';

const initialProgress = { completed: 0, total: 0, current: '' };

export const useSpotifyImportStore = create((set, get) => ({
  isOpen: false,
  step: 'connect',
  playlistUrl: '',
  playlist: null,
  results: [],
  progress: initialProgress,
  importedCount: 0,
  error: '',

  open: () => set({
    isOpen: true,
    step: hasSpotifySession() ? 'input' : 'connect',
    error: '',
    importedCount: 0
  }),

  close: () => set({ isOpen: false }),

  setPlaylistUrl: (playlistUrl) => set({ playlistUrl, error: '' }),

  connect: async () => {
    try {
      set({ error: '' });
      await beginSpotifyAuth();
    } catch (error) {
      set({ error: error.message || 'Spotify connection failed.' });
    }
  },

  handleCallback: async () => {
    const result = await handleSpotifyCallback();
    if (!result.handled) return;
    set({
      isOpen: true,
      step: result.connected ? 'input' : 'connect',
      error: result.error || ''
    });
  },

  disconnect: () => {
    clearSpotifySession();
    set({ step: 'connect', playlist: null, results: [], playlistUrl: '', error: '' });
  },

  importPlaylist: async () => {
    const { playlistUrl } = get();
    const playlistId = parseSpotifyPlaylistId(playlistUrl);
    if (!playlistId) {
      set({ error: 'Paste a valid Spotify playlist URL or playlist URI.' });
      return;
    }

    try {
      set({ step: 'loading', error: '', progress: { completed: 0, total: 0, current: 'Loading Spotify playlist...' } });
      const [playlist, spotifyEntries] = await Promise.all([
        getSpotifyPlaylist(playlistId),
        getSpotifyPlaylistTracks(playlistId)
      ]);
      if (!spotifyEntries.length) {
        throw new Error('This playlist has no importable tracks. Local or removed tracks are skipped.');
      }

      set({
        playlist,
        progress: { completed: 0, total: spotifyEntries.length, current: spotifyEntries[0]?.title || '' }
      });
      const results = await matchSpotifyTracks(spotifyEntries, (completed, total, result) => {
        set({ progress: { completed, total, current: result?.source?.title || '' } });
      });
      set({ results, step: 'preview', progress: { completed: results.length, total: results.length, current: '' } });
    } catch (error) {
      set({ step: 'input', error: error.message || 'Spotify playlist import failed.' });
    }
  },

  selectCandidate: (spotifyId, candidate) => set((state) => ({
    results: state.results.map((result) => result.source.spotifyId === spotifyId
      ? { ...result, selected: candidate, status: candidate ? 'matched' : 'skipped' }
      : result)
  })),

  confirmImport: () => {
    const { playlist, results } = get();
    const selectedTracks = results
      .filter((result) => result.selected)
      .map((result) => ({
        ...result.selected,
        source: {
          provider: 'spotify',
          spotifyTrackId: result.source.spotifyId,
          spotifyUri: result.source.spotifyUri,
          spotifyAlbum: result.source.album,
          importedTitle: result.source.title,
          importedArtist: result.source.artist
        }
      }));

    if (!playlist || !selectedTracks.length) {
      set({ error: 'Select at least one matched track before importing.' });
      return;
    }

    usePlaylistStore.getState().createImportedPlaylist({
      name: playlist.name,
      description: playlist.description || `Imported from Spotify by ${playlist.owner}`,
      color: GRADIENT_PRESETS[4],
      image: playlist.image,
      tracks: selectedTracks,
      source: {
        provider: 'spotify',
        spotifyPlaylistId: playlist.id,
        spotifyUri: playlist.uri,
        externalUrl: playlist.externalUrl,
        importedAt: new Date().toISOString(),
        totalSourceTracks: results.length
      }
    });

    set({ step: 'done', importedCount: selectedTracks.length, error: '' });
  }
}));
