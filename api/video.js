// api/video.js — Vercel Serverless Function
// Fetches YouTube video details (snippet + contentDetails) by video ID.
// Mirrors the /api/search endpoint pattern so the frontend can call:
//   /api/video?id=VIDEO_ID

export default async function handler(req, res) {
  // CORS headers — allow requests from the same Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  const videoId = id.trim().slice(0, 64); // sanity-limit length

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('[api/video] YOUTUBE_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error: API key missing' });
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || 'YouTube API error';
      const errReason = data?.error?.errors?.[0]?.reason || '';

      if (response.status === 403 && errReason === 'quotaExceeded') {
        return res.status(429).json({ error: 'YouTube API quota exceeded. Try again later.' });
      }
      if (response.status === 400 || response.status === 403) {
        return res.status(403).json({ error: 'Invalid API key or request', detail: errMsg });
      }
      return res.status(response.status).json({ error: errMsg });
    }

    const item = data.items?.[0];
    if (!item) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Cache for 1 hour on CDN edge
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

    return res.status(200).json(item);

  } catch (err) {
    console.error('[api/video] fetch error:', err.message);
    return res.status(500).json({ error: 'Network error fetching video details' });
  }
}
