import express from 'express';

const router = express.Router();

// Simple streamer login (no JWT for simplicity - just password check)
router.post('/login', (req, res) => {
  const { password } = req.body;
  const STREAMER_PASSWORD = process.env.STREAMER_PASSWORD || 'meddplays2024';

  if (password === STREAMER_PASSWORD) {
    res.json({ success: true, streamerId: 'meddplays', streamerName: 'MEDDplays' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

export default router;
