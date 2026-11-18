# 04 · Database: MongoDB Atlas (free) 🍃

Your game needs somewhere to **remember** runs and the leaderboard, even when the server restarts. We use **MongoDB Atlas**, MongoDB's cloud service, on its **free M0 cluster**.

> 🧠 **Why not Supabase or SQLite?**
> - We're on the **MERN** stack: MongoDB stores JSON-like documents, which is the same shape our API already speaks. With Mongoose there's no SQL to learn today.
> - **SQLite** (a file on disk) doesn't work on Render's free plan, because the disk is wiped every time the server restarts or sleeps, which would delete your leaderboard.
> - **Supabase** is great too, but it's PostgreSQL (SQL). Save it for your next project!

⏱️ About 10 minutes. The Atlas website changes its layout from time to time, so if a button name differs slightly, look for the closest match.

---

## Step 1: Create an account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with **Google** or **GitHub** (fastest).
3. If it asks survey questions ("What are you building?"), any answer is fine. Pick *Learning / JavaScript*.

## Step 2: Create a free cluster

A "cluster" is your database server.

1. Click **Create** (or **Build a Database**).
2. Choose **M0 / Free**. Make sure it shows **Free**, not a price.
3. **Provider:** AWS. **Region:** pick the one closest to your Render server:
   - India → **Mumbai (ap-south-1)** or **Singapore (ap-southeast-1)** if available
   - 💡 Choose **Singapore** for Render too ([05](05-deploy-backend-render.md)). Keeping both close makes the game feel snappier.
4. **Name:** leave `Cluster0` or call it `reflex-arena`.
5. Click **Create Deployment**. It takes 1-3 minutes to provision.

## Step 3: Create a database user

Atlas shows a **"Connect to Cluster0"** dialog (if not, click **Connect** on your cluster).

1. **Username:** e.g. `reflex`
2. **Password:** click **Autogenerate Secure Password**, or type one with **only letters and numbers** (e.g. `Arena2026Play`).
   ⚠️ Avoid `@ # / : ? %` in the password: they break the connection URL. If you must use them, you'll need to URL-encode them.
3. **Copy the password somewhere safe now.** You can't see it again (you can only reset it).
4. Click **Create Database User**.

## Step 4: Allow Render to connect (Network Access)

By default Atlas blocks every computer. Render's free servers don't have a fixed IP address, so we allow all IPs and rely on the username and password for security.

1. Left menu → **Security → Network Access** (or "Database & Network Access").
2. **Add IP Address** → **Allow Access from Anywhere** → this fills in `0.0.0.0/0`.
3. **Confirm**. Wait until the status shows **Active** (about 1 minute).

> 🔒 Is `0.0.0.0/0` safe? For a workshop game, yes: an attacker would still need your password. For real company apps, teams use private networking or fixed IPs (paid features).

## Step 5: Copy the connection string

1. Back on your cluster → **Connect** → **Drivers** (it may say "Connect your application").
2. Driver: **Node.js**, latest version.
3. Copy the string. It looks like:
   ```
   mongodb+srv://reflex:<db_password>@cluster0.ab1cd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
4. Edit it:
   - Replace `<db_password>` with your real password (**remove the `< >`**)
   - Add the database name **`reflex-arena`** right after `.net/`

   ```
   mongodb+srv://reflex:Arena2026Play@cluster0.ab1cd.mongodb.net/reflex-arena?retryWrites=true&w=majority&appName=Cluster0
                        ^^^^^^^^^^^^^                           ^^^^^^^^^^^^
                        your password                           database name
   ```

   💡 You don't need to create the database or collection yourself. MongoDB creates `reflex-arena` → `runs` automatically on the first save.

## Step 6: Use it

- **Locally:** paste it into `backend/.env` as `MONGODB_URI=...` ([03](03-run-locally.md#part-b-backend-on-its-own))
- **On Render:** paste it as the `MONGODB_URI` environment variable ([05](05-deploy-backend-render.md))

## Step 7: Watch your data 👀

After playing a game: cluster → **Browse Collections** → `reflex-arena` → `runs`. You'll see every run as a document, including the **secret** `currentCommand` the browser never sees. This is the "memory" of your app.

---

## ✅ Checklist

- [ ] M0 **Free** cluster created
- [ ] Database user created, password saved
- [ ] Network Access has `0.0.0.0/0` with status **Active**
- [ ] Connection string has the real password (no `< >`) and `/reflex-arena` after `.net`

## 🆘 Common problems

| Error message | Fix |
|---|---|
| `bad auth : authentication failed` | Wrong username/password. Reset the password under Database Access, and make sure the `< >` are removed |
| `Could not connect to any servers` / `ETIMEOUT` / `ENOTFOUND` | Network Access is missing `0.0.0.0/0` or not Active yet. On college Wi-Fi, port 27017 may be blocked: try a phone hotspot |
| `querySrv ECONNREFUSED` | Your network's DNS blocks SRV lookups. Switch network (hotspot), or set your DNS to 8.8.8.8 |
| `MONGODB_URI is missing` | `.env` not created or in the wrong folder. It must be `backend/.env` |
| Password with `@` in it | Reset to a letters+numbers password |

📏 **Free tier limits:** M0 gives 512 MB of storage. Each run is about 1 KB, so that's room for hundreds of thousands of games. 😄
