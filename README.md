# 🔗 LINKLY

> **Shorten URLs. Share Smarter.**

A premium, production-quality URL Shortener web application built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies, no fuss. Designed to feel at home alongside products like Vercel, Linear, Stripe, and Framer.

---

## Preview

```
https://linkly.dev/A8xY29        ← generated short link
https://linkly.dev/my-custom     ← with custom alias
```

---

## Features

### Core
- **URL Shortening** — paste any `http://` or `https://` URL and get a short link instantly
- **Custom Aliases** — choose your own slug (e.g. `linkly.dev/launch-day`)
- **Link Expiration** — set links to expire after 24 hours, 7 days, 30 days, or never
- **QR Code Generation** — every link gets a downloadable QR code (via `api.qrserver.com`)
- **Web Share API** — native share sheet on supported devices, clipboard fallback elsewhere
- **Click Stats** — per-link panel showing clicks, creation time, expiry, and status
- **Recent Links** — full history stored in `localStorage`, newest first, survives page refresh
- **Clear History** — confirmation modal before bulk-deleting all saved links

### Design & UX
- **Glassmorphism** — frosted-glass cards with backdrop blur throughout
- **Aurora Background** — animated gradient blobs + subtle CSS grid
- **Mouse Glow** — radial gradient that follows the cursor
- **Dark / Light Mode** — toggle persists across sessions via `localStorage`
- **Ripple Buttons** — material-style ripple on every interactive element
- **Toast Notifications** — non-blocking success / error / info feedback
- **Skeleton Loading** — shimmer placeholder while the QR image loads
- **Floating Feature Cards** — subtle looping float animation, lift on hover
- **FAQ Accordion** — smooth `max-height` expand / collapse with chevron rotation
- **Scroll-triggered Animations** — `IntersectionObserver`-powered fade-up reveals
- **Custom Scrollbar** — thin purple accent scrollbar (webkit + Firefox)
- **Back-to-Top Button** — appears after 300px scroll
- **Animated Footer Divider** — shimmer gradient line above the footer

### Accessibility & Performance
- Semantic HTML5 (`header`, `main`, `footer`, `nav`, `article`, `section`)
- Full keyboard navigation — every interactive element is focusable
- `aria-label`, `aria-expanded`, `aria-live`, `aria-modal` throughout
- `prefers-reduced-motion` respected — all animations disabled for users who opt out
- No external JavaScript dependencies — zero runtime overhead
- Google Fonts loaded with `preconnect` for fastest possible TTFB

### Bonus
| Shortcut | Action |
|---|---|
| `Ctrl` / `Cmd` + `K` | Focus the URL input |
| `Enter` (in URL field) | Shorten immediately |
| `Escape` | Close any open modal |

---

## Project Structure

```
linkly/
├── index.html    — markup, semantic structure, all sections & modals
├── style.css     — all styling: design tokens, layout, animations, responsive
└── script.js     — all logic: shortening, storage, QR, share, theme, keyboard
```

No build step. No bundler. No package manager. Open `index.html` in a browser and it works.

---

## Getting Started

```bash
# Clone or download the project
git clone https://github.com/aryankpandey/linkly.git
cd linkly

# Open directly in your browser
open index.html

# Or serve locally (optional, for proper URL handling)
npx serve .
# → http://localhost:3000
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#050505` | Page background |
| `--bg-card` | `#101010` | Card surfaces |
| `--accent` | `#7C3AED` | Primary purple |
| `--accent-light` | `#9d6cf7` | Hover states, links |
| `--text` | `#FFFFFF` | Primary text |
| `--text-muted` | `#B5B5B5` | Secondary text |
| `--success` | `#22C55E` | Success states |
| `--error` | `#EF4444` | Error states |

**Font:** [Poppins](https://fonts.google.com/specimen/Poppins) — weights 300, 400, 500, 600, 700

**Max content width:** 900px

---

## How It Works

1. User pastes a URL into the input field
2. The URL is validated client-side (`URL` constructor + protocol check)
3. A cryptographically random 6-character code is generated via `crypto.getRandomValues()`
4. If a custom alias is provided and unique, it is used instead
5. The link object (code, original URL, expiry, timestamps) is saved to `localStorage`
6. The output card animates in with the short URL and stats
7. QR codes are fetched on demand from `api.qrserver.com` and offered for download

> **Note:** This is a frontend-only demo. Short links do not resolve in a real browser — a backend redirect service would be needed for production deployment (e.g. a Node.js/Express server or serverless functions on Vercel/Cloudflare Workers).

---

## Deployment

The project is fully static and deploys to any host without configuration.

**Vercel**
```bash
vercel --prod
```

**Netlify** — drag and drop the `linkly/` folder into the Netlify dashboard.

**GitHub Pages**
```bash
git push origin main
# Enable Pages in repo Settings → Pages → Deploy from branch: main
```

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile (iOS/Android) | ✅ Responsive |

`backdrop-filter` requires Safari 9+ / Chrome 76+. The UI degrades gracefully on older browsers — cards remain visible without the blur effect.

---

## Roadmap

- [ ] Backend redirect service (Node.js / Cloudflare Workers)
- [ ] Real click analytics with geolocation
- [ ] User accounts and link management dashboard
- [ ] Link preview (Open Graph metadata fetch)
- [ ] Password-protected links
- [ ] Bulk shortening via CSV upload
- [ ] API endpoint for programmatic link creation

---

## Author

**Aryan Kumar Pandey**  
Backend Engineer · Java Developer · Software Engineer

*"Building scalable software, one project at a time."*

[![GitHub](https://img.shields.io/badge/GitHub-aryankpandey-181717?style=flat&logo=github)](https://github.com/aryankpandey)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aryankpandey-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/aryankpandey/)
[![Portfolio](https://img.shields.io/badge/Portfolio-aryan--kumar--pandey.vercel.app-7C3AED?style=flat)](https://aryan-kumar-pandey.vercel.app/)

---

## License

MIT — free to use, modify, and distribute.
