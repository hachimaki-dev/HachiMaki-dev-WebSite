# AI Agent Configuration Files

This project includes context files for multiple AI coding assistants.
Each agent reads its own file automatically at the start of a session.

## File → Agent Mapping

| File | Agent(s) | Auto-loaded? |
|---|---|---|
| `CLAUDE.md` | Claude Code, Claude (Anthropic) | ✅ Yes |
| `AGENTS.md` | OpenAI Codex CLI | ✅ Yes |
| `GEMINI.md` | Gemini CLI, Google AI | ✅ Yes |
| `AGENT_MASTER_PROMPT.md` | Any agent (full reference) | Manual load |
| `AGENT_SESSION_PROMPT.md` | Any agent (quick tasks) | Manual load |
| `.cursorrules` | Cursor editor | ✅ Yes |
| `.windsurfrules` | Windsurf / Codeium | ✅ Yes |
| `.clinerules` | Cline / Roo Code | ✅ Yes |
| `.github/copilot-instructions.md` | GitHub Copilot | ✅ Yes |
| `.aider.conf.yml` | Aider | ✅ Yes |

## Key Principles (all agents)

1. **JavaScript only** — no TypeScript
2. **CSS Custom Properties only** — from `src/styles/tokens.css`
3. **No CSS frameworks** — native CSS
4. **Single Supabase client** — from `src/lib/supabase.js`
5. **Always handle** loading, error, and empty states
6. **Migrations are local** — `migrations/` is gitignored

## For New Agents

If you're adding a new AI tool, create its config file in the project root
following the same conventions. The core context is in `AGENT_MASTER_PROMPT.md`.
