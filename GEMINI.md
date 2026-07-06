# GEMINI.md — Project context for Gemini CLI

## Project Overview

**hachimaki-dev** — Personal website for a single admin user.
Includes: landing page, blog, portfolio, and private admin panel.

**Stack:** React 18 + Vite + CSS nativo (Custom Properties) + Supabase (Auth + PostgreSQL)
**Deploy:** GitHub Pages via GitHub Actions

## Architecture

```
src/
├── components/
│   ├── ui/              # Button, Input, Card, Modal, Toast, PageLoader, EmptyState, Badge, Countdown, NewsletterInvite
│   └── layout/          # Header, Footer, PageWrapper, AdminLayout
├── pages/
│   ├── public/          # Home, Blog, BlogPost, Portfolio, ProjectDetail, PhotosPage, VisitantesPage, ContactPage
│   │   ├── Stream/      # StreamRoomPage, CasterPage, ViewerPage, StreamChat
│   │   ├── Photos/      # PhotosPage
│   │   └── Visitantes/  # VisitantesPage
│   │   └── Nexus/       # NexusPage
│   └── admin/           # Dashboard, AdminBlog, BlogEditor, AdminPortfolio, ProjectEditor, Settings, AdminPhotosPage, AdminContactPage, AdminSubscriptionsPage
│       └── Streams/     # AdminStreamsPage
│       └── Photos/      # AdminPhotosPage
├── features/
│   ├── auth/            # useAuth hook, AuthGuard component, LoginPage
│   ├── blog/            # useBlogPosts, useBlogTags, useBlogSeries, useBlogAdmin, useBlogTagsAdmin, useBlogSeriesAdmin
│   ├── portfolio/       # useProjects (public reads), useProjectsAdmin (CRUD)
│   ├── visitor/         # useVisitorTracker (logs actions), useVisitorLogs (live sync)
│   ├── contact/         # useContact (public), useContactAdmin (CRUD)
│   ├── subscriptions/   # useSubscriptions (public), useSubscriptionsAdmin (CRUD)
│   ├── friends/         # useFriendLinks (public), useFriendLinksAdmin (CRUD)
│   ├── nexus/           # useNexusLibrary, fileSystemDb, p2pDataChannel, nexusSignaling
│   └── streaming/
│       ├── lib/         # signalingChannel, peerManager, viewerPeer, signalingCleanup, streamLogger
│       └── hooks/       # useMediaDevices, useMediaRecorder, useRooms, usePresence, usePublicLiveStreams, useRecordingUpload, useChat, useSpeechTranscription
├── hooks/               # useLocalStorage, useMediaQuery
├── utils/               # formatDate, slugify, truncate
├── lib/
│   ├── supabase.js      # Singleton client — ALWAYS import from here
│   └── constants.js     # Routes, table names, config
├── styles/
│   ├── tokens.css       # ALL design tokens (colors, typography, spacing, etc.)
│   ├── reset.css        # Modern CSS reset
│   ├── global.css       # Base styles + imports
│   └── animations.css   # Keyframes + utility animation classes
├── router.jsx           # React Router v6 — lazy loaded pages
└── main.jsx             # Entry point
```

## Strict Rules

1. **JavaScript only** — No TypeScript files (`.ts`, `.tsx`)
2. **CSS variables only** — All visual values from `src/styles/tokens.css`, never hardcoded
3. **No CSS frameworks** — No Tailwind, Bootstrap, Chakra, etc.
4. **Single Supabase instance** — Import from `src/lib/supabase.js` only
5. **No localStorage for data** — Only Supabase for business data
6. **Handle all states** — Loading, error, and empty states in every async component
7. **Toast for feedback** — Use `useToast()` from `src/components/blog/           → BlogShare, BlogReactions, BlogComments, MarkdownRenderer, TableOfContents, TagPills, PostMeta, SeriesNav
src/components/ui/Toast.jsx`
8. **Migrations are local** — `migrations/` is in `.gitignore`, never commit
9. **No `console.log`** — Remove debug logs before finishing
10. **No `!important`** — If needed, it's an architectural problem

## Database (Supabase)

| Table | Key Fields | RLS |
|---|---|---|
| `profiles` | `display_name`, `bio`, `avatar_url` | Public read, auth write |
| `blog_posts` | `slug`, `title`, `content`, `published`, `published_at`, `reading_time_min`, `content_format`, `series_id`, `series_order` | Published = public read, auth write |
| `blog_tags` | `name`, `slug`, `color` | Public read, auth write |
| `blog_reactions` | `post_id`, `visitor_id`, `reaction_type` | Public read/insert |
| `blog_comments` | `post_id`, `visitor_id`, `alias`, `content` | Public read/insert |
| `blog_post_tags` | `post_id`, `tag_id` | Public read, auth write |
| `blog_series` | `title`, `slug`, `description` | Public read, auth write |
| `projects` | `slug`, `title`, `tags[]`, `featured`, `published`, `sort_order` | Published = public read, auth write |
| `rooms` | `slug`, `title`, `caster_id`, `status`, `is_private` | Public read, auth write |
| `room_members` | `room_id`, `user_id`, `role` | Public read, open insert |
| `stream_state` | `room_id`, `is_live`, `viewer_count` | Public read, auth write |
| `signaling_messages` | `room_id`, `sender_id`, `type`, `payload` | Public read, open insert, auth delete |
| `recordings` | `room_id`, `caster_id`, `file_path`, `duration_ms` | Public read, auth write |
| `chat_messages` | `room_id`, `sender_id`, `display_name`, `message` | Public read, open insert, auth delete |
| `photos` | `storage_path`, `width`, `height` | Public read, auth write |
| `visitor_logs` | `session_id`, `visitor_id`, `ip`, `country`, `city`, `browser`, `os`, `action_type`, `action_details`, `canvas_fingerprint`, `gpu_model`, `visit_count` | Public read, open insert |
| `contact_messages` | `name`, `email`, `subject`, `message`, `is_read` | Public insert, auth select/update/delete |
| `subscriptions` | `email`, `subscribe_streams`, `subscribe_newsletter` | Public insert (via RPC), auth all |
| `stream_transcriptions` | `room_id`, `text`, `created_at` | Public read, auth insert/delete |
| `friend_links` | `name`, `url`, `image_url`, `animation_type`, `sort_order` | Public read, auth all |
| `peer_libraries` | `visitor_id`, `alias`, `files`, `is_online` | Public read/insert/update |
| `peer_alerts` | `id`, `sender_id`, `receiver_id`, `file_id`, `status` | Public read/insert/update/delete |
| `p2p_signaling` | `id`, `sender_id`, `target_id`, `type`, `payload` | Public read/insert/delete |

Schema changes → create `migrations/NNN_description.sql`, update `migrations/README.md`

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `BlogCard.jsx` |
| Hooks | camelCase with `use` | `useBlogPosts.js` |
| Utils | camelCase | `formatDate.js` |
| CSS classes | kebab-case | `.blog-card__title` |
| CSS variables | `--prefix-name` | `--color-accent` |
| SQL migrations | `NNN_description` | `001_init_schema.sql` |

## Environment

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Build & Dev

```bash
npm run dev      # Start development server
npm run build    # Production build (must complete with 0 errors)
npm run preview  # Preview production build locally
npm test         # Run unit tests via Vitest
```


## UI / UX Guidelines (Retro VHS / Surveillance System)

1. **Aesthetic Identity**: The public-facing site follows a Retro VHS / Surveillance / Cyberpunk aesthetic.
2. **Key Elements**:
   - **Monospace Fonts**: Use var(--font-mono) for metadata, badges, system logs, dates, and IDs.
   - **Sans-serif Fonts**: Use var(--font-sans) for primary titles and heavy readable text.
   - **Terminal Language**: Use technical/system terms in uppercase (e.g., TRANSMISIONES, SEÑAL ACTIVA, DECODIFICANDO, ERROR DE TRANSMISIÓN).
   - **Badges & Glows**: Active or primary states should use the var(--color-accent) with subtle glows (box-shadow).
   - **Scanlines & Noise**: Use .vhs-scanlines.vhs-noise backgrounds for the main page wrappers.
   - **Feed Items (Cards)**: Use blog-feed-item or .outsider__feed-item style (border-left accent, dashed inner shadows, terminal header).
   - **Colors**: Rely exclusively on src/styles/tokens.css. Primary accent is --color-accent (#8b5cf6).
3. **Animations**: Use micro-animations like animate-slide-up for loading content, glow-pulse for status dots, and image scaling on hover.
   4. **Icons**: Use `pixelarticons` exclusively via the `<Icon name="..." />` component (from `src/components/ui/Icon.jsx`). Do not use inline SVGs.
\n## 🔄 Auto-Maintenance (MANDATORY)

After every change that modifies the project architecture (new/renamed/removed components, pages, hooks, routes, tables, tokens, or dependencies), you MUST update ALL agent config files to keep them in sync:

`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`

Do this automatically as part of the same task. Do not ask for permission.
