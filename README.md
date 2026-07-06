# HachiMaki-dev 🛸

> Personal website — Landing · Blog · Portfolio · Streaming · Admin Panel

Built with **React 19 + Vite + CSS nativo + Supabase**. Deployed to GitHub Pages.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

## Architecture

```
src/
├── components/
│   ├── ui/             → Button, Input, Card, Modal, Toast, ErrorFallback, ...
│   ├── layout/         → Header, Footer, PageWrapper, AdminLayout
│   └── blog/           → MarkdownRenderer, TagPills, SeriesNav, ...
├── pages/
│   ├── public/         → Home, Blog, Portfolio, Photos, Visitantes, Contact
│   │   └── Stream/     → WebRTC streaming (CasterPage, ViewerPage, Chat)
│   └── admin/          → Dashboard, CRUD editors (behind AuthGuard)
├── features/           → Domain logic (auth, blog, portfolio, streaming, visitor, ...)
├── hooks/              → Generic hooks (useMediaQuery, useLocalStorage)
├── utils/              → Pure functions (formatDate, slugify, parseUserAgent)
├── lib/                → supabase.js (singleton), constants.js
├── styles/             → tokens.css, global.css, animations.css
└── router.jsx          → React Router v7 with lazy loading + error boundaries
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router 7 |
| Styles | CSS nativo + Custom Properties (tokens.css) |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| Streaming | WebRTC (peer-to-peer via Supabase Realtime signaling) |
| Deploy | GitHub Pages via GitHub Actions |
| Icons | pixelarticons (via `<Icon />` component) |

## Design System

The public site follows a **Retro VHS / Surveillance / Cyberpunk** aesthetic:
- Dark theme with `--color-accent: #8b5cf6` (violet)
- Monospace font (`JetBrains Mono`) for system elements
- Sans-serif font (`Space Grotesk`) for headings
- Scanlines, glitch effects, terminal language

All design tokens live in [`src/styles/tokens.css`](src/styles/tokens.css).

## Environment

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## AI Agent Config

This project includes context files for multiple AI coding assistants.
See [`.ai/README.md`](.ai/README.md) for the full mapping.

## License

Private project — © hachimaki-dev
