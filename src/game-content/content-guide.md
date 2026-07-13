# Game content guide

This folder is the replaceable layer of AI Learning Game Starter. `game.config.ts`, `character-prompts.ts`, and `theme.css` currently describe **Startup Sprint**. They may be rewritten for a different subject without rebuilding the engine, database boundary, role checks, or deployment setup.

## Start here

1. Write one observable learning objective.
2. Define the player role and central tension.
3. Replace the characters. Give each a story job and a learning job.
4. Draft the endings before the scenes. An ending should explain the player’s reasoning, not merely declare success or failure.
5. Build scenes that ask the player to use evidence or manage a genuine tradeoff.
6. Add variable effects and inventory only when they make the reasoning visible.

## Safe to replace

- `game.config.ts`: game, characters, chapters, scenes, choices, variables, evidence, endings
- `character-prompts.ts`: server-authoritative AI character behavior
- `theme.css`: color tokens
- The narrative presentation in `src/styles/global.css`, when the new concept needs a different mood

## Usually preserve

- `src/game-engine`: topic-neutral transitions, endings, and gameplay components
- `src/services`: browser-to-Function access only
- `netlify/functions`: validation, role checks, database access, AI secret handling
- `database`: schema and reproducible migrations
- `netlify.toml`, robots protections, and environment-variable patterns

If the new concept requires a genuinely new mechanic, extend the model in `src/types/game.ts` and engine deliberately. Do not hard-code the new subject into reusable components.

## Content quality check

- Can two reasonable choices have different tradeoffs?
- Does feedback name what was learned and what remains unknown?
- Are consequences explained rather than scored as simply right/wrong?
- Does inventory represent useful evidence, tools, or clues?
- Can the final debrief trace the ending to prior decisions?
- Has a teacher or subject-matter expert reviewed factual claims?
