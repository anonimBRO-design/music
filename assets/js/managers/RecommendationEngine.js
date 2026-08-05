// Recommendation Engine - Smart recommendations based on genre, artist, mood, history

import { eventBus } from '../core/events.js';
import { store } from '../core/store.js';
import { STORAGE_KEYS, DISCOVERY_GENRES, MOODS } from '../core/constants.js';
import { makeTrack, smartShuffle, sanitizeSearch } from '../core/utils.js';

class RecommendationEngine {
  constructor() {
    this.cache = new Map();
    this.lastFetch = 0;
    this.fetchCooldown = 5000; // 5 seconds between API calls
    this.recentlyRecommended = new Set(); // Track IDs recommended recently
    this.maxRecentSize = 100;
  }

  /**
   * Get recommendations for a seed track
   * @param {Object} seedTrack - Seed track
   * @param {Object} context - Context (playlist, album, search, radio)
   * @param {number} count - Number of recommendations
   * @returns {Promise<Array>} Recommended tracks
   */
  async getRecommendations(seedTrack, context = {}, count = 20) {
    const cacheKey = this.getCacheKey(seedTrack, context, count);

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 min cache
        return this.applyDiversity(cached.tracks, count);
      }
    }

    // Get user data for personalization
    const history = store.get(STORAGE_KEYS.HISTORY, []);
    const liked = store.get(STORAGE_KEYS.LIKED, []);
    const playlists = store.get(STORAGE_KEYS.PLAYLISTS, []);

    // Build recommendation strategy
    const strategies = this.buildStrategies(seedTrack, context, history, liked, playlists);

    // Execute strategies in parallel
    const allTracks = await this.executeStrategies(strategies, count * 2);

    // Apply diversity and filtering
    const filtered = this.applyDiversity(allTracks, count);

    // Cache results
    this.cache.set(cacheKey, {
      tracks: filtered,
      timestamp: Date.now()
    });

    return filtered;
  }

  /**
   * Build recommendation strategies based on context and user data
   */
  buildStrategies(seedTrack, context, history, liked, playlists) {
    const strategies = [];
    const seedArtist = seedTrack.artist?.toLowerCase() || '';
    const seedTitle = seedTrack.title?.toLowerCase() || '';

    // Extract keywords from seed track
    const seedKeywords = this.extractKeywords(seedTitle);

    // 1. Same artist (highest priority)
    if (seedArtist) {
      strategies.push({
        name: 'sameArtist',
        priority: 1,
        query: `${seedArtist} best songs`,
        weight: 1.0
      });
    }

    // 2. Similar artists (from user history)
    const similarArtists = this.findSimilarArtists(seedArtist, history, liked);
    similarArtists.slice(0, 3).forEach((artist, i) => {
      strategies.push({
        name: `similarArtist_${i}`,
        priority: 2,
        query: `${artist} similar music`,
        weight: 0.8 - i * 0.1
      });
    })

    // 3. Genre-based (from keywords)
    const genres = this.inferGenres(seedKeywords, history, liked);
    genres.slice(0, 3).forEach((genre, i) => {
      strategies.push({
        name: `genre_${i}`,
        priority: 3,
        query: `${genre} ${DISCOVERY_GENRES[Math.floor(Math.random() * DISCOVERY_GENRES.length)]}`,
        weight: 0.6 - i * 0.1
      });
    });

    // 4. Mood-based (if context is radio/discovery)
    if (context.type === 'radio' || context.type === 'discovery') {
      const moods = this.inferMoods(seedKeywords, history);
      moods.slice(0, 2).forEach((mood, i) => {
        strategies.push({
          name: `mood_${i}`,
          priority: 4,
          query: `${mood} music playlist`,
          weight: 0.5 - i * 0.1
        });
      });
    }

    // 5. Trending/popular in same genre
    strategies.push({
      name: 'trending',
      priority: 5,
      query: `trending ${genres[0] || 'music'} ${new Date().getFullYear()}`,
      weight: 0.4
    });

    // 6. Discovery - user's unexplored genres
    const unexploredGenres = this.getUnexploredGenres(history, liked);
    unexploredGenres.slice(0, 2).forEach((genre, i) => {
      strategies.push({
        name: `discovery_${i}`,
        priority: 6,
        query: `${genre} hidden gems`,
        weight: 0.3 - i * 0.05
      });
    });

    // 7. Collaborative filtering - "users who liked this also liked"
    if (context.playlistId) {
      strategies.push({
        name: 'collaborative',
        priority: 3,
        query: `playlist ${context.playlistId} similar tracks`,
        weight: 0.7
      });
    }

    return strategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Execute search strategies
   */
  async executeStrategies(strategies, maxTotal) {
    const results = [];

    // Execute in batches to avoid rate limiting
    const batchSize = 3;
    for (let i = 0; i < strategies.length; i += batchSize) {
      const batch = strategies.slice(i, i + batchSize);
      const promises = batch.map(strategy => this.searchStrategy(strategy, maxTotal));
      const batchResults = await Promise.allSettled(promises);

      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          results.push({
            strategy: batch[idx].name,
            weight: batch[idx].weight,
            tracks: result.value
          });
        }
      });

      // Small delay between batches
      if (i + batchSize < strategies.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    // Merge and weight results
    return this.mergeResults(results, maxTotal);
  }

  /**
   * Execute a single search strategy
   */
  async searchStrategy(strategy, limit) {
    // Rate limiting
    const now = Date.now();
    if (now - this.lastFetch < this.fetchCooldown) {
      await new Promise(r => setTimeout(r, this.fetchCooldown - (now - this.lastFetch)));
    }

    try {
      this.lastFetch = Date.now();
      const response = await fetch(`/api/search?q=${encodeURIComponent(strategy.query)}&maxResults=${limit}`);
      const data = await response.json();

      if (data.items) {
        return data.items.map(makeTrack).filter(t => !this.recentlyRecommended.has(t.id));
      }
    } catch (error) {
      console.warn(`Strategy "${strategy.name}" failed:`, error);
    }

    return [];
  }

  /**
   * Merge and weight results from multiple strategies
   */
  mergeResults(strategyResults, maxTotal) {
    const trackScores = new Map();

    strategyResults.forEach(({ tracks, weight }) => {
      tracks.forEach((track, index) => {
        const positionScore = 1 - (index / tracks.length) * 0.5;
        const score = weight * positionScore;

        if (!trackScores.has(track.id)) {
          trackScores.set(track.id, { track, score: 0 });
        }
        trackScores.get(track.id).score += score;
      });
    });

    // Sort by score
    const sorted = Array.from(trackScores.values())
      .sort((a, b) => b.score - a.score)
      .map(({ track }) => track);

    return sorted.slice(0, maxTotal);
  }

  /**
   * Apply diversity filtering (max 2 per artist, no recent repeats)
   */
  applyDiversity(tracks, count) {
    const artistCounts = new Map();
    const result = [];

    for (const track of tracks) {
      if (result.length >= count) break;

      const artist = (track.artist || 'Unknown').toLowerCase();
      const currentCount = artistCounts.get(artist) || 0;

      // Max 2 tracks per artist
      if (currentCount >= 2) continue;

      // Skip recently recommended
      if (this.recentlyRecommended.has(track.id)) continue;

      artistCounts.set(artist, currentCount + 1);
      result.push(track);
    }

    // Update recently recommended
    result.forEach(t => this.recentlyRecommended.add(t.id));
    if (this.recentlyRecommended.size > this.maxRecentSize) {
      const toRemove = Array.from(this.recentlyRecommended).slice(0, this.recentlyRecommended.size - this.maxRecentSize);
      toRemove.forEach(id => this.recentlyRecommended.delete(id));
    }

    return result;
  }

  /**
   * Get smart shuffle for a track list
   */
  getSmartShuffle(tracks) {
    return smartShuffle(tracks);
  }

  /**
   * Get radio-style infinite recommendations
   */
  async getRadio(seedTrack, history, liked, currentQueue = []) {
    const excludeIds = new Set([
      seedTrack.id,
      ...currentQueue.map(t => t.id),
      ...this.recentlyRecommended
    ]);

    const recommendations = await this.getRecommendations(seedTrack, { type: 'radio' }, 30);

    return recommendations.filter(t => !excludeIds.has(t.id));
  }

  /**
   * Extract keywords from track title
   */
  extractKeywords(title) {
    return title
      .replace(/\(.*?\)|\[.*?\]/g, '')
      .replace(/official|video|audio|lyrics|ft\.|feat\./gi, '')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .map(w => w.toLowerCase());
  }

  /**
   * Infer genres from keywords and history
   */
  inferGenres(keywords, history, liked) {
    const genreKeywords = {
      'phonk': ['phonk', 'drift', 'skrrr'],
      'synthwave': ['synthwave', 'retrowave', 'outrun', '80s'],
      'lofi': ['lofi', 'lo-fi', 'chill', 'study', 'beats'],
      'hiphop': ['hip hop', 'hip-hop', 'rap', 'trap', 'boom bap'],
      'electronic': ['electronic', 'edm', 'house', 'techno', 'trance'],
      'jazz': ['jazz', 'bebop', 'swing', 'fusion'],
      'rnb': ['r&b', 'rnb', 'soul', 'neo soul'],
      'indie': ['indie', 'alternative', 'dream pop', 'bedroom pop'],
      'rock': ['rock', 'metal', 'punk', 'grunge', 'alternative rock'],
      'pop': ['pop', 'k-pop', 'j-pop', 'dance pop'],
      'ambient': ['ambient', 'drone', 'atmospheric', 'dark ambient'],
      'classical': ['classical', 'orchestral', 'piano', 'violin']
    };

    const scores = {};
    const allText = [...history, ...liked].map(t =>
      (t.title + ' ' + t.artist).toLowerCase()
    ).join(' ');

    // Score from seed keywords
    keywords.forEach(kw => {
      Object.entries(genreKeywords).forEach(([genre, terms]) => {
        if (terms.some(t => kw.includes(t) || t.includes(kw))) {
          scores[genre] = (scores[genre] || 0) + 2;
        }
      });
    });

    // Score from history
    Object.entries(genreKeywords).forEach(([genre, terms]) => {
      terms.forEach(term => {
        const count = (allText.match(new RegExp(term, 'gi')) || []).length;
        if (count > 0) scores[genre] = (scores[genre] || 0) + count;
      });
    });

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);
  }

  /**
   * Infer moods from keywords and history
   */
  inferMoods(keywords, history) {
    const moodKeywords = {
      'chill': ['chill', 'relax', 'calm', 'peaceful', 'lofi', 'ambient'],
      'energetic': ['energetic', 'hype', 'workout', 'gym', 'running', 'fast'],
      'sad': ['sad', 'melancholic', 'depressing', 'emotional', 'heartbreak'],
      'happy': ['happy', 'upbeat', 'feel good', 'positive', 'joyful'],
      'dark': ['dark', 'moody', 'atmospheric', 'ominous', 'night'],
      'romantic': ['romantic', 'love', 'valentine', 'wedding', 'date'],
      'focus': ['focus', 'study', 'concentration', 'productivity', 'deep work'],
      'party': ['party', 'club', 'dance', 'festival', 'celebration']
    };

    const scores = {};
    const allText = history.map(t => (t.title + ' ' + t.artist).toLowerCase()).join(' ');

    [...keywords, ...allText.split(' ')].forEach(kw => {
      Object.entries(moodKeywords).forEach(([mood, terms]) => {
        if (terms.some(t => kw.includes(t))) {
          scores[mood] = (scores[mood] || 0) + 1;
        }
      });
    });

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([mood]) => mood);
  }

  /**
   * Find similar artists from user history
   */
  findSimilarArtists(seedArtist, history, liked) {
    const artistCooccurrence = new Map();

    [...history, ...liked].forEach(track => {
      const artist = (track.artist || '').toLowerCase();
      if (artist && artist !== seedArtist) {
        artistCooccurrence.set(artist, (artistCooccurrence.get(artist) || 0) + 1);
      }
    });

    return Array.from(artistCooccurrence.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([artist]) => artist);
  }

  /**
   * Get genres user hasn't explored much
   */
  getUnexploredGenres(history, liked) {
    const allGenres = new Set(DISCOVERY_GENRES);
    const listenedGenres = new Set();

    [...history, ...liked].forEach(track => {
      const genres = this.inferGenres(this.extractKeywords(track.title), [track], []);
      genres.forEach(g => listenedGenres.add(g));
    });

    return Array.from(allGenres).filter(g => !listenedGenres.has(g));
  }

  /**
   * Generate cache key
   */
  getCacheKey(seedTrack, context, count) {
    const contextStr = JSON.stringify(context);
    return `rec:${seedTrack.id}:${contextStr}:${count}`;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get recommendations for "Discover Weekly" style
   */
  async getDiscoverWeekly(history, liked, playlists) {
    // Mix of user's top genres + discovery
    const topGenres = this.inferGenres([], history, liked).slice(0, 5);
    const unexploredGenres = this.getUnexploredGenres(history, liked).slice(0, 3);

    const strategies = [
      ...topGenres.map((genre, i) => ({
        name: `topGenre_${i}`,
        query: `${genre} best new music`,
        weight: 0.8
      })),
      ...unexploredGenres.map((genre, i) => ({
        name: `explore_${i}`,
        query: `${genre} for beginners`,
        weight: 0.5
      }))
    ];

    const allTracks = await this.executeStrategies(strategies, 50);
    return this.applyDiversity(allTracks, 30);
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();