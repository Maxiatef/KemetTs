/**
 * Vercel Serverless Function: /api/chat
 * POST endpoint for AI chat
 */
import OpenAI from 'openai';

// Initialize client (reused across invocations)
let client = null;

function initClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.NV_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1'
    });
  }
  return client;
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!process.env.NV_API_KEY) {
      console.error('NV_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const openaiClient = initClient();

    // Build messages array with system prompt
    const messages = [
      {
        role: 'system',
        content: `You are a professional AI assistant for Kemet Technologies, a software development and design firm based in Clovis, California. Be friendly, concise, and helpful. Answer questions about our services (Web Design, Mobile Apps, SEO/GEO/AEO, Custom Software, AI Integrations), team, portfolio, and contact info. For detailed project quotes, direct clients to contact us at founder@kemetts.com or +1 (559) 712-8024. Keep responses under 3 sentences when possible.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await openaiClient.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 500
    });

    const assistantMessage = response.choices[0].message.content;
    const updatedHistory = [
      ...messages,
      { role: 'assistant', content: assistantMessage }
    ];

    return res.status(200).json({
      text: assistantMessage,
      conversationHistory: updatedHistory
    });

  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to generate response',
      details: error.message
    });
  }
}
