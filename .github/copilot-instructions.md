# Kemet Technologies - Copilot Instructions

## Project Overview
**Kemet Technologies** is a full-stack website featuring:
- Modern, responsive landing page with hero section, services, portfolio, and testimonials
- Node.js + Express backend serving static HTML/CSS/JavaScript
- Contact form submissions saved to `data.json`
- Blog management system (create, read, update posts)
- AI Receptionist chat powered by NVIDIA OpenAI integration
- Interactive features: testimonial auto-scroll, featured-work image carousel

**Tech Stack:**
- Frontend: HTML5, CSS3, vanilla JavaScript (no frameworks)
- Backend: Node.js + Express
- AI/Chat: NVIDIA GLM-5 via OpenAI API
- Hosting: Vercel (production), local dev server

---

## Quick Start Commands

### Development
```bash
npm install              # Install dependencies (first time only)
npm start                # Start server on port 3000 (production mode)
npm run dev              # Start with --watch for hot reload
```

### Testing
```bash
cd e:\CODE\Kemet2
npm start
# Visit http://localhost:3000 in browser
```

---

## Project Structure

```
e:\CODE\Kemet2/
├── api/                          # Helper modules for API routes
│   ├── blog.js                   # Blog CRUD operations
│   ├── blogs.js                  # Blog retrieval/filtering
│   ├── chat.js                   # AI chat with NVIDIA OpenAI
│   ├── contact.js                # Contact form handling
│   ├── health.js                 # Health check endpoint
│   └── message.js                # Message storage utilities
│
├── media/                         # Project portfolio images
│   ├── gks/                       # German Kitchen Studio
│   ├── globalnexus/              # Global Nexus Management
│   ├── urban/                     # Urban Design Engineering
│   └── [other projects]/
│
├── docs/                          # Project documentation
│   ├── QUICK-START.md             # Admin dashboard guide
│   ├── SETUP-INSTRUCTIONS.md      # Environment setup
│   └── [other docs]/
│
├── Home page & main files:
│   ├── home.html                  # Primary landing page
│   ├── about.html                 # About/Team page
│   ├── services.html              # Services overview
│   ├── portfolio.html             # Full portfolio
│   ├── blogs.html                 # Blog listing
│   ├── blog-post.html             # Individual blog post
│   ├── blog-create.html           # New blog editor
│   ├── contact.html               # Contact page
│   ├── team.html                  # Team profiles
│   ├── index.html                 # Alias for home.html
│   └── admingeorge.html           # Admin dashboard (password: password123)
│
├── Styles & scripts:
│   ├── site-enhancements.css      # Global styles (navigation, utilities)
│   ├── site-enhancements.js       # Global JS utilities
│   ├── chat-widget.js             # Chat floater UI
│
├── Backend:
│   ├── server.js                  # Express app, API routes
│   ├── save-data.php              # Legacy PHP endpoint (mapped in server.js)
│   ├── save-message.php           # Legacy PHP endpoint (mapped in server.js)
│   ├── upload-cover.php           # Blog cover image upload
│
├── Data & config:
│   ├── data.json                  # Persistent data store (messages, blogs)
│   ├── package.json               # Project metadata & dependencies
│   ├── vercel.json                # Vercel deployment config
│   └── .env                        # Environment variables (NV_API_KEY, PORT, NODE_ENV)
```

---

## Key Conventions & Patterns

### 1. HTML Structure
- **Fixed navigation** on all pages (navbar with 0.9rem padding, 46px logo height)
- **Active class** on current page link: `.nav-links a.active::after { transform: scaleX(1); }`
- **Responsive design**: 900px media query breakpoint for mobile

### 2. CSS Naming
- **BEM-inspired**: `.fw-card`, `.nav-links`, `.test-slide`
- **CSS custom properties** for theming:  
  ```css
  --primary: #143c93
  --accent: #ba1d49
  --text: #0F1419
  --bg: #F5F7FA
  --muted: #5A6B7F
  ```
- **No CSS framework**: Pure CSS with flexbox/grid

### 3. JavaScript Conventions
- **Inline scripts** for page-specific features (prefer over deferred external scripts for reliability)
- **IIFE pattern** for encapsulation: `(function() { /* code */ })();`
- **Vanilla JS**: No jQuery, React, Vue, etc.
- **Event delegation**: Use `document.querySelector()` / `document.querySelectorAll()`
- **Namespace under features**:
  - Testimonials: `#testTrack`, `.test-slide`, `.test-dot`
  - Featured Work: `.fw-card[data-images]`, `.fw-main-image`

### 4. Interactive Components
- **Testimonial Slider** (home.html, inline script):
  - Auto-rotates every 6 seconds
  - Pauses on hover, resumes from paused position (tracks `pausedRatio`)
  - Progress bar with fade effect
  
- **Featured Work Carousel** (home.html, inline script):
  - Image cycling on hover (1.2s per image)
  - Preloads all images for smooth transitions
  - Fades to first image on mouseleave
  - Icons: JSON array in `data-images` attribute

### 5. API Routes
All routes POST/GET/PUT to `server.js`:

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/contact` | Save contact form (name, email, message → data.json) |
| POST | `/api/chat` | AI chat with NVIDIA OpenAI (receives messages, returns AI response) |
| POST | `/api/blog` | Create new blog post |
| PUT | `/api/blog/:id` | Update existing blog post |
| GET | `/api/health` | Health check for monitoring |

### 6. Data Storage
- **File-based**: `data.json` stores messages & blogs locally
- **No database**: Simple, portable, works on Vercel Serverless
- **Format**: 
  ```json
  {
    "messages": [{ "name": "...", "email": "...", "message": "...", "timestamp": "..." }],
    "blogs": [{ "id": "...", "title": "...", "content": "...", "...": "..." }]
  }
  ```

---

## Common Tasks

### Adding a New Page
1. Create HTML file in root (e.g., `services.html`)
2. Copy navbar from `home.html` with correct active state:
   ```html
   <li><a href="services.html" class="active">Services</a></li>
   ```
3. Include links to stylesheets:
   ```html
   <link rel="stylesheet" href="site-enhancements.css" />
   <script src="site-enhancements.js" defer></script>
   ```

### Updating Navbar Styling
Edit `.nav-*` CSS rules in each page's `<style>` tag (all pages have consistent navbar CSS as of April 2026):
- `nav { padding: 0.9rem 2.5rem; background: rgba(250, 248, 244, 0.95); }`
- **Center-origin hover underline**: `.nav-links a::after { transform-origin: center; }`

### Adding New Interactive Feature
1. Write inline `<script>` tag in HTML (at end of `<body>`)
2. Wrap in IIFE: `(function() { /* your code */ })();`
3. Use descriptive console logs for debugging:
   ```javascript
   console.log('✓ Feature initialized');
   console.log('⚠️ Warning: element not found');
   ```
4. Test in browser DevTools Console tab

### Deploying to Production
```bash
# Vercel handles this automatically on git push
# Or manually:
npm run build   # (just echoes "no build needed")
vercel          # Deploy to vercel.com
```

---

## Important Notes

### Browser Storage vs Server Storage
- **Client-side**: Testimonials, featured work carousel (hardcoded in HTML)
- **Server-side**: Contact messages, blog posts (data.json)
- **localStorage**: Admin dashboard uses it for temporary state only

### Environment Variables
Create `.env` file in root:
```
NV_API_KEY=your_nvidia_openai_key_here
PORT=3000
NODE_ENV=development
```

### Known Quirks
- **Port 3000 conflicts**: Port shows `EADDRINUSE` if server already running → kill process or use different port in `.env`
- **Featured work images**: Must exist at paths specified in `data-images` attribute (no lazy loading on first hover)
- **Testimonials**: Using `pausedRatio` calculation instead of timer restart for smooth pause/resume

---

## File-Specific Guidelines

### home.html
- Primary landing page with all key sections
- Contains inline scripts for testimonials & featured-work-carousel
- Hero video: `media/herobackground22.mp4`
- Featured work cards: 3 portfolio projects with image arrays

### server.js
- Entry point for Express app
- CORS whitelist: `localhost:3000`, `localhost:8000`, `127.0.0.1`
- Serves all static files from root directory
- AI endpoint uses NVIDIA API (not OpenAI.com)

### site-enhancements.js
- Loaded with `defer` on all pages
- Contains global utilities, NOT page-specific features (those go inline in HTML)
- Used for mobile nav, scroll state management, lazy-load utilities

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Server won't start | Check port 3000 isn't in use; kill node process: `taskkill /F /IM node.exe` |
| CSS not updating | Hard refresh: Ctrl+F5 or Cmd+Shift+R |
| Carousel/slider not working | Check inline scripts in HTML use direct selectors (`.fw-card[data-images]`); verify DOM ready |
| Contact form 404 | Ensure `npm start` running; check CORS origin whitelist in server.js |
| Images not loading | Verify paths in `data-images` tag match actual file locations in `/media/` |

---

## Link to Documentation
- [Quick Start Guide](docs/QUICK-START.md) - Admin dashboard guide
- [Setup Instructions](docs/SETUP-INSTRUCTIONS.md) - Environment setup (legacy, see npm start above)
- [Testing Checklist](docs/TESTING-CHECKLIST.md) - QA procedures
- [CORS Fix Summary](docs/CORS-FIX-SUMMARY.md) - CORS solution history

---

**Last Updated**: April 10, 2026  
**Maintained By**: Development Team
