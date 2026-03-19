# COSY Frontend

## Project Overview

COSY (Cost Optimized Server Yard) is a self-hosted game server management platform. This is the React frontend that provides a gamified web interface for managing Docker-based game servers.

### What COSY Does
- Manages game servers as Docker containers through a web UI
- Provides real-time console, metrics, and file management
- Uses templates for quick server setup (Minecraft, ARK, Terraria, etc.)
- Supports user roles (Owner/Admin/User) with resource quotas
- Features Access Groups for fine-grained server permissions
- Offers public dashboards for community server status sharing
- Integrates webhooks (Discord, Slack, n8n) for notifications

### Architecture
- **Frontend** (this repo): React/TypeScript SPA
- **Backend**: Spring Boot API at `/api` (see cosy-backend repo)
- **Infrastructure**: PostgreSQL, InfluxDB (metrics), Loki (logs), nginx

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19 with TypeScript
- **Build**: Vite
- **Routing**: TanStack Router (file-based routes in `src/routes/`)
- **State**: Redux Toolkit + TanStack Query
- **Forms**: TanStack Form + Zod validation
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix primitives) in `src/components/ui/`
- **Linting**: Biome
- **API Client**: Generated via Orval from OpenAPI spec
- **i18n**: i18next
- **Real-time**: WebSocket via react-stomp-hooks

## Project Structure

```
src/
  api/
    axiosInstance.ts     # Axios config with auth interceptor
    generated/           # Orval-generated API client + models
  components/
    ui/                  # shadcn/ui primitives (Button, Dialog, etc.)
    display/             # Feature components (server cards, dashboards)
    technical/           # Utility components (providers, guards)
  routes/                # TanStack Router file-based routes
  stores/
    slices/              # Redux slices (gameServer, user, etc.)
    index.ts             # Store configuration
    rootReducer.ts       # Combined reducer with RESET_STORE action
  hooks/                 # Custom React hooks
  i18n/
    i18nKeys.ts          # Type definitions for all translation keys
    en-US/translation.ts # English translations
    de-DE/translation.ts # German translations
  lib/                   # Utilities (cn, etc.)
  types/                 # TypeScript type definitions
```

## Commands

```bash
bun dev              # Start dev server
bun build            # Production build
bun typecheck        # TypeScript check (no emit)
bun lint             # Biome lint + tsc
bun lint:fix         # Auto-fix lint issues
bun gen:api          # Regenerate API client from backend OpenAPI
```

---

## Internationalization (i18n)

### Structure
- `src/i18n/i18nKeys.ts` - **Type definitions** for all translation keys. This file defines the `i18nLanguage` type that enforces type-safety for translations.
- `src/i18n/en-US/translation.ts` - English translations (implements `i18nLanguage`)
- `src/i18n/de-DE/translation.ts` - German translations (implements `i18nLanguage`)
- `src/i18n/i18n.ts` - i18next initialization with language detection

### Adding New Translations
1. Add the key structure to `i18nKeys.ts` (this enforces type-safety)
2. Add the actual translation strings to both `en-US/translation.ts` and `de-DE/translation.ts`

### Using Translations
```tsx
// Option 1: useTranslation directly
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
t("toasts.serverStartSuccess")

// Option 2: useTranslationPrefix for scoped translations (preferred for components)
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
const { t } = useTranslationPrefix("components.CreateGameServer");
t("backButton")  // Translates "components.CreateGameServer.backButton"
```

### Variables in Translations
Use `{{variable}}` syntax in translation strings:
```ts
// In i18nKeys.ts - use ContainsVariable<"varName"> type
invitedBy: ContainsVariable<"username">;

// In translation.ts
invitedBy: "Invited by {{username}}"

// Usage
t("invitedBy", { username: "admin" })
```

---

## API Client (Orval)

### How It Works
The API client is auto-generated from the backend's OpenAPI spec using Orval.

**Configuration** (`orval.config.js`):
- Input: `openapi-backend.json` (downloaded from running backend)
- Output: `src/api/generated/backend-api.ts` (React Query hooks)
- Models: `src/api/generated/model/` (TypeScript types)
- Uses custom axios instance from `src/api/axiosInstance.ts`

### Regenerating the API Client
```bash
bun gen:api  # Backend must be running on localhost:8080
```

This command:
1. Fetches OpenAPI spec from `http://localhost:8080/api/v3/api-docs`
2. Saves it to `openapi-backend.json`
3. Runs Orval to generate typed React Query hooks and models

### What Gets Generated
- **React Query hooks**: `useGetAllGameServers()`, `useCreateGameServer()`, etc.
- **Query key functions**: `getGetAllGameServersQueryKey()` for cache invalidation
- **TypeScript types**: `GameServerDto`, `UserEntityDto`, etc.
- **Mutation hooks**: `useDeleteGameServerById()`, `useUpdateGameServer()`, etc.

### Axios Instance
`src/api/axiosInstance.ts` configures:
- Base URL: `/api`
- Auth token injection via interceptor
- Response unwrapping (extracts `data` from `ApiResponse<T>` wrapper)
- Request cancellation support

---

## State Management

### Redux vs React Query - When to Use What

**Use Redux (via slices in `src/stores/slices/`)** for:
- Data that needs to be globally accessible and updated from WebSocket events
- Game server state, logs, metrics, permissions
- Data that multiple components read and needs real-time updates

**Use React Query (via Orval-generated hooks)** for:
- One-off data fetching in components
- Mutations (create, update, delete operations)
- Data that doesn't need global state

### Redux Slices
Located in `src/stores/slices/`:
- `gameServerSlice.ts` - Game server data, status, pull progress, webhooks, dashboards
- `gameServerLogSlice.ts` - Server logs (updated via WebSocket)
- `gameServerMetrics.ts` - Metrics data
- `gameServerPermissionsSlice.ts` - User permissions per server
- `userSlice.ts` - User list
- `userInviteSlice.ts` - Pending invitations
- `templateSlice.ts` - Server templates

### SliceState Pattern
All slices follow a common pattern:
```ts
interface SliceState<T> {
  data: T[];
  state: "idle" | "loading" | "failed";
}
```

### Store Reset
Use `RESET_STORE` action to clear all state (e.g., on logout):
```ts
dispatch({ type: RESET_STORE });
```

---

## Data Loading & Interactions Hooks

### useDataLoading
`src/hooks/useDataLoading/useDataLoading.tsx`

Central hook for **reading/loading** data into Redux store. Handles:
- Loading game servers, users, invites, templates
- Loading server-specific data (logs, metrics, permissions)
- Permission-aware loading (skips data user can't access)
- Race condition handling for metrics requests

**Key functions:**
```ts
const {
  loadAllData,           // Load everything (game servers, templates, users if admin)
  loadGameServers,       // Load all game servers + their additional data
  loadGameServer,        // Load single server by UUID
  loadGameServerLogs,    // Load logs for a server
  loadGameServerMetrics, // Load metrics with time range
  loadTemplates,         // Load available templates
  loadUsers,             // Load user list (admin only)
  loadInvites,           // Load pending invites (admin only)
} = useDataLoading();
```

### useDataInteractions
`src/hooks/useDataInteractions/useDataInteractions.tsx`

Central hook for **write operations** (mutations). Aggregates all domain-specific interaction hooks:

```ts
const {
  // Game server operations
  createGameServer,
  updateGameServer,
  deleteGameServer,
  transferOwnership,
  
  // User operations
  deleteUser,
  updateUserRole,
  updateUserDockerLimits,
  
  // Access group operations
  createAccessGroup,
  updateAccessGroup,
  deleteAccessGroup,
  
  // Webhook operations
  createWebhook,
  updateWebhook,
  deleteWebhook,
  
  // Server control
  startServer,
  stopServer,
  
  // ... more
} = useDataInteractions();
```

### Domain-Specific Hooks
Each domain has its own interaction hook in `src/hooks/`:
- `useGameServerDataInteractions` - CRUD for game servers
- `useUserDataInteractions` - User management
- `useAccessGroupDataInteractions` - Access group management
- `useWebhookDataInteractions` - Webhook CRUD
- `useServerInteractions` - Start/stop/restart servers
- `useFooterDataInteractions` - Footer content management
- `useGameServerConfigDataInteractions` - Server config updates

These hooks use Orval-generated mutation hooks internally and dispatch Redux actions to update the store on success.

---

## Component Organization

### Three Subdirectories in `src/components/`

#### `ui/` - Primitives (shadcn/ui)
Low-level, reusable UI components. These are the building blocks:
- `button.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`
- `card.tsx`, `badge.tsx`, `tooltip.tsx`
- `dropdown-menu.tsx`, `context-menu.tsx`
- Custom additions: `CopyButton.tsx`, `TooltipWrapper.tsx`, `UnsavedModal.tsx`

**When to use**: Import from `@/components/ui/` when you need basic UI primitives.

#### `display/` - Feature Components
Domain-specific, visual components that compose `ui/` primitives:
- `GameServer/` - Server cards, detail pages, status displays
- `Dashboard/` - Metric displays, dashboard layouts
- `UserManagement/` - User tables, role badges
- `Login/` - Authentication forms
- `LogDisplay/` - Console log viewer
- `FileBrowser/` - File management UI
- `AccessGroups/` - Permission management
- `Configurations/` - Settings forms

**When to use**: These are the main feature components rendered in routes.

#### `technical/` - Infrastructure Components
Non-visual, utility components:
- `Providers/` - Context providers (Auth, Theme, WebSocket)
- `WebsocketCollection/` - WebSocket subscription management
- `LoadingScreen/` - Loading states

**When to use**: Wrap your app or routes with these for infrastructure needs.

---

## TanStack Router

### File-Based Routing
Routes are defined by file structure in `src/routes/`:

```
routes/
  __root.tsx           # Root layout (always rendered)
  index.tsx            # / (home page)
  users.tsx            # /users
  server/
    $serverId.tsx      # /server/:serverId (layout with Outlet)
    $serverId/
      index.tsx        # /server/:serverId (dashboard)
      console.tsx      # /server/:serverId/console
      metrics.tsx      # /server/:serverId/metrics
      files.tsx        # /server/:serverId/files
      settings.tsx     # /server/:serverId/settings
```

### Route Parameters
Use `$paramName` in filenames for dynamic segments:
```tsx
// In $serverId.tsx
export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const { serverId } = Route.useParams();
  // ...
}
```

### Nested Layouts
Parent routes with `<Outlet />` render child routes:
```tsx
// $serverId.tsx - layout for all /server/:serverId/* routes
function GameServerDetailPage() {
  return (
    <GameServerDetailPageLayout>
      <Outlet />  {/* Child routes render here */}
    </GameServerDetailPageLayout>
  );
}
```

### Route Generation
Run `bun tsr:gen` to regenerate `routeTree.gen.ts` after adding new route files.

---

## Key Concepts

### Game Server Lifecycle
Servers have states: Created -> Starting -> Running -> Stopped/Failed. Configuration (image, ports, env vars, volumes, limits) is locked while running.

### User Roles
- **Owner**: Full system access, one per instance
- **Admin**: Manage servers/users, subject to quotas
- **User**: Own servers only, resource limits enforced

### Access Groups
Per-server permission sets for sharing with moderators. Permissions include: `SEE_SERVER`, `START_STOP_SERVER`, `READ_SERVER_LOGS`, `SEND_COMMANDS`, `CHANGE_SERVER_FILES`, etc.

### Templates
Pre-configured server setups from cosy-templates repo. Define image, ports, env vars, volumes, and support user-configurable variables with `{{placeholder}}` substitution.

---

## Notes

- Real-time updates (logs, metrics) use WebSocket via STOMP
- File browser accesses server volumes through the backend
- Custom metrics can be sent from game servers to `/api/internal/game-server/custom-metric/{uuid}`
- Use `useTypedSelector` from `rootReducer.ts` for type-safe Redux selectors
