/**
 * Vercel Serverless Function: /api/blogs
 * POST endpoint for bulk blog and message data save
 */
import { promises as fs } from 'fs';

const DATA_FILE = '/tmp/kemet-data.json';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { posts, messages } = req.body;

    // Validate data structure
    if (!Array.isArray(posts)) {
      return res.status(400).json({ error: 'Posts must be an array' });
    }

    const data = {
      posts: Array.isArray(posts) ? posts : [],
      messages: Array.isArray(messages) ? messages : []
    };

    // Save to file
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    console.log(`✅ Saved ${posts.length} blog posts and ${messages.length} messages`);

    return res.status(200).json({
      success: true,
      message: 'Data saved successfully!',
      postsCount: posts.length,
      messagesCount: messages.length
    });

  } catch (error) {
    console.error('Blogs save error:', error);
    return res.status(500).json({
      error: 'Failed to save data',
      details: error.message
    });
  }
}
