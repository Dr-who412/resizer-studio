import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleGenerateImage, handleEditImage } from './src/server/geminiHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// API routes for Gemini Image Generation and Editing
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const result = await handleGenerateImage(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Server error generating image:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

app.post('/api/gemini/edit-image', async (req, res) => {
  try {
    const result = await handleEditImage(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Server error editing image:', error);
    res.status(500).json({ error: error.message || 'Failed to edit image' });
  }
});

// Serve frontend static assets from dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
