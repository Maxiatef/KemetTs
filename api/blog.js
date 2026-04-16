/**
 * Vercel Serverless Function: /api/blog
 * POST, PUT, DELETE, and GET endpoints for blog management
 * Stores data in BOTH MongoDB and data.json (dual persistence)
 */
import { MongoClient, ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '..', 'data.json');

const MONGODB_URI = process.env.Kemet_MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

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

async function saveToMongoDB(post) {
  try {
    const client = await connectToDatabase();
    const db = client.db('kemet');
    const postsCollection = db.collection('posts');
    const result = await postsCollection.insertOne(post);
    return result.insertedId;
  } catch (err) {
    console.error('MongoDB save failed:', err.message);
    return null;
  }
}

async function updateInMongoDB(mongoId, updateData) {
  try {
    const client = await connectToDatabase();
    const db = client.db('kemet');
    const postsCollection = db.collection('posts');
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(mongoId) },
      { $set: updateData }
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.error('MongoDB update failed:', err.message);
    return false;
  }
}

async function deleteFromMongoDB(mongoId) {
  try {
    const client = await connectToDatabase();
    const db = client.db('kemet');
    const postsCollection = db.collection('posts');
    const result = await postsCollection.deleteOne({ _id: new ObjectId(mongoId) });
    return result.deletedCount > 0;
  } catch (err) {
    console.error('MongoDB delete failed:', err.message);
    return false;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Create new blog post
      const { title, excerpt, category, author, content, image } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const newPost = {
        id: Date.now(),
        title,
        excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        category: category || 'Technology',
        author: author || 'Kemet Team',
        content,
        image: image || null,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        timestamp: new Date().toISOString()
      };

      // Save to MongoDB FIRST
      let mongoId = null;
      try {
        const client = await connectToDatabase();
        const db = client.db('kemet');
        const postsCollection = db.collection('posts');
        const mongoPost = { ...newPost, createdAt: new Date(), updatedAt: new Date() };
        const result = await postsCollection.insertOne(mongoPost);
        mongoId = result.insertedId;
        console.log(`✅ Blog post created in MongoDB: ${title}`);
      } catch (err) {
        console.error('Error saving to MongoDB:', err.message);
      }

      // Also save to data.json for backup
      try {
        const data = await getDataFile();
        if (!Array.isArray(data.posts)) {
          data.posts = [];
        }
        data.posts.unshift(newPost);
        await saveDataFile(data);
        console.log(`✅ Blog post synced to data.json: ${title}`);
      } catch (err) {
        console.warn('Could not sync to data.json:', err.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Blog post created successfully!',
        post: newPost,
        mongoId: mongoId
      });

    } else if (req.method === 'GET') {
      // Get from MongoDB first, sync to data.json
      try {
        const client = await connectToDatabase();
        const db = client.db('kemet');
        const postsCollection = db.collection('posts');
        const posts = await postsCollection.find({}).sort({ createdAt: -1 }).toArray();

        // Also sync to data.json
        try {
          const data = await getDataFile();
          data.posts = posts;
          await saveDataFile(data);
        } catch (syncErr) {
          console.warn('Could not sync MongoDB to data.json:', syncErr.message);
        }

        return res.status(200).json({
          success: true,
          posts: posts,
          source: 'mongodb'
        });
      } catch (err) {
        console.error('MongoDB retrieve failed:', err.message);
        
        // Fallback to data.json
        try {
          const data = await getDataFile();
          if (data.posts && Array.isArray(data.posts)) {
            return res.status(200).json({
              success: true,
              posts: data.posts,
              source: 'data.json'
            });
          }
        } catch (fallbackErr) {
          console.warn('Could not read data.json:', fallbackErr.message);
        }

        return res.status(200).json({
          success: true,
          posts: []
        });
      }

    } else if (req.method === 'PUT') {
      // Update blog post in BOTH data.json and MongoDB
      const { id, mongoId, title, excerpt, category, author, content, image } = req.body;

      if (!id || !title || !content) {
        return res.status(400).json({ error: 'ID, title, and content are required' });
      }

      const updateData = {
        title,
        excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        category: category || 'Technology',
        author: author || 'Kemet Team',
        content,
        timestamp: new Date().toISOString()
      };

      if (image) {
        updateData.image = image;
      }

      // Update in MongoDB FIRST
      if (mongoId) {
        const mongoUpdateData = { ...updateData, updatedAt: new Date() };
        await updateInMongoDB(mongoId, mongoUpdateData);
        console.log(`✅ Blog post updated in MongoDB: ${title}`);
      }

      // Also update in data.json for consistency
      try {
        const data = await getDataFile();
        const postIndex = data.posts.findIndex(p => p.id === id);
        if (postIndex !== -1) {
          data.posts[postIndex] = { ...data.posts[postIndex], ...updateData };
          await saveDataFile(data);
          console.log(`✅ Blog post synced updated in data.json: ${title}`);
        }
      } catch (err) {
        console.warn('Could not sync update to data.json:', err.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Blog post updated successfully!'
      });

    } else if (req.method === 'DELETE') {
      // Delete from MongoDB first, then sync to data.json
      const { id, mongoId } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      // Delete from MongoDB FIRST
      let mongoDeleted = false;
      if (mongoId) {
        mongoDeleted = await deleteFromMongoDB(mongoId);
        if (mongoDeleted) {
          console.log(`✅ Blog post deleted from MongoDB: ${mongoId}`);
        }
      }

      // Also delete from data.json for consistency
      try {
        const data = await getDataFile();
        const initialLength = data.posts.length;
        // Convert both to strings for comparison to handle string/number mismatch
        data.posts = data.posts.filter(p => String(p.id) !== String(id));
        if (data.posts.length < initialLength) {
          await saveDataFile(data);
          console.log(`✅ Blog post synced deleted in data.json`);
        }
      } catch (err) {
        console.warn('Could not sync delete to data.json:', err.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Blog post deleted successfully!'
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
