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

  let genre = raw.genre;
  if (!genre) {
    const t = title.toLowerCase();
    if (t.includes('phonk') || t.includes('drift')) genre = 'Phonk';
    else if (t.includes('synth') || t.includes('night') || t.includes('wave')) genre = 'Synthwave';
    else if (t.includes('lofi') || t.includes('chill') || t.includes('relax')) genre = 'Lo-Fi';
    else if (t.includes('hip') || t.includes('rap') || t.includes('trap')) genre = 'Hip-Hop';
    else if (t.includes('pop') || t.includes('indie')) genre = 'Indie Pop';
    else genre = 'Pop';
  }

  return {
    id,
    title,
    artist,
    thumbnail,
    thumbnailHQ,
    duration: raw.duration || 180,
    genre,
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
