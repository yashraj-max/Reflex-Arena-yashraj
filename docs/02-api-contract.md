# 02 · The API Contract 🤝

The contract is the **promise** between frontend and backend: which URLs exist, what JSON goes in, and what comes out. If both sides keep the promise, they work together the first time they meet.

> 🧠 **Rule:** if the contract must change, change **this document first**, then both sides. Never "quietly fix" one side.

---

## Conventions

- All bodies are **JSON**. Field names are **camelCase** (`reactionMs`, not `reaction_ms`).
- Pad ids: `red`, `blue`, `green`, `yellow` (lowercase). The frontend may *display* them as anything ("MIRCHI", "MARS"...). The ids never change.
- Actions: `click`, `double`, `hold`, `none`.
- Errors: an HTTP status plus `{ "detail": "human readable message" }`.
- **The server never sends the correct answer.** A command is only `{ round, text, timeLimitMs }`.

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/api/health` | Is the service up? | 200 |
| POST | `/api/start` | Create a run, get command 1 | 201 |
| POST | `/api/answer` | Judge one answer, get the next command | 200 |
| GET | `/api/leaderboard` | Top finished runs | 200 |

| Error code | When |
|---|---|
| 400 | Body is not valid JSON |
| 404 | Run not found, or unknown `/api/...` route |
| 409 | Run already finished, or this round was already answered |
| 422 | Body breaks a validation rule (bad nickname, missing color...) |
| 500 | Bug or outage on the server (check the Render logs) |

---

## GET /api/health

```json
{ "status": "ok", "version": "1.0.0", "db": "connected", "stretch": false, "uptimeSec": 42 }
```

`version` comes from `backend/package.json`. Bump it when you ship, and the start screen badge shows it. `stretch` tells the frontend whether "hold" commands are enabled.

## POST /api/start

Nickname: trimmed, **2 to 16 characters** from letters, digits, space, `_`, `-`.
`arena` (optional): which leaderboard to join, **2 to 32 characters** from `a-z`, `0-9`, `-`. Defaults to `"global"`.

```jsonc
// request
{ "nickname": "Asha", "arena": "asha-pizza-party" }

// response 201
{
  "runId": "b3f1c2d4-6a7e-4f10-9c55-2d1e8a0b7c31",
  "arena": "asha-pizza-party",
  "lives": 3,
  "maxRounds": 15,
  "score": 0,
  "command": { "round": 1, "text": "Simon says: click RED", "timeLimitMs": 3000 }
}
```

## POST /api/answer

| Field | Type | Rule |
|---|---|---|
| `runId` | string | required |
| `round` | int | optional, but the frontend always sends it. If it doesn't match the server's round → 409 (protects against double-sends) |
| `action` | `click` \| `double` \| `hold` \| `none` | required |
| `color` | pad id or `null` | required for click/double/hold; **must be `null`** for none |
| `reactionMs` | int or `null` | ms from the command appearing to the **first** press; required unless none |
| `holdMs` | int or `null` | required only for hold |

```jsonc
// request
{ "runId": "b3f1...", "round": 1, "action": "click", "color": "red", "reactionMs": 742, "holdMs": null }

// response 200, run continues
{
  "correct": true,
  "reason": "ok",
  "round": 1,              // the round that was just judged
  "pointsEarned": 175,
  "multiplier": 1,
  "streak": 1,
  "score": 175,
  "lives": 3,
  "gameOver": false,
  "command": { "round": 2, "text": "Click BLUE", "timeLimitMs": 3000 },
  "summary": null
}

// response 200, run ends
{
  "correct": false, "reason": "trap", "round": 9, "pointsEarned": 0, "multiplier": 1,
  "streak": 0, "score": 1240, "lives": 0, "gameOver": true, "command": null,
  "summary": { "finalScore": 1240, "title": "Sharp", "rank": 4, "roundsPlayed": 9, "avgReactionMs": 812 }
}
```

**Worked example:** 742 ms on a 3000 ms limit → speed bonus = round(100 × (1 − 742/3000)) = **75** → points = (100 + 75) × 1 = **175**. (This exact case is a test in `backend/tests/referee.test.js`.)

### `reason` values

| reason | Meaning |
|---|---|
| `ok` | Correct! |
| `wrong_color` | Right action, wrong pad |
| `wrong_action` | e.g. single tap on a double-tap command, or a hold shorter than 600 ms |
| `trap` | You acted, but the command did **not** start with "Simon says" |
| `timeout` | You did nothing (or were too slow) on a real command |
| `invalid_timing` | Reported timing is impossible: anti-cheat |

### How the referee judges (in this order, stops at first failure)

1. Run not found → 404. Run finished → 409. Wrong `round` → 409.
2. `elapsedMs` = now − time the server issued the command.
3. **Expected action is `none`** (trap or "DON'T click"): any action → `trap`; `none` arriving more than 200 ms before the time limit → `invalid_timing`; else `ok`.
4. **Expected a real action:** `none` → `timeout`; different action (or hold < 600 ms) → `wrong_action`; different pad → `wrong_color`.
5. **Timing:** `reactionMs` < 100 → `invalid_timing`; `reactionMs` > `elapsedMs` → `invalid_timing`; `elapsedMs − reactionMs` > **2500 ms** (network allowance, `MAX_NETWORK_GAP_MS`) → `invalid_timing`; `reactionMs` > time limit → `timeout`.
6. Correct → add points, streak + 1. Wrong → lose a life, streak = 0.
7. Lives = 0 or round 15 judged → run finished, summary built. Otherwise → next command.

🧠 **Why the 2500 ms allowance?** Between the server sending a command and receiving your answer, time passes for things that aren't your reaction: the trip to your phone, the 350 ms feedback pause, the 400 ms double-tap wait, and the trip back. A cheater can gain at most that margin, and can never claim faster than 100 ms.

### Scoring

- Multiplier from the streak **before** this answer: 0-2 → ×1, 3-5 → ×2, 6+ → ×3
- Speed bonus (real command): `max(0, round(100 × (1 − reactionMs / timeLimitMs)))`
- Speed bonus (trap dodged): flat **50**
- **points = (100 + speedBonus) × multiplier**

| Rank title | Final score |
|---|---|
| Rookie | < 1000 |
| Sharp | 1000-2499 |
| Lightning | 2500-4499 |
| Reflex God | 4500+ |

## GET /api/leaderboard?limit=10&arena=global

`limit` defaults to 10, max 50. `arena` defaults to `global`. Sorted by score (high first), then average reaction (low first).

```json
{
  "arena": "global",
  "totalRuns": 37,
  "entries": [
    { "rank": 1, "nickname": "Asha", "score": 5120, "avgReactionMs": 640, "title": "Reflex God" }
  ],
  "generatedAt": "2026-11-12T10:00:00.000Z"
}
```

---

## Command text format

| Case | Text from server | Example after the classic theme |
|---|---|---|
| Real click | `Simon says: click RED` | **Simon says:** tap 🔴 RED |
| Real double | `Simon says: double-click BLUE` | **Simon says:** double-tap 🔵 BLUE |
| Trap click | `Click GREEN` | Tap 🟢 GREEN |
| Trap double | `Double-click YELLOW` | Double-tap 🟡 YELLOW |
| Stretch: hold | `Simon says: hold YELLOW` | **Simon says:** hold 🟡 YELLOW |
| Stretch: don't | `Simon says: DON'T click` | **Simon says:** DON'T touch anything! |

The frontend **translates** this text with the theme (`lib/commandText.js`). That's why you can turn the whole game into "Mummy says: grab 🌶️ MIRCHI" without touching the backend.

---

## Data model: one MongoDB collection, `runs`

| Field | Type | Meaning |
|---|---|---|
| `_id` | String (UUID) | sent to the browser as `runId` |
| `arena` | String | which leaderboard |
| `nickname` | String | trimmed nickname |
| `status` | `active` \| `finished` | |
| `round`, `lives`, `score`, `streak` | Number | live game state |
| `reactionSumMs`, `reactionCount` | Number | for the average reaction time |
| `avgReactionMs`, `sortReactionMs` | Number | set when the run finishes (tie-breaker) |
| `currentCommand` | Object | `{ round, text, simon, action, color, timeLimitMs, issuedAt }`, **secret** |
| `finishedAt`, `createdAt`, `updatedAt` | Date | |

Index: `{ arena: 1, status: 1, score: -1, sortReactionMs: 1 }` keeps the leaderboard fast.

You can see these documents live in Atlas → **Browse Collections** → `reflex-arena` → `runs`.
