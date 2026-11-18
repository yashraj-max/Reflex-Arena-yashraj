# 07 · Make It Yours 🎨

Everyone in the room starts with the same Simon Says game. Everyone leaves with **a different product**.

The trick: **the backend only speaks in pad ids** (`red`, `blue`, `green`, `yellow`) and plain commands (`"Simon says: click RED"`). **How** that looks, sounds and feels is 100% the frontend's job. So you can reinvent the whole game **without touching the backend**, and it still works on a shared server.

```
Server says:   "Simon says: double-click BLUE"
                         │
                theme/presets/kitchen.js
                         ▼
Player sees:   MUMMY SAYS:  double-grab ☕ CHAI
```

---

## 🟢 Safe zone vs 🔴 Don't-touch zone

| 🟢 Change freely | 🟡 Change carefully | 🔴 Leave alone (unless you also change the backend) |
|---|---|---|
| `src/theme/**` (everything!) | `src/screens/*.jsx` | `src/api/client.js` (request shapes) |
| `src/styles/global.css` | `src/components/*.jsx` | the pad **ids** `red/blue/green/yellow` |
| `src/lib/sound.js` | `src/App.jsx` | `config.js` timing numbers (the server checks timing!) |
| `index.html` `<meta>` tags | `src/lib/commandText.js` | `hooks/useGameEngine.js` input + timer logic |

Golden rule: **keep the contract** ([02](02-api-contract.md)). Change how things *look*, not what gets *sent*.

---

## Level 1 · Pick a ready-made theme (2 minutes)

Open `frontend/src/theme/index.js` and change one word:

```js
import activeTheme from './presets/kitchen.js';
```

| Preset | Game | Commander | Pads |
|---|---|---|---|
| `classic` | ⚡ Reflex Arena | Simon says | 🔴 🔵 🟢 🟡 |
| `kitchen` | 🍳 Mummy's Kitchen | Mummy says | 🌶️ MIRCHI ☕ CHAI 🥬 PALAK 🥭 MANGO |
| `space` | 🚀 Mission Control | Commander says | 🪐 MARS 🌍 EARTH 👽 ALIEN ☀️ SUN |
| `cricket` | 🏏 Captain's Call | Captain says | 🔴 BALL ⛑️ HELMET 🏟️ PITCH 🏆 TROPHY |
| `hacker` | 💻 SUDO_SAYS.exe | sudo says | 🔥 FIREWALL 💾 DATABASE 🐛 BUG ⚡ POWER |
| `my-theme` | 🎓 Campus Chaos | Prof says | 📝 ASSIGNMENT 💻 LAPTOP 🍵 CANTEEN 🔔 BELL |

Save, and the browser updates instantly. Then `git push`, and your live site updates within a minute. 🚀

---

## Level 2 · Design your own theme (10-15 minutes)

1. Open `frontend/src/theme/presets/my-theme.js`
2. Point `theme/index.js` at it: `import activeTheme from './presets/my-theme.js';`
3. Change values, save, and look. Repeat.

### What every field does

| Field | Example | Shows up... |
|---|---|---|
| `gameTitle` | `'Campus Chaos'` | top bar, start screen, browser tab, share text |
| `tagline` | `'Do it only when Prof says.'` | under the title |
| `logoEmoji` | `'🎓'` | start screen + **browser tab icon** |
| `commander` | `'Prof says'` | replaces "Simon says" in every command |
| `verbs` | `{ click: 'tap', double: 'double-tap', hold: 'hold' }` | command wording: "Prof says: **tap** 📝 ASSIGNMENT" |
| `madeBy` | `'Asha (CSE 1st yr)'` | footer: "Made with 💜 by ..." |
| `pads.red.label` | `'ASSIGNMENT'` | pad text and command text |
| `pads.red.emoji` | `'📝'` | on the pad and in commands |
| `pads.red.color` | `'#ef476f'` | pad color, title gradient, timer bar |
| `pads.red.tone` | `329.63` | beep pitch in Hz (try 200-1000) |
| `colors.*` | `background`, `primary`, `good`, `bad`... | the whole color scheme |
| `fontsUrl` + `fonts` | any font from [fonts.google.com](https://fonts.google.com) | headings (`display`) and text (`body`) |
| `lifeIcon` / `lostLifeIcon` | `'📗'` / `'📕'` | the lives in the top bar |
| `ranks` | `Rookie: { name: 'Backbencher', emoji: '😴' }` | game over screen + leaderboard |
| `messages.ok / trap / timeout ...` | lists of strings | the pop-up after each answer (random pick) |
| `celebrationEmoji` | `['🎓', '💯']` | the emoji rain for top scores |

⚠️ **Three rules so nothing breaks:**
1. Keep the 4 pad keys exactly: `red`, `blue`, `green`, `yellow` (change what's inside, not the key).
2. Keep the 4 rank keys exactly: `Rookie`, `Sharp`, `Lightning`, `'Reflex God'`.
3. Keep every message key. Each one must be a **list** of strings, even if it holds only one.

💡 **Pro tip, make music:** set the 4 tones to a chord, like `261.63, 329.63, 392.0, 523.25` (C-E-G-C). Now every game sounds like a song.

### 🎲 20 theme ideas to steal

| Theme | Commander | Pads |
|---|---|---|
| 🚦 Traffic Signal | "Traffic Police says" | 🔴 STOP · 🚌 BUS · 🟢 GO · 🟡 WAIT |
| 🏨 Hostel Life | "Warden says" | 🍜 MAGGI · 🧺 LAUNDRY · 📱 PHONE · 🛏️ BED |
| 🎬 Film Set | "Director says" | 🎬 ACTION · 💃 DANCE · 🎤 SING · ✂️ CUT |
| 💍 Desi Wedding | "Aunty says" | 💃 DANCE · 🍬 MITHAI · 📸 PHOTO · 🎁 SHAGUN |
| 📝 Exam Hall | "Invigilator says" | ✏️ WRITE · 📏 SCALE · 🧮 CALC · 🙋 RAISE HAND |
| 🏋️ Gym | "Trainer says" | 🏋️ LIFT · 🏃 RUN · 🧘 STRETCH · 🥤 PROTEIN |
| 🚇 Metro | "Driver says" | 🚪 DOORS · 🎫 CARD · 🪑 SEAT · 🛑 ALARM |
| 🐶 Dog Training | "Owner says" | 🦴 BONE · 🎾 BALL · 🐾 PAW · 🛁 BATH |
| 🏴‍☠️ Pirate Ship | "Captain says" | 💣 CANNON · ⚓ ANCHOR · 🗺️ MAP · 💰 GOLD |
| 🪔 Diwali | "Dadi says" | 🪔 DIYA · 🎆 ROCKET · 🍬 LADDOO · 🎨 RANGOLI |
| 🌧️ Monsoon | "Mausam says" | ☔ UMBRELLA · ⛈️ THUNDER · 🐸 FROG · 🌈 RAINBOW |
| 🚀 Startup | "CEO says" | 💰 FUNDING · 📉 BURN · 🧑‍💻 HIRE · 📣 PIVOT |
| 🎮 Retro Arcade | "Player 1 says" | 🍒 CHERRY · 👾 INVADER · 🕹️ JOYSTICK · ⭐ STAR |
| 🦁 Jungle Safari | "Ranger says" | 🦁 LION · 🐘 ELEPHANT · 🦜 PARROT · 🐒 MONKEY |
| 🎸 Rock Band | "Drummer says" | 🥁 DRUMS · 🎸 GUITAR · 🎹 KEYS · 🎤 VOCALS |
| 🍕 Pizza Shop | "Chef says" | 🍅 SAUCE · 🧀 CHEESE · 🌶️ JALAPENO · 🍍 PINEAPPLE |
| 🏥 Hospital | "Doctor says" | 💉 INJECTION · 🩺 CHECKUP · 💊 PILL · 🩹 BANDAGE |
| 🧙 Wizard School | "Headmaster says" | 🔥 FIRE · 💧 WATER · 🌿 EARTH · ⚡ STORM |
| 🛒 Supermarket | "Cashier says" | 🍎 APPLE · 🥛 MILK · 🥦 BROCCOLI · 🧈 BUTTER |
| 🤖 Robot Factory | "AI says" | 🔩 BOLT · 🔋 BATTERY · 🛞 WHEEL · 💡 BULB |

…and plenty more for you to invent: your college fest, your branch (*"HOD says"*), your favourite food street, your city, your hobby, your pet, your hometown...

### 🤖 AI prompt: generate a complete theme

Copy this into **ChatGPT** or **Gemini**, fill in the `[brackets]`, then paste your current `my-theme.js` underneath:

```
You are helping me customise a React game called Reflex Arena (a Simon Says reflex game).
Below is my theme file. Create a NEW theme with this idea: [describe your idea, e.g.
"a Bollywood film set where the Director gives orders"].

Rules you MUST follow:
- Return the COMPLETE file, same structure, as one JavaScript code block.
- Keep the pad keys exactly: red, blue, green, yellow. Change label, emoji, color, tone.
- Keep the rank keys exactly: Rookie, Sharp, Lightning, 'Reflex God'.
- Keep every key inside messages; each value must be an array of short strings (max 30 chars).
- "commander" must end with " says" (e.g. "Director says").
- Pad colors must be clearly different from each other, and white text must be readable on them.
- Background must be dark; text must be light.
- Use a Google Fonts URL in fontsUrl, and the same font names in fonts.display / fonts.body.
- Keep it fun, kind and suitable for a college audience.

[paste the contents of frontend/src/theme/presets/my-theme.js here]
```

Paste the answer into `my-theme.js`, save, and play. Not perfect? Ask a follow-up: *"Make the colors more neon"*, *"Make the trap messages funnier"*, *"Use Hindi-English (Hinglish) messages"*.

---

## Level 3 · Add a feature (frontend only, with AI)

Pick one or two. Each lists the file(s) to give the AI. 🌶️ = difficulty.

| # | Feature | Files to paste | Level |
|---|---|---|---|
| 1 | 📳 **Phone vibration** on a mistake (`navigator.vibrate`) | `hooks/useGameEngine.js` (only the `showVerdict` function) | 🌶️ |
| 2 | 🔥 **"ON FIRE!" banner** when the multiplier hits ×3 | `components/Hud.jsx`, `styles/global.css` | 🌶️ |
| 3 | 💬 **Rank quotes**: a funny line per rank on the game over screen | `theme/presets/my-theme.js`, `screens/GameOverScreen.jsx` | 🌶️ |
| 4 | 🌌 **Animated background**: stars, bubbles, rain or floating emojis | `styles/global.css`, `App.jsx` | 🌶️ |
| 5 | 🔵 **Round pads** like the original Simon toy (a circle split into 4) | `styles/global.css` | 🌶️ |
| 6 | 👤 **About the developer** screen with your photo/bio/links | `App.jsx`, `screens/StartScreen.jsx` | 🌶️ |
| 7 | 🎵 **New sound pack**: different wave types, a game-over melody, a victory tune | `lib/sound.js` | 🌶️🌶️ |
| 8 | 🗣️ **Voice announcer**: the browser *speaks* each command (`speechSynthesis`) | `components/CommandBanner.jsx` | 🌶️🌶️ |
| 9 | 🏅 **Personal best + stats** saved in `localStorage` (best score, games played) | `screens/GameOverScreen.jsx`, `screens/StartScreen.jsx` | 🌶️🌶️ |
| 10 | 🎖️ **Achievements**: "Speed Demon (<350 ms avg)", "Survivor (all 15 rounds)"... | `screens/GameOverScreen.jsx` | 🌶️🌶️ |
| 11 | ♿ **Colour-blind mode**: shapes (● ▲ ■ ★) on pads, toggle saved in localStorage | `components/Pad.jsx`, `App.jsx`, `styles/global.css` | 🌶️🌶️ |
| 12 | ☀️ **Light mode** toggle | `styles/global.css`, `App.jsx`, `theme/applyTheme.js` | 🌶️🌶️ |
| 13 | 🧑‍🎤 **Avatar picker**: choose an emoji avatar shown in game (kept in the browser only) | `screens/StartScreen.jsx`, `components/Hud.jsx` | 🌶️🌶️ |
| 14 | 📱 **Installable app (PWA)**: add a `manifest.json` so it can be "Added to Home Screen" | `index.html` (+ new `public/manifest.json`) | 🌶️🌶️ |
| 15 | 🎨 **Theme picker for players**: dropdown on the start screen to switch preset | `theme/index.js`, `main.jsx`, `App.jsx` | 🌶️🌶️🌶️ |
| 16 | 🖼️ **Share card**: draw your score on a `<canvas>` and download it as an image | `screens/GameOverScreen.jsx` | 🌶️🌶️🌶️ |
| 17 | 📺 **Projector mode**: a big-screen leaderboard with auto-scroll and a "Scan to play" QR | `screens/LeaderboardScreen.jsx` | 🌶️🌶️🌶️ |
| 18 | 🎶 **Background music** loop made with Web Audio (with a mute toggle) | `lib/sound.js`, `App.jsx` | 🌶️🌶️🌶️ |

### 🤖 AI prompt: add a feature safely

```
I have a React 19 + Vite game called Reflex Arena (plain JavaScript, plain CSS, no extra
libraries). I want to add this feature: [describe it, e.g. "vibrate the phone for 200 ms
when the player makes a mistake"].

Constraints:
- Frontend only. Do NOT change src/api/client.js, the JSON sent to the server, the pad ids
  (red/blue/green/yellow), or the timing/input logic in useGameEngine.js.
- No new npm packages.
- It must work on phones and must not crash on browsers that don't support the feature.
- Return the FULL updated file(s), each in its own code block with the file path as a heading.
- Briefly explain what you changed in 3 bullet points.

Here are the relevant files:
[paste file 1 with its path]
[paste file 2 with its path]
```

### 🤖 AI prompt: something broke

```
My React + Vite game broke after a change. Here is the exact error from the browser console
(or terminal):
[paste the full red error text]

Here is the file I changed (with its path):
[paste]

Explain the cause in one sentence and give the minimal fix as a before/after snippet.
Do not rewrite anything else.
```

### 🧠 Working with AI like a pro

1. **Give context, not vibes.** Paste the actual file. AI can't see your screen.
2. **One feature at a time.** Small change → test → `git commit` → next feature.
3. **Commit before you experiment.** If the AI breaks everything: `git checkout -- .` takes you back to your last commit.
4. **Read the code it gives you.** If you can't explain a line, ask it: *"Explain line X like I'm in first year."*
5. **The AI is often confidently wrong.** Your browser is the judge: test everything.

---

## Level 4 · Change the rules (backend, optional)

Only if you deployed **your own** backend (Option A). On the shared backend, the rules are the same for everyone.

Every rule number lives in `backend/src/game/rules.js`:

| Want | Change |
|---|---|
| A longer game | `MAX_ROUNDS = 20` and add a 4th level to `DIFFICULTY` |
| An easier game | `START_LIVES = 5`, bigger `timeLimitMs` |
| Evil mode | `trapChance: 0.6`, `timeLimitMs: 800` |
| Bonus commands (hold / DON'T tap) | set `ENABLE_STRETCH=true` on Render. The frontend already supports it! |
| Different rank thresholds | edit `RANKS` |

After changing rules: run `npm test` (fix the tests if you changed numbers on purpose), and update the copy in `frontend/src/api/mockServer.js` so mock mode matches.

---

## 🏁 Make it feel like a real product

- [ ] Your name in `madeBy`
- [ ] A custom project name on Vercel (`yourname-arena.vercel.app`)
- [ ] Update `<meta name="description">` in `frontend/index.html`, which shows when the link is shared
- [ ] Write your own `README.md`: what you built, a screenshot, and the live link
- [ ] Pin the repo on your GitHub profile. It's your first portfolio project! 🎉

Keep it kind: themes, messages and nicknames are seen by everyone who plays. Make people laugh, not feel bad. 💜
