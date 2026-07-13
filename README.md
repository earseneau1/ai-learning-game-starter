# AI Learning Game Starter

A complete React + TypeScript starter for turning a subject into a short, story-driven learning game. It includes a reusable game engine, a polished entrepreneurship demonstration, an AI character, PostgreSQL persistence, a friendly Game Designer, simulated roles, and Netlify deployment configuration.

> **Classroom demo:** authentication and permissions are simulated. Do not enter personal, confidential, or sensitive information. The app contains no analytics. Its noindex settings discourage search indexing but do not make a deployment private.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/earseneau1/ai-learning-game-starter)

Clicking this button creates a student-owned copy of the public repository and a connected Netlify site. Students need a free GitHub account first; the easiest path is to choose **Sign up with GitHub** on Netlify.

## Student quick start

1. Use GitHub’s **Use this template** (or fork/copy the repository).
2. Run `npm install`, copy `.env.example` to `.env`, and follow Database setup below.
3. Run `npm run dev` and play Startup Sprint once as a Player.
4. Read [`STUDENT_PROMPT.md`](./STUDENT_PROMPT.md), [`src/game-content/content-guide.md`](./src/game-content/content-guide.md), and [`src/game-content/ai-character-guide.md`](./src/game-content/ai-character-guide.md).
5. Give the filled-in student prompt to your coding agent. Have it modify `src/game-content` first and preserve server-side secrets, roles, migrations, and Netlify configuration.
6. Ask a teacher or subject-matter expert to review the educational content before sharing it.

## What Startup Sprint demonstrates

Startup Sprint is a five-scene, 5–8 minute entrepreneurship game. The player investigates a peer-tutoring idea with Jordan, interviews Maya, optionally consults AI mentor Professor Rivera, and answers Alex’s final challenge. Four variables deliberately separate team confidence from customer evidence. Choices can award evidence, branch around a scene, and lead to an evidence-based next step, premature build, popular-but-unproven outcome, productive pivot, disciplined stop, or mixed outcome.

The demo is content, not engine code. Entrepreneurship-specific material lives in `src/game-content/game.config.ts`, seed data derived from it, and the character prompt file.

## Technology

- React 19, strict TypeScript, Vite, React Router
- Netlify Functions and Netlify Database-compatible PostgreSQL
- Drizzle ORM and reproducible SQL migrations
- Zod request validation
- OpenAI JavaScript SDK, used only in a Netlify Function
- Plain responsive CSS with keyboard focus, reduced-motion support, and semantic HTML

## Repository map

```text
src/game-engine/       Topic-neutral gameplay and transition logic
src/game-content/      Replaceable Startup Sprint content, prompts, theme, guides
src/designer/          Game Designer interface
src/services/          Browser calls to Netlify Functions
src/types/             Shared strict domain model
netlify/functions/     Role-protected database and OpenAI operations
database/              Drizzle schema, SQL migrations, seed/reset scripts
tests/                 Engine and interface checks
```

React never accesses PostgreSQL or OpenAI. Browser requests go through Functions. `game-chat` looks up the authoritative character and scene configuration; the browser cannot provide Professor Rivera’s instructions.

## Local setup

Requirements: Node.js 20 or newer, npm, and PostgreSQL (local or hosted).

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:8888`. `netlify dev` runs Vite and Functions together so cookies and environment variables behave like production. `npm run dev:vite` is a UI-only preview; server saves and AI calls intentionally fall back.

Useful commands:

```bash
npm run typecheck
npm test
npm run test:integration # requires DATABASE_URL and seeded local database
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:reset
```

## Database setup

Create an empty PostgreSQL database and set its connection string as `DATABASE_URL`. Netlify Database exposes a PostgreSQL URL through the Netlify environment; use that value in deployed Functions. Do not prefix it with `VITE_`.

- `npm run db:generate` creates SQL from `database/schema.ts` after a schema change.
- `npm run db:migrate` applies committed migrations in order.
- `npm run db:seed` replaces only the `startup-sprint` game with the canonical definition.
- `npm run db:reset` does the same from the command line and removes its play sessions by cascade.

The schema includes games, characters, chapters, scenes, scene-character links, dialogue, decisions, choices, variable and item effects, endings and conditions, play state, responses, inventory, and minimal AI request audit rows. Full conversations are not stored.

## OpenAI configuration

Set these in `.env` locally and in **Netlify → Site configuration → Environment variables** for deployment:

```text
OPENAI_API_KEY=your-key
OPENAI_MODEL=a-model-available-to-your-project
MAX_AI_INTERACTIONS_PER_SESSION=4
MAX_AI_INPUT_CHARACTERS=1500
MAX_AI_OUTPUT_TOKENS=500
AI_REQUEST_TIMEOUT_MS=15000
```

The key must remain server-side because browser code and browser network responses can be inspected by every visitor. Never place it in a `VITE_` variable, commit it, log it, put it in a URL, or store it in the database.

`game-chat` verifies the simulated role, game, character, scene, session, rate window, duplicate hash, and interaction count. It limits input, history, output, and request time. Missing configuration returns a prewritten coaching prompt; failures and limits also leave the rest of the game playable.

## Simulated roles

The entry screen creates a random, HttpOnly demo-session cookie whose hash and selected role are stored server-side for eight hours. The React router hides the other role, and each mutation Function independently checks the cookie. A Player calling `designer-content` or `reset-demo` manually receives `403`.

This is **not production authentication**. It has no identity proof, password, OAuth, account recovery, or private user boundary. Do not use it for grades, private student data, or access to sensitive content.

## Game Designer and reset

The studio provides settings plus create/edit/delete/reorder workflows for characters, chapters, scenes, dialogue, decisions, choices, variables, evidence, and endings. Friendly forms cover common edits; complex effects and conditions remain readable in `game.config.ts` rather than an elaborate visual language.

**Reset Startup Sprint** requires a confirmation and a Designer server role. It removes that game (including its sessions by foreign-key cascade) and reloads the canonical seed. It does not alter infrastructure or unrelated games.

## Create a new learning game

Begin in `src/game-content/game.config.ts`: replace the game promise, characters, variables, evidence, scenes, choices, effects, and endings. Then update `character-prompts.ts` and theme tokens. Keep IDs stable and human-readable. Run migrations only if the reusable model itself changes, then update seed and tests together.

A strong learning loop is: encounter a situation → interpret character/evidence → consult a scaffold when useful → choose under uncertainty → see consequences and educational explanation → carry changed state forward → debrief the full path.

## Deploy to Netlify

1. Push the repository to GitHub and import it into Netlify.
2. Netlify reads `netlify.toml`: build `npm run build`, publish `dist`, bundle Functions, and rewrite SPA routes.
3. Create/attach Netlify Database and set `DATABASE_URL`.
4. Set the OpenAI variables above. The game still works without them.
5. Run `npm run db:migrate` and `npm run db:seed` against the deployment database from a trusted environment.
6. Deploy and verify `/`, `/play`, `/designer`, a Function response, and `X-Robots-Tag`.

`index.html`, `public/robots.txt`, and Netlify response headers specify `noindex, nofollow, noarchive, nosnippet`. Search engines may ignore directives, and anyone with the URL may still access the demo. Do not treat this as privacy or security.

## Safety and privacy

- Use fictional seed people and never request real student details.
- Keep AI prompts and keys server-side.
- Do not add hidden analytics, fingerprinting, or surveillance.
- Do not log full conversations by default; this starter records only count/status/hash metadata.
- Keep the prewritten path usable when AI is off.
- Review new content for accuracy, age suitability, bias, and accessibility.
- Never ask for addresses, contact details, passwords, health data, or other sensitive information.

## Troubleshooting

- **Database connection failed:** verify `DATABASE_URL`, network access, and SSL requirements. Run `npm run db:migrate`.
- **Startup Sprint is missing:** run `npm run db:seed` against the same database used by `netlify dev`.
- **AI mentor shows fallback:** check both `OPENAI_API_KEY` and `OPENAI_MODEL`, account model access, and Function logs. No key is required for the rest of the game.
- **403 from a Function:** return to `/`, switch roles, and let the server create a fresh demo cookie. UI-only Vite mode cannot create one.
- **A scene transition fails:** verify referenced IDs in `game.config.ts` and run `npm test`.
- **Designer save says preview only:** the Function/database is unavailable; run through `netlify dev` after migrations and seed.
- **Deep links show 404:** deploy with `netlify.toml`; its SPA rewrite serves `index.html`.
- **Raw database error:** server responses intentionally hide it. Inspect local Function logs without printing credentials or conversation text.

## Verification before sharing

Run `npm run typecheck && npm test && npm run build`. Play all five scenes, try several ending strategies, use both Rivera scenes, exhaust the AI limit, remove the AI key, exercise CRUD and reorder, try Player requests against Designer endpoints, reset the demo, check mobile and keyboard navigation, and inspect the built browser assets for secrets.
