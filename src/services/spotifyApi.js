import { YouTubeAPI } from './youtubeApi';

const SESSION_KEYS = {
  accessToken: 'nonim_spotify_access_token',
  refreshToken: 'nonim_spotify_refresh_token',
  expiresAt: 'nonim_spotify_expires_at',
  verifier: 'nonim_spotify_pkce_verifier',
  state: 'nonim_spotify_oauth_state'
};

const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const SPOTIFY_SCOPES = ['playlist-read-private', 'playlist-read-collaborative'];
const DEFAULT_SPOTIFY_CLIENT_ID = 'e4ff5a0a2088495e9421caa1cc08a3eb';

const getSession = (key) => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(key);
};

const setSession = (key, value) => {
  if (typeof window === 'undefined') return;
  if (value === null || value === undefined) window.sessionStorage.removeItem(key);
  else window.sessionStorage.setItem(key, value);
};

export const getSpotifyConfig = () => ({
  clientId: String(import.meta.env.VITE_SPOTIFY_CLIENT_ID || DEFAULT_SPOTIFY_CLIENT_ID).trim(),
  redirectUri: String(import.meta.env.VITE_SPOTIFY_REDIRECT_URI || (typeof window !== 'undefined' ? `${window.location.origin}/` : '')).trim()
});

export const isSpotifyConfigured = () => Boolean(getSpotifyConfig().clientId);

const randomString = (length = 64) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const base64UrlEncode = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const createCodeChallenge = async (verifier) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
};

const storeTokens = (data) => {
  setSession(SESSION_KEYS.accessToken, data.access_token);
  setSession(SESSION_KEYS.refreshToken, data.refresh_token || getSession(SESSION_KEYS.refreshToken));
  setSession(SESSION_KEYS.expiresAt, String(Date.now() + Math.max(Number(data.expires_in || 3600) - 60, 60) * 1000));
};

const getStoredAccessToken = () => {
  const accessToken = getSession(SESSION_KEYS.accessToken);
  const expiresAt = Number(getSession(SESSION_KEYS.expiresAt) || 0);
  return accessToken && expiresAt > Date.now() ? accessToken : null;
};

export const hasSpotifySession = () => Boolean(
  getStoredAccessToken() || getSession(SESSION_KEYS.refreshToken)
);

export const clearSpotifySession = () => {
  Object.values(SESSION_KEYS).forEach((key) => setSession(key, null));
};

const requestToken = async (body) => {
  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.error || `Spotify token request failed (${response.status})`);
  }
  return data;
};

export const beginSpotifyAuth = async () => {
  const { clientId, redirectUri } = getSpotifyConfig();
  if (!clientId) {
    throw new Error('Spotify is not configured. Add VITE_SPOTIFY_CLIENT_ID first.');
  }
  if (!window.crypto?.subtle) {
    throw new Error('This browser cannot create a secure Spotify PKCE challenge.');
  }

  const verifier = randomString();
  const state = randomString(32);
  const challenge = await createCodeChallenge(verifier);
  setSession(SESSION_KEYS.verifier, verifier);
  setSession(SESSION_KEYS.state, state);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state
  });

  window.location.assign(`${SPOTIFY_ACCOUNTS_URL}/authorize?${params.toString()}`);
};

export const handleSpotifyCallback = async () => {
  if (typeof window === 'undefined') return { handled: false };
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const returnedState = params.get('state');
  const error = params.get('error');
  if (!code && !error) return { handled: false };

  const clearCallbackParams = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (error) {
    clearCallbackParams();
    return { handled: true, error: `Spotify authorization was cancelled (${error}).` };
  }

  const expectedState = getSession(SESSION_KEYS.state);
  const verifier = getSession(SESSION_KEYS.verifier);
  const { clientId, redirectUri } = getSpotifyConfig();
  if (!clientId || !verifier || !expectedState || returnedState !== expectedState) {
    clearCallbackParams();
    return { handled: true, error: 'Spotify authorization state could not be verified.' };
  }

  try {
    const data = await requestToken({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier
    });
    storeTokens(data);
    setSession(SESSION_KEYS.verifier, null);
    setSession(SESSION_KEYS.state, null);
    clearCallbackParams();
    return { handled: true, connected: true };
  } catch (callbackError) {
    clearCallbackParams();
    return { handled: true, error: callbackError.message || 'Spotify authorization failed.' };
  }
};

let refreshPromise = null;

const refreshAccessToken = async () => {
  const refreshToken = getSession(SESSION_KEYS.refreshToken);
  const { clientId } = getSpotifyConfig();
  if (!refreshToken || !clientId) return null;
  if (!refreshPromise) {
    refreshPromise = requestToken({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }).then((data) => {
      storeTokens(data);
      return data.access_token;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const getAccessToken = async () => getStoredAccessToken() || refreshAccessToken();

export const spotifyRequest = async (path, options = {}, retry = true) => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Connect Spotify before importing a playlist.');

  const response = await fetch(`${SPOTIFY_API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (response.status === 401 && retry && getSession(SESSION_KEYS.refreshToken)) {
    await refreshAccessToken();
    return spotifyRequest(path, options, false);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.error_description || `Spotify request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
};

export const parseSpotifyPlaylistId = (value = '') => {
  const input = value.trim();
  const match = input.match(/(?:open\.spotify\.com\/playlist\/|spotify:playlist:)([A-Za-z0-9]+)|^([A-Za-z0-9]{10,})$/i);
  return match?.[1] || match?.[2] || null;
};

export const getSpotifyPlaylist = async (playlistId) => {
  const data = await spotifyRequest(`/playlists/${encodeURIComponent(playlistId)}`);
  return {
    id: data.id,
    uri: data.uri,
    name: data.name || 'Imported Spotify Playlist',
    description: data.description || '',
    image: data.images?.[0]?.url || null,
    owner: data.owner?.display_name || data.owner?.id || 'Spotify',
    externalUrl: data.external_urls?.spotify || null
  };
};

export const getSpotifyPlaylistTracks = async (playlistId) => {
  const tracks = [];
  let offset = 0;
  let hasNext = true;

  while (hasNext) {
    const data = await spotifyRequest(`/playlists/${encodeURIComponent(playlistId)}/items?limit=100&offset=${offset}`);
    const page = data.items || data.tracks?.items || [];
    tracks.push(...page);
    offset += page.length;
    hasNext = Boolean(data.next) && page.length > 0;
  }

  return tracks.map((entry) => {
    const track = entry?.item || entry?.track || entry;
    if (!track || track.type !== 'track' || track.is_local || !track.id) return null;
    return {
      spotifyId: track.id,
      spotifyUri: track.uri,
      title: track.name || 'Unknown Title',
      artist: (track.artists || []).map((artist) => artist.name).filter(Boolean).join(', ') || 'Unknown Artist',
      album: track.album?.name || '',
      image: track.album?.images?.[0]?.url || null,
      duration: Math.round((track.duration_ms || 0) / 1000),
      addedAt: entry.added_at || new Date().toISOString()
    };
  }).filter(Boolean);
};

const normalizeForMatch = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\([^)]*(official|audio|video|lyrics?|remaster|version|live|edit)[^)]*\)/gi, ' ')
  .replace(/\[[^\]]*(official|audio|video|lyrics?|remaster|version|live|edit)[^\]]*\]/gi, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const tokenOverlap = (left, right) => {
  const leftTokens = new Set(normalizeForMatch(left).split(' ').filter(Boolean));
  const rightTokens = new Set(normalizeForMatch(right).split(' ').filter(Boolean));
  if (!leftTokens.size || !rightTokens.size) return 0;
  let matches = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) matches += 1;
  });
  return matches / Math.max(leftTokens.size, rightTokens.size);
};

export const scoreYouTubeCandidate = (source, candidate) => {
  const titleScore = tokenOverlap(source.title, candidate.title);
  const artistScore = tokenOverlap(source.artist, candidate.artist);
  const durationScore = source.duration > 0 && candidate.duration > 0
    ? Math.max(0, 1 - Math.abs(source.duration - candidate.duration) / Math.max(source.duration, candidate.duration))
    : 0.5;
  const noisyPenalty = /(karaoke|cover|reaction|nightcore|sped up|slowed|8d audio)/i.test(`${candidate.title} ${candidate.artist}`) ? 0.16 : 0;
  const score = Math.max(0, Math.min(1, titleScore * 0.58 + artistScore * 0.3 + durationScore * 0.12 - noisyPenalty));
  return Number(score.toFixed(3));
};

export const matchSpotifyTrack = async (source) => {
  const query = `${source.title} ${source.artist} official audio`;
  const response = await YouTubeAPI.search(query, 5);
  const candidates = (response.items || [])
    .map((candidate) => ({ ...candidate, matchScore: scoreYouTubeCandidate(source, candidate) }))
    .sort((left, right) => right.matchScore - left.matchScore);
  const top = candidates[0];
  const second = candidates[1];
  const gap = top && second ? top.matchScore - second.matchScore : 1;
  const status = !top
    ? 'unmatched'
    : top.matchScore >= 0.76 && (gap >= 0.08 || top.matchScore >= 0.9)
    ? 'matched'
    : top.matchScore >= 0.48
    ? 'ambiguous'
    : 'unmatched';

  return {
    source,
    query,
    candidates,
    selected: status === 'matched' ? top : null,
    status,
    error: response.error || null
  };
};

export const matchSpotifyTracks = async (tracks, onProgress, concurrency = 3) => {
  const results = new Array(tracks.length);
  let nextIndex = 0;
  let completed = 0;

  const worker = async () => {
    while (nextIndex < tracks.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await matchSpotifyTrack(tracks[index]);
      } catch (error) {
        results[index] = {
          source: tracks[index],
          query: `${tracks[index].title} ${tracks[index].artist} official audio`,
          candidates: [],
          selected: null,
          status: 'unmatched',
          error: error.message || 'YouTube matching failed.'
        };
      }
      completed += 1;
      onProgress?.(completed, tracks.length, results[index]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, tracks.length || 1) }, worker));
  return results;
};
