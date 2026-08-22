import { tasteEngine } from './tasteEngine';
import { candidateGenerator } from './candidateGenerator';
import { candidateScorer } from './scorer';
import { diversityEngine } from './diversity';

export { tasteEngine } from './tasteEngine';
export { candidateGenerator } from './candidateGenerator';
export { candidateScorer } from './scorer';
export { diversityEngine } from './diversity';
export { recencyEngine } from './recency';

export const recommendationEngine = {
  /**
   * Log an event into the taste engine
   */
  async logEvent(track, action, extra = {}) {
    return tasteEngine.logInteraction(track, action, extra);
  },

  /**
   * Retrieve current user profile and affinities
   */
  async getProfile() {
    return tasteEngine.getProfile();
  },

  /**
   * Main pipeline to generate all personalized sections for the Home feed
   */
  async generateHomeFeed(initialSeeds = []) {
    const profile = await tasteEngine.getProfile();
    const candidatePools = await candidateGenerator.generateCandidatePools(profile, initialSeeds);

    // 1. Daily Mix 1 (Primary Artist / Primary Genre)
    const mix1Artist = profile.topArtists[0]?.displayName || 'Top Hits';
    const mix1Tracks = candidateScorer.rankCandidates(candidatePools.dailyMix1, profile, {
      weights: { artist: 0.4, genre: 0.3, track: 0.15, recency: 0.1, discovery: 0.05 },
      maxPerArtist: 2,
      limit: 16
    });

    // 2. Daily Mix 2 (Secondary Artist / Secondary Genre)
    const mix2Artist = profile.topArtists[1]?.displayName || profile.topGenres[0]?.displayName || 'Global Vibe';
    const mix2Tracks = candidateScorer.rankCandidates(candidatePools.dailyMix2, profile, {
      weights: { artist: 0.35, genre: 0.35, track: 0.15, recency: 0.1, discovery: 0.05 },
      maxPerArtist: 2,
      limit: 16
    });

    // 3. Daily Mix 3 (Time-slot preference / Acoustic / Night)
    const timeSlotName = profile.currentTimeSlot.charAt(0).toUpperCase() + profile.currentTimeSlot.slice(1);
    const mix3Title = profile.isColdStart ? 'Trending Essentials' : `${timeSlotName} Acoustic & Chill`;
    const mix3Tracks = candidateScorer.rankCandidates(candidatePools.dailyMix3, profile, {
      weights: { artist: 0.2, genre: 0.4, track: 0.1, recency: 0.2, discovery: 0.1 },
      maxPerArtist: 2,
      limit: 16
    });

    // 4. Discover Radar (Fresh unplayed recommendations)
    const discoverTracks = candidateScorer.rankCandidates(candidatePools.discover, profile, {
      weights: { artist: 0.2, genre: 0.3, track: 0.05, recency: 0.05, discovery: 0.4 },
      isDiscovery: true,
      maxPerArtist: 2,
      limit: 16
    });

    // 5. Jump Back In (High-affinity tracks from favorites/history)
    const jumpBackTracks = diversityEngine.filterEligibleTracks(candidatePools.jumpBack, profile.blockedTrackIds).slice(0, 12);

    return {
      profile,
      sections: {
        dailyMix1: {
          id: 'mix_1',
          title: `Daily Mix 1: ${mix1Artist}`,
          subtitle: `${mix1Artist} and similar acoustics`,
          tracks: mix1Tracks
        },
        dailyMix2: {
          id: 'mix_2',
          title: `Daily Mix 2: ${mix2Artist}`,
          subtitle: `Curated around ${mix2Artist}`,
          tracks: mix2Tracks
        },
        dailyMix3: {
          id: 'mix_3',
          title: `Daily Mix 3: ${mix3Title}`,
          subtitle: `Soundtrack for your ${profile.currentTimeSlot}`,
          tracks: mix3Tracks
        },
        discoverRadar: {
          id: 'discover_radar',
          title: '✨ Discover Radar',
          subtitle: 'Fresh releases tailored to your taste',
          tracks: discoverTracks
        },
        jumpBackIn: {
          id: 'jump_back',
          title: '🔥 Jump Back In',
          subtitle: 'Your frequent rotation',
          tracks: jumpBackTracks
        }
      }
    };
  }
};
