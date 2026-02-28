# Typo (client2)

Typing practice web app built with Next.js App Router + Redux Toolkit, with Redis-backed paragraph/leaderboard content and external API-backed auth + analytics.

---

## 1) Project Summary

Typo is a frontend-heavy typing platform where users can:

- Practice typing on generated paragraph/quote content.
- Track per-test metrics (accuracy, raw/net WPM, final score).
- Persist and sync account analytics.
- View profile analytics and global leaderboard.
- Use a command palette (`Ctrl + Q`) for fast navigation/actions.

This repository is the client application (`client2`) and relies on an external backend API (configured via environment variables).

---

## 2) Tech Stack

- **Framework:** Next.js `15.5.12` (App Router)
- **UI:** React `18.3.1`, Tailwind CSS v4
- **State:** Redux Toolkit + React Redux
- **Charts:** Recharts
- **Validation:** Zod
- **Data source:** Redis (via server actions/controllers in this app)
- **Linting:** ESLint + `eslint-config-next`

---

## 3) High-Level Architecture

```text
UI Components (client)
  -> Redux slices (typing/user/score/modal/theme)
  -> Next "server actions" (src/app/actions/*)
	  -> Controllers (src/app/controllers/*)
		  -> External HTTP API and/or Redis
			  -> Response + optional refreshed tokens
				  -> Redux update + localStorage persistence
```

### 3.1 App composition

- Global shell is defined in `src/app/layout.js`.
- `Header`, `Footer`, and command `Search` are mounted globally.
- `FetchDetails` silently refreshes user profile/analytics when needed.
- Home route renders typing experience (`MainPage` -> `Menu` + `Paragraph` or `Score`).

### 3.2 State model

Store slices:

- `colorscheme`: active theme id.
- `userdata`: auth/profile/analytics summary.
- `typingdata`: current typing session configuration and runtime state.
- `modal`: account modal tab, refresh markers, command palette visibility.
- `userscore`: current test result + DB sync status.

Local persistence (`persistMiddleware`) stores selected slices in `localStorage`.

---

## 4) Runtime Flows

## 4.1 Typing flow

1. `Menu` fetches paragraph from Redis key.
2. Paragraph gets line-wrapped using `paraToLines` based on live typing box metrics.
3. `Paragraph` captures keystrokes, tracks word-level correctness.
4. On finish/timeout/bailout, `calculateUpdatedScore` computes:
   - current test score metrics
   - aggregated DB analytics payload
5. `userscore` slice stores test result.
6. If logged in, analytics sync is attempted through `updateAccountAnalyticsAction`.

## 4.2 Auth flow

1. Login/Register forms call server actions (`loginAction` / `registerAction`).
2. Controller validates input (Zod) and calls backend API.
3. Tokens are written to `localStorage`.
4. `userdata` slice is hydrated.
5. If there is pending unsynced score, client attempts post-login analytics sync.

## 4.3 Account management flow

- Update username performs Redis + API availability checks before submit.
- Reset analytics requires exact phrase confirmation and backend call.
- Delete account requires exact phrase + password confirmation.
- Unauthorized responses trigger logout + redirect to login.

## 4.4 Command palette flow (`Ctrl + Q`)

- `Search` filters command definitions from `searchData` by keyword.
- Visibility rules (`displayFlag`) adapt commands for logged-in / logged-out users.
- Selecting a command dispatches Redux updates and/or navigation.

---

## 5) Routes

- `/` -> Typing test (`MainPage`)
- `/login` -> Login page
- `/register` -> Register page
- `/resetpassword` -> Password reset (OTP)
- `/account` -> Account settings and modals
- `/analytics` -> Logged-in user analytics
- `/analytics/[username]` -> Public/other user analytics lookup
- `/leaderboard` -> Top leaderboard

---

## 6) Environment Variables

Configured from `.env` and consumed mainly via `src/app/init/env.js`.

### 6.1 Runtime switches

- `NODE_ENV`
- `LOCAL_SERVER_URL`
- `CLOUD_SERVER_URL`

### 6.2 Redis

- `LOCAL_REDIS_HOST`
- `LOCAL_REDIS_PORT`
- `LOCAL_REDIS_PASSWORD`
- `CLOUD_REDIS_HOST`
- `CLOUD_REDIS_PORT`
- `CLOUD_REDIS_PASSWORD`

### 6.3 User APIs

- `SIGNUP_ROUTE`
- `LOGIN_ROUTE`
- `OTP_ROUTE`
- `RESET_PASSWORD_ROUTE`
- `CHECK_USERNAME_ROUTE`
- `UPDATE_USERNAME_ROUTE`
- `DELETE_ACCOUNT_ROUTE`

### 6.4 Analytics APIs

- `USER_ANALYTICS_ROUTE`
- `ACCOUNT_ANALYTICS_ROUTE`
- `RESET_ANALYTICS_ROUTE`
- `UPDATE_ANALYTICS_ROUTE`

### 6.5 Public app setting

- `NEXT_PUBLIC_MAX_PARA`

> Security note: keep secrets out of source control and rotate exposed credentials immediately if committed.

---

## 7) Local Development

### 7.1 Prerequisites

- Node.js 18+
- npm
- Redis instance (if testing paragraph/leaderboard fetch from this client setup)
- Backend API running and reachable at configured server URL

### 7.2 Install and run

```bash
npm install
npm run dev
```

App runs by default at `http://localhost:3000`.

### 7.3 Scripts

- `npm run dev` -> Start dev server
- `npm run build` -> Production build
- `npm run start` -> Start production server
- `npm run lint` -> Run ESLint

---

## 8) File-by-File Inventory

This section documents every file currently present in the repository (excluding `node_modules`, `.git`, and `.next` runtime artifacts).

## 8.1 Root / workspace files

| File | Purpose |
|---|---|
| `.env` | Local environment configuration for API routes, Redis endpoints, and runtime mode. |
| `.gitignore` | Ignore rules for dependencies, build outputs, env files, and misc artifacts. |
| `.vscode/settings.json` | VS Code workspace-level setting (Postman extension UI preference). |
| `eslint.config.mjs` | ESLint flat config using Next.js core-web-vitals presets and ignore overrides. |
| `jsconfig.json` | Path alias config (`@/* -> ./src/*`). |
| `next.config.mjs` | Next.js config (`reactStrictMode: false`). |
| `package.json` | App metadata, scripts, dependencies/devDependencies. |
| `package-lock.json` | npm lockfile for deterministic installs. |
| `postcss.config.mjs` | PostCSS plugin setup for Tailwind v4. |
| `README.md` | Project documentation (this file). |

## 8.2 App entry and routing

| File | Purpose |
|---|---|
| `src/app/layout.js` | Root layout; mounts providers, global UI shell (`Header`, `Search`, `Footer`), and `FetchDetails`. |
| `src/app/page.js` | Home page entry rendering `MainPage`. |
| `src/app/globals.css` | Global style import (`@import "tailwindcss"`). |
| `src/app/favicon.ico` | Browser tab icon asset. |
| `src/app/(Routes)/account/page.js` | Route wrapper for account section. |
| `src/app/(Routes)/analytics/page.js` | Route wrapper for self analytics page. |
| `src/app/(Routes)/analytics/[username]/page.js` | Dynamic route for user analytics profile by username. |
| `src/app/(Routes)/leaderboard/page.js` | Route wrapper for leaderboard page. |
| `src/app/(Routes)/login/page.js` | Login page shell with dynamic theme panel and auth form. |
| `src/app/(Routes)/register/page.js` | Register page shell with dynamic theme panel and auth form. |
| `src/app/(Routes)/resetpassword/page.jsx` | Reset password page shell with dynamic theme panel. |

## 8.3 Server actions layer (`src/app/actions`)

| File | Purpose |
|---|---|
| `src/app/actions/authAction.js` | Server actions for login/register calling `authController`, normalizing success/error response shape. |
| `src/app/actions/userAction.js` | Server actions for username checks, update, delete, OTP, and password reset through `userController`. |
| `src/app/actions/analyticsAction.js` | Server actions for analytics get/reset/update operations through `analyticsController`. |
| `src/app/actions/redisAction.js` | Server actions for paragraph, leaderboard, and username checks through `redisController`. |

## 8.4 Controller layer (`src/app/controllers`)

| File | Purpose |
|---|---|
| `src/app/controllers/authController.js` | Validates auth payloads (Zod), calls backend login/register APIs, and maps HTTP failures to thrown errors. |
| `src/app/controllers/userController.js` | User APIs: username availability, OTP send, password reset, username update, account delete, with token header handling. |
| `src/app/controllers/analyticsController.js` | Analytics APIs: self analytics, target account analytics, reset analytics, update analytics, with token refresh extraction. |
| `src/app/controllers/redisController.js` | Redis operations: paragraph read, leaderboard read/JSON parse, username existence checks. |

## 8.5 Init / infrastructure (`src/app/init`)

| File | Purpose |
|---|---|
| `src/app/init/env.js` | Centralized environment mapping and default route/key values for runtime use. |
| `src/app/init/redis.js` | Singleton Redis connection manager with ping test, error listener, and SIGINT/SIGTERM graceful shutdown handlers. |

## 8.6 Global components

| File | Purpose |
|---|---|
| `src/app/components/LoadingSpinner.js` | Full-screen loading overlay used in auth/reset flows. |
| `src/app/components/Theme.js` | Marketing/visual side panel used on auth-related pages. |

## 8.7 Header / footer

| File | Purpose |
|---|---|
| `src/app/components/header/Header.jsx` | Top navigation, auth links/profile menu, streak indicator, and command modal trigger. |
| `src/app/components/footer/Footer.jsx` | Footer showing quick stats, GitHub link, and runtime theme switcher dropdown. |

## 8.8 Main typing workflow

| File | Purpose |
|---|---|
| `src/app/components/main/MainPage.jsx` | Chooses between live typing view and results view based on `typingdata.isTyping`. |
| `src/app/components/main/typing/Menu.jsx` | Typing configuration controls (type, difficulty, length, timer, modifiers), paragraph fetch/refresh/reset. |
| `src/app/components/main/typing/Paragraph.jsx` | Core typing engine: focus handling, word comparison, timer, score dispatch, analytics sync triggers. |
| `src/app/components/main/typing/custom/CustomTime.jsx` | Modal for custom timer duration input (1-3600 seconds). |
| `src/app/components/main/typing/custom/CustomPara.jsx` | Modal for trimming active paragraph word count and recomputing wrapped lines. |
| `src/app/components/main/score/Score.jsx` | Results dashboard with stat cards, wrong-word table, and Recharts visualizations. |

## 8.9 Auth components

| File | Purpose |
|---|---|
| `src/app/components/auth/Login.jsx` | Login form with remember-me, token storage, Redux hydration, and pending score sync. |
| `src/app/components/auth/Register.jsx` | Registration form, token storage, Redux hydration, and pending score sync. |
| `src/app/components/resetpassword/ResetPassword.jsx` | Two-step reset flow (email OTP -> password update) with countdown expiry management. |

## 8.10 Account components

| File | Purpose |
|---|---|
| `src/app/components/account/Account.jsx` | Account page layout with responsive sidebar and tabbed modal content switching. |
| `src/app/components/account/FetchDetails.js` | Non-visual refresher that re-fetches account/analytics data when refresh marker changes. |
| `src/app/components/account/modal/AccountDetails.jsx` | Displays profile metadata and quick action shortcuts. |
| `src/app/components/account/modal/UpdateUsername.jsx` | Username change UI with debounce availability checks and token-aware update request. |
| `src/app/components/account/modal/ResetAnalytics.jsx` | Analytics reset confirmation flow and local state reset. |
| `src/app/components/account/modal/DeleteAccount.jsx` | Permanent account deletion flow requiring phrase + password confirmation. |

## 8.11 Analytics components

| File | Purpose |
|---|---|
| `src/app/components/analytics/UserAnalytics.jsx` | Logged-in user analytics dashboard with streak panel and multi-chart trends. |
| `src/app/components/analytics/OtherAnalytics.jsx` | Profile analytics viewer for any username with insight summaries and metric bars. |
| `src/app/components/analytics/insights.js` | Rule-based narrative insight generator from WPM/accuracy/practice metrics. |

## 8.12 Leaderboard and command search

| File | Purpose |
|---|---|
| `src/app/components/leaderboard/Leaderboard.jsx` | Loads and renders top users with desktop table + mobile cards and quick actions. |
| `src/app/components/search/Search.jsx` | Command palette modal with keyboard navigation and action execution map. |
| `src/app/components/search/searchData.js` | Command registry with keyword metadata and login visibility flags. |
| `src/app/components/search/action.js` | Command handlers dispatching Redux updates and route navigation. |

## 8.13 State management

| File | Purpose |
|---|---|
| `src/app/state/store.js` | Redux store setup with combined reducers, preloaded state, and persistence middleware. |
| `src/app/state/providers.jsx` | React Redux provider wrapper for app tree. |
| `src/app/state/persistMiddleware.js` | Custom persistence middleware + safe local storage state loader. |
| `src/app/state/colorSchemeOptions.js` | Theme token list (name + color palette values). |
| `src/app/state/slices/colorschemeSlice.js` | Selected theme slice and setter action. |
| `src/app/state/slices/modalSlice.js` | UI modal/refresh state (`accountModal`, command modal, refresh timestamps). |
| `src/app/state/slices/typingdataSlice.js` | Typing session config/state transitions (start, update, toggle options, bailout, etc.). |
| `src/app/state/slices/userdataSlice.js` | User auth/profile/analytics aggregate state and update actions. |
| `src/app/state/slices/userscoreSlice.js` | Current test score state, sync lifecycle (`idle/pending/syncing/synced/failed`). |

## 8.14 Utilities

| File | Purpose |
|---|---|
| `src/app/utils/regexValidation.js` | Regex constants for username/email/password constraints. |
| `src/app/utils/authValidation.js` | Zod schemas + helper validators for auth/user payloads. |
| `src/app/utils/formatDateTime.js` | Date formatting helper (`DD/MM/YYYY at HH:mm`). |
| `src/app/utils/generateKey.js` | Builds Redis key prefix + random index for paragraph/quote retrieval. |
| `src/app/utils/paraToLines.js` | Canvas text measurement utility for responsive paragraph line wrapping. |
| `src/app/utils/editParaLines.js` | Post-processes paragraph lines (punctuation capitalization and optional number/symbol injections). |
| `src/app/utils/score.js` | Core scoring/aggregation engine for current test + rolling DB metrics. |
| `src/app/utils/logoutUtil.js` | Shared logout helper (token cleanup + store reset actions). |

---

## 9) Operational Notes

- API and Redis dependencies are expected to be available for full feature behavior.
- Unauthorized backend responses are intentionally handled by forcing client logout in multiple flows.
- Some display flows depend on localStorage tokens (`access_token`, `refresh_token`).
- `Search` command palette is globally available except by command visibility rules.

---


