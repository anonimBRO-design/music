import { YouTubeAPI } from '../youtubeApi';

const COLD_START_SEEDS = [
  'Todays Top Hits Billboard global pop songs official',
  'Viral Hits 2026 trending music official',
  'Best Global Pop and R&B hits official',
  'Top Indo Pop Viral songs official'
];

export const candidateGenerator = {
  /**
   * Fetch candidate pools for recommendations based on user profile
   */
  async generateCandidatePools(profile, initialSeeds = []) {
    const { isColdStart, topArtists, topGenres, timeGenre } = profile;

    // 1. Cold Start Path
    if (isColdStart) {
      const coldResults = await Promise.allSettled(
        COLD_START_SEEDS.map((q) => YouTubeAPI.search(q, 16))
      );

      const allColdCandidates = [];
      coldResults.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.items) {
          allColdCandidates.push(...res.value.items);
        }
      });

      // Include initial liked/history items if any
      if (initialSeeds.length > 0) {
        allColdCandidates.unshift(...initialSeeds);
      }

      return {
        dailyMix1: allColdCandidates.slice(0, 30),
        dailyMix2: allColdCandidates.slice(30, 60),
        dailyMix3: allColdCandidates.slice(60, 90),
        discover: allColdCandidates.slice(10, 40),
        jumpBack: initialSeeds.slice(0, 12)
      };
    }

    // 2. Warm / Adaptive Profile Path
    const artist1 = topArtists[0]?.displayName || topArtists[0]?.artist || 'Pop';
    const artist2 = topArtists[1]?.displayName || topArtists[1]?.artist || null;
    const genre1 = topGenres[0]?.displayName || topGenres[0]?.genre || 'Pop';
    const genre2 = topGenres[1]?.displayName || topGenres[1]?.genre || 'Indie';
    const activeTimeGenre = timeGenre || genre1;

    // Multi-seed Queries
    const queries = {
      mix1: `${artist1} popular songs official audio`,
      mix1_related: `${artist1} and similar artists official`,
      mix2: artist2 ? `${artist2} popular songs official audio` : `${genre1} top hits official`,
      mix2_related: artist2 ? `${artist2} similar music official` : `${genre1} viral music`,
      mix3: `${activeTimeGenre} hits official audio`,
      discover1: `${genre1} new music 2026 official audio`,
      discover2: `${genre2} songs official audio`
    };

    const results = await Promise.allSettled([
      YouTubeAPI.search(queries.mix1, 16),
      YouTubeAPI.search(queries.mix1_related, 12),
      YouTubeAPI.search(queries.mix2, 16),
      YouTubeAPI.search(queries.mix2_related, 12),
      YouTubeAPI.search(queries.mix3, 16),
      YouTubeAPI.search(queries.discover1, 16),
      YouTubeAPI.search(queries.discover2, 16)
    ]);

    const getItems = (idx) => (results[idx]?.status === 'fulfilled' ? results[idx].value?.items || [] : []);

    const mix1Candidates = [...getItems(0), ...getItems(1)];
    const mix2Candidates = [...getItems(2), ...getItems(3)];
    const mix3Candidates = getItems(4);
    const discoverCandidates = [...getItems(5), ...getItems(6)];

    return {
      dailyMix1: mix1Candidates,
      dailyMix2: mix2Candidates,
      dailyMix3: mix3Candidates,
      discover: discoverCandidates,
      jumpBack: profile.favoriteTracks || []
    };
  }
};
