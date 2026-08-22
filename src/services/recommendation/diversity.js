export const diversityEngine = {
  /**
   * Filter out hour-long loops, compilations, blocked tracks, and exact duplicates
   */
  filterEligibleTracks(tracks = [], blockedTrackIds = new Set()) {
    const seenIds = new Set();
    const seenFingerprints = new Set();

    return (tracks || []).filter((track) => {
      if (!track?.id) return false;
      if (seenIds.has(track.id)) return false;
      if (blockedTrackIds.has(track.id)) return false;

      // Filter out long compilation video loops
      if (track.duration > 900) return false; // > 15 minutes

      const title = (track.title || '').toLowerCase();
      if (
        title.includes('1 hour') ||
        title.includes('2 hours') ||
        title.includes('3 hours') ||
        title.includes('10 hours') ||
        title.includes('full album') ||
        title.includes('mix 202') ||
        title.includes('compilation') ||
        title.includes('playlist 202')
      ) {
        return false;
      }

      // Title-artist fingerprint deduplication
      const fingerprint = `${(track.title || '').slice(0, 18).toLowerCase()}_${(track.artist || '').toLowerCase()}`;
      if (seenFingerprints.has(fingerprint)) return false;

      seenIds.add(track.id);
      seenFingerprints.add(fingerprint);
      return true;
    });
  },

  /**
   * Apply maximum artist capping (max 2 songs per artist) and interleave
   */
  diversify(rankedCandidates = [], maxPerArtist = 2, targetLimit = 20) {
    const artistCounts = {};
    const diversified = [];
    const overflow = [];

    for (const item of rankedCandidates) {
      const track = item.track || item;
      const artist = (track.artist || 'Unknown').toLowerCase().trim();
      const count = artistCounts[artist] || 0;

      if (count < maxPerArtist) {
        artistCounts[artist] = count + 1;
        diversified.push(track);
      } else {
        overflow.push(track);
      }

      if (diversified.length >= targetLimit) break;
    }

    // If we need more items to reach targetLimit, backfill from overflow
    if (diversified.length < targetLimit && overflow.length > 0) {
      for (const track of overflow) {
        diversified.push(track);
        if (diversified.length >= targetLimit) break;
      }
    }

    return diversified;
  }
};
