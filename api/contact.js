/**
 * Vercel Serverless Function: /api/contact
 * POST endpoint for contact form submissions
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, company, service, budget, project, timeline, source, message, date } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const data = await getDataFile();

    if (!Array.isArray(data.messages)) {
      data.messages = [];
    }

    // Create new message
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
      date: date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      timestamp: new Date().toISOString(),
      read: false
    };

    data.messages.push(newMessage);
    await saveDataFile(data);

    console.log('✅ Contact message saved:', email);

    return res.status(200).json({
      success: true,
      message: 'Thank you for your message. We will be in touch soon!',
      id: newMessage.id
    });

  } catch (error) {
    console.error('Contact error:', error);
    return res.status(500).json({
      error: 'Failed to save your message',
      details: error.message
    });
  }
}
