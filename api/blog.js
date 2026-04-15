/**
 * Vercel Serverless Function: /api/blog
 * POST and PUT endpoints for blog management
 */
import { promises as fs } from 'fs';

const DATA_FILE = '/tmp/kemet-data.json';

async function getDataFile() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { posts: [], messages: [] };
  }
}

async function saveDataFile(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 4), 'utf-8');
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Create new blog post
      const { title, excerpt, category, author, content, image, date } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const data = await getDataFile();
      if (!Array.isArray(data.posts)) data.posts = [];

      const newPost = {
        id: Date.now(),
        title,
        excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        category: category || 'Technology',
        author: author || 'Kemet Team',
        content,
        image: image || null,
        date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      data.posts.unshift(newPost);
      await saveDataFile(data);

      console.log('✅ Blog post created:', title);

      return res.status(200).json({
        success: true,
        message: 'Blog post created successfully!',
        post: newPost
      });

    } else if (req.method === 'PUT') {
      // Update blog post
      const id = parseInt(req.query.id);
      const { title, excerpt, category, author, content, image, date } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const data = await getDataFile();
      const postIndex = data.posts.findIndex(p => p.id === id);

      if (postIndex === -1) {
        return res.status(404).json({ error: 'Post not found' });
      }

      data.posts[postIndex].title = title;
      data.posts[postIndex].excerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
      data.posts[postIndex].category = category || data.posts[postIndex].category;
      data.posts[postIndex].author = author || data.posts[postIndex].author;
      data.posts[postIndex].content = content;
      if (image) data.posts[postIndex].image = image;
      data.posts[postIndex].date = date || data.posts[postIndex].date;

      await saveDataFile(data);

      console.log('✅ Blog post updated:', title);

      return res.status(200).json({
        success: true,
        message: 'Blog post updated successfully!',
        post: data.posts[postIndex]
      });

    } else if (req.method === 'DELETE') {
      // Delete blog post
      const id = parseInt(req.query.id);
      const data = await getDataFile();
      const postIndex = data.posts.findIndex(p => p.id === id);

      if (postIndex === -1) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const deletedPost = data.posts[postIndex];
      data.posts.splice(postIndex, 1);
      await saveDataFile(data);

      console.log('✅ Blog post deleted:', deletedPost.title);

      return res.status(200).json({
        success: true,
        message: 'Blog post deleted successfully!',
        postsRemaining: data.posts.length
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Blog error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    });
  }
}
