import { openDB } from 'idb';

const DB_NAME = 'nonimsong_recs_db';
const DB_VERSION = 1;

let dbPromise = null;

export function getRecsDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. Interactions log
        if (!db.objectStoreNames.contains('interactions')) {
          const store = db.createObjectStore('interactions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by_track', 'trackId');
          store.createIndex('by_artist', 'artist');
          store.createIndex('by_timestamp', 'timestamp');
        }

        // 2. Artist Affinity
        if (!db.objectStoreNames.contains('artist_affinity')) {
          const store = db.createObjectStore('artist_affinity', { keyPath: 'artist' });
          store.createIndex('by_score', 'score');
        }

        // 3. Genre Affinity
        if (!db.objectStoreNames.contains('genre_affinity')) {
          const store = db.createObjectStore('genre_affinity', { keyPath: 'genre' });
          store.createIndex('by_score', 'score');
        }

        // 4. Track Affinity
        if (!db.objectStoreNames.contains('track_affinity')) {
          const store = db.createObjectStore('track_affinity', { keyPath: 'trackId' });
          store.createIndex('by_score', 'score');
          store.createIndex('by_artist', 'artist');
        }

        // 5. Time Context Learning
        if (!db.objectStoreNames.contains('time_context')) {
          db.createObjectStore('time_context', { keyPath: 'timeSlot' });
        }

        // 6. Profile Metadata
        if (!db.objectStoreNames.contains('profile_meta')) {
          db.createObjectStore('profile_meta', { keyPath: 'key' });
        }
      }
    });
  }
  return dbPromise;
}

export const recommendationStorage = {
  // --- Interactions ---
  async saveInteraction(interaction) {
    const db = await getRecsDB();
    return db.add('interactions', {
      ...interaction,
      timestamp: interaction.timestamp || Date.now()
    });
  },

  async getInteractions(limit = 100) {
    const db = await getRecsDB();
    const tx = db.transaction('interactions', 'readonly');
    const index = tx.store.index('by_timestamp');
    const records = [];
    let cursor = await index.openCursor(null, 'prev');
    while (cursor && records.length < limit) {
      records.push(cursor.value);
      cursor = await cursor.continue();
    }
    return records;
  },

  async countInteractions() {
    const db = await getRecsDB();
    return db.count('interactions');
  },

  // --- Artist Affinity ---
  async getArtistAffinity(artist) {
    if (!artist) return null;
    const db = await getRecsDB();
    return db.get('artist_affinity', artist.toLowerCase().trim());
  },

  async saveArtistAffinity(data) {
    if (!data?.artist) return;
    const db = await getRecsDB();
    return db.put('artist_affinity', {
      ...data,
      artist: data.artist.toLowerCase().trim(),
      lastUpdated: Date.now()
    });
  },

  async getAllArtistAffinities() {
    const db = await getRecsDB();
    return db.getAll('artist_affinity');
  },

  // --- Genre Affinity ---
  async getGenreAffinity(genre) {
    if (!genre) return null;
    const db = await getRecsDB();
    return db.get('genre_affinity', genre.toLowerCase().trim());
  },

  async saveGenreAffinity(data) {
    if (!data?.genre) return;
    const db = await getRecsDB();
    return db.put('genre_affinity', {
      ...data,
      genre: data.genre.toLowerCase().trim(),
      lastUpdated: Date.now()
    });
  },

  async getAllGenreAffinities() {
    const db = await getRecsDB();
    return db.getAll('genre_affinity');
  },

  // --- Track Affinity ---
  async getTrackAffinity(trackId) {
    if (!trackId) return null;
    const db = await getRecsDB();
    return db.get('track_affinity', trackId);
  },

  async saveTrackAffinity(data) {
    if (!data?.trackId) return;
    const db = await getRecsDB();
    return db.put('track_affinity', {
      ...data,
      lastUpdated: Date.now()
    });
  },

  async getAllTrackAffinities() {
    const db = await getRecsDB();
    return db.getAll('track_affinity');
  },

  // --- Time Context ---
  async getTimeContext(timeSlot) {
    if (!timeSlot) return null;
    const db = await getRecsDB();
    return db.get('time_context', timeSlot);
  },

  async saveTimeContext(data) {
    if (!data?.timeSlot) return;
    const db = await getRecsDB();
    return db.put('time_context', {
      ...data,
      lastUpdated: Date.now()
    });
  },

  async getAllTimeContexts() {
    const db = await getRecsDB();
    return db.getAll('time_context');
  },

  // --- Profile Meta ---
  async getMeta(key, fallback = null) {
    const db = await getRecsDB();
    const item = await db.get('profile_meta', key);
    return item ? item.value : fallback;
  },

  async setMeta(key, value) {
    const db = await getRecsDB();
    return db.put('profile_meta', { key, value, lastUpdated: Date.now() });
  },

  // --- Clear / Reset ---
  async clearAll() {
    const db = await getRecsDB();
    const stores = ['interactions', 'artist_affinity', 'genre_affinity', 'track_affinity', 'time_context', 'profile_meta'];
    const tx = db.transaction(stores, 'readwrite');
    await Promise.all(stores.map((s) => tx.objectStore(s).clear()));
    await tx.done;
  }
};
