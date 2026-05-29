export default async function handler(req, res) {
  try {
    const q = req.query.q;

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(q)}&key=${process.env.YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}