import { create } from 'zustand';
import { usePlayerStore } from './usePlayerStore';

const LRC_CACHE = new Map();

function parseLRC(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];
  const lines = lrcText.split('\n');
  const parsed = [];

  for (const line of lines) {
    const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)$/);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = match[3].length === 2
        ? parseInt(match[3], 10) * 10
        : parseInt(match[3], 10);
      const time = min * 60 + sec + ms / 1000;
      const text = match[4].trim();
      if (text) {
        parsed.push({ time, text });
      }
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

function cleanTrackName(title) {
  if (!title) return '';
  return title
    .replace(/\s*[\(\[](official\s*(music\s*)?video|audio|lyric(s)?\s*video|mv|visualizer|hd|hq|4k|remastered|live|remix|cover|acoustic|edit|extended|short|ver(\.|sion)?|feat\.?[^)\]]*|ft\.?[^)\]]*|prod\.?[^)\]]*)[)\]]/gi, '')
    .replace(/\s*[\|\/\-]\s*(official\s*(music\s*)?video|audio|lyric(s)?\s*video|mv|visualizer)/gi, '')
    .replace(/\s*\|\s*.*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanArtistName(artist) {
  if (!artist) return '';
  return artist
    .replace(/\s*[-]\s*topic$/i, '')
    .replace(/vevo$/i, '')
    .replace(/\s*official$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export const useLyricsStore = create((set, get) => ({
  lyrics: [],
  plainLyrics: '',
  isLoading: false,
  error: null,
  isLyricsView: false,
  currentTrackId: null,

  toggleLyricsView: () => {
    set((s) => ({ isLyricsView: !s.isLyricsView }));
  },

  setLyricsView: (open) => {
    set({ isLyricsView: open });
  },

  fetchLyrics: async (track) => {
    if (!track?.id || !track?.title) {
      set({ lyrics: [], plainLyrics: '', isLoading: false, error: 'No track' });
      return;
    }

    // Already cached
    if (LRC_CACHE.has(track.id)) {
      const cached = LRC_CACHE.get(track.id);
      set({
        lyrics: cached.synced,
        plainLyrics: cached.plain,
        isLoading: false,
        error: null,
        currentTrackId: track.id
      });
      return;
    }

    set({ lyrics: [], plainLyrics: '', isLoading: true, error: null, currentTrackId: track.id });

    const trackName = cleanTrackName(track.title);
    const artistName = cleanArtistName(track.artist);

    try {
      // Try exact match first
      const params = new URLSearchParams({
        track_name: trackName,
        artist_name: artistName
      });

      const res = await fetch(`https://lrclib.net/api/get?${params}`, {
        headers: {
          'Lrclib-Client': 'NONIMSONG/2.5 (https://music-one-woad.vercel.app)'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const synced = parseLRC(data.syncedLyrics);
        const plain = data.plainLyrics || '';

        LRC_CACHE.set(track.id, { synced, plain });
        // Only update if this is still the current track
        if (get().currentTrackId === track.id) {
          set({
            lyrics: synced,
            plainLyrics: plain,
            isLoading: false,
            error: synced.length === 0 && !plain ? 'No lyrics found' : null
          });
        }
        return;
      }

      // Fallback: search endpoint
      const searchParams = new URLSearchParams({ q: `${trackName} ${artistName}` });
      const searchRes = await fetch(`https://lrclib.net/api/search?${searchParams}`, {
        headers: {
          'Lrclib-Client': 'NONIMSONG/2.5 (https://music-one-woad.vercel.app)'
        }
      });

      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          const best = results[0];
          const synced = parseLRC(best.syncedLyrics);
          const plain = best.plainLyrics || '';

          LRC_CACHE.set(track.id, { synced, plain });
          if (get().currentTrackId === track.id) {
            set({
              lyrics: synced,
              plainLyrics: plain,
              isLoading: false,
              error: synced.length === 0 && !plain ? 'No lyrics found' : null
            });
          }
          return;
        }
      }

      // No results
      LRC_CACHE.set(track.id, { synced: [], plain: '' });
      if (get().currentTrackId === track.id) {
        set({ lyrics: [], plainLyrics: '', isLoading: false, error: 'No lyrics found' });
      }
    } catch (err) {
      console.warn('[Lyrics] Fetch error:', err);
      if (get().currentTrackId === track.id) {
        set({ lyrics: [], plainLyrics: '', isLoading: false, error: 'Failed to load lyrics' });
      }
    }
  },

  clearLyrics: () => {
    set({ lyrics: [], plainLyrics: '', isLoading: false, error: null, currentTrackId: null });
  }
}));

// Auto-fetch lyrics when current track changes
let _prevTrackId = null;
usePlayerStore.subscribe((state) => {
  const trackId = state.currentTrack?.id;
  if (trackId && trackId !== _prevTrackId) {
    _prevTrackId = trackId;
    useLyricsStore.getState().fetchLyrics(state.currentTrack);
  }
});
