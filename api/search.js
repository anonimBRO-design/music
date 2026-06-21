// api/search.js — Vercel Serverless Function
// Searches YouTube using youtubei.js (Innertube)
import { Innertube } from 'youtubei.js';

let youtube;

async function getInnertube() {
  if (!youtube) {
    youtube = await Innertube.create();
  }
  return youtube;
}

export default async function handler(req, res) {
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

  try {
    const yt = await getInnertube();
    const searchResults = await yt.search(query, { type: 'video' });
    
    // Map Innertube results to match YouTube Data API v3 'items' format expected by frontend
    const results = searchResults.videos || searchResults.results || [];
    const items = results
      .slice(0, max)
      .filter(video => video.id) // Defensive filter
      .map(video => ({
        id: { videoId: video.id },
        snippet: {
          title: video.title?.text || 'Untitled',
          channelTitle: video.author?.name || 'Unknown',
          publishedAt: video.published_time?.text || ''
        }
      }));
    
    console.log(`[api/search] Query: "${query}", Results mapped: ${items.length}`);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json({ items });

  } catch (err) {
    console.error('[api/search] Innertube error:', err);
    return res.status(500).json({ error: 'Failed to fetch from YouTube' });
  }
}
