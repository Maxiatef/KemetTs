# Kemet Technologies Website — Setup & Deployment Guide

## How the Data System Works

All data (blog posts + contact messages) is stored in **`data.json`** in the same folder as your HTML files.

```
your-domain.com/
├── data.json          ← Your database (posts + messages)
├── save-data.php      ← Saves blog posts (called by admin)
├── save-message.php   ← Saves contact messages (called by contact form)
├── admingeorge.html   ← Admin dashboard
├── blogs.html
├── blog-create.html
├── blog-post.html
├── contact.html
└── ... other pages
```

## ✅ Requirements
- PHP hosting (any shared host works: cPanel, Hostinger, GoDaddy, SiteGround, etc.)
- PHP 7.4 or higher
- Write permissions on the folder (chmod 755 or ask your host)

## 🚀 Deployment Steps

1. Upload ALL files to your domain's root folder (or a subfolder)
2. Make sure `data.json` is in the same folder as the PHP files
3. If messages aren't saving, check file permissions:
   - Right-click `data.json` in cPanel File Manager → Permissions → set to 644
   - The folder itself should be 755

## 🔐 Admin Dashboard

- URL: `yourdomain.com/admingeorge.html`
- Password: `kemet2026`
- Change password: open `admingeorge.html`, find `const ADMIN_PASSWORD = "kemet2026";` and update it

## 📝 Blog Posts

- Create/edit posts at: `yourdomain.com/blog-create.html`
- Or use the admin dashboard → Blogs tab → New Post button
- Posts are saved to `data.json` automatically

## 📬 Contact Messages

- When visitors submit the contact form on `contact.html`, the message is saved to `data.json`
- View all messages in the admin dashboard → Messages tab
- Messages show: name, company, email, phone, service interest, budget, timeline, project description, and timestamp

## ⚠️ Does NOT Work When Opening Files Locally

Opening HTML files directly from your computer (`file://C:/...`) will NOT save data — this requires a web server.
To test locally, use XAMPP, WAMP, MAMP, or any local PHP server.

## 🔄 Backup

Download `data.json` regularly from your hosting file manager to keep a backup of all posts and messages.
In the admin panel, there's also an **Export** button that downloads a copy of `data.json`.
