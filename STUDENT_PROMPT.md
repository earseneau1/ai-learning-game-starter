# Transform this starter into your learning game

Copy the prompt below into your AI coding agent, fill in the brackets, and attach any teacher-approved references.

---

I realize this repository is an existing starter shell for an AI-powered learning game.

Before changing anything, inspect the repository and understand how the current game engine, characters, scenes, database, AI conversation, roles, and deployment configuration work.

I want to transform it into a game for learning:

**Subject:**  
[ENTER SUBJECT]

**Target learner:**  
[ENTER WHO THE GAME IS FOR]

**Learning objective:**  
[DESCRIBE WHAT THE PLAYER SHOULD UNDERSTAND OR BE ABLE TO DO]

**What I imagine happening:**  
[DESCRIBE THE SETTING, PLAYER ROLE, CHARACTERS, CHALLENGES, DECISIONS, AI INTERACTION, AND HOW THE GAME ENDS.]

Use the existing starter shell to simulate this idea as effectively as possible.

Preserve the existing:

- React and strict TypeScript architecture
- Netlify configuration
- PostgreSQL, Drizzle migrations, seed, and CRUD system
- OpenAI SDK integration and server-side API-key handling
- simulated Player and Game Designer roles and server role checks
- noindex protections
- responsive, accessible layout
- deployment workflow

Do not rebuild working infrastructure unnecessarily. Modify game content and presentation first. Extend the reusable engine only when the proposed game genuinely requires a new mechanic. Never put database credentials, AI keys, or system prompts in browser code.

Adapt the existing characters, scenes, dialogue, variables, choices, consequences, AI conversation, branching, and endings to support my concept. The finished game should include a clear player role, setting, central challenge, distinct characters, an AI learning character, meaningful decisions and consequences, educational feedback, progression, at least two outcomes, and a final debrief.

The AI character should contribute to learning. It should not simply answer questions, reveal an ideal choice, or complete the game for the player. Keep a prewritten fallback path.

Before modifying the application, provide:

1. The game concept
2. The learning objective
3. The player’s role
4. The setting
5. The major characters
6. The AI character’s role
7. The main game loop
8. The variables or resources being tracked
9. The major scenes
10. The possible endings
11. The existing features that will be reused
12. The files that need to change

When my idea is incomplete, make reasonable creative decisions that support the learning objective. Use accurate educational content. Identify anything that should be reviewed by a teacher or subject-matter expert.

After implementation:

1. Run the TypeScript check and production build; fix every error.
2. Run the automated tests.
3. Test a complete playthrough and multiple endings.
4. Test both AI scenes, missing-key fallback, timeout, and interaction limit.
5. Test Game Designer create, edit, delete, and reorder operations.
6. Confirm Player users cannot open Designer routes or call Designer mutations.
7. Confirm reset restores only this game’s seed content.
8. Confirm the main flow works by keyboard and at mobile widths.
9. Confirm no AI key, internal prompt, or database credential reaches the browser.
10. Confirm Netlify deployment, headers, and SPA routes remain configured.

---
