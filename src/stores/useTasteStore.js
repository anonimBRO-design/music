import { create } from 'zustand';
import { recommendationEngine } from '../services/recommendation';

export const useTasteStore = create((set, get) => ({
  profile: {
    isColdStart: true,
    totalInteractions: 0,
    topArtists: [],
    topGenres: [],
    currentTimeSlot: 'afternoon'
  },
  sections: {
    dailyMix1: { id: 'mix_1', title: 'Daily Mix 1', tracks: [] },
    dailyMix2: { id: 'mix_2', title: 'Daily Mix 2', tracks: [] },
    dailyMix3: { id: 'mix_3', title: 'Daily Mix 3', tracks: [] },
    discoverRadar: { id: 'discover_radar', title: 'Discover Radar', tracks: [] },
    jumpBackIn: { id: 'jump_back', title: 'Jump Back In', tracks: [] }
  },
  isLoading: false,
  lastFetchedAt: 0,

  /**
   * Load personalized recommendations
   */
  fetchRecommendations: async (initialSeeds = [], force = false) => {
    const { lastFetchedAt, isLoading } = get();
    // Cache for 2 minutes unless forced
    if (!force && !isLoading && Date.now() - lastFetchedAt < 120000 && get().sections.dailyMix1.tracks.length > 0) {
      return;
    }

    set({ isLoading: true });
    try {
      const feed = await recommendationEngine.generateHomeFeed(initialSeeds);
      set({
        profile: feed.profile,
        sections: feed.sections,
        isLoading: false,
        lastFetchedAt: Date.now()
      });
    } catch (err) {
      console.warn('[useTasteStore] Error generating recommendations:', err);
      set({ isLoading: false });
    }
  },

  /**
   * Record a behavioral interaction event in the taste engine
   */
  logTrackEvent: async (track, action, extra = {}) => {
    if (!track?.id) return;
    try {
      await recommendationEngine.logEvent(track, action, extra);
      // Silently refresh profile summary
      const profile = await recommendationEngine.getProfile();
      set({ profile });
    } catch (e) {
      console.warn('[useTasteStore] Error logging track event:', e);
    }
  }
}));
