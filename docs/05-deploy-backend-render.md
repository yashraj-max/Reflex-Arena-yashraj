# 05 · Deploy the Backend on Render (free) ☁️

Right now your backend only runs on **your** laptop, at `localhost`, which nobody else can reach. Let's put it on a real server with a public URL like `https://reflex-arena-api.onrender.com`.

⏱️ About 10-15 minutes (the first build takes a few minutes).

> 🧠 **What is Render doing?** It rents you a small Linux computer, downloads your code from GitHub, runs `npm install`, then `npm start`, and gives it a public HTTPS address. Every time you `git push`, it does all that again automatically. That's **continuous deployment**.

---

## Step 1: Put your code on GitHub

Skip this if you used "Use this template" and have already pushed.

```bash
# in the reflex-arena folder (the one containing backend/ and frontend/)
git init
git add .
git commit -m "Reflex Arena v1"
git branch -M main
```

Create an **empty** repo on https://github.com/new (no README), then:

```bash
git remote add origin https://github.com/<your-username>/reflex-arena.git
git push -u origin main
```

⚠️ Before pushing, double-check `git status` does **not** list `backend/.env`. It's in `.gitignore`, but if you see it, stop and ask for help. Your DB password must not go to GitHub.

## Step 2: Create the Web Service

1. Go to https://dashboard.render.com → sign in with **GitHub**.
2. Click **New +** → **Web Service**.
3. Connect your GitHub account if asked, and pick your **reflex-arena** repo. (If it's not listed: "Configure account" → give Render access to the repo.)
4. Fill in the settings:

| Setting | Value |
|---|---|
| **Name** | `reflex-arena-api` (or `yourname-arena-api`), which becomes the URL |
| **Language / Runtime** | `Node` |
| **Branch** | `main` |
| **Region** | **Singapore** (closest to India), ideally the same as Atlas |
| **Root Directory** | `backend` ⚠️ important: our server lives in the backend folder |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

5. **Environment Variables** → **Add Environment Variable**:

| Key | Value |
|---|---|
| `MONGODB_URI` | your full Atlas string from [04](04-database-mongodb-atlas.md) |
| `CORS_ORIGINS` | `*` (we'll tighten this after the frontend is deployed) |
| `NODE_VERSION` | `22` |

6. (Optional) **Advanced → Health Check Path:** `/api/health`
7. Click **Deploy Web Service** (or **Create Web Service**).

## Step 3: Watch it build 🍿

Render shows live **Logs**. You want to see:

```
==> Running build command 'npm install'...
added 80 packages in 4s
==> Build successful 🎉
==> Running 'npm start'
✅ MongoDB connected (database: reflex-arena)
🚀 Reflex Arena API listening on port 10000
==> Your service is live 🎉
```

> 🧠 Notice the port isn't 5000. Render picks the port and passes it in the `PORT` environment variable, which `config/env.js` reads. That's why we never hard-code ports.

## Step 4: Test it

Your URL is at the top of the page, e.g. `https://reflex-arena-api.onrender.com`.

- Open `https://<your-service>.onrender.com/api/health` → `{"status":"ok",...,"db":"connected"}` ✅
- Open `https://<your-service>.onrender.com/api/leaderboard` → `{"arena":"global","entries":[...]}` ✅
- Or change `@base` in `backend/requests.http` to your Render URL and send the requests.

**Copy this URL**: the frontend needs it in the next step.

---

## 💤 Free tier: what to expect

| Behaviour | What it means for you |
|---|---|
| **Sleeps after 15 min without traffic** | The first visit after that takes **about 1 minute** to wake up. The start screen shows "😴 Waking up the server...", which is normal |
| **750 free instance hours / month** | Enough for one service running all month |
| **No persistent disk** | Fine, because our data lives in **Atlas**, not on Render's disk 😎 |

💡 Before a demo, open `/api/health` a minute early to wake it up.

---

## ✅ Checklist

- [ ] Logs show `MongoDB connected` and `Your service is live`
- [ ] `/api/health` on the public URL returns `"db":"connected"`
- [ ] You copied the URL (no trailing `/`)

## 🆘 Common problems

| Symptom | Fix |
|---|---|
| Build fails: `Could not read package.json` / `ENOENT` | **Root Directory** must be `backend` (Settings → Build & Deploy) |
| `MONGODB_URI is missing` | Add it under **Environment**, then **Manual Deploy → Deploy latest commit** |
| `bad auth` / `Could not connect to any servers` | See [04 · Common problems](04-database-mongodb-atlas.md#-common-problems). Usually it's the password, or Network Access missing `0.0.0.0/0` |
| "Deploy failed" with exit status 1 | Scroll **up** in the logs: the real error is above the last line |
| Changed an env variable and nothing happened | Saving env vars triggers a redeploy. Wait for it to finish |

## 🗂️ Bonus: infrastructure as code (`render.yaml`)

The repo includes `render.yaml`, which holds the same settings as code. Instead of filling in the form: **New + → Blueprint** → pick your repo → Render reads the file and only asks for `MONGODB_URI`. Real teams prefer this: settings are versioned in Git, reviewable and repeatable.

Next: **[06 · Deploy the frontend](06-deploy-frontend-vercel.md)** →
