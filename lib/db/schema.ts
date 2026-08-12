import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";


// ---------------------------------------------------------------------------
// Better Auth Schema
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: "date" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }),
    updatedAt: timestamp("updated_at", { mode: "date" }),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// ---------------------------------------------------------------------------
// PromptForge Application Schema
// ---------------------------------------------------------------------------

export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  themePreference: text("theme_preference").notNull().default("system"), // 'system' | 'light' | 'dark'
  defaultProvider: text("default_provider").notNull().default("openai"),
  defaultModel: text("default_model").notNull().default("gpt-4o-mini"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const prompts = pgTable(
  "prompts",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Untitled prompt"),
    content: text("content").notNull().default(""),
    variableDefaults: jsonb("variable_defaults")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    modelConfig: jsonb("model_config")
      .$type<{
        provider?: string;
        model?: string;
        temperature?: number;
        maxTokens?: number;
      }>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("prompts_owner_id_idx").on(table.ownerId),
    index("prompts_updated_at_idx").on(table.updatedAt),
  ]
);

export const promptVersions = pgTable(
  "prompt_versions",
  {
    id: text("id").primaryKey(),
    promptId: text("prompt_id")
      .notNull()
      .references(() => prompts.id, { onDelete: "cascade" }),
    label: text("label"),
    snapshot: jsonb("snapshot")
      .$type<{
        title: string;
        content: string;
        variableDefaults: Record<string, string>;
        modelConfig: {
          provider?: string;
          model?: string;
          temperature?: number;
          maxTokens?: number;
        };
      }>()
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("prompt_versions_prompt_id_idx").on(table.promptId),
    index("prompt_versions_created_at_idx").on(table.createdAt),
  ]
);

export const executions = pgTable(
  "executions",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    promptId: text("prompt_id").references(() => prompts.id, {
      onDelete: "set null",
    }),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    status: text("status").notNull(), // 'pending' | 'streaming' | 'completed' | 'cancelled' | 'failed'
    durationMs: integer("duration_ms"),
    usage: jsonb("usage").$type<{
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
      estimatedCost?: number;
    }>(),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("executions_owner_id_idx").on(table.ownerId),
    index("executions_prompt_id_idx").on(table.promptId),
  ]
);

// Foreign keys are enforced directly via .references() on the tables above.
