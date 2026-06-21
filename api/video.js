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
    
    // Defensive access to Innertube result
    const basicInfo = info.basic_info || {};
    
    // Map Innertube video info to match expected structure
    const item = {
      id: basicInfo.id || videoId,
      snippet: {
        title: basicInfo.title || 'Untitled',
        channelTitle: basicInfo.author || 'Unknown',
        publishedAt: basicInfo.upload_date || ''
      },
      contentDetails: {
        duration: basicInfo.duration ? `PT${basicInfo.duration}S` : ''
      }
    };
    
    console.log(`[api/video] ID: "${videoId}", Result mapped: "${item.snippet.title}"`);

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(item);

  } catch (err) {
    console.error(`[api/video] Innertube error for ID "${videoId}":`, err);
    return res.status(500).json({ error: 'Failed to fetch video details' });
  }
}
