import { recencyEngine } from './recency';
import { diversityEngine } from './diversity';

export const DEFAULT_WEIGHTS = {
  artist: 0.30,
  genre: 0.25,
  track: 0.20,
  recency: 0.15,
  discovery: 0.10
};

export const candidateScorer = {
  /**
   * Score a single track based on user taste profile
   */
  scoreTrack(track, profile, weights = DEFAULT_WEIGHTS, isDiscovery = false) {
    if (!track?.id) return -999;

    const artistKey = (track.artist || '').toLowerCase().trim();
    const genres = track.genres || [track.genre || 'Pop'];

    // 1. Artist Affinity Score (normalized 0..1)
    const artistRecord = profile.allArtistsMap?.get(artistKey);
    const artistRawScore = artistRecord?.score || 0;
    const artistScore = artistRawScore > 0 ? Math.min(1.0, artistRawScore / 15) : 0;

    // 2. Genre Affinity Score (normalized 0..1)
    let genreRawScore = 0;
    genres.forEach((g) => {
      const gRecord = profile.allGenresMap?.get(g.toLowerCase().trim());
      if (gRecord?.score) {
        genreRawScore += gRecord.score;
      }
    });
    const genreScore = genreRawScore > 0 ? Math.min(1.0, genreRawScore / 20) : 0;

    // 3. Track Affinity Score (normalized 0..1)
    const trackRecord = profile.allTracksMap?.get(track.id);
    const trackRawScore = trackRecord?.score || 0;
    const trackScore = trackRawScore > 0 ? Math.min(1.0, trackRawScore / 10) : 0;

    // 4. Recency & Time-of-day boost
    const recencyScore = recencyEngine.calculateRecencyScore(trackRecord?.lastUpdated);
    const timeBoost = profile.timeGenre && genres.some((g) => g.toLowerCase() === profile.timeGenre.toLowerCase()) ? 0.2 : 0;

    // 5. Discovery Bonus (bonus for unplayed tracks by similar artists/genres)
    const isUnplayed = !trackRecord || trackRecord.playCount === 0;
    const discoveryBonus = isDiscovery && isUnplayed ? 0.8 : isUnplayed ? 0.3 : 0;

    // 6. Skip / Dislike Penalties
    let penalties = 0;
    if (artistRecord?.skipCount > 2) {
      penalties += Math.min(0.5, (artistRecord.skipCount - 2) * 0.1);
    }
    if (trackRecord?.skipCount > 0) {
      penalties += Math.min(0.6, trackRecord.skipCount * 0.2);
    }

    // Weighted Combined Score
    const finalScore =
      artistScore * weights.artist +
      genreScore * weights.genre +
      trackScore * weights.track +
      (recencyScore + timeBoost) * weights.recency +
      discoveryBonus * weights.discovery -
      penalties;

    return finalScore;
  },

  /**
   * Filter, score, and rank candidates
   */
  rankCandidates(candidates = [], profile, options = {}) {
    const {
      weights = DEFAULT_WEIGHTS,
      isDiscovery = false,
      maxPerArtist = 2,
      limit = 20
    } = options;

    // Step 1: Hard filter
    const eligible = diversityEngine.filterEligibleTracks(candidates, profile.blockedTrackIds);

    // Step 2: Scoring
    const scored = eligible.map((track) => ({
      track,
      score: this.scoreTrack(track, profile, weights, isDiscovery)
    }));

    // Step 3: Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Step 4: Apply diversity capping
    return diversityEngine.diversify(scored, maxPerArtist, limit);
  }
};
