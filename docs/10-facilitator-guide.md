# 10 · Facilitator Guide 🎤

For the organisers running the workshop. Students don't need this page.

---

## 1. What changed from the original plan (PDF)

The design ideas from *"Reflex Arena: Full Project Plan"* are kept: game rules, scoring, ranks, the "server is the referee" principle, the API contract, mock mode, and the build → integrate → deploy flow. What changed:

| Topic | PDF plan | This project | Why |
|---|---|---|---|
| Stack | HTML/JS + FastAPI + SQLite | **React (Vite) + Express + MongoDB** | MERN: one language (JS) end to end, which suits 1st/2nd years |
| Hosting | One Render service | **Vercel** (frontend) + **Render** (backend) + **Atlas** (DB) | Shows students three real platforms and how they connect |
| Database | SQLite file | **MongoDB Atlas M0** | Render free disk is wiped on restart, so SQLite would lose the leaderboard |
| Code source | Students generate everything with AI prompts | **Complete, tested codebase**; AI is used to **customise** | A 90-minute session can't absorb half-generated code failing; customising with AI is more reliable and more fun |
| Personalisation | not covered | **Theme system** (6 presets) + `arena` leaderboards + feature ideas with AI prompts | Every student ships *their own* product |
| Network allowance | 1500 ms | **2500 ms** (`MAX_NETWORK_GAP_MS`) | Vercel → Render → Atlas has more hops than a single service |
| API | 4 endpoints | Same 4 + optional `arena` and `round` fields, `version`/`db` in health | Shared-backend leaderboards, protection against double-sends, visible versions |
| Stretch commands | prompts F2/B2 | **Built in**, off by default (`ENABLE_STRETCH=true`) | Fast groups flip one env var |
| Tests | pytest | `node --test` (built into Node, zero install) | |

---

## 2. Pick a format

### Format A: "Express" (90 min) with a shared backend ✅ recommended for first-years

You deploy **one** backend + Atlas before the session. Students run the frontend, customise it, and deploy it to Vercel pointing at your backend, each with their own `VITE_ARENA`. They still learn every concept (the contract, env vars, CORS, deploys), but only create accounts on GitHub + Vercel.

| Time | Segment | Facilitator does | Students do |
|---|---|---|---|
| 0-10 | **Demo & hook** | Projector: play the live game. Ask 3 volunteers to play on their phones. Show the leaderboard updating. | Play on phones |
| 10-20 | **How it works** | Draw the 3-box diagram. Walk through "follow one tap" ([01](01-how-it-works.md)). F12 → Network → show a real `/api/answer` request. Try to cheat with `requests.http` #4 → `invalid_timing`. | Watch, ask |
| 20-35 | **Run it locally** | Live-code: clone → `npm install` → `npm run dev` (mock mode). Explain mock mode = parallel teamwork. | Same on their laptops |
| 35-55 | **Make it yours** | Show switching presets (one word). Show `my-theme.js`. Demo the AI theme prompt live with ChatGPT/Gemini. | Build their theme |
| 55-70 | **Ship it** | Push to GitHub → Vercel import → Root Directory `frontend` → `VITE_API_URL` + `VITE_ARENA` → Deploy. | Deploy, open on phone |
| 70-80 | **Maintain** | Change a message → push → auto-deploy. Show Render logs scrolling with everyone's requests. Show a rollback. | Push one update |
| 80-90 | **🏆 Competition** | Projector: your competition site (`VITE_ARENA=workshop-finals`). Everyone plays on their phones. Announce the top 3. | Play! |

### Format B: "Full stack" (3 hours) where every student owns everything

| Time | Segment |
|---|---|
| 0-15 | Demo + how it works |
| 15-35 | Frontend locally in mock mode + first theme |
| 35-60 | MongoDB Atlas account + cluster ([04](04-database-mongodb-atlas.md)) |
| 60-85 | Backend locally: `.env`, `npm test`, `npm run dev`, `requests.http` |
| 85-100 | Integration: `VITE_API_URL=http://localhost:5000`, Network tab, checklist ([03 Part C](03-run-locally.md#part-c-connect-frontend--backend-integration)) |
| 100-110 | ☕ Break (Atlas clusters and installs finish in the background) |
| 110-130 | Deploy backend on Render ([05](05-deploy-backend-render.md)) |
| 130-145 | Deploy frontend on Vercel ([06](06-deploy-frontend-vercel.md)) |
| 145-165 | Make it yours: features with AI ([07](07-make-it-yours.md) Level 3) |
| 165-180 | Maintenance drills + competition |

---

## 3. Before the workshop

### One week before
- [ ] Push this project to a GitHub repo and enable **Settings → Template repository**.
- [ ] Send students the account list + tools list from [00 · Start here](00-START-HERE.md). **Ask them to create accounts in advance.** Email verification and GitHub's anti-spam checks can take time on the day.
- [ ] Check whether the venue Wi-Fi blocks MongoDB (port 27017) or SRV DNS lookups. Run the backend locally on that network once. (Only local backend dev is affected; Render → Atlas always works.)

### Day before
- [ ] Deploy the **shared backend** on Render ([05](05-deploy-backend-render.md)) with its own Atlas cluster.
- [ ] Deploy **your own frontend** twice:
  - a demo site (`VITE_ARENA=demo`)
  - a competition site (`VITE_ARENA=workshop-finals`)
- [ ] **Load test** the shared backend with roughly the class size:
  ```bash
  cd backend
  npm run load-test -- https://<shared-backend>.onrender.com 60
  ```
  Healthy = no errors, almost all `ok`, p95 < 800 ms. If not: raise `MAX_NETWORK_GAP_MS`, or upgrade the shared Render instance to a paid plan for the day (free instances have very little CPU).
- [ ] Rehearse every step on a **fresh** laptop or user account.
- [ ] Tag a known-good version: `git tag v1.0-workshop && git push --tags`

### 15 minutes before
- [ ] Open `<shared-backend>/api/health` to **wake the Render free instance**
- [ ] Write the shared backend URL big on the board / slide
- [ ] Put the competition site's URL + a QR code on the projector

---

## 4. Talking points per concept

| Concept | One-liner for the room | Show it |
|---|---|---|
| Client vs server | "Your browser is a stage; the server is the referee." | F12 → change a score variable; leaderboard doesn't care |
| API contract | "Two teams, one agreement, zero meetings." | [02](02-api-contract.md) side by side with the Network tab |
| Mock mode | "Don't wait for the backend team. Fake it till they make it." | Toggle `VITE_API_URL` and watch the badge change |
| Validation | "Never trust input. Anyone can send anything." | `requests.http` #6 → 422 |
| Anti-cheat | "The server double-checks your timing." | `requests.http` #4 → `invalid_timing` |
| Env variables | "Secrets live in the environment, not in the code." | `.env` is git-ignored; Render Environment tab |
| CORS | "Browsers protect users from websites talking behind their back." | Set `CORS_ORIGINS` to a wrong site → console error → fix |
| CI/CD | "Push = ship." | Push a change; watch Vercel + Render rebuild |
| Rollback | "Restore first, debug second." | Vercel → Promote previous deployment |
| Multi-tenancy | "One server, many separate leaderboards." | Two student sites, same backend, different arenas |

---

## 5. Fallback plans 🛟

| Problem on the day | Fallback |
|---|---|
| Render shared backend down / slow | Students deploy to Vercel **without** `VITE_API_URL`. Mock mode works fully (leaderboard per browser). They still ship a live link! |
| Atlas blocked on campus Wi-Fi (local dev) | Skip local backend; deploy to Render directly (Render → Atlas isn't affected). Or use phone hotspots |
| Student's Node install broken | Pair them with a neighbour, or use **GitHub Codespaces** (repo → Code → Codespaces), which has Node preinstalled |
| GitHub account flagged / unverified | Pair programming, or deploy the facilitator's fork with their theme |
| AI free-tier limits hit | Switch model (ChatGPT ↔ Gemini), or use the 6 presets |
| Student far behind | `git checkout v1.0-workshop` gives them a clean working copy |
| Someone committed `.env` | Rotate the Atlas password immediately ([09 Drill 5](09-maintenance.md#drill-5-rotate-a-secret-5-min)) |

---

## 6. Capacity notes (free tiers)

- **Render free:** 512 MB RAM and a small CPU share. Sleeps after 15 minutes idle and wakes in about 1 minute. Fine for dozens of simultaneous players; **load test** for bigger rooms.
- **Atlas M0:** 512 MB storage, shared resources and a connection cap. One Express server uses a small connection pool, so that's fine.
- **Vercel Hobby:** static files on a CDN. Effectively unlimited for a workshop.
- Each player sends about **1 request per 1-3 seconds** while playing.

---

## 7. After the workshop

- Share a "Wall of Fame" with everyone's live links (a simple GitHub README or a Google Form → Sheet).
- Encourage students to pin the repo on their GitHub profile and add the live link in its description.
- Award small prizes: 🏆 top score, 🎨 most creative theme, 🛠️ coolest feature, 😂 funniest messages.
- Collect feedback: what clicked, what didn't. Then **maintain this handbook** like a product. 😉
