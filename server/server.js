const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());

app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q,
          maxResults: 10,
          type: "video",
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    console.log("YouTube API Error:");
    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "NONIMID backend"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NONIMID backend running on port ${PORT}`);
});