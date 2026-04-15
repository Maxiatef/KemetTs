/**
 * Vercel Serverless Function: /api/message
 * DELETE endpoint for message management
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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const messageId = parseInt(req.query.id);
    const data = await getDataFile();

    if (!Array.isArray(data.messages)) {
      return res.status(404).json({ error: 'No messages found' });
    }

    const messageIndex = data.messages.findIndex(m => m.id === messageId);

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const deletedMessage = data.messages[messageIndex];
    data.messages.splice(messageIndex, 1);

    await saveDataFile(data);

    console.log('✅ Message deleted:', deletedMessage.email);

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully!',
      messagesRemaining: data.messages.length
    });

  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      error: 'Failed to delete message',
      details: error.message
    });
  }
}
