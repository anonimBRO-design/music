// Core constants for NONIMSONG

export const STORAGE_KEYS = {
  API: 'nonimid_apikey',
  LIKED: 'nonimid_liked',
  HISTORY: 'nonimid_history',
  QUEUE: 'nonimid_queue',
  PLAYLISTS: 'nonimid_playlists',
  VOLUME: 'nonimid_volume',
  LAST: 'nonimid_last',
  SETTINGS: 'nonimid_settings',
  STATS: 'nonimid_stats',
  PROFILE: 'nonimid_profile',
  MONTHLY: 'nonimid_monthly',
  SIDEBAR_COLLAPSED: 'nonimid_sidebar_collapsed',
  CROSSFADE: 'nonimid_crossfade',
  PLAYBACK_SPEED: 'nonimid_playback_speed',
  // New keys
  QUEUE_STATE: 'nonimid_queue_state',
  PLAYBACK_STATE: 'nonimid_playback_state',
  USER_PROFILE: 'nonimid_user_profile',
  LISTENING_PARTY: 'nonimid_listening_party',
  NOTIFICATIONS: 'nonimid_notifications',
  RECENTLY_PLAYED: 'nonimid_recently_played',
  FAVORITE_ARTISTS: 'nonimid_favorite_artists',
  FAVORITE_GENRES: 'nonimid_favorite_genres'
};

export const REPEAT_MODES = {
  OFF: 0,
  QUEUE: 1,
  ONE: 2
};

export const PLAYLIST_VISIBILITY = {
  PUBLIC: 'public',
  UNLISTED: 'unlisted',
  PRIVATE: 'private'
};

export const QUEUE_SECTIONS = {
  NOW_PLAYING: 'nowPlaying',
  NEXT_UP: 'nextUp',
  RECOMMENDED: 'recommended'
};

export const YOUTUBE_PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
};

export const DEFAULT_VOLUME = 80;
export const MAX_QUEUE_SIZE = 500;
export const MAX_HISTORY_SIZE = 100;
export const CROSSFADE_MAX_SECONDS = 12;

export const MOODS = [
  'Phonk', 'Night Drive', 'Chill Beats', 'Hip-Hop',
  'Lo-Fi', 'Dark Ambient', 'Electronic', 'Jazz', 'R&B', 'Indie'
];

export const DISCOVERY_GENRES = [
  'Indie Pop', 'Electronic', 'Jazz', 'R&B', 'Classical',
  'Synthwave', 'Dark Ambient', 'Acoustic'
];

export const REACTION_EMOJIS = ['❤️', '🔥', '🎵', '👏'];

export const PERSONALITY_BADGES = [
  { icon: '🚗', label: 'Night Driver' },
  { icon: '☕', label: 'Chill Listener' },
  { icon: '🔊', label: 'Phonk Addict' },
  { icon: '⚡', label: 'Electronic Explorer' }
];

export const API_ENDPOINTS = {
  SEARCH: '/api/search',
  VIDEO: '/api/video',
  USERS: '/api/users',
  PLAYLISTS: '/api/playlists',
  LISTENING_PARTY: '/api/listening-party',
  RECOMMENDATIONS: '/api/recommendations',
  AUTH: '/api/auth',
  ME: '/api/me'
};

export const WS_EVENTS = {
  PARTY_CREATE: 'party:create',
  PARTY_JOIN: 'party:join',
  PARTY_LEAVE: 'party:leave',
  PARTY_PLAY: 'party:play',
  PARTY_PAUSE: 'party:pause',
  PARTY_SEEK: 'party:seek',
  PARTY_QUEUE: 'party:queue',
  PARTY_CHAT: 'party:chat',
  PARTY_REACTION: 'party:reaction',
  PARTY_SYNC: 'party:sync'
};

export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  NEXT: 'ArrowRight',
  PREV: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  MUTE: 'm',
  SHUFFLE: 's',
  REPEAT: 'r',
  LIKE: 'l',
  QUEUE: 'q',
  FULLSCREEN: 'f',
  LYRICS: 'y',
  WRAPPED: 'w',
  SEARCH: '/'
};

// New constants for enhanced features
export const VOLUME_LEVELS = {
  MUTED: 0,
  LOW: 30,
  MEDIUM: 60,
  HIGH: 100
};

export const LISTENING_PARTY_ROLES = {
  HOST: 'host',
  PARTICIPANT: 'participant'
};

export const SYNC_TOLERANCE_MS = 500;
export const PROGRESS_UPDATE_INTERVAL = 100;
export const BUFFER_INDICATOR_THRESHOLD = 0.1;
export const MAX_RECOMMENDATIONS = 50;
export const RECENTLY_RECOMMENDED_TTL = 3600000; // 1 hour