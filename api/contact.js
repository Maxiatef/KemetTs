/**
 * Vercel Serverless Function: /api/contact
 * POST endpoint for contact form submissions
 * Stores data in BOTH MongoDB and data.json (dual persistence)
 */
import { MongoClient } from 'mongodb';
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

async function saveToMongoDB(message) {
  try {
    const client = await connectToDatabase();
    const db = client.db('kemet');
    const messagesCollection = db.collection('messages');
    const result = await messagesCollection.insertOne(message);
    return result.insertedId;
  } catch (err) {
    console.error('MongoDB save failed:', err.message);
    return null;
  }
}

async function deleteFromMongoDB(messageId) {
  try {
    const client = await connectToDatabase();
    const db = client.db('kemet');
    const messagesCollection = db.collection('messages');
    const { ObjectId } = await import('mongodb');
    const result = await messagesCollection.deleteOne({ _id: new ObjectId(messageId) });
    return result.deletedCount > 0;
  } catch (err) {
    console.error('MongoDB delete failed:', err.message);
    return false;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get messages from MongoDB first, fallback to data.json
      try {
        const client = await connectToDatabase();
        const db = client.db('kemet');
        const messagesCollection = db.collection('messages');
        const messages = await messagesCollection.find({}).sort({ createdAt: -1 }).toArray();

        // Also sync to data.json
        try {
          const data = await getDataFile();
          data.messages = messages;
          await saveDataFile(data);
        } catch (syncErr) {
          console.warn('Could not sync MongoDB to data.json:', syncErr.message);
        }

        return res.status(200).json({
          success: true,
          messages: messages,
          data: messages,
          source: 'mongodb'
        });
      } catch (err) {
        console.error('MongoDB retrieve failed:', err.message);
        
        // Fallback to data.json
        try {
          const data = await getDataFile();
          if (data.messages && Array.isArray(data.messages)) {
            return res.status(200).json({
              success: true,
              messages: data.messages,
              data: data.messages,
              source: 'data.json'
            });
          }
        } catch (fallbackErr) {
          console.warn('Could not read data.json:', fallbackErr.message);
        }

        return res.status(200).json({
          success: true,
          messages: [],
          data: []
        });
      }
    }

    if (req.method === 'DELETE') {
      // Delete from both MongoDB and data.json
      const { id, mongoId } = req.body;

      // Delete from MongoDB FIRST
      let mongoDeleted = false;
      if (mongoId) {
        mongoDeleted = await deleteFromMongoDB(mongoId);
        if (mongoDeleted) {
          console.log(`✅ Message deleted from MongoDB: ${mongoId}`);
        }
      }

      // Also delete from data.json for consistency
      try {
        const data = await getDataFile();
        if (data.messages && Array.isArray(data.messages)) {
          const initialLength = data.messages.length;
          // Convert both to strings for comparison to handle string/number mismatch
          data.messages = data.messages.filter(m => String(m.id) !== String(id));
          if (data.messages.length < initialLength) {
            await saveDataFile(data);
            console.log(`✅ Message synced deleted in data.json: ${id}`);
          }
        }
      } catch (err) {
        console.warn('Could not sync delete to data.json:', err.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, company, service, budget, project, timeline, source, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Create new message object
    const newMessage = {
      id: Date.now(),
      name,
      email,
      phone: phone || 'Not provided',
      company: company || 'Not provided',
      service: service || 'Not provided',
      budget: budget || 'Not provided',
      project: project || 'Not provided',
      timeline: timeline || 'Not provided',
      source: source || 'Not provided',
      message,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      read: false
    };

    // Save to MongoDB FIRST
    let mongoId = null;
    try {
      const client = await connectToDatabase();
      const db = client.db('kemet');
      const messagesCollection = db.collection('messages');
      const mongoMessage = { ...newMessage, createdAt: new Date() };
      const result = await messagesCollection.insertOne(mongoMessage);
      mongoId = result.insertedId;
      console.log(`✅ Contact message saved to MongoDB: ${email}`);
    } catch (err) {
      console.error('❌ Error saving to MongoDB:', err.message);
    }

    // Also save to data.json for backup
    try {
      const data = await getDataFile();
      if (!Array.isArray(data.messages)) {
        data.messages = [];
      }
      data.messages.push(newMessage);
      await saveDataFile(data);
      console.log(`✅ Contact message synced to data.json: ${email}`);
    } catch (err) {
      console.warn('Could not sync to data.json:', err.message);
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your message. We will be in touch soon!',
      id: newMessage.id,
      mongoId: mongoId
    });
  } catch (error) {
    console.error('❌ Error processing request:', error.message);
    res.status(500).json({ error: 'Failed to process message' });
  }
}

