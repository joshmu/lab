# RepoWeb — GitHub Repository Proxy for AI Agents

## Overview

RepoWeb is a lightweight HTTP proxy that serves any public GitHub repository as plain text. Files return raw content. Directories return a listing. No rendering, no transformation.

Hosted at: `lab.joshmu.com/repoweb/`

## URL Format

```
/repoweb/github.com/{owner}/{repo}          → repo root directory listing
/repoweb/github.com/{owner}/{repo}/{path}   → file content or directory listing
```

### Examples

| URL                                                   | Returns                     |
| ----------------------------------------------------- | --------------------------- |
| `/repoweb/github.com/sindresorhus/is`                 | Root directory listing      |
| `/repoweb/github.com/sindresorhus/is/source`          | `source/` directory listing |
| `/repoweb/github.com/sindresorhus/is/source/index.ts` | Raw file content            |

## Response Format

All responses are `Content-Type: text/plain; charset=utf-8`.

### Directory Listing

```
owner/repo: A short description of the repo

src/
test/
README.md (1.2kb)
package.json (482b)
```

- Directories listed first (sorted alphabetically, trailing `/`), then files
- File sizes in human-readable format
- Repository description shown at root level only

### File Content

```
import { something } from "./lib";

export function main() {
  // raw file content, nothing else
}
```

Files are returned as-is — no headers, no metadata, no wrapping. A true proxy.

### Errors

```
Error (404): Not found: owner/repo/nonexistent/path
```

- `400` — Invalid URL format
- `403` — Rate limit exceeded or forbidden
- `404` — Repository or path not found
- `502` — GitHub API unreachable

## Rate Limits

| Mode            | Limit        | How                        |
| --------------- | ------------ | -------------------------- |
| Unauthenticated | 60 req/hr    | Default                    |
| Authenticated   | 5,000 req/hr | Set `GITHUB_TOKEN` env var |

## Caching

- `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`
- Edge-cached 5 min, stale up to 1 hr while revalidating
- No persistent storage — Vercel CDN edge cache only

## Architecture

```
src/
├── lib/
│   └── github.ts              # GitHub Contents API client
├── app/
│   └── repoweb/
│       ├── page.tsx            # Landing/docs page
│       └── [...path]/
│           └── route.ts        # Catch-all route handler
```

### How It Works

1. Request hits `/repoweb/github.com/{owner}/{repo}/{path}`
2. Route handler parses URL segments → owner, repo, path
3. Calls GitHub Contents API (`GET /repos/{owner}/{repo}/contents/{path}`)
4. Directory → text listing; File → decoded base64 content
5. Served with cache headers

### Dependencies

None. Uses native `fetch`, `Buffer`, and Next.js Route Handlers.

## Extending

- **Branch support:** Add `ref` query param, pass to GitHub API
- **Search:** Expose GitHub Code Search API via `?search=` param
- **Private repos:** Use token with `repo` scope
- **Binary files:** Redirect to GitHub's `download_url`
