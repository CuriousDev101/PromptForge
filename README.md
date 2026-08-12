# PromptForge

**An AI prompt engineering workbench for creating, testing, comparing, versioning, and exporting LLM prompts.**

PromptForge is a web application designed to streamline prompt engineering. It provides a dedicated workspace for writing system prompts, managing variables, testing prompts against AI models, comparing model outputs, and maintaining prompt versions.

Built with Next.js, React, TypeScript, Drizzle ORM, Neon PostgreSQL, and Better Auth.

## Features

### Prompt Playground

- Write and edit system prompts in a code-editor interface.
- Preview prompts with variables substituted.
- Configure model parameters for prompt execution.
- Execute prompts against supported AI models.
- Stream model responses as they are generated.
- Compare responses from two model configurations.

### Prompt Management

- Create, edit, and organize saved prompts.
- Store prompt content and variable defaults.
- Save model configurations alongside prompts.
- Access and manage saved prompts from the prompt library.

### Version History

- Maintain versions of saved prompts.
- Inspect previous versions.
- Restore an earlier prompt version.

### AI Model Integration

- Integrate with supported AI providers.
- Configure model execution settings.
- Stream generated responses.
- Compare outputs from different model configurations.

### Authentication and User Preferences

- User authentication powered by Better Auth.
- Session-based access to protected workspace pages.
- User-specific prompt management.
- Persistent user preferences.

### Developer Experience

- TypeScript for type safety.
- Tailwind CSS 4 for styling.
- CodeMirror for prompt editing.
- TanStack Query for server-state management.
- Zustand for playground state management.
- Drizzle ORM for database access and migrations.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Next.js 16 | Application framework and routing |
| React 19 | User interface |
| TypeScript | Static typing |
| Tailwind CSS 4 | Styling |
| CodeMirror 6 | Prompt editor |
| Vercel AI SDK | AI model integration and streaming |
| Anthropic AI SDK | Anthropic provider integration |
| OpenAI AI SDK | OpenAI provider integration |
| Neon PostgreSQL | Serverless PostgreSQL database |
| Drizzle ORM | Database queries and schema management |
| Better Auth | Authentication and sessions |
| TanStack Query | Server-state management |
| Zustand | Client-side state management |
| Zod | Schema validation |
| React Hook Form | Form management |
| Sonner | Toast notifications |
| Lucide React | Icons |
| pnpm | Package management |

## Prerequisites

Before installing PromptForge, ensure you have:

- [Node.js](<https://nodejs.org/>) installed.
- [pnpm](<https://pnpm.io/>) installed.
- A PostgreSQL database, preferably through [Neon](<https://neon.tech/>).
- An authentication secret for Better Auth.
- API keys for the AI providers you intend to use.

AI provider credentials are required for actual model execution, but not necessarily for developing the interface or working on unrelated features.

## Getting Started

### 1\. Clone the Repository

bash

```
git clone <your-repository-url>
cd promptforge
```

If you already have the project locally, navigate to its root directory instead.

### 2\. Install Dependencies

bash

```
pnpm install
```

### 3\. Configure Environment Variables

Create a `.env.local` file in the project root:

env

```
# Database
DATABASE_URL="your-neon-postgresql-connection-string"

# Better Auth
BETTER_AUTH_SECRET="your-generated-secret"
BETTER_AUTH_URL="http://localhost:3000"

# AI Providers
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
```

Replace the example database connection string with your actual Neon PostgreSQL connection string.

Generate a secure authentication secret using:

bash

```
openssl rand -base64 32
```

Copy the generated value into `BETTER_AUTH_SECRET`.

**Important:**

- Keep `.env.local` out of version control.
- Never expose AI provider API keys in client-side code.
- Configure only the AI provider keys you need.
- Confirm that the environment variable names match those referenced by the application.
- If the application uses different variable names in its AI execution code, update this example accordingly.

### 4\. Configure the Database

PromptForge uses Drizzle ORM with PostgreSQL.

Review the database configuration in:

- `drizzle.config.ts`
- `lib/db/index.ts`
- `lib/db/schema.ts`

Generate migrations when the schema changes:

bash

```
pnpm exec drizzle-kit generate
```

Apply migrations to the configured database:

bash

```
pnpm exec drizzle-kit migrate
```

Ensure your database connection is configured before running migrations.

### 5\. Start the Development Server

bash

```
pnpm dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

The following commands are available through pnpm:

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint, if configured in `package.json` |
| `pnpm exec tsc --noEmit` | Check TypeScript types |
| `pnpm exec drizzle-kit generate` | Generate database migrations |
| `pnpm exec drizzle-kit migrate` | Apply database migrations |
| `pnpm exec drizzle-kit studio` | Open Drizzle Studio |

Check `package.json` for the exact scripts configured in your project.

## Project Structure

text

```
promptforge/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   ├── generate/
│   │   ├── prompts/
│   │   └── user/
│   │       └── preferences/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (workspace)/
│   │   ├── playground/
│   │   ├── prompts/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   ├── library/
│   ├── playground/
│   ├── shared/
│   └── ui/
├── drizzle/
│   └── migrations
├── hooks/
├── lib/
│   ├── ai/
│   ├── auth/
│   ├── db/
│   └── prompt/
├── public/
├── scripts/
├── store/
├── .env.local
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### Directory Overview

- **`app/`** — Application routes, layouts, and API endpoints.
- **`app/api/auth/`** — Better Auth authentication handlers.
- **`app/api/generate/`** — API endpoint for AI prompt execution.
- **`app/api/prompts/`** — Prompt CRUD operations and version management.
- **`app/api/user/`** — User preferences endpoints.
- **`components/`** — Reusable interface components.
- **`components/playground/`** — Prompt editor, model configuration, output panels, comparison view, and version history.
- **`components/library/`** — Prompt library components.
- **`components/ui/`** — Reusable UI primitives.
- **`hooks/`** — Custom React hooks, including prompt queries and mutations.
- **`lib/ai/`** — AI model configuration and execution logic.
- **`lib/auth/`** — Authentication configuration, client utilities, and session helpers.
- **`lib/db/`** — Database connection and schema definitions.
- **`lib/prompt/`** — Prompt variables, token utilities, and export functionality.
- **`drizzle/`** — Database migration files.
- **`store/`** — Client-side playground state.
- **`SRS.md`** — Software Requirements Specification.

## AI Provider Configuration

PromptForge includes integrations for OpenAI and Anthropic through the Vercel AI SDK.

### OpenAI

Configure your OpenAI API key:

env

```
OPENAI_API_KEY="your-openai-api-key"
```

### Anthropic

Configure your Anthropic API key:

env

```
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

Provider credentials should be stored on the server and accessed through the AI execution layer.

The available models, provider selection, streaming behavior, and supported configuration options depend on the implementation in `lib/ai/models.ts` and `lib/ai/executor.ts`.

**Note:** Installing an AI SDK does not provide free model access. Using hosted models generally requires valid provider credentials and may incur usage charges.

## Database

PromptForge uses Neon PostgreSQL for persistent application data and Drizzle ORM for schema management.

The database schema is maintained in:

text

```
lib/db/schema.ts
```

The database connection is configured in:

text

```
lib/db/index.ts
```

Migration configuration is defined in:

text

```
drizzle.config.ts
```

After changing the schema, generate and apply migrations before relying on the new database structure.

## Authentication

Better Auth handles authentication and session management.

Authentication-related files include:

text

```
lib/auth/
├── auth.ts
├── client.ts
└── session.ts
```

The authentication API is exposed through:

text

```
app/api/auth/[...all]/route.ts
```

Protected workspace routes use server-side session verification.

Ensure that the Better Auth URL, secret, and database configuration are correct before testing registration, login, and protected routes.

## Production Build

Before deploying, verify that your environment variables and database are configured correctly.

Run:

bash

```
pnpm exec tsc --noEmit
pnpm exec eslint .
pnpm build
```

If the project builds successfully, start the production server locally:

bash

```
pnpm start
```

The application requires its production environment variables and a reachable database at runtime.

## Security Considerations

- Never commit `.env.local` or other files containing secrets.
- Keep database credentials and AI API keys server-side.
- Validate API request bodies before performing database operations.
- Enforce authentication and authorization on protected API endpoints.
- Ensure users can access only the prompts and preferences they are authorized to manage.
- Use HTTPS in production.
- Apply database migrations deliberately and maintain backups.
- Monitor AI usage to avoid unexpected provider charges.

## Troubleshooting

### Database Connection Errors

Verify that `DATABASE_URL` is correct, the Neon database is available, and your network can reach the database endpoint.

### Authentication Errors

Check `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and the database connection. Restart the development server after changing environment variables.

### AI Generation Failures

Verify that the relevant provider API key is configured, the selected model is supported, and the provider account has the required access and quota.

### Production Build Errors

Run:

bash

```
pnpm exec tsc --noEmit
pnpm exec next build --debug-prerender
```

Inspect the stack trace and resolve errors involving request-dependent data, caching, prerendering, or hydration before deployment.

### Dependency Issues

Try reinstalling dependencies from the lockfile:

bash

```
pnpm install --frozen-lockfile
```
