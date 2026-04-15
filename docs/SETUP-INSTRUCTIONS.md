# Kemet Technologies - Setup Instructions

## Overview
This is a static HTML/CSS/JavaScript website. **Data is stored in your browser using localStorage** (no server needed during development).

### Current Production Flow (Important)
- Blog content is saved to Google Sheets via Apps Script.
- Cover images are uploaded to your hosting server using `upload-cover.php`.
- Sheets stores only the cover URL/path (for example: `/blogs-cover-imgs/file.jpg`).
- Public blog URLs are now title-based: `blog-post.html?title=My%20Blog%20Title`.

If you run only `python -m http.server`, PHP does not run, so image upload will fail locally.

### What Changed
- ✅ **Messages** from contact forms now save to browser storage
- ✅ **Blog posts** are stored in browser storage  
- ✅ **Admin dashboard** reads/writes from browser storage
- ✅ **No CORS errors** - works with or without a server

---

## Quick Start

### Option 1: Open Directly (Fastest)
Simply open `admingeorge.html` or `home.html` directly in your browser:
```
File > Open File > Select admingeorge.html
```
Everything works! Messages and blogs save in your browser.

### Option 2: Use a Local Server (Recommended)
For a more realistic development environment:

#### Windows PowerShell
```powershell
cd e:\VideoEditing\Kemet
python -m http.server 8000
```

#### macOS/Linux
```bash
cd /path/to/Kemet
python3 -m http.server 8000
```

Then visit: **`http://localhost:8000`**

### Option 3: Local PHP Server (Required to test image upload)
```powershell
cd e:\CODE\Kemet
php -S localhost:8000
```

Then visit: **`http://localhost:8000`**

#### Using Node.js (npx)
```bash
cd e:\VideoEditing\Kemet
npx serve
```

---

## Using the Website

### Contact Form
1. Fill in the contact form on the home page or `/contact.html`
2. Submit the form
3. Messages automatically save in your browser storage

### Admin Dashboard
**File:** `admingeorge.html`

1. Open the admin dashboard
2. **Password:** `password123` (edit in the code to change)
3. Access these tabs:
   - **Dashboard** - View stats
   - **Messages** - See all contact form submissions
   - **Blog Posts** - Manage blog content
   - **Settings** - Future use

### Blog System
**Create Posts:**
1. Go to `/blog-create.html` (or click "New Post" in admin)
2. Edit in the WYSIWYG editor
3. Upload a cover image
4. Click "Publish"
5. Post immediately appears in `/blogs.html`

**Edit/Delete Posts:**
- Go to admin dashboard → Blog Posts tab
- Click "Edit" or "Delete"

### Exporting Data
In the admin dashboard, click the **Export Data** button to download a `data.json` file containing:
- All blog posts
- All contact messages

---

## Data Storage

### How It Works
- **Blog posts** are saved in: `localStorage['kemetBlogPosts']`
- **Contact messages** are saved in: `localStorage['kemetMessages']`
- Data persists across browser sessions on the same device
- Each user/browser has separate storage

### Accessing Stored Data
Open browser console and run:
```javascript
// View all blog posts
JSON.parse(localStorage.getItem('kemetBlogPosts'))

// View all messages
JSON.parse(localStorage.getItem('kemetMessages'))

// Clear all data (careful!)
localStorage.clear()
```

---

## Important Notes

### Storage Limits
- Each domain has ~5-10MB of storage
- Storing high-quality images (base64) uses space quickly
- Export data regularly to preserve important content

### Data Persistence
- **Same browser/computer**: Data persists forever (or until you clear storage)
- **Different browser/computer**: Data is separate
- **Clear browser cache**: May delete data
- **Private/Incognito mode**: Data may not persist

### Browser Compatibility
Works in all modern browsers:
- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- IE11 ❌ (unsupported)

---

## Troubleshooting

### "Admin dashboard is blank"
**Solution:** Make sure you're logged in first (password: `password123`)

### "Blog posts aren't showing up"
**Reason:** You created them in a different browser or cleared your browser storage
**Solution:** Create the blogs again, or restore from an exported `data.json`

### "Messages aren't saving"
**Reason:** Browser storage might be disabled or full
**Solution:**
1. Check browser allows localStorage (privacy settings)
2. Clear some browser cache
3. Try a different browser

### "Images are not uploading"
**Reason:** PHP upload endpoint is not running, image is too large, or upload folder permissions are incorrect
**Solution:**
1. Use a PHP-enabled host (or local PHP server) so `upload-cover.php` can execute
2. Ensure `blogs-cover-imgs/` exists and is writable by PHP
3. Use a smaller file size (< 5MB)
4. Confirm `upload-cover.php` returns JSON on POST requests

---

## For Server Deployment

When deploying to a real server:

1. **Data Migration**: Export `data.json` from localStorage
2. **Upload**: Place files on server
3. **Optional**: Set up a backend API to replace localStorage with a database
4. **PHP endpoints** (`save-message.php`, `save-data.php`) can be used if you set up a backend

---

## Password Management

To change the admin password:

1. Open `admingeorge.html` in a text editor
2. Search for `function doLogin()`
3. Find: `const PASSWORD = 'password123';`
4. Change to your password
5. Save and reload

---

## Tips & Tricks

### Backup Your Data
In the admin dashboard:
1. Click **Export Data**
2. Save the `data.json` file
3. Keep it in a safe location

### Restore from Backup
1. Export the old data from another browser/device
2. Manually copy posts/messages JSON
3. Use browser console: `localStorage.setItem('kemetBlogPosts', jsonData)`

### Share Data Between Users
Export a `data.json` file and send it to another person. They can restore it using the browser console.

---

## Files Reference

```
/
├── home.html                # Home page with hero & contact form
├── contact.html             # Standalone contact page
├── portfolio.html           # Portfolio showcase
├── services.html            # Services page
├── team.html                # Team members
├── blogs.html               # Blog listing
├── blog-create.html         # Blog editor
├── blog-post.html           # Individual blog view
├── admingeorge.html         # Admin dashboard ⭐
├── data.json                # (Optional) Backup data file
├── SETUP.md                 # Project setup guide
├── AGENTS.md                # Project documentation
└── media/                   # Images and assets
    ├── hero/
    ├── portfolio/
    └── ... (other folders)
```

---

## Questions?

Check the code comments in:
- `admingeorge.html` - Admin logic
- `contact.html` - Form submission
- `blog-create.html` - Blog editor
- `blogs.html` - Blog listing

All functions are well-documented! 🚀
