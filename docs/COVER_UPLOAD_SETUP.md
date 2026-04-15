# Cover Upload + SEO URL Setup

This project now uploads cover images to your hosting server and stores only the image URL/path in Google Sheets.

## What Was Added

- `upload-cover.php`
  - Receives image file from admin pages.
  - Validates file size and MIME type.
  - Saves image into `blogs-cover-imgs/`.
  - Returns JSON: `{ success, path, url }`.
- `blogs-cover-imgs/` folder
  - Stores uploaded blog cover images.

## Important Config

Open `upload-cover.php` and update:

1. `allowedOrigins`
- Add your production domain:
  - `https://your-domain.com`

2. `$uploadToken`
- Set a strong secret string (recommended in production).
- Then use the same token in frontend constant `COVER_UPLOAD_TOKEN`.

## Frontend Behavior

Admin pages now do this flow:

1. Admin chooses a cover image.
2. Frontend uploads the file to `upload-cover.php`.
3. Server returns URL/path.
4. Frontend sends that URL/path to Google Apps Script in `coverimg`.
5. Sheets stores only URL/path (not base64).

## Google Apps Script

No schema change is required.
- Keep using `coverimg` column.
- It now stores URL/path such as:
  - `https://your-domain.com/blogs-cover-imgs/20260403-...jpg`
  - or `blogs-cover-imgs/20260403-...jpg`

## SEO-Friendly Blog URLs

Public blog links now use slug URLs:

- From listing: `blog-post.html?slug=my-blog-title`
- Post page resolves by slug first, with id fallback for old links.

## Deployment Checklist

1. Upload updated files to hosting:
- `blog-create.html`
- `admingeorge.html`
- `blogs.html`
- `blog-post.html`
- `upload-cover.php`
- `blogs-cover-imgs/` directory

2. Ensure PHP is enabled on your hosting account.

3. Ensure `blogs-cover-imgs/` is writable by PHP.

4. Set correct domain in `allowedOrigins`.

5. Test upload endpoint directly (replace with your domain):
- `https://your-domain.com/upload-cover.php`
  - GET should return method-not-allowed JSON.

6. Test full flow:
- Create/edit blog with cover image.
- Confirm image file appears in `blogs-cover-imgs/`.
- Confirm `coverimg` in Sheets is URL/path.
- Confirm public blog shows image.

## Troubleshooting

- If upload fails with non-JSON response:
  - PHP errors are being output. Check hosting PHP logs.
- If CORS error appears:
  - Add your exact domain to `allowedOrigins`.
- If file not saved:
  - Check folder write permission on `blogs-cover-imgs/`.
- If image URL is stored but not displayed:
  - Open that exact URL in browser and verify it loads.
