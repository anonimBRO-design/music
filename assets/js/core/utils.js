// Utility functions for NONIMSONG

/**
 * Format ISO 8601 duration to MM:SS or H:MM:SS
 * @param {string} iso - ISO duration (e.g., PT4M13S)
 * @returns {string} Formatted duration
 */
export function formatDuration(iso) {
  if (!iso) return '0:00';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Format seconds to MM:SS or H:MM:SS
 * @param {number} seconds - Seconds
 * @returns {string} Formatted duration
 */
export function formatSeconds(seconds) {
  seconds = Math.floor(seconds || 0);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Format milliseconds to MM:SS
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted duration
 */
export function formatMs(ms) {
  return formatSeconds(Math.floor(ms / 1000));
}

/**
 * Get YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string} Thumbnail URL
 */
export function getThumbnail(videoId, quality = 'mqdefault') {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Create track object from YouTube API item
 * @param {Object} item - YouTube search result item
 * @returns {Object} Track object
 */
export function makeTrack(item) {
  const snippet = item.snippet || item;
  const id = item.id?.videoId || item.id || item.videoId;
  return {
    id,
    title: snippet.title,
    artist: snippet.channelTitle,
    thumbnail: getThumbnail(id, 'mqdefault'),
    thumbnailHQ: getThumbnail(id, 'hqdefault'),
    thumbnailMax: getThumbnail(id, 'maxresdefault'),
    publishedAt: snippet.publishedAt,
    duration: snippet.duration || null,
    videoId: id
  };
}

/**
 * Escape HTML for safe insertion
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Shuffle array using Fisher-Yates
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array (new array)
 */
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Smart shuffle - avoids same artist consecutively
 * @param {Array} tracks - Array of track objects
 * @returns {Array} Shuffled array
 */
export function smartShuffle(tracks) {
  if (tracks.length <= 1) return [...tracks];

  // Group by artist
  const byArtist = new Map();
  tracks.forEach(track => {
    const artist = (track.artist || 'Unknown').toLowerCase();
    if (!byArtist.has(artist)) byArtist.set(artist, []);
    byArtist.get(artist).push(track);
  });

  // Shuffle each artist's tracks
  byArtist.forEach(list => shuffle(list));

  // Interleave artists
  const artists = Array.from(byArtist.keys());
  shuffle(artists);

  const result = [];
  const indices = new Map(artists.map(a => [a, 0]));
  let added = true;

  while (added) {
    added = false;
    for (const artist of artists) {
      const list = byArtist.get(artist);
      const idx = indices.get(artist);
      if (idx < list.length) {
        result.push(list[idx]);
        indices.set(artist, idx + 1);
        added = true;
      }
    }
  }

  return result;
}

/**
 * Generate random ID
 * @param {number} length - ID length
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Format number with commas
 * @param {number} num - Number
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date
 * @returns {string} Relative time
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

/**
 * Deep clone object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two tracks are the same
 * @param {Object} a - Track A
 * @param {Object} b - Track B
 * @returns {boolean}
 */
export function tracksEqual(a, b) {
  return a && b && a.id === b.id;
}

/**
 * Get initials from name
 * @param {string} name - Name
 * @returns {string} Initials (max 2 chars)
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get dominant color from image (async)
 * @param {string} imageUrl - Image URL
 * @returns {Promise<{r,g,b,hex}>} Dominant color
 */
export async function getDominantColor(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;

      const buckets = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        buckets[key] = (buckets[key] || 0) + 1;
      }

      const dominant = Object.entries(buckets)
        .sort((a, b) => b[1] - a[1])[0]?.[0]
        .split(',')
        .map(Number) || [29, 185, 84];

      const [r, g, b] = dominant;
      resolve({
        r, g, b,
        hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
      });
    };
    img.onerror = () => resolve({ r: 29, g: 185, b: 84, hex: '#1db954' });
    img.src = imageUrl;
  });
}

/**
 * Sanitize string for search
 * @param {string} str - String
 * @returns {string} Sanitized
 */
export function sanitizeSearch(str) {
  return str.replace(/[<>{}[\]\\]/g, '').trim().slice(0, 100);
}

/**
 * Parse LRC lyrics format
 * @param {string} lrcText - LRC text
 * @returns {Array<{time: number, text: string}>} Parsed lines
 */
export function parseLRC(lrcText) {
  const lines = [];
  const timeTagRe = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  lrcText.split('\n').forEach(rawLine => {
    const tags = [...rawLine.matchAll(timeTagRe)];
    if (!tags.length) return;
    const text = rawLine.replace(timeTagRe, '').trim();
    tags.forEach(tag => {
      const min = parseInt(tag[1], 10);
      const sec = parseInt(tag[2], 10);
      const ms = tag[3] ? parseInt(tag[3].padEnd(3, '0'), 10) : 0;
      const time = min * 60 + sec + ms / 1000;
      lines.push({ time, text: text || '' });
    });
  });

  lines.sort((a, b) => a.time - b.time);
  return lines.filter(l => l.text.length > 0 || lines.length === 1);
}

/**
 * Create element from HTML string
 * @param {string} html - HTML string
 * @returns {HTMLElement} Element
 */
export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

/**
 * Safe JSON parse
 * @param {string} str - JSON string
 * @param {*} fallback - Fallback value
 * @returns {*} Parsed or fallback
 */
export function safeParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}