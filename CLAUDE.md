# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # First-time setup
npm start         # Start Express server on port 3000
npm run dev       # Start with --watch (hot reload)
```

Visit `http://localhost:3000` to develop. No build step — static HTML served directly.

Kill a stuck server: `taskkill /F /IM node.exe`

## Architecture

**Full-stack marketing website** — static HTML/CSS/JS pages served by an Express backend. No frontend framework.

### Key files that interact

- **`projects.json`** — single source of truth for all portfolio projects. Both `home.html` and `portfolio.html` fetch this at runtime to render cards. When adding/editing projects, update `projects.json` only — the pages pick it up automatically.
- **`data.json`** — file-based persistence for blog posts and contact messages. Written by `server.js` API routes using atomic temp-file-then-rename to avoid corruption.
- **`server.js`** — Express app. Serves all static files from root, handles `/api/*` routes, and maps legacy `/save-data.php` and `/save-message.php` to JS handlers.
- **`site-enhancements.css` / `site-enhancements.js`** — loaded on every page via `<link>` / `<script defer>`. Contains shared nav, card hover effects, button styles, and utility classes. Page-specific JS lives inline in each HTML file's `<body>`.

### Portfolio data flow

`projects.json` → fetched in `home.html` inline script → `renderGrid(filter)` → `.portfolio-card` elements with `card-bg-img` wallpaper at 12% opacity. The circle nav filters by calling `renderGrid(filter)` on the same fetched data. `portfolio.html` has its own hardcoded `const projects = [...]` array that mirrors `projects.json`.

### AI Chat

`/api/chat` routes to `api/chat.js` which calls NVIDIA's API (not OpenAI.com) using the `openai` SDK pointed at `https://integrate.api.nvidia.com/v1`. Requires `NV_API_KEY` in `.env`.

## Design System

CSS custom properties defined in `:root` of each page:

```css
--bg: #F5F7FA        /* page background */
--surface: #EBEEF4   /* card background */
--text: #0F1419      /* body text */
--muted: #5A6B7F     /* secondary text */
--primary: #143c93   /* blue */
--accent: #ba1d49    /* red — used for highlights, progress bars, borders */
--dark: #2a2a2a      /* dark sections (marquee, WCU, footer) */
--border: rgba(20, 60, 147, 0.15)
```

Every page has its own `<style>` block — there is no single global CSS file. `site-enhancements.css` adds on top of page-level styles.

## Important Patterns

**Hover effects** live in `site-enhancements.css` (the shared selector lists at lines ~384–424), not in page-level CSS. Removing a hover from a specific component often requires editing both the page CSS and `site-enhancements.css`.

**Logo** on all pages: `<img src="media/Kemet_Technologies_logo.png">` at `height: 58px`.

**Dark color** `--dark: #2a2a2a` is set in every page's `:root`. If changed, update all pages.

**Portfolio cards** (`home.html`) use a `renderGrid()` function that fetches `projects.json`. Cards show: category, number, name, location, link, and a `card-bg-img` div (absolute, 12% opacity) using `p.image` from the JSON.

**`portfolio.html`** uses a hardcoded `const projects` array (not a fetch). When adding projects, update both `projects.json` AND the array in `portfolio.html`.

## Environment

```
NV_API_KEY=nvapi-...    # NVIDIA API key for AI chat
PORT=3000
NODE_ENV=development
```

## Deployment

Vercel. Routes configured in `vercel.json` — `/api/*` goes to serverless functions, everything else serves static files.
