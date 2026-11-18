# 00 · Start Here 🚦

Welcome! By the end of this workshop you will have:

- ✅ a working **full-stack game** (React + Express + MongoDB)
- ✅ that **you** have restyled into your own game
- ✅ live on the internet at **your own link**, e.g. `https://asha-arena.vercel.app`
- ✅ with a **real leaderboard** your friends can compete on

That's the same journey every real product takes: **Idea → Build → Ship → Maintain.**

---

## 🗺️ Your roadmap

Tick these off as you go.

### Stage 1: Understand (10 min)
- [ ] Play the finished game (your facilitator will share a link)
- [ ] Read [01 · How it works](01-how-it-works.md): follow one tap through the whole system
- [ ] Skim [02 · API contract](02-api-contract.md): the "agreement" between frontend and backend

### Stage 2: Frontend on your laptop (15 min)
- [ ] Get the code (see "Get the code" below)
- [ ] `cd frontend` → `npm install` → `npm run dev`
- [ ] Play in **mock mode** at http://localhost:5173 (the fake server lives in your browser)

### Stage 3: Make it yours (15 min, the fun part)
- [ ] Open `frontend/src/theme/index.js` and switch to another theme
- [ ] Edit `frontend/src/theme/presets/my-theme.js` with your own idea
- [ ] Use an AI prompt from [07 · Make it yours](07-make-it-yours.md)

### Stage 4: Database + backend (25 min)
- [ ] Create a free MongoDB Atlas database → [04](04-database-mongodb-atlas.md)
- [ ] Run the backend locally and run its tests → [03](03-run-locally.md)
- [ ] Connect your frontend to your backend (mock mode **off**)

### Stage 5: Ship it 🚀 (25 min)
- [ ] Push your code to GitHub
- [ ] Deploy the backend on Render → [05](05-deploy-backend-render.md)
- [ ] Deploy the frontend on Vercel → [06](06-deploy-frontend-vercel.md)
- [ ] Share your link! Play on your phone!

### Stage 6: Maintain (after the workshop)
- [ ] Make a change, push it, and watch it auto-deploy → [09](09-maintenance.md)

> 🏃 **Short on time?** Your facilitator may run a **shared backend**. Then you skip Stage 4 and Render, and only deploy the frontend, with your own leaderboard "arena". See [06 · Option B](06-deploy-frontend-vercel.md#option-b-use-the-workshops-shared-backend).

---

## 👤 Accounts you need (all free, no credit card)

Create these **before** the workshop if you can. Sign in with GitHub everywhere to make life easy.

| Service | Why | Sign up |
|---|---|---|
| **GitHub** | Stores your code; Vercel and Render deploy from it | https://github.com/signup |
| **Vercel** | Hosts the frontend | https://vercel.com/signup → "Continue with GitHub" |
| **Render** | Hosts the backend | https://dashboard.render.com/register → "GitHub" |
| **MongoDB Atlas** | Hosts the database | https://www.mongodb.com/cloud/atlas/register |
| **ChatGPT** or **Gemini** | Your AI pair programmer for customising | https://chatgpt.com · https://gemini.google.com |

## 💻 Tools to install

| Tool | Check it works | Get it |
|---|---|---|
| **Node.js 20+** (LTS) | `node -v` prints v20 or higher | https://nodejs.org |
| **Git** | `git --version` | https://git-scm.com |
| **VS Code** | - | https://code.visualstudio.com |

> 🪟 **Windows users:** use the VS Code terminal (`` Ctrl+` ``). Commands like `npm install` work the same in PowerShell, Command Prompt and Git Bash. Where a command differs, this handbook shows both.

---

## 📥 Get the code

**Option 1 (recommended): use the template.** On the workshop repo page, click **"Use this template" → "Create a new repository"**, name it (e.g. `reflex-arena`), keep it **Public**, then:

```bash
git clone https://github.com/<your-username>/reflex-arena.git
cd reflex-arena
code .
```

**Option 2: download a ZIP**, unzip it, open the folder in VS Code, then put it on GitHub later (see [05](05-deploy-backend-render.md#step-1-put-your-code-on-github)).

---

## 🧭 How to read this handbook

- 💡 **Tip:** a useful shortcut
- ⚠️ **Watch out:** a common mistake
- 🧠 **Concept:** the "why" behind the "how"
- 🤖 **AI prompt:** copy-paste into ChatGPT or Gemini

When something breaks, don't panic: check [08 · Troubleshooting](08-troubleshooting.md). Every developer breaks things daily. The skill is fixing them. 💪
