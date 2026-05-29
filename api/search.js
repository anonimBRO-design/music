// api/search.js — Vercel Serverless Function
// Proxies YouTube Data API v3 search requests, keeping the API key server-side.
// Frontend calls: /api/search?q=QUERY&maxResults=N

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, maxResults = '10' } = req.query;

  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Missing required parameter: q' });
  }

  const query = q.trim().slice(0, 200);
  const max = Math.min(Math.max(parseInt(maxResults, 10) || 10, 1), 50);

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('[api/search] YOUTUBE_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error: API key missing' });
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=${max}&q=${encodeURIComponent(query)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || 'YouTube API error';
      const errReason = data?.error?.errors?.[0]?.reason || '';

      console.error(`[api/search] YouTube error ${response.status}: ${errMsg} (${errReason})`);

      if (response.status === 403 && errReason === 'quotaExceeded') {
        return res.status(429).json({ error: 'YouTube API quota exceeded. Try again later.' });
      }
      if (response.status === 400 || response.status === 403) {
        return res.status(403).json({ error: 'Invalid API key or request', detail: errMsg });
      }
      return res.status(response.status).json({ error: errMsg });
    }

    // Cache search results for 10 minutes on CDN edge
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');

    return res.status(200).json({
      items: data.items || [],
      nextPageToken: data.nextPageToken,
      pageInfo: data.pageInfo,
    });

  } catch (err) {
    console.error('[api/search] fetch error:', err.message);
    return res.status(500).json({ error: 'Network error contacting YouTube API' });
  }
}
