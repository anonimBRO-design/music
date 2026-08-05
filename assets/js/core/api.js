// API client for backend communication

import { API_ENDPOINTS } from './constants.js';

class APIClient {
  constructor() {
    this.baseURL = '';
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Make a request with caching and deduplication
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<any>}
   */
  async request(endpoint, options = {}, useCache = false) {
    const cacheKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || {})}`;

    // Check cache
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Deduplicate pending requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const url = `${this.baseURL}${endpoint}`;
    const fetchOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const promise = fetch(url, fetchOptions)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new APIError(response.status, data.error || data.message || 'Request failed');
        }
        return data;
      })
      .finally(() => {
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      if (useCache) {
        this.cache.set(cacheKey, result);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint, params = {}, useCache = false) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' }, useCache);
  }

  /**
   * POST request
   */
  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * PUT request
   */
  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Invalidate cache for a specific endpoint
   */
  invalidateCache(endpoint) {
    for (const key of this.cache.keys()) {
      if (key.includes(endpoint)) {
        this.cache.delete(key);
      }
    }
  }
}

export class APIError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// Singleton instance
export const api = new APIClient();

// Specific API methods
export const API = {
  // Search
  search: (query, maxResults = 20) =>
    api.get(API_ENDPOINTS.SEARCH, { q: query, maxResults }),

  // Video details
  getVideo: (videoId) =>
    api.get(API_ENDPOINTS.VIDEO, { id: videoId }),

  // Users
  getUser: (username) =>
    api.get(`${API_ENDPOINTS.USERS}/${username}`),

  getUserPlaylists: (username) =>
    api.get(`${API_ENDPOINTS.USERS}/${username}/playlists`),

  // Playlists
  getPlaylists: () =>
    api.get(API_ENDPOINTS.PLAYLISTS),

  createPlaylist: (data) =>
    api.post(API_ENDPOINTS.PLAYLISTS, data),

  updatePlaylist: (id, data) =>
    api.put(`${API_ENDPOINTS.PLAYLISTS}/${id}`, data),

  deletePlaylist: (id) =>
    api.delete(`${API_ENDPOINTS.PLAYLISTS}/${id}`),

  addTrackToPlaylist: (playlistId, track) =>
    api.post(`${API_ENDPOINTS.PLAYLISTS}/${playlistId}/tracks`, track),

  removeTrackFromPlaylist: (playlistId, trackId) =>
    api.delete(`${API_ENDPOINTS.PLAYLISTS}/${playlistId}/tracks/${trackId}`),

  // Listening Party
  createListeningParty: (data) =>
    api.post(API_ENDPOINTS.LISTENING_PARTY, data),

  getListeningParty: (code) =>
    api.get(`${API_ENDPOINTS.LISTENING_PARTY}/${code}`),

  // Recommendations
  getRecommendations: (seed, context = {}, count = 20) =>
    api.get(API_ENDPOINTS.RECOMMENDATIONS, { seed, ...context, count }),

  // Auth
  register: (data) =>
    api.post(`${API_ENDPOINTS.AUTH}/register`, data),

  login: (data) =>
    api.post(`${API_ENDPOINTS.AUTH}/login`, data),

  // Current user
  getMe: () =>
    api.get(API_ENDPOINTS.ME),

  updateMe: (data) =>
    api.put(API_ENDPOINTS.ME, data)
};