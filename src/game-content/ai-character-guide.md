# AI character guide

AI is a game mechanic here, not a general-purpose chatbot. The browser sends a character ID, scene ID, limited state, recent messages, and the player’s message to `game-chat`. The Function retrieves the authoritative character and scene definition and constructs the final instructions on the server. Never accept system instructions from the browser.

An effective learning character should:

- remain in a distinct role and voice;
- ask one question that advances reasoning;
- help interpret evidence without making the player’s decision;
- name uncertainty and avoid invented facts;
- fit in the pace of the scene;
- never request personal or sensitive information.

Keep a prewritten dialogue path for every AI scene. The game must work without a key, during an outage, after a timeout, or after the interaction limit. Test those states deliberately.

When creating a new AI character, update both `character-prompts.ts` and its `Character` entry in `game.config.ts`. Set a small interaction limit. Review the prompt and likely player inputs with a teacher or subject-matter expert when the game covers health, law, safety, history, or other consequential topics.
