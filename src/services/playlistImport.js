const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const basename = (value) => {
  const name = decodeURIComponent(String(value || '').split(/[\\/]/).pop() || 'Imported Playlist');
  return name.replace(/\.(m3u8?|csv|json)$/i, '') || 'Imported Playlist';
};

const parseDuration = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 10000 ? Math.round(value / 1000) : Math.round(value);
  }
  const raw = cleanText(value);
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Number(raw) > 10000 ? Math.round(Number(raw) / 1000) : Number(raw);
  const parts = raw.split(':').map((part) => Number(part) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

const splitArtistTitle = (value) => {
  const text = cleanText(value);
  const separator = text.indexOf(' - ');
  if (separator > 0) {
    return {
      artist: cleanText(text.slice(0, separator)),
      title: cleanText(text.slice(separator + 3))
    };
  }
  return { artist: 'Unknown Artist', title: text || 'Unknown Title' };
};

const toSourceTrack = (entry, index, fallbackTitle = '') => {
  const item = entry?.track || entry?.item || entry || {};
  const artists = Array.isArray(item.artists)
    ? item.artists.map((artist) => typeof artist === 'string' ? artist : artist?.name).filter(Boolean).join(', ')
    : item.artist || item.artists;
  const rawTitle = item.title || item.name || item.trackName || item.song || fallbackTitle;
  const split = splitArtistTitle(rawTitle);
  const title = cleanText(item.title || item.name || item.trackName || item.song || split.title);
  const artist = cleanText(artists || item.performer || split.artist);
  if (!title || title === 'Unknown Title') return null;

  return {
    sourceId: String(item.id || item.uri || item.url || `imported_${index}`),
    provider: 'file',
    title,
    artist: artist || 'Unknown Artist',
    album: cleanText(item.album?.name || item.album || item.release || ''),
    image: item.image || item.thumbnail || item.album?.images?.[0]?.url || null,
    duration: parseDuration(item.duration ?? item.duration_ms ?? item.length),
    sourceRef: item.url || item.uri || item.path || item.location || '',
    addedAt: item.added_at || item.addedAt || new Date().toISOString()
  };
};

const parseM3u = (text) => {
  const lines = text.replace(/\r/g, '').split('\n').map((line) => line.trim());
  const tracks = [];
  let pendingInfo = null;

  lines.forEach((line, index) => {
    if (!line) return;
    if (line.toUpperCase().startsWith('#EXTINF:')) {
      const match = line.match(/^#EXTINF:([^,]*),(.*)$/i);
      pendingInfo = {
        duration: parseDuration(match?.[1]),
        label: cleanText(match?.[2])
      };
      return;
    }
    if (line.startsWith('#')) return;

    const split = splitArtistTitle(pendingInfo?.label || basename(line));
    const track = toSourceTrack({
      title: split.title,
      artist: split.artist,
      duration: pendingInfo?.duration,
      url: line
    }, index);
    if (track) tracks.push(track);
    pendingInfo = null;
  });

  return tracks;
};

const parseCsvRows = (text) => {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => cleanText(value))) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => cleanText(value))) rows.push(row);
  return rows;
};

const normalizeHeader = (value) => cleanText(value).toLowerCase().replace(/[^a-z0-9]/g, '');

const findColumn = (headers, aliases) => aliases.reduce((found, alias) => {
  if (found !== -1) return found;
  return headers.indexOf(alias);
}, -1);

const parseCsv = (text) => {
  const rows = parseCsvRows(text);
  if (!rows.length) return [];
  const firstRow = rows[0].map(normalizeHeader);
  const titleColumn = findColumn(firstRow, ['title', 'name', 'track', 'trackname', 'song', 'songtitle']);
  const artistColumn = findColumn(firstRow, ['artist', 'artists', 'performer', 'author']);
  const hasHeader = titleColumn !== -1 || artistColumn !== -1;
  const headers = hasHeader ? firstRow : [];
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const getValue = (row, aliases, fallbackIndex) => {
    if (!hasHeader) return row[fallbackIndex];
    const column = findColumn(headers, aliases);
    return column === -1 ? '' : row[column];
  };

  return dataRows.map((row, index) => toSourceTrack({
    title: getValue(row, ['title', 'name', 'track', 'trackname', 'song', 'songtitle'], 0),
    artist: getValue(row, ['artist', 'artists', 'performer', 'author'], 1),
    album: getValue(row, ['album', 'release'], 2),
    duration: getValue(row, ['duration', 'durationms', 'length'], 3),
    url: getValue(row, ['url', 'uri', 'source', 'location', 'file', 'filename'], 4),
    image: getValue(row, ['image', 'thumbnail', 'cover'], 5)
  }, index)).filter(Boolean);
};

const findJsonTracks = (data) => {
  if (Array.isArray(data)) return { tracks: data, name: '' };
  if (!data || typeof data !== 'object') return { tracks: [], name: '' };
  if (Array.isArray(data.tracks)) return { tracks: data.tracks, name: data.name || data.title || '' };
  if (Array.isArray(data.items)) return { tracks: data.items, name: data.name || data.title || '' };
  if (Array.isArray(data.playlist?.tracks)) return { tracks: data.playlist.tracks, name: data.playlist.name || '' };
  if (Array.isArray(data.data?.tracks)) return { tracks: data.data.tracks, name: data.data.name || '' };
  return { tracks: [], name: '' };
};

const parseJson = (text) => {
  const data = JSON.parse(text);
  const payload = findJsonTracks(data);
  return {
    name: payload.name,
    tracks: payload.tracks.map((entry, index) => toSourceTrack(entry, index)).filter(Boolean)
  };
};

export const parsePlaylistText = (text, sourceName = 'Imported Playlist') => {
  const content = String(text || '').replace(/^\uFEFF/, '').trim();
  if (!content) throw new Error('The playlist file is empty.');

  const lowerName = sourceName.toLowerCase();
  if (lowerName.endsWith('.json') || /^[\[{]/.test(content)) {
    const parsed = parseJson(content);
    return {
      name: parsed.name || basename(sourceName),
      tracks: parsed.tracks
    };
  }
  if (lowerName.endsWith('.m3u') || lowerName.endsWith('.m3u8') || /^#EXTM3U|#EXTINF:/i.test(content)) {
    return { name: basename(sourceName), tracks: parseM3u(content) };
  }
  return { name: basename(sourceName), tracks: parseCsv(content) };
};

export const parsePlaylistFile = async (file) => {
  const parsed = parsePlaylistText(await file.text(), file.name);
  return {
    id: `file_${Date.now()}`,
    uri: '',
    name: parsed.name,
    description: `Imported from ${file.name}`,
    image: null,
    owner: 'Local file',
    externalUrl: null,
    source: 'file',
    tracks: parsed.tracks
  };
};

export const parsePlaylistUrl = async (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Enter a valid http(s) playlist file URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http(s) playlist file URLs are supported.');
  }

  const response = await fetch(url.href, { headers: { Accept: 'text/plain, text/csv, application/json, audio/x-mpegurl' } });
  if (!response.ok) throw new Error(`Playlist URL returned HTTP ${response.status}.`);
  const text = await response.text();
  if (/^\s*<(?:!doctype\s+html|html)\b/i.test(text)) {
    throw new Error('This URL is a web page, not a raw M3U, CSV, or JSON playlist file.');
  }
  const parsed = parsePlaylistText(text, basename(url.pathname) || 'Remote Playlist');
  return {
    id: `url_${Date.now()}`,
    uri: url.href,
    name: parsed.name,
    description: `Imported from ${url.href}`,
    image: null,
    owner: 'Remote file',
    externalUrl: url.href,
    source: 'url',
    tracks: parsed.tracks
  };
};
