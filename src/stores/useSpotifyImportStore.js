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
import { parsePlaylistFile, parsePlaylistUrl } from '../services/playlistImport';

const initialProgress = { completed: 0, total: 0, current: '' };

const runMatching = async (set, playlist, sourceTracks) => {
  if (!sourceTracks.length) {
    throw new Error('No importable tracks were found in this playlist.');
  }

  set({
    playlist,
    step: 'loading',
    error: '',
    progress: { completed: 0, total: sourceTracks.length, current: sourceTracks[0]?.title || '' }
  });
  const results = await matchSpotifyTracks(sourceTracks, (completed, total, result) => {
    set({ progress: { completed, total, current: result?.source?.title || '' } });
  });
  set({
    results,
    step: 'preview',
    progress: { completed: results.length, total: results.length, current: '' }
  });
};

export const useSpotifyImportStore = create((set, get) => ({
  isOpen: false,
  sourceMode: 'file',
  step: 'file',
  playlistUrl: '',
  fileName: '',
  playlist: null,
  results: [],
  progress: initialProgress,
  importedCount: 0,
  error: '',

  open: () => set({
    isOpen: true,
    sourceMode: 'file',
    step: 'file',
    error: '',
    importedCount: 0
  }),

  close: () => set({ isOpen: false }),

  setSourceMode: (sourceMode) => set({
    sourceMode,
    step: sourceMode === 'spotify' ? (hasSpotifySession() ? 'input' : 'connect') : sourceMode,
    error: ''
  }),

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
      sourceMode: 'spotify',
      step: result.connected ? 'input' : 'connect',
      error: result.error || ''
    });
  },

  disconnect: () => {
    clearSpotifySession();
    set({ step: 'connect', playlist: null, results: [], playlistUrl: '', error: '' });
  },

  importSpotifyPlaylist: async () => {
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
      await runMatching(set, playlist, spotifyEntries);
    } catch (error) {
      set({ step: 'input', error: error.message || 'Spotify playlist import failed.' });
    }
  },

  importFile: async (file) => {
    if (!file) return;
    try {
      set({ step: 'loading', fileName: file.name, error: '', progress: { completed: 0, total: 0, current: `Reading ${file.name}...` } });
      const playlist = await parsePlaylistFile(file);
      await runMatching(set, playlist, playlist.tracks);
    } catch (error) {
      set({ step: 'file', error: error.message || 'Playlist file import failed.' });
    }
  },

  importUrl: async () => {
    const { playlistUrl } = get();
    if (!playlistUrl.trim()) {
      set({ error: 'Paste a direct URL to an M3U, CSV, or JSON playlist file.' });
      return;
    }
    try {
      set({ step: 'loading', error: '', progress: { completed: 0, total: 0, current: 'Downloading playlist file...' } });
      const playlist = await parsePlaylistUrl(playlistUrl);
      await runMatching(set, playlist, playlist.tracks);
    } catch (error) {
      set({ step: 'url', error: error.message || 'Playlist URL import failed.' });
    }
  },

  selectCandidate: (sourceId, candidate) => set((state) => ({
    results: state.results.map((result) => (result.source.sourceId || result.source.spotifyId) === sourceId
      ? { ...result, selected: candidate, status: candidate ? 'matched' : 'skipped' }
      : result)
  })),

  confirmImport: () => {
    const { playlist, results } = get();
    const selectedTracks = results
      .filter((result) => result.selected)
      .map((result) => {
        const source = result.source;
        const provider = source.provider || 'file';
        return {
          ...result.selected,
          source: {
            provider,
            sourceId: source.sourceId || source.spotifyId,
            sourceRef: source.sourceRef || source.spotifyUri || '',
            sourceAlbum: source.album || '',
            importedTitle: source.title,
            importedArtist: source.artist
          }
        };
      });

    if (!playlist || !selectedTracks.length) {
      set({ error: 'Select at least one matched track before importing.' });
      return;
    }

    usePlaylistStore.getState().createImportedPlaylist({
      name: playlist.name,
      description: playlist.description || `Imported from ${playlist.owner}`,
      color: GRADIENT_PRESETS[4],
      image: playlist.image,
      tracks: selectedTracks,
      source: {
        provider: playlist.source || 'file',
        sourceId: playlist.id,
        sourceRef: playlist.uri || playlist.externalUrl || '',
        importedAt: new Date().toISOString(),
        totalSourceTracks: results.length
      }
    });

    set({ step: 'done', importedCount: selectedTracks.length, error: '' });
  }
}));
