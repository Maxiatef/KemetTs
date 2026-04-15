import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

console.log('🚀 Server initialization started...');
console.log('📝 Loading environment variables...');

dotenv.config();

console.log('✓ Environment variables loaded');
console.log(`NV_API_KEY present: ${!!process.env.NV_API_KEY}`);
console.log(`NV_API_KEY length: ${process.env.NV_API_KEY?.length || 0}`);
console.log(`PORT: ${process.env.PORT || 3000}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

console.log('📁 Serving static files from:', __dirname);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

console.log('🔧 Initializing OpenAI client...');

// Initialize OpenAI client with NVIDIA integration
try {
  const client = new OpenAI({
    apiKey: process.env.NV_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1'
  });
  console.log('✓ OpenAI client initialized successfully');
  console.log('🎯 Base URL: https://integrate.api.nvidia.com/v1');
  console.log('🤖 Model: z-ai/glm5');
} catch (err) {
  console.error('❌ CRITICAL: Failed to initialize OpenAI client');
  console.error('Error:', err.message);
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.NV_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('📊 Health check requested');
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('\n📨 Contact form submission received');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    const { name, email, phone, company, service, budget, project, timeline, source, message, date } = req.body;

    // Validation
    if (!name || !email || !message) {
      console.warn('⚠️ Missing required fields');
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const dataPath = path.join(__dirname, 'data.json');

    // Read existing data
    let data = {};
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      data = JSON.parse(fileContent);
    }

    // Ensure messages array exists
    if (!data.messages) {
      data.messages = [];
    }

    // Create new message object with full schema
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

    // Add to messages
    data.messages.push(newMessage);

    console.log('💾 Saving to data.json...');
    console.log('📋 Schema: name, email, phone, company, service, budget, project, timeline, source, message, date');

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');

    console.log('✅ Message saved successfully');
    console.log('📧 From:', email);
    console.log('🏢 Company:', company || 'Not provided');
    console.log('💼 Service:', service || 'Not provided');
    console.log('💰 Budget:', budget || 'Not provided');
    console.log('⏱️ Timeline:', timeline || 'Not provided');

    res.json({
      success: true,
      message: 'Thank you for your message. We will be in touch soon!',
      id: newMessage.id
    });

  } catch (err) {
    console.error('\n❌ ERROR in /api/contact endpoint');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    res.status(500).json({
      error: 'Failed to save your message. Please try again.',
      details: err.message
    });
  }
});

// Create blog post endpoint
app.post('/api/blog', async (req, res) => {
  console.log('\n📝 Blog post creation request received');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    const { title, excerpt, category, author, content, image, date } = req.body;

    // Validation
    if (!title || !content) {
      console.warn('⚠️ Missing required fields (title or content)');
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const dataPath = path.join(__dirname, 'data.json');

    // Read existing data
    let data = {};
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      data = JSON.parse(fileContent);
    }

    // Ensure posts array exists
    if (!Array.isArray(data.posts)) {
      data.posts = [];
    }

    // Create new post object
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

    // Add to beginning of posts array (newest first)
    data.posts.unshift(newPost);

    console.log('💾 Saving to data.json...');

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');

    console.log('✅ Blog post created successfully');
    console.log('📄 Title:', title);
    console.log('👤 Author:', author || 'Kemet Team');
    console.log('🏷️ Category:', category || 'Technology');

    res.json({
      success: true,
      message: 'Blog post created successfully!',
      post: newPost
    });

  } catch (err) {
    console.error('\n❌ ERROR in /api/blog POST endpoint');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    res.status(500).json({
      error: 'Failed to create blog post. Please try again.',
      details: err.message
    });
  }
});

// Edit blog post endpoint
app.put('/api/blog/:id', async (req, res) => {
  console.log('\n✏️ Blog post edit request received');
  console.log('Post ID:', req.params.id);
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    const postId = parseInt(req.params.id);
    const { title, excerpt, category, author, content, image, date } = req.body;

    // Validation
    if (!title || !content) {
      console.warn('⚠️ Missing required fields (title or content)');
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const dataPath = path.join(__dirname, 'data.json');

    // Read existing data
    if (!fs.existsSync(dataPath)) {
      console.warn('⚠️ data.json not found');
      return res.status(404).json({ error: 'Data file not found' });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Ensure posts array exists
    if (!Array.isArray(data.posts)) {
      return res.status(404).json({ error: 'No posts found' });
    }

    // Find and update post
    const postIndex = data.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      console.warn('⚠️ Post not found with ID:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update post fields
    data.posts[postIndex].title = title;
    data.posts[postIndex].excerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
    data.posts[postIndex].category = category || data.posts[postIndex].category;
    data.posts[postIndex].author = author || data.posts[postIndex].author;
    data.posts[postIndex].content = content;
    if (image) data.posts[postIndex].image = image;
    data.posts[postIndex].date = date || data.posts[postIndex].date;

    console.log('💾 Saving to data.json...');

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');

    console.log('✅ Blog post updated successfully');
    console.log('📄 Title:', title);
    console.log('👤 Author:', author || 'Kemet Team');
    console.log('🏷️ Category:', category);

    res.json({
      success: true,
      message: 'Blog post updated successfully!',
      post: data.posts[postIndex]
    });

  } catch (err) {
    console.error('\n❌ ERROR in /api/blog PUT endpoint');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    res.status(500).json({
      error: 'Failed to update blog post. Please try again.',
      details: err.message
    });
  }
});

// Delete blog post endpoint
app.delete('/api/blog/:id', async (req, res) => {
  console.log('\n🗑️ Blog post deletion request received');
  console.log('Post ID:', req.params.id);

  try {
    const postId = parseInt(req.params.id);

    const dataPath = path.join(__dirname, 'data.json');

    // Read existing data
    if (!fs.existsSync(dataPath)) {
      console.warn('⚠️ data.json not found');
      return res.status(404).json({ error: 'Data file not found' });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Ensure posts array exists
    if (!Array.isArray(data.posts)) {
      return res.status(404).json({ error: 'No posts found' });
    }

    // Find post to delete
    const postIndex = data.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      console.warn('⚠️ Post not found with ID:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get post title for logging
    const postTitle = data.posts[postIndex].title;

    // Remove post from array
    data.posts.splice(postIndex, 1);

    console.log('💾 Saving to data.json...');

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');

    console.log('✅ Blog post deleted successfully');
    console.log('📄 Title:', postTitle);
    console.log('🔢 Total posts remaining:', data.posts.length);

    res.json({
      success: true,
      message: 'Blog post deleted successfully!',
      postsRemaining: data.posts.length
    });

  } catch (err) {
    console.error('\n❌ ERROR in /api/blog DELETE endpoint');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    res.status(500).json({
      error: 'Failed to delete blog post. Please try again.',
      details: err.message
    });
  }
});

// Delete message endpoint
app.delete('/api/message/:id', async (req, res) => {
  console.log('\n🗑️ Message deletion request received');
  console.log('Message ID:', req.params.id);

  try {
    const messageId = parseInt(req.params.id);

    const dataPath = path.join(__dirname, 'data.json');

    // Read existing data
    if (!fs.existsSync(dataPath)) {
      console.warn('⚠️ data.json not found');
      return res.status(404).json({ error: 'Data file not found' });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Ensure messages array exists
    if (!Array.isArray(data.messages)) {
      return res.status(404).json({ error: 'No messages found' });
    }

    // Find message to delete
    const messageIndex = data.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      console.warn('⚠️ Message not found with ID:', messageId);
      return res.status(404).json({ error: 'Message not found' });
    }

    // Get message email for logging
    const messageEmail = data.messages[messageIndex].email;

    // Remove message from array
    data.messages.splice(messageIndex, 1);

    console.log('💾 Saving to data.json...');

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');

    console.log('✅ Message deleted successfully');
    console.log('📧 From:', messageEmail);
    console.log('🔢 Total messages remaining:', data.messages.length);

    res.json({
      success: true,
      message: 'Message deleted successfully!',
      messagesRemaining: data.messages.length
    });

  } catch (err) {
    console.error('\n❌ ERROR in /api/message DELETE endpoint');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);

    res.status(500).json({
      error: 'Failed to delete message. Please try again.',
      details: err.message
    });
  }
});

// Chat endpoint (non-streaming)
app.post('/api/chat', async (req, res) => {
  console.log('\n📨 Chat request received');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    const { message, conversationHistory = [] } = req.body;

    console.log('📝 Message:', message);
    console.log('💬 Conversation history length:', conversationHistory.length);

    if (!message || message.trim().length === 0) {
      console.warn('⚠️ Empty message received');
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: `You are a professional Virtual Assistant for Kemet Technologies, a software development and design firm. 
You are friendly, helpful, and professional. You greet visitors and help answer questions about services, 
team capabilities, portfolio, and contact information. Keep responses concise and helpful. If asked about 
specific project details not in context, direct them to email editors@kemetmediagroup.com or call +1 (559) 712-8024.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🔄 Sending request to NVIDIA API...');
    console.log(`📤 Total messages in context: ${messages.length}`);

    const completion = await client.chat.completions.create({
      model: 'z-ai/glm5',
      messages: messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 512
    });

    console.log('✓ Response received from NVIDIA API');
    console.log('Response object keys:', Object.keys(completion));
    console.log('Choices:', completion.choices?.length);

    const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

    console.log('💭 Assistant response:', assistantMessage.substring(0, 100) + '...');

    const responseData = {
      text: assistantMessage,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
      ]
    };

    console.log('✅ Sending response to client');
    res.json(responseData);

  } catch (err) {
    console.error('\n❌ ERROR in /api/chat endpoint');
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error object:', JSON.stringify(err, null, 2));

    res.status(500).json({
      error: 'Failed to process your message. Please try again.',
      details: err.message
    });
  }
});

// Legacy PHP-style endpoints for compatibility with static admin pages
// POST /save-data.php  - accepts { posts: [], messages: [] } and writes data.json
app.options('/save-data.php', (req, res) => res.sendStatus(204));
app.post('/save-data.php', async (req, res) => {
  try {
    const payload = req.body || {};
    const dataPath = path.join(__dirname, 'data.json');

    // Read existing data if present
    let data = { posts: [], messages: [] };
    if (fs.existsSync(dataPath)) {
      try {
        const raw = fs.readFileSync(dataPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.posts)) data.posts = parsed.posts;
          if (Array.isArray(parsed.messages)) data.messages = parsed.messages;
        }
      } catch (e) {
        console.warn('Could not parse existing data.json, using defaults', e.message);
      }
    }

    if (payload.posts && Array.isArray(payload.posts)) {
      data.posts = payload.posts;
    }
    if (payload.messages && Array.isArray(payload.messages)) {
      data.messages = payload.messages;
    }

    // Atomic write: write to temp file then rename
    const tmpPath = dataPath + '.tmp';
    await fs.promises.writeFile(tmpPath, JSON.stringify(data, null, 4), 'utf8');
    await fs.promises.rename(tmpPath, dataPath);

    return res.json({ success: true, postsCount: data.posts.length, messagesCount: data.messages.length });
  } catch (err) {
    console.error('Error in /save-data.php:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /save-message.php - accepts a single message payload and prepends to messages
app.options('/save-message.php', (req, res) => res.sendStatus(204));
app.post('/save-message.php', async (req, res) => {
  try {
    const input = req.body || {};
    if (!input || !input.name || !input.email) {
      return res.status(400).json({ success: false, error: 'Missing name or email' });
    }

    const dataPath = path.join(__dirname, 'data.json');
    let data = { posts: [], messages: [] };
    if (fs.existsSync(dataPath)) {
      try {
        const raw = fs.readFileSync(dataPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') data = parsed;
      } catch (e) {
        console.warn('Could not parse existing data.json, using defaults', e.message);
      }
    }

    if (!Array.isArray(data.messages)) data.messages = [];

    const message = {
      id: String(Date.now()) + String(Math.floor(100 + Math.random() * 900)),
      name: input.name,
      email: input.email,
      phone: input.phone || '',
      company: input.company || '',
      service: input.service || '',
      budget: input.budget || '',
      project: input.project || '',
      timeline: input.timeline || '',
      notes: input.notes || '',
      source: input.source || '',
      message: input.message || (input.project || ''),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour12: false })
    };

    data.messages.unshift(message);

    // Atomic write
    const tmpPath = dataPath + '.tmp';
    await fs.promises.writeFile(tmpPath, JSON.stringify(data, null, 4), 'utf8');
    await fs.promises.rename(tmpPath, dataPath);

    return res.json({ success: true });
  } catch (err) {
    console.error('Error in /save-message.php:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  console.log('⚠️ 404 - Not found:', req.method, req.path);
  res.status(404).json({ error: 'Endpoint not found' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('\n' + '='.repeat(50));
  console.log('✓ Kemet AI Receptionist running on http://localhost:' + port);
  console.log('✓ Chat endpoint: POST http://localhost:' + port + '/api/chat');
  console.log('✓ Health endpoint: GET http://localhost:' + port + '/api/health');
  console.log('✓ API Key: ' + (process.env.NV_API_KEY ? '✓ Loaded' : '✗ MISSING'));
  console.log('='.repeat(50));
  console.log('\n Ready to accept connections...\n');
});
