# 06 · Deploy the Frontend on Vercel (free) 🌍

This is the moment your game gets **a link you can send to anyone**. ⏱️ About 5 minutes.

> 🧠 **What is Vercel doing?** It runs `npm run build`, which turns your React code into plain HTML/CSS/JS files in `dist/`, and serves those files from a global network (CDN). There's no server running your code, just files, which is why it's fast and free.

There are two ways to connect the frontend:

- **Option A:** your own backend (you did [04](04-database-mongodb-atlas.md) + [05](05-deploy-backend-render.md))
- **Option B:** the workshop's shared backend (the facilitator gives you a URL)

Both use the same steps. Only the environment variables differ.

---

## Step 1: Import the project

1. Push your latest code: `git add . && git commit -m "my theme" && git push`
2. Go to https://vercel.com → sign in with **GitHub**.
3. **Add New... → Project** → find your **reflex-arena** repo → **Import**.

## Step 2: Configure

| Setting | Value |
|---|---|
| **Project Name** | becomes your URL: `asha-arena` → `asha-arena.vercel.app` |
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | click **Edit** → choose **`frontend`** ⚠️ important |
| Build Command | `npm run build` (default) |
| Output Directory | `dist` (default) |

## Step 3: Environment variables

Open **Environment Variables** and add:

### Option A: your own backend

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://reflex-arena-api.onrender.com` (your Render URL, **no** `/` at the end, **no** `/api`) |
| `VITE_ARENA` | `global` (or any name you like, e.g. `cse-a-champions`) |

### Option B: use the workshop's shared backend

| Key | Value |
|---|---|
| `VITE_API_URL` | the URL your facilitator shares |
| `VITE_ARENA` | **your own unique name**, e.g. `asha-kitchen` (2-32 chars: `a-z`, `0-9`, `-`) |

🧠 **What's an arena?** The shared backend stores everyone's games, but each arena has **its own leaderboard**. Players on *your* site only compete with players on *your* site. Same server, separate worlds. Real SaaS products call this **multi-tenancy**.

> ⚠️ Remember: `VITE_` variables are **public**, baked into the JavaScript at build time. Never put a password here.

## Step 4: Deploy 🚀

Click **Deploy**. About 30 seconds later: 🎉 **Congratulations!** Click the preview to open your live game.

## Step 5: Test it for real

- [ ] The start screen badge shows **🟢 Server online** (or 😴 waking up, so wait a bit)
- [ ] Play a full run on your **phone** (scan the URL as a QR code, or send it to yourself)
- [ ] Your run shows on the leaderboard
- [ ] A friend plays on their phone and appears on **your** leaderboard 🏆

**Share your link!** You've shipped a full-stack product. 🥳

---

## Step 6 (optional): lock CORS to your site

Right now your backend accepts calls from any website (`CORS_ORIGINS=*`). To allow only your game:

Render → your service → **Environment** → set `CORS_ORIGINS` to:

```
https://asha-arena.vercel.app,http://localhost:5173
```

(Comma separated, no trailing `/`. Keep localhost so local development still works.) Save, wait for the redeploy, and check the game still works.

---

## 🔁 How updates work from now on

```
edit code → git push → Vercel AND Render both rebuild automatically → live in ~1 min
```

- Every `git push` to `main` → **Production** deploy
- Push to another branch → a **Preview** URL to test before merging (super useful!)

⚠️ **Changed an environment variable on Vercel?** Vite bakes variables in at **build** time, so you must redeploy: Deployments → ⋯ on the latest → **Redeploy**.

## 🆘 Common problems

| Symptom | Fix |
|---|---|
| Badge says **🧪 Mock mode** on Vercel | `VITE_API_URL` wasn't set, or you set it *after* deploying → **Redeploy** |
| Badge says **🔴 Server offline** | Wrong URL (typo, trailing `/api`, `http` instead of `https`), or the backend crashed (check Render logs) |
| Console: `blocked by CORS policy` | `CORS_ORIGINS` on Render doesn't include your exact Vercel URL (https, no trailing `/`) |
| Build error `Could not resolve "./presets/xyz.js"` | Your `theme/index.js` imports a file that doesn't exist. Check spelling and capitals: Vercel runs on Linux, which is **case-sensitive** |
| 404 page on Vercel | Root Directory isn't `frontend` → Settings → General → Root Directory |
| Works on laptop, not on phone | You're testing `localhost`. Use the Vercel URL |

More: [08 · Troubleshooting](08-troubleshooting.md)

Next: make it truly yours → **[07 · Make it yours](07-make-it-yours.md)** 🎨
