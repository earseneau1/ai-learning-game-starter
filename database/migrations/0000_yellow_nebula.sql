CREATE TYPE "public"."game_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."item_action" AS ENUM('award', 'remove');--> statement-breakpoint
CREATE TYPE "public"."demo_role" AS ENUM('player', 'designer');--> statement-breakpoint
CREATE TYPE "public"."play_status" AS ENUM('active', 'completed', 'abandoned');--> statement-breakpoint
CREATE TABLE "ai_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"character_id" text NOT NULL,
	"scene_id" text NOT NULL,
	"request_hash" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"learning_focus" text NOT NULL,
	"completion_requirements" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"description" text NOT NULL,
	"personality" text NOT NULL,
	"goals" text NOT NULL,
	"relationship" text NOT NULL,
	"initials" text NOT NULL,
	"color" text NOT NULL,
	"opening_dialogue" text NOT NULL,
	"ai_enabled" boolean DEFAULT false NOT NULL,
	"ai_instructions" text,
	"educational_purpose" text NOT NULL,
	"knowledge_boundaries" text NOT NULL,
	"avoid_topics" text NOT NULL,
	"max_ai_interactions" integer DEFAULT 0 NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "choice_effects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"choice_id" text NOT NULL,
	"variable_id" text NOT NULL,
	"amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "choice_item_effects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"choice_id" text NOT NULL,
	"item_id" text NOT NULL,
	"action" "item_action" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "choices" (
	"id" text PRIMARY KEY NOT NULL,
	"decision_id" text NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"consequence" text NOT NULL,
	"feedback" text NOT NULL,
	"next_scene_id" text,
	"required_item_id" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"scene_id" text NOT NULL,
	"prompt" text NOT NULL,
	"context" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decisions_scene_id_unique" UNIQUE("scene_id")
);
--> statement-breakpoint
CREATE TABLE "demo_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"role" "demo_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"role" "demo_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dialogue_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"scene_id" text NOT NULL,
	"character_id" text NOT NULL,
	"text" text NOT NULL,
	"player_response" text,
	"relationship_effect" integer,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ending_conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ending_id" text NOT NULL,
	"variable_id" text,
	"operator" text,
	"value" integer,
	"choice_id" text,
	"item_id" text
);
--> statement-breakpoint
CREATE TABLE "endings" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"title" text NOT NULL,
	"narrative" text NOT NULL,
	"explanation" text NOT NULL,
	"learning_debrief" text NOT NULL,
	"principles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reflection_question" text NOT NULL,
	"replay_suggestion" text NOT NULL,
	"priority" integer NOT NULL,
	"tone" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_variables" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"starting_value" integer NOT NULL,
	"min_value" integer NOT NULL,
	"max_value" integer NOT NULL,
	"icon" text,
	"explanation" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"description" text NOT NULL,
	"learning_objective" text NOT NULL,
	"target_learner" text NOT NULL,
	"setting" text NOT NULL,
	"player_role" text NOT NULL,
	"opening_story" text NOT NULL,
	"instructions" text NOT NULL,
	"estimated_play_time" text NOT NULL,
	"status" "game_status" DEFAULT 'draft' NOT NULL,
	"theme" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"icon" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "play_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"current_scene_id" text,
	"status" "play_status" DEFAULT 'active' NOT NULL,
	"ending_id" text,
	"ai_interaction_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "player_inventory" (
	"session_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_inventory_session_id_item_id_pk" PRIMARY KEY("session_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "player_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"scene_id" text NOT NULL,
	"choice_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_variable_state" (
	"session_id" uuid NOT NULL,
	"variable_id" text NOT NULL,
	"value" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_variable_state_session_id_variable_id_pk" PRIMARY KEY("session_id","variable_id")
);
--> statement-breakpoint
CREATE TABLE "scene_characters" (
	"scene_id" text NOT NULL,
	"character_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "scene_characters_scene_id_character_id_pk" PRIMARY KEY("scene_id","character_id")
);
--> statement-breakpoint
CREATE TABLE "scenes" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"narrative" text NOT NULL,
	"objective" text NOT NULL,
	"learning_focus" text NOT NULL,
	"ai_character_id" text,
	"ai_prompt" text,
	"next_scene_id" text,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_session_id_play_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."play_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_interactions" ADD CONSTRAINT "ai_interactions_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choice_effects" ADD CONSTRAINT "choice_effects_choice_id_choices_id_fk" FOREIGN KEY ("choice_id") REFERENCES "public"."choices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choice_effects" ADD CONSTRAINT "choice_effects_variable_id_game_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."game_variables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choice_item_effects" ADD CONSTRAINT "choice_item_effects_choice_id_choices_id_fk" FOREIGN KEY ("choice_id") REFERENCES "public"."choices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choice_item_effects" ADD CONSTRAINT "choice_item_effects_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_decision_id_decisions_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogue_lines" ADD CONSTRAINT "dialogue_lines_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialogue_lines" ADD CONSTRAINT "dialogue_lines_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ending_conditions" ADD CONSTRAINT "ending_conditions_ending_id_endings_id_fk" FOREIGN KEY ("ending_id") REFERENCES "public"."endings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ending_conditions" ADD CONSTRAINT "ending_conditions_variable_id_game_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."game_variables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ending_conditions" ADD CONSTRAINT "ending_conditions_choice_id_choices_id_fk" FOREIGN KEY ("choice_id") REFERENCES "public"."choices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ending_conditions" ADD CONSTRAINT "ending_conditions_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endings" ADD CONSTRAINT "endings_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_variables" ADD CONSTRAINT "game_variables_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_current_scene_id_scenes_id_fk" FOREIGN KEY ("current_scene_id") REFERENCES "public"."scenes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_ending_id_endings_id_fk" FOREIGN KEY ("ending_id") REFERENCES "public"."endings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_inventory" ADD CONSTRAINT "player_inventory_session_id_play_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."play_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_inventory" ADD CONSTRAINT "player_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_responses" ADD CONSTRAINT "player_responses_session_id_play_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."play_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_responses" ADD CONSTRAINT "player_responses_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_responses" ADD CONSTRAINT "player_responses_choice_id_choices_id_fk" FOREIGN KEY ("choice_id") REFERENCES "public"."choices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_variable_state" ADD CONSTRAINT "player_variable_state_session_id_play_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."play_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_variable_state" ADD CONSTRAINT "player_variable_state_variable_id_game_variables_id_fk" FOREIGN KEY ("variable_id") REFERENCES "public"."game_variables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scene_characters" ADD CONSTRAINT "scene_characters_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scene_characters" ADD CONSTRAINT "scene_characters_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_ai_character_id_characters_id_fk" FOREIGN KEY ("ai_character_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_interactions_session_created_idx" ON "ai_interactions" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_interactions_request_hash_idx" ON "ai_interactions" USING btree ("session_id","request_hash");--> statement-breakpoint
CREATE INDEX "chapters_game_sort_idx" ON "chapters" USING btree ("game_id","sort_order");--> statement-breakpoint
CREATE INDEX "characters_game_sort_idx" ON "characters" USING btree ("game_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "choice_effect_unique_idx" ON "choice_effects" USING btree ("choice_id","variable_id");--> statement-breakpoint
CREATE UNIQUE INDEX "choice_item_effect_unique_idx" ON "choice_item_effects" USING btree ("choice_id","item_id","action");--> statement-breakpoint
CREATE INDEX "choices_decision_sort_idx" ON "choices" USING btree ("decision_id","sort_order");--> statement-breakpoint
CREATE INDEX "demo_sessions_expires_idx" ON "demo_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "dialogue_scene_sort_idx" ON "dialogue_lines" USING btree ("scene_id","sort_order");--> statement-breakpoint
CREATE INDEX "ending_conditions_ending_idx" ON "ending_conditions" USING btree ("ending_id");--> statement-breakpoint
CREATE INDEX "endings_game_priority_idx" ON "endings" USING btree ("game_id","priority");--> statement-breakpoint
CREATE UNIQUE INDEX "game_variables_game_name_idx" ON "game_variables" USING btree ("game_id","name");--> statement-breakpoint
CREATE INDEX "items_game_sort_idx" ON "inventory_items" USING btree ("game_id","sort_order");--> statement-breakpoint
CREATE INDEX "play_sessions_game_status_idx" ON "play_sessions" USING btree ("game_id","status");--> statement-breakpoint
CREATE INDEX "responses_session_idx" ON "player_responses" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "scenes_chapter_sort_idx" ON "scenes" USING btree ("chapter_id","sort_order");--> statement-breakpoint
CREATE INDEX "scenes_game_idx" ON "scenes" USING btree ("game_id");