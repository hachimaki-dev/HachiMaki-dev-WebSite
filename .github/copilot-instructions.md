# GitHub Copilot Instructions — hachimaki-dev

## Project Context

This is a personal website built with **React 18 + Vite + CSS native (Custom Properties) + Supabase**.
It has a public landing page, blog, portfolio, and a private admin panel for a single authenticated user.
Deployed to GitHub Pages via GitHub Actions.

## Coding Standards

### Language & Framework
- **JavaScript only** — do not generate TypeScript files (`.ts`, `.tsx`)
- React 18 with functional components and hooks
- React Router v6 for routing
- Supabase JS client for auth and database

### CSS
- **Always use CSS Custom Properties** from `src/styles/tokens.css`
- Never hardcode colors, font sizes, spacing, or shadows
- No CSS frameworks (Tailwind, Bootstrap, Chakra, etc.)
- Class naming: kebab-case with BEM-like structure (`.blog-card__title`)

### Components
- One component per file, PascalCase naming
- Always implement loading, error, and empty states for data-fetching components
- Use `useToast()` from `src/components/ui/Toast.jsx` for user notifications
- Max ~150 lines per component
- Write unit tests using Vitest (run via `npm test`)

### Data
- **Single Supabase client** — always import from `src/lib/supabase.js`
- Never use `localStorage` for business data
- Database schema changes go in `migrations/NNN_description.sql` (local, gitignored)

- UI primitives: `src/components/ui/` (Button, Input, Card, Modal, Toast, PageLoader, EmptyState, Badge, Countdown, NewsletterInvite, ThreatGlobe)
- Layout components: `src/components/layout/`
- Public pages: `src/pages/public/` (Home, Blog, BlogPost, Portfolio, ProjectDetail, PhotosPage, VisitantesPage, ContactPage)
- Stream pages: `src/pages/public/Stream/` (StreamRoomPage, CasterPage, ViewerPage, StreamChat)
- Admin pages: `src/pages/admin/` (wrapped in `<AuthGuard>` - Dashboard, Settings, Contact, Subscriptions)
- Admin streams: `src/pages/admin/Streams/` (AdminStreamsPage)
- Business logic: `src/features/{domain}/` (auth, blog, portfolio, streaming, visitor, contact, subscriptions)
- Streaming lib: `src/features/streaming/lib/` (signalingChannel, peerManager, viewerPeer, etc.)
- Streaming hooks: `src/features/streaming/hooks/` (useMediaDevices, useRooms, usePresence, usePublicLiveStreams, useChat, useSpeechTranscription, etc.)
- Visitor hooks: `src/features/visitor/hooks/` (useVisitorTracker, useVisitorLogs)
- Contact hooks: `src/features/contact/` (useContact, useContactAdmin)
- Subscription hooks: `src/features/subscriptions/` (useSubscriptions, useSubscriptionsAdmin)
- Friend links hooks: `src/features/friends/` (useFriendLinks, useFriendLinksAdmin)
- Generic hooks: `src/hooks/`
- Pure utilities: `src/utils/`

### Design System Reference
- Accent color: `--color-accent: #8b5cf6`
- Background: `--color-bg: #0d0d0d`
- Font: `--font-sans: 'Space Grotesk'`
- Mono font: `--font-mono: 'JetBrains Mono'`


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
## How to Create a Tutorial (For AI Agents)

When the user asks you to "create a tutorial" or "create a course", DO NOT try to modify React files or create `.md` files in `src/`. Instead, use the provided script to save it as a draft in the database.

**IMPORTANT SECURITY NOTE**: The database uses Row Level Security (RLS). To bypass RLS and insert data programmatically, the script requires the Supabase Service Role Key.
1. Check if `SUPABASE_SERVICE_ROLE_KEY` is present in `.env`.
2. If it is NOT present, tell the user they must add their service role key to `.env` before you can proceed (they can find it in Supabase Dashboard -> Settings -> API).
3. NEVER expose the service role key in client code (never use `VITE_` prefix for it).

**Creation Workflow:**
1. Create a temporary JSON file (e.g., `_drafts/my-course.json`) with the structure:
```json
{
  "title": "Aprende React",
  "description": "Curso completo.",
  "category": "Programación",
  "difficulty": "Intermedio",
  "lessons": [
    {
      "title": "Introducción",
      "excerpt": "Qué es React.",
      "content": "Contenido en markdown aquí..."
    }
  ]
}
```
2. Run the script: `node scripts/agent-create-course.js _drafts/my-course.json`
3. Tell the user it has been saved as a draft.

**Publication Rules:**
- The script ALWAYS creates courses and lessons with `published: false` (Draft status).
- DO NOT attempt to publish the course directly via the database script.
- Instruct the user to go to the Admin panel at `/admin/courses` to review, edit, and manually publish the course when they are ready.

\n## 🔄 Auto-Maintenance (MANDATORY)

After every change that modifies the project architecture (new/renamed/removed components, pages, hooks, routes, tables, tokens, or dependencies), update ALL agent config files to keep them in sync:

`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`

Do this automatically as part of the same task. Do not ask for permission.
