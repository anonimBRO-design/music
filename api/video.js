// api/video.js — Vercel Serverless Function
// Fetches video details using youtubei.js (Innertube)
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

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !id.trim()) {
    return res.status(400).json({ error: 'Missing required parameter: id' });
  }

  const videoId = id.trim().slice(0, 64);

  try {
    const yt = await getInnertube();
    const info = await yt.getBasicInfo(videoId);
    
    // Map Innertube video info to match YouTube Data API v3 expected by frontend
    const item = {
      id: info.basic_info.id,
      snippet: {
        title: info.basic_info.title,
        channelTitle: info.basic_info.author,
        publishedAt: info.basic_info.upload_date
      },
      contentDetails: {
        duration: info.basic_info.duration ? `PT${info.basic_info.duration}S` : ''
      }
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(item);

  } catch (err) {
    console.error('[api/video] Innertube error:', err);
    return res.status(500).json({ error: 'Failed to fetch video details' });
  }
}
