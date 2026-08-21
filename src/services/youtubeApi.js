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

  const title = (raw.title || raw.snippet?.title || 'Unknown Title')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
    
  const artist = (raw.artist || raw.snippet?.channelTitle || raw.channelTitle || 'Unknown Artist')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

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
    else genre = 'Electronic';
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
