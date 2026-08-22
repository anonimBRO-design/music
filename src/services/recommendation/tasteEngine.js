import { recommendationStorage } from '../../utils/recommendationStorage';

export const ACTION_WEIGHTS = {
  LIKE: 5,
  UNLIKE: -5,
  ADD_PLAYLIST: 4,
  PLAY_FINISH: 3,
  REPEAT: 2,
  NORMAL_PLAY: 1,
  SKIP: -3,
  DISLIKE: -8
};

export function getCurrentTimeSlot(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export const tasteEngine = {
  /**
   * Log an interaction event and update affinity scores in IndexedDB
   */
  async logInteraction(track, action, extra = {}) {
    if (!track?.id) return;

    const actionWeight = ACTION_WEIGHTS[action] ?? 0;
    const timeSlot = extra.timeSlot || getCurrentTimeSlot();
    const timestamp = Date.now();
    const artistKey = (track.artist || 'Unknown').toLowerCase().trim();
    const genres = track.genres && track.genres.length > 0 ? track.genres : [track.genre || 'Pop'];

    // 1. Persist raw interaction
    const interactionRecord = {
      trackId: track.id,
      title: track.title || '',
      artist: track.artist || '',
      genre: track.genre || 'Pop',
      genres,
      tags: track.tags || [],
      action,
      weight: actionWeight,
      playedRatio: extra.playedRatio || 0,
      playedSeconds: extra.playedSeconds || 0,
      timeSlot,
      timestamp
    };

    try {
      await recommendationStorage.saveInteraction(interactionRecord);
    } catch (e) {
      console.warn('[TasteEngine] Error saving interaction:', e);
    }

    // 2. Update Artist Affinity
    try {
      const existingArtist = (await recommendationStorage.getArtistAffinity(artistKey)) || {
        artist: artistKey,
        displayName: track.artist,
        score: 0,
        playCount: 0,
        skipCount: 0,
        likeCount: 0
      };

      const newArtistScore = (existingArtist.score || 0) + actionWeight;
      const playInc = ['NORMAL_PLAY', 'PLAY_FINISH'].includes(action) ? 1 : 0;
      const skipInc = action === 'SKIP' ? 1 : 0;
      const likeInc = action === 'LIKE' ? 1 : action === 'UNLIKE' ? -1 : 0;

      await recommendationStorage.saveArtistAffinity({
        ...existingArtist,
        displayName: track.artist || existingArtist.displayName,
        score: newArtistScore,
        playCount: (existingArtist.playCount || 0) + playInc,
        skipCount: (existingArtist.skipCount || 0) + skipInc,
        likeCount: Math.max(0, (existingArtist.likeCount || 0) + likeInc)
      });
    } catch (e) {
      console.warn('[TasteEngine] Error updating artist affinity:', e);
    }

    // 3. Update Genre Affinity
    for (const g of genres) {
      const gKey = g.toLowerCase().trim();
      try {
        const existingGenre = (await recommendationStorage.getGenreAffinity(gKey)) || {
          genre: gKey,
          displayName: g,
          score: 0,
          playCount: 0,
          skipCount: 0
        };

        const playInc = ['NORMAL_PLAY', 'PLAY_FINISH'].includes(action) ? 1 : 0;
        const skipInc = action === 'SKIP' ? 1 : 0;

        await recommendationStorage.saveGenreAffinity({
          ...existingGenre,
          displayName: g,
          score: (existingGenre.score || 0) + actionWeight,
          playCount: (existingGenre.playCount || 0) + playInc,
          skipCount: (existingGenre.skipCount || 0) + skipInc
        });
      } catch (e) {
        console.warn('[TasteEngine] Error updating genre affinity:', e);
      }
    }

    // 4. Update Track Affinity
    try {
      const existingTrack = (await recommendationStorage.getTrackAffinity(track.id)) || {
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        score: 0,
        playCount: 0,
        skipCount: 0,
        isLiked: false
      };

      const newTrackScore = (existingTrack.score || 0) + actionWeight;
      const playInc = ['NORMAL_PLAY', 'PLAY_FINISH'].includes(action) ? 1 : 0;
      const skipInc = action === 'SKIP' ? 1 : 0;
      const isLiked = action === 'LIKE' ? true : action === 'UNLIKE' ? false : existingTrack.isLiked;

      await recommendationStorage.saveTrackAffinity({
        ...existingTrack,
        title: track.title || existingTrack.title,
        artist: track.artist || existingTrack.artist,
        genre: track.genre || existingTrack.genre,
        thumbnail: track.thumbnail || existingTrack.thumbnail,
        score: newTrackScore,
        playCount: (existingTrack.playCount || 0) + playInc,
        skipCount: (existingTrack.skipCount || 0) + skipInc,
        isLiked
      });
    } catch (e) {
      console.warn('[TasteEngine] Error updating track affinity:', e);
    }

    // 5. Update Time Context
    try {
      const existingTime = (await recommendationStorage.getTimeContext(timeSlot)) || {
        timeSlot,
        totalPlays: 0,
        artistCounts: {},
        genreCounts: {}
      };

      const artistCounts = { ...(existingTime.artistCounts || {}) };
      const genreCounts = { ...(existingTime.genreCounts || {}) };

      if (['NORMAL_PLAY', 'PLAY_FINISH', 'LIKE'].includes(action)) {
        artistCounts[artistKey] = (artistCounts[artistKey] || 0) + 1;
        genres.forEach((g) => {
          const gKey = g.toLowerCase().trim();
          genreCounts[gKey] = (genreCounts[gKey] || 0) + 1;
        });
      }

      await recommendationStorage.saveTimeContext({
        timeSlot,
        totalPlays: (existingTime.totalPlays || 0) + 1,
        artistCounts,
        genreCounts
      });
    } catch (e) {
      console.warn('[TasteEngine] Error updating time context:', e);
    }
  },

  /**
   * Get user taste profile summarizing affinities, top artists, top genres, and timeSlot preferences
   */
  async getProfile() {
    const totalInteractions = (await recommendationStorage.countInteractions()) || 0;
    const allArtists = (await recommendationStorage.getAllArtistAffinities()) || [];
    const allGenres = (await recommendationStorage.getAllGenreAffinities()) || [];
    const allTracks = (await recommendationStorage.getAllTrackAffinities()) || [];
    const currentTimeSlot = getCurrentTimeSlot();
    const timeContext = await recommendationStorage.getTimeContext(currentTimeSlot);

    // Sort Top Artists (Score > 0)
    const topArtists = allArtists
      .filter((a) => (a.score || 0) > 0 && a.artist !== 'unknown')
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // Sort Top Genres (Score > 0)
    const topGenres = allGenres
      .filter((g) => (g.score || 0) > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Blocked track IDs (e.g. Disliked, score <= -5)
    const blockedTrackIds = new Set(
      allTracks.filter((t) => (t.score || 0) <= -5).map((t) => t.trackId)
    );

    // High affinity favorite tracks (score >= 5 or isLiked)
    const favoriteTracks = allTracks
      .filter((t) => (t.score || 0) >= 4 || t.isLiked)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    // Time-slot specific top genre
    let timeGenre = null;
    if (timeContext?.genreCounts) {
      const sortedTimeGenres = Object.entries(timeContext.genreCounts).sort((a, b) => b[1] - a[1]);
      if (sortedTimeGenres.length > 0 && sortedTimeGenres[0][1] > 0) {
        timeGenre = sortedTimeGenres[0][0];
      }
    }

    const isColdStart = totalInteractions < 4 && topArtists.length === 0;

    return {
      isColdStart,
      totalInteractions,
      topArtists,
      topGenres,
      favoriteTracks,
      currentTimeSlot,
      timeGenre,
      blockedTrackIds,
      allArtistsMap: new Map(allArtists.map((a) => [a.artist, a])),
      allGenresMap: new Map(allGenres.map((g) => [g.genre, g])),
      allTracksMap: new Map(allTracks.map((t) => [t.trackId, t]))
    };
  }
};
