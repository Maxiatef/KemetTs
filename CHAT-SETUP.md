# Kemet AI Receptionist Chat Setup & Deployment

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
cd d:\WAmpserver\install\www\Kemet
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and add your NVIDIA GLM5 API key:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Edit .env:
# NV_API_KEY=nvapi-YOUR_KEY_HERE
```

Or set as environment variable:
```bash
# Windows PowerShell
$env:NV_API_KEY = 'nvapi-YOUR_KEY_HERE'

# Windows CMD
set NV_API_KEY=nvapi-YOUR_KEY_HERE

# Linux/Mac
export NV_API_KEY=nvapi-YOUR_KEY_HERE
```

### 3. Run the Server
```bash
npm start
```

Server will start on `http://localhost:3000`

**For development with auto-reload:**
```bash
npm run dev
```

### 4. Test the Chat
- Open `http://localhost:3000` in your browser
- Chat widget appears in bottom-right corner
- Type a message and send

## Production Deployment on Your Domain

### Option A: WAMPServer + Node (Recommended)
Your current setup uses WAMPServer. Keep using it for Apache + static files, and run Node in the background:

1. **Update `home.html` API URL:**
   - During development: `http://localhost:3000/api/chat`
   - On production: Change to your domain `/api/chat` (relative URL)

   In `chat-widget.js`, line 17:
   ```js
   this.apiUrl = options.apiUrl || '/api/chat';  // Use relative path
   ```

2. **Install Node.js** on your server (if not already installed)
   - Download from https://nodejs.org/ (LTS version)
   - Run installer, accept defaults

3. **Deploy Node server** to your WAMPServer folder:
   ```bash
   cd d:\WAmpserver\install\www\Kemet
   npm install --production  # Install only production deps
   ```

4. **Set environment variable on Windows:**
   ```bash
   # PowerShell (as Admin)
   [Environment]::SetEnvironmentVariable("NV_API_KEY", "nvapi-YOUR_KEY_HERE", "Machine")
   
   # Then restart your machine or the command prompt
   ```

5. **Start Node server (background process):**
   - **Option 1: Windows Service** (PM2 - Recommended)
     ```bash
     npm install -g pm2
     pm2 start server.js --name "kemet-chat"
     pm2 startup
     pm2 save
     ```
   - **Option 2: Task Scheduler**
     - Open Task Scheduler (Win+X → Task Scheduler)
     - Create Basic Task
     - Set trigger to "On startup"
     - Set action: `C:\Program Files\nodejs\node.exe` with argument `d:\WAmpserver\install\www\Kemet\server.js`

6. **Configure Apache Reverse Proxy** (if Node is on separate port):
   - Edit `httpd.conf` in WAMPServer Apache folder
   - Add:
     ```apache
     ProxyPreserveHost On
     ProxyPass "/api/chat" "http://localhost:3000/api/chat"
     ProxyPassReverse "/api/chat" "http://localhost:3000/api/chat"
     ```
   - Restart Apache

---

### Option B: Full Migration to Node.js

If you want to migrate the entire site to Node.js:

1. Install Node.js
2. Install `express` and `serve-static`:
   ```bash
   npm install express serve-static
   ```
3. Update `server.js` to also serve static HTML:
   ```js
   app.use(express.static(__dirname));  // Already included in provided server.js
   ```
4. Run `npm start`
5. Point your domain to Node server (port 3000)

---

## CORS Configuration

### For Local Development:
- Allowed origins: `localhost:3000`, `localhost:8000`, `127.0.0.1:8000`
- Auto-configured in `server.js`, lines 16-19

### For Production:
Update `server.js` CORS settings:
```js
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

---

## Security Checklist

- [ ] **API Key Management:**
  - Store `NV_API_KEY` in environment variables, NOT in code
  - Rotate key if accidentally exposed
  - Use `.env` only for local development

- [ ] **HTTPS:** 
  - Use `https://` URLs in production
  - Update CORS `origin` to `https://yourdomain.com`

- [ ] **Rate Limiting (Optional):**
  - Add rate limiting to `/api/chat` endpoint to prevent abuse
  - Use package: `npm install express-rate-limit`

- [ ] **Firewall:**
  - Only expose port 443 (HTTPS) to the internet
  - Keep Node server on internal port (3000), behind Apache reverse proxy

---

## Troubleshooting

### Chat widget doesn't appear
- Open browser console (F12)
- Check for JavaScript errors
- Verify `chat-widget.js` is being loaded (Network tab)
- Ensure API URL is correct

### "Failed to process your message" error
- Check that Node server is running: `http://localhost:3000/api/health`
- Verify `NV_API_KEY` environment variable is set
- Check Node server logs for API errors
- Monitor API usage on https://build.nvidia.com/

### CORS errors
- Verify Node server CORS config includes your domain
- Restart Node server after changing CORS settings

### High latency/slow responses
- GLM5 model may take 1-3s to generate responses
- Consider increasing `max_tokens` or `temperature` in `server.js`
- Check network/internet connection

---

## File Structure

```
d:\WAmpserver\install\www\Kemet\
├── server.js                 # Node.js backend (chat API)
├── chat-widget.js            # Frontend chat widget
├── package.json              # Node dependencies
├── .env.example              # Environment template
├── .env                       # (Create locally, don't commit)
├── home.html                 # Main site with chat widget
├── media/
│   └── team/
│       └── team-1.jpg ... team-8.jpg
└── ...
```

---

## API Endpoint Reference

### POST `/api/chat`
Send a message to the AI receptionist

**Request:**
```json
{
  "message": "What services do you offer?",
  "conversationHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"}
  ]
}
```

**Response:**
```json
{
  "text": "We offer web design, mobile apps, custom software...",
  "conversationHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"},
    {"role": "user", "content": "What services do you offer?"},
    {"role": "assistant", "content": "We offer web design, mobile apps..."}
  ]
}
```

### GET `/api/health`
Health check endpoint

**Response:**
```json
{
  "status": "online",
  "timestamp": "2026-04-07T10:30:00.000Z"
}
```

---

## Support & Resources

- **NVIDIA GLM5 API:** https://build.nvidia.com/
- **Express.js Docs:** https://expressjs.com/
- **OpenAI Node.js SDK:** https://github.com/openai/node-sdk
- **PM2 Docs:** https://pm2.keymetrics.io/

---

Generated for Kemet Technologies | April 2026
