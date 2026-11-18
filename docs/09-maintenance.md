# 09 · Life After Launch: Maintenance 🔧

Shipping is not the end. It's the **start**. Real products spend most of their life being **watched, fixed and improved**. Here's how that works for your game, with hands-on drills.

```
        ┌────────────┐
        │   Build    │
        └─────┬──────┘
              ▼
   ┌──────▶ Ship ───────┐
   │                    ▼
 Improve            Monitor   ← logs, health checks, user feedback
   ▲                    │
   └────── Fix ◀────────┘
```

---

## 1. Your production setup at a glance

| Piece | Dashboard | What to watch |
|---|---|---|
| Frontend | vercel.com → your project | Deployments (green/red), build logs |
| Backend | dashboard.render.com → your service | **Logs**, Events (deploys), Metrics |
| Database | cloud.mongodb.com → your cluster | Browse Collections, Metrics, storage used |
| Code | github.com → your repo | Commits = history of every change |

---

## 2. Drills 🏋️ (do them, don't just read them)

### Drill 1: Read the logs (5 min)

1. Open Render → your service → **Logs**.
2. Play a game on your live site.
3. Watch the lines appear live:
   ```
   POST /api/start 201 48ms
   POST /api/answer 200 31ms
   ...
   ```
4. Now enter a 1-letter nickname directly against the API (`requests.http` #6) and find the `422` line.

🧠 Every line comes from `backend/src/middleware/logger.js`. **Logs are how you see production.** You can't put a breakpoint on a server you don't own.

### Drill 2: Ship a versioned update (10 min)

1. Change something visible, e.g. a message in your theme.
2. Bump the backend version in `backend/package.json`: `"version": "1.0.0"` → `"1.1.0"`.
3. Commit with a meaningful message and push:
   ```bash
   git add .
   git commit -m "v1.1.0: funnier trap messages"
   git push
   ```
4. Watch **both** Vercel and Render rebuild automatically.
5. Refresh your site: the badge now says **🟢 Server online · v1.1.0**.

🧠 **Semantic versioning (MAJOR.MINOR.PATCH):** PATCH `1.0.1` = bug fix; MINOR `1.1.0` = new feature, nothing breaks; MAJOR `2.0.0` = breaking change (e.g. the API contract changed).

### Drill 3: Break it and recover (10 min)

**Part A: a broken build can't hurt you.**
1. In `frontend/src/theme/index.js`, import `./presets/doesnotexist.js`. Push.
2. Vercel's build **fails** ❌, but open your site: **it still works!** Vercel only switches traffic to a build that succeeds.
3. Fix the import, push, and it goes green ✅.

**Part B: a bug that builds fine (the dangerous kind).**
1. Make a *visible* but harmless mistake that still builds (e.g. set `gameTitle: 'OOPS'`). Push.
2. It's live. Pretend it's a serious bug and users are complaining!
3. **Instant rollback:** Vercel → Deployments → the previous good deployment → ⋯ → **Promote to Production** (or **Instant Rollback**). Fixed in seconds, without touching code.
4. On Render the equivalent is: **Events** → an earlier successful deploy → **Rollback**.
5. Now fix the code properly and push.

🧠 **Rollback first, debug second.** When production is broken, restore the last good version immediately, then investigate calmly.

### Drill 4: Use a preview deployment (10 min)

1. Create a branch: `git checkout -b feature/new-sounds`
2. Change `frontend/src/lib/sound.js`, then commit and `git push -u origin feature/new-sounds`
3. Vercel creates a **Preview URL** just for this branch. Production is untouched.
4. Send the preview link to a friend: "Do these sounds work?"
5. Happy? Open a Pull Request on GitHub → merge → production updates.

🧠 This is how teams work: **every change gets reviewed and tested before real users see it.**

### Drill 5: Rotate a secret (5 min)

Pretend your DB password leaked:
1. Atlas → **Database Access** → your user → **Edit** → new password.
2. Render → **Environment** → update `MONGODB_URI` → save (it redeploys).
3. Check `/api/health` shows `"db":"connected"`.

---

## 3. Monitoring: know before your users tell you

### Free uptime monitor
Use a free service like **UptimeRobot** (uptimerobot.com) or **cron-job.org**:
- Monitor type: HTTP(s), URL: `https://<your-service>.onrender.com/api/health`, interval: 5-10 min
- You get an **email if the server goes down**
- Side effect: regular pings keep a free Render server from sleeping. One service running 24/7 (~720 h) fits inside Render's 750 free hours per month.

### What to look at weekly
- **Render Metrics:** memory and CPU. Spikes = something to investigate
- **Atlas Metrics:** connections, operations, storage (free = 512 MB)
- **Vercel Analytics** (optional, free on Hobby): how many people played

---

## 4. Database housekeeping

Open Atlas → cluster → **Browse Collections** (or use the free **MongoDB Compass** app).

**Reset a leaderboard** for a new competition. In Atlas → `runs` collection → Filter:
```json
{ "arena": "workshop-finals" }
```
…then delete the matching documents. (Or, in the Atlas shell: `db.runs.deleteMany({ arena: "workshop-finals" })`)

**Clean up abandoned runs** (players who closed the tab mid-game stay `active` forever):
```js
db.runs.deleteMany({ status: "active", updatedAt: { $lt: new Date(Date.now() - 24*60*60*1000) } })
```

💡 **Improvement idea** (a real maintenance ticket!): make MongoDB delete abandoned runs automatically with a [TTL index](https://www.mongodb.com/docs/manual/core/index-ttl/) on active runs.

**Backup:** Compass → collection → **Export Collection** → JSON. Do it before any risky change.

---

## 5. Keeping dependencies healthy

```bash
npm outdated     # which packages have newer versions
npm audit        # known security issues
npm update       # safe minor/patch updates
```

Run `npm test` after updating the backend, play a game after updating the frontend, then push.

---

## 6. A release checklist (stick it on your wall)

- [ ] Tests pass (`cd backend && npm test`)
- [ ] Played one full game locally against the real backend
- [ ] Version bumped (`backend/package.json`)
- [ ] Meaningful commit message
- [ ] Pushed, and both deploys are green
- [ ] `/api/health` shows the new version
- [ ] One full game on the **live** site, on a **phone**
- [ ] Rollback plan known (previous deployment in Vercel/Render)

---

## 7. Ideas for v2 (your own roadmap)

| Idea | Touches | Teaches |
|---|---|---|
| Daily leaderboard tab | backend query + frontend tab | date filtering, indexes |
| Hold & DON'T-tap commands | `ENABLE_STRETCH=true` | feature flags |
| Login with Google | backend auth | authentication, JWT |
| Two-player rooms | WebSockets | real-time systems |
| Profanity filter for nicknames | `validate.js` | input sanitisation |
| Rate limiting | `express-rate-limit` | abuse protection |
| TTL index for abandoned runs | `models/Run.js` | database maintenance |

Keep a `CHANGELOG.md` in your repo listing what changed in each version. Future-you will be grateful. 🙏
