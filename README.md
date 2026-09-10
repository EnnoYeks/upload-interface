# Upload Interface

Modern mobile-first upload / Create Pin interface based on real camera and Pinterest-style screenshots.

## Features

### Capture Screen
- Full camera-style preview
- Right-side tool rail: Flip, Timer, Duration, Effects, Speed, Green Screen, Retouch, Filters, Lighting, Flash
- Mode tabs: Video / Short / Live / Post
- Large record button + Gallery picker
- High-contrast mode toggle

### Details / Create Pin Screen
- Title (100 chars) + Description (800 chars) with voice input buttons
- Link field
- Board / Topics / Products pickers
- Full Accessibility card (alt text, captions, audio description, content warnings)

### Image Optimization (Client-side)
- Automatic resize (max 1600px)
- WebP (preferred) or JPEG conversion
- Adjustable quality slider (50–95%)
- Live size comparison: Original → Optimized → % Saved
- Re-optimize button

### Accessibility
- ARIA labels on all controls
- Visible focus rings
- High-contrast mode
- Dynamic Type friendly
- Keyboard support (Esc to go back)
- `prefers-reduced-motion` respected

## How to use
1. Open `index.html` in a browser (or serve the folder).
2. Tap the red record button or the gallery icon.
3. On the details screen, adjust quality/format if desired.
4. Fill Title + Description and hit **Create**.

## Tech
Pure HTML + CSS + vanilla JS. No frameworks. Works offline after first load (except gallery images).

---
Built from real UI screenshots + modern 2026 best practices.
