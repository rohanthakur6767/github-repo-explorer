# GitHub Repo Explorer

> Studio Graphene — Full Stack Assessment · **Exercise 3: GitHub Repo Explorer**

A small full-stack app where you type a GitHub username and see that user's public
profile and repositories. The React frontend **never calls GitHub directly** — every
request goes through a Node/Express backend that proxies the GitHub API, caches
responses for 60 seconds to protect the rate limit, attaches the API token
server-side, and maps upstream failures to clean, typed errors.

---

## Live Demo

| | URL |
|---|---|
| **Frontend** (Vercel) | https://github-repo-explorer-client.vercel.app |
| **Backend** (Render)  | https://github-repo-explorer-whmn.onrender.com |

> Tested from an incognito window to confirm the deployed frontend talks to the
> deployed backend.
>
> ⚠️ **Cold start:** the backend runs on Render's free tier, which sleeps after
> ~15 minutes of inactivity. The **first** request after a nap can take ~50s to
> wake the server; subsequent requests are fast. If the first search seems to
> hang, give it a moment — it is not broken.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | **Node.js + Express** | Minimal, well-understood, perfect for a thin proxy layer. |
| HTTP client | **Native `fetch`** (Node 18+) | No extra dependency needed on modern Node. |
| Frontend | **React 18 + Vite** | Vite gives a fast dev server and a tiny build; CRA is effectively deprecated. |
| Styling | **Plain CSS + CSS variables** | A small design-token system keeps things consistent without shipping a UI-library bundle. |
| Storage | **In-memory TTL cache** | The brief only needs a 60s cache; a `Map` is the right tool for a single instance. |
| Tests | **Vitest + Supertest** | Fast, zero-config; Supertest exercises the real Express routes. |
| Dev tooling | **npm workspaces + concurrently** | One `npm install`, one `npm run dev` for the whole monorepo. |

### Why proxy through the backend?

Both reasons called out in the brief:

1. **Caching / rate limits** — the same username requested within 60s is served from
   the in-memory cache (`X-Cache: HIT` header) instead of re-hitting GitHub.
2. **Token secrecy** — the optional `GITHUB_TOKEN` lives only on the server and is
   never exposed to the browser. It lifts the GitHub rate limit from 60 to 5000
   requests/hour.

---

## How to Run Locally

**Prerequisites:** only Node.js (v18 or newer) and npm.

```bash
# 1. Clone and enter the project
git clone https://github.com/rohanthakur6767/github-repo-explorer.git
cd github-repo-explorer

# 2. Install everything (npm workspaces installs both client and server)
npm install

# 3. Configure the backend (optional token raises the rate limit)
cp server/.env.example server/.env
#   then edit server/.env and paste a GitHub token into GITHUB_TOKEN
#   (a classic PAT with no scopes is enough for public data)

# 4. Run both servers together
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend:  **http://localhost:4000**

The Vite dev server proxies `/api` to the backend, so no CORS setup is needed locally.

**Run the backend tests:**

```bash
npm test
```

---

## API Documentation

Base path: `/api`. All responses are JSON. Errors share one shape:

```json
{ "error": { "code": "NOT_FOUND", "message": "No GitHub user found with that username." } }
```

Successful GitHub responses include an `X-Cache: HIT | MISS` header indicating
whether the data came from the 60s cache.

### `GET /api/health`
Health check. → `200 { "status": "ok" }`

### `GET /api/github/users/:username`
Returns the user's public profile.

**Response `200`:**
```json
{
  "user": {
    "login": "octocat",
    "name": "The Octocat",
    "avatarUrl": "https://...",
    "bio": null,
    "company": "@github",
    "location": "San Francisco",
    "blog": "https://github.blog",
    "followers": 22839,
    "following": 9,
    "publicRepos": 8,
    "htmlUrl": "https://github.com/octocat",
    "createdAt": "2011-01-25T18:44:36Z"
  }
}
```

### `GET /api/github/users/:username/repos`
Returns a sorted, paginated list of the user's public repositories.

**Query parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `sort` | `stars` \| `name` \| `updated` | `updated` | Invalid values return `400 BAD_REQUEST`. |
| `page` | number | `1` | 1-based page index. |
| `perPage` | number | `30` | Capped at 100. |

**Response `200`:**
```json
{
  "repos": [
    {
      "id": 1300192,
      "name": "Spoon-Knife",
      "fullName": "octocat/Spoon-Knife",
      "description": "This repo is for demonstration purposes only.",
      "language": "HTML",
      "stars": 13828,
      "forks": 157432,
      "openIssues": 20617,
      "defaultBranch": "main",
      "htmlUrl": "https://github.com/octocat/Spoon-Knife",
      "isFork": false,
      "topics": [],
      "updatedAt": "2026-06-03T11:56:47Z",
      "createdAt": "2011-01-27T19:30:43Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 30,
    "totalItems": 8,
    "totalPages": 1,
    "hasMore": false
  },
  "sort": "updated"
}
```

### Error codes

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `BAD_REQUEST` | Invalid query parameter (e.g. unknown `sort`). |
| 404 | `NOT_FOUND` | No such GitHub user / unknown route. |
| 429 | `RATE_LIMITED` | GitHub rate limit exhausted (includes reset time). |
| 502 | `UPSTREAM_ERROR` | Could not reach GitHub / unexpected GitHub status. |
| 500 | `INTERNAL_ERROR` | Unexpected server error. |

---

## Project Structure

```
github-repo-explorer/
├── package.json            # npm workspaces root; "dev" runs client + server together
├── client/                 # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js      # dev proxy: /api -> localhost:4000
│   └── src/
│       ├── main.jsx
│       ├── App.jsx         # top-level layout + state wiring
│       ├── index.css       # design tokens + all component styles
│       ├── api/
│       │   └── githubApi.js        # fetch wrapper for OUR backend (never GitHub)
│       ├── hooks/
│       │   ├── useGithubProfile.js # search / sort / load-more orchestration
│       │   └── useRecentSearches.js# localStorage-backed recent list
│       ├── components/
│       │   ├── SearchBar.jsx
│       │   ├── RecentSearches.jsx
│       │   ├── ProfileCard.jsx
│       │   ├── RepoList.jsx / RepoCard.jsx / SortControl.jsx
│       │   ├── LanguageBar.jsx      # dependency-free language chart
│       │   ├── ErrorState.jsx / WelcomeState.jsx / Skeletons.jsx
│       └── utils/
│           └── format.js            # number/date formatting + language colours
└── server/                 # Express backend
    ├── .env.example
    └── src/
        ├── index.js        # entrypoint (binds the port)
        ├── app.js          # buildable Express app (injectable deps for tests)
        ├── config.js       # env parsing in one place
        ├── cache.js        # TtlCache  (+ cache.test.js)
        ├── errors.js       # ApiError type + factories
        ├── services/
        │   └── githubService.js     # all GitHub I/O, shaping, error mapping (+ test)
        ├── routes/
        │   └── github.js            # validates input, sorts, paginates (+ test)
        ├── utils/
        │   └── repos.js             # pure sort + paginate helpers
        └── middleware/
            └── errorHandler.js      # 404 + central error handler
```

---

## Requirements Coverage

**Must Have** — all complete:
- ✅ Username search input
- ✅ Profile: avatar, name, bio, followers, following, public repo count
- ✅ Repo list: name, description, primary language, stars, last-updated
- ✅ Sort by stars / name / last updated
- ✅ Clear "user not found" error
- ✅ Graceful network-error and rate-limit handling

**Should Have** — all complete:
- ✅ Server-side 60s cache (`X-Cache` header proves hits)
- ✅ Loading skeletons while requests are in flight
- ✅ "Load more" pagination
- ✅ Click a repo to expand (open issues, default branch, created date, topics)

**Nice to Have (Bonus):**
- ✅ Recently-searched list persisted in `localStorage`
- ✅ Language-distribution chart across the profile (dependency-free)
- ⬜ Debounced search-as-you-type (deliberately omitted — see Next Steps)

---

## What Works / Honest Notes

- Everything in **Must / Should Have** works end-to-end, plus two of the three
  bonuses. Verified against real GitHub profiles (e.g. `torvalds`, `sindresorhus`).
- **Repo cap:** to bound rate-limit cost, the backend fetches up to **300 repos**
  (3 pages of 100) per user, then sorts/paginates over that set. For the vast
  majority of users this is the full set; for users with 1000+ repos the count
  shown reflects the loaded subset. Documented rather than hidden.
- **`npm audit`** reports advisories in `esbuild`/`vite`/`vitest`. These are
  **dev-only** (the local dev server) and do not affect the production build or the
  deployed app. I left them rather than force a breaking Vite 8 upgrade.
- No code was copied from a tutorial or Stack Overflow; the structure and styling
  are written from scratch. AI assistance was used and every line is understood.

---

## Next Steps (with more time)

- **Debounced search-as-you-type** — straightforward to add, but it multiplies
  GitHub calls; I kept search on submit to be deliberate about the rate limit.
- **Full pagination passthrough** so users with >300 repos see everything (stream
  pages from GitHub on demand rather than capping).
- **Shared cache** (Redis) so caching survives restarts and works across multiple
  backend instances.
- **More tests** — a few frontend component tests (React Testing Library) and a
  cache-expiry integration test on the route layer.
- **Accessibility polish** — focus management after search, `aria-live` on the
  results region for screen readers.

---

## Deployment Notes

- **Backend → Render:** root dir `server`, build `npm install`, start `npm start`.
  Set env vars `GITHUB_TOKEN` and `CLIENT_ORIGIN` (your Vercel URL). See
  [`render.yaml`](render.yaml).
- **Frontend → Vercel:** root dir `client`, framework Vite, build `npm run build`,
  output `dist`. Set env var `VITE_API_BASE_URL` to the Render backend URL. See
  [`client/vercel.json`](client/vercel.json).
