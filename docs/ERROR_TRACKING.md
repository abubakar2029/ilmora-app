# Error tracking (frontend)

## Fix history (primary — read this first)

**`ERROR_TRACKER.txt`** in the frontend repo root is the human-readable log of bugs we fixed, root causes, and which files changed. **Append new entries there** whenever you fix a production issue.

## Runtime log (optional, while debugging)

**`src/lib/error-tracker.ts`** also records live errors in the browser **sessionStorage** key `ilmora_error_log_v1` (last 80 entries).

## Areas logged

| Area | When |
|------|------|
| `chat:send` | Message POST failed |
| `chat:conversation` | Conversation load failed |
| `chat:ws` | WebSocket parse / connection issues |
| `chat:cache` | Unexpected cache merge (debug) |

## Inspect in the browser

1. Open DevTools → Console.
2. Run:

```js
__ilmoraErrors()
```

3. Copy for support:

```js
copy(JSON.stringify(__ilmoraErrors(), null, 2))
```

4. Clear:

```js
__ilmoraClearErrors()
```

The tracker is installed on app load via `QueryProvider`.

## Production

No third-party service is required. For Sentry or similar later, call `trackError` from a single wrapper in `error-tracker.ts`.
