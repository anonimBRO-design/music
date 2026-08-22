export function cleanMusicMeta(rawTitle, rawArtist) {
  let title = (rawTitle || 'Unknown Title')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

  let artist = (rawArtist || 'Unknown Artist')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/ - Topic$/i, '')
    .replace(/VEVO$/i, '')
    .trim();

  // If title has "Artist - Song Title" format, extract genuine artist
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    if (parts.length >= 2) {
      const possibleArtist = parts[0].trim();
      const possibleTitle = parts.slice(1).join(' - ').trim();
      if (
        artist.toLowerCase().includes('lirik') ||
        artist.toLowerCase().includes('lyrics') ||
        artist.toLowerCase().includes('music') ||
        artist.toLowerCase().includes('channel') ||
        artist.toLowerCase().includes('records') ||
        artist.toLowerCase().includes('indo') ||
        artist.toLowerCase().includes('sound')
      ) {
        artist = possibleArtist;
      }
      title = possibleTitle;
    }
  }

  // Clean clutter suffixes like (Official Music Video), [Lyric Video], etc.
  title = title
    .replace(/\s*[\(\[]\s*(official\s*(music\s*)?video|official\s*audio|official\s*lyric\s*video|lyric\s*video|audio|visualizer|clip\s*officiel|video\s*clip|mv|lyrics?)\s*[\)\]]/gi, '')
    .replace(/\s*\|\s*lirik\s*lagu.*$/gi, '')
    .replace(/\s*\|\s*terjemahan.*$/gi, '')
    .replace(/\s*\|\s*official.*$/gi, '')
    .trim();

  return { title, artist };
}

export function extractTrackTags(title = '', artist = '') {
  const combined = `${title} ${artist}`.toLowerCase();
  const tags = new Set();
  const genres = new Set();

  const genreMap = [
    { genre: 'Phonk', keywords: ['phonk', 'drift', 'brazilian phonk', 'kordhell'] },
    { genre: 'Synthwave', keywords: ['synthwave', 'retrowave', 'night drive', 'cyberpunk', 'synth'] },
    { genre: 'Lo-Fi', keywords: ['lofi', 'lo-fi', 'chillhop', 'study beats', 'chill vibes'] },
    { genre: 'Hip-Hop', keywords: ['hiphop', 'hip-hop', 'rap', 'trap', 'drill', 'boombap'] },
    { genre: 'R&B', keywords: ['rnb', 'r&b', 'soul', 'neo-soul'] },
    { genre: 'Indie', keywords: ['indie', 'alternative', 'alt-rock', 'bedroom pop'] },
    { genre: 'K-Pop', keywords: ['kpop', 'k-pop', 'bts', 'blackpink', 'twice', 'newjeans', 'aespa'] },
    { genre: 'Pop', keywords: ['pop', 'hits', 'billboard', 'viral'] },
    { genre: 'Acoustic', keywords: ['acoustic', 'guitar', 'unplugged', 'coffee', 'piano'] },
    { genre: 'EDM', keywords: ['edm', 'dance', 'house', 'techno', 'remix', 'electronic', 'club'] },
    { genre: 'Rock', keywords: ['rock', 'metal', 'punk', 'grunge'] },
    { genre: 'Anime', keywords: ['anime', 'ost', 'opening', 'ending', 'j-pop', 'jpop'] }
  ];

  genreMap.forEach(({ genre, keywords }) => {
    if (keywords.some((kw) => combined.includes(kw))) {
      genres.add(genre);
      tags.add(genre.toLowerCase());
    }
  });

  // Additional mood/vibe tags
  const moodMap = [
    { tag: 'chill', keywords: ['chill', 'relax', 'sleep', 'peaceful', 'ambient'] },
    { tag: 'energetic', keywords: ['upbeat', 'dance', 'workout', 'energy', 'party', 'hype'] },
    { tag: 'sad', keywords: ['sad', 'heartbreak', 'melancholy', 'cry', 'alone'] },
    { tag: 'focus', keywords: ['focus', 'study', 'work', 'instrumental', 'coding'] },
    { tag: 'retro', keywords: ['80s', '90s', 'retro', 'vintage', 'classic', 'oldies'] }
  ];

  moodMap.forEach(({ tag, keywords }) => {
    if (keywords.some((kw) => combined.includes(kw))) {
      tags.add(tag);
    }
  });

  if (genres.size === 0) genres.add('Pop');
  if (tags.size === 0) tags.add('pop');

  return {
    genres: Array.from(genres),
    tags: Array.from(tags),
    primaryGenre: Array.from(genres)[0] || 'Pop'
  };
}

export function makeTrack(raw) {
  if (!raw) return null;
  let id = '';
  if (typeof raw.id === 'string') {
    id = raw.id;
  } else if (raw.id && typeof raw.id.videoId === 'string') {
    id = raw.id.videoId;
  } else if (typeof raw.videoId === 'string') {
    id = raw.videoId;
  }

  id = String(id || '').trim();
  if (!id || id === '[object Object]') return null;

  const rawTitle = raw.title || raw.snippet?.title || 'Unknown Title';
  const rawArtist = raw.artist || raw.snippet?.channelTitle || raw.channelTitle || 'Unknown Artist';

  const { title, artist } = cleanMusicMeta(rawTitle, rawArtist);

  const thumbnail = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
  const thumbnailHQ = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const { genres, tags, primaryGenre } = extractTrackTags(title, artist);
  const genre = raw.genre || primaryGenre;

  const durationRaw = raw.duration || raw.snippet?.duration || 0;
  let duration = 0;
  if (typeof durationRaw === 'number' && !isNaN(durationRaw)) {
    duration = durationRaw;
  } else if (typeof durationRaw === 'string' && durationRaw.includes(':')) {
    const parts = durationRaw.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) duration = parts[0] * 60 + parts[1];
  }

  return {
    id,
    title,
    artist,
    thumbnail,
    thumbnailHQ,
    duration: duration || 0,
    genre,
    genres: raw.genres || genres,
    tags: raw.tags || tags,
    addedAt: raw.addedAt || new Date().toISOString()
  };
}

export const YouTubeAPI = {
  async search(query, maxResults = 20) {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
      if (!res.ok) throw new Error(`Search failed with HTTP ${res.status}`);
      const data = await res.json();
      return {
        items: (data.items || []).map(makeTrack).filter(Boolean)
      };
    } catch (err) {
      console.warn('YouTube search API error:', err);
      return { items: [], error: err.message };
    }
  },

  async getVideoDetails(videoId) {
    try {
      const res = await fetch(`/api/video?id=${videoId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('YouTube video details error:', err);
      return null;
    }
  }
};
