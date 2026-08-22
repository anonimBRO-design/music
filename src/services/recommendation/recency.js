export const recencyEngine = {
  /**
   * Calculate time decay multiplier (half-life of 7 days)
   */
  calculateRecencyScore(lastPlayedTimestamp) {
    if (!lastPlayedTimestamp) return 0.5; // neutral for unplayed candidates
    const ageInHours = (Date.now() - lastPlayedTimestamp) / (1000 * 60 * 60);
    // Exponential decay: e^(-age / 168 hours)
    return Math.max(0.1, Math.min(1.0, Math.exp(-ageInHours / 168)));
  },

  /**
   * Score track against current time-of-day listening habits
   */
  calculateTimeContextBoost(track, timeSlotData) {
    if (!timeSlotData || !track) return 0;
    const artistKey = (track.artist || '').toLowerCase().trim();
    const genres = track.genres || [track.genre || 'Pop'];

    let boost = 0;
    if (timeSlotData.artistCounts?.[artistKey]) {
      boost += 0.3;
    }

    genres.forEach((g) => {
      const gKey = g.toLowerCase().trim();
      if (timeSlotData.genreCounts?.[gKey]) {
        boost += 0.2;
      }
    });

    return Math.min(1.0, boost);
  }
};
