// ================================================================
//  ✏️  MY THEME - your playground.
//  It starts as a "campus" theme so you can see how things work.
//  Change ANY value below: words, emojis, colors, sounds, ranks.
//  Then set  import activeTheme from './presets/my-theme.js'  in ../index.js
//
//  Rules so nothing breaks:
//   1. Keep the 4 pad keys exactly: red, blue, green, yellow.
//   2. Keep the 4 rank keys exactly: Rookie, Sharp, Lightning, 'Reflex God'.
//   3. Keep the message keys (ok, trapDodged, trap, ...). Each holds a list of strings.
//  Stuck? Paste this file into ChatGPT/Gemini with a prompt from docs/07-make-it-yours.md
// ================================================================
export default {
  id: 'my-theme',

  gameTitle: 'Campus Chaos', // ← your game's name
  tagline: 'Do it only when Prof says. Proxy attendance will not save you.',
  logoEmoji: '🎓',
  commander: 'Prof says', // who gives the orders?
  verbs: { click: 'tap', double: 'double-tap', hold: 'hold' },
  madeBy: 'Your Name', // ← shown in the footer. Put YOUR name here! ('' hides it)

  pads: {
    red: { label: 'ASSIGNMENT', emoji: '📝', color: '#ef476f', tone: 329.63 },
    blue: { label: 'LAPTOP', emoji: '💻', color: '#118ab2', tone: 261.63 },
    green: { label: 'CANTEEN', emoji: '🍵', color: '#06d6a0', tone: 392.0 },
    yellow: { label: 'BELL', emoji: '🔔', color: '#ffd166', tone: 523.25 },
  },

  colors: {
    background: '#14121f',
    backgroundAccent: '#3d2c8d',
    surface: 'rgba(255, 255, 255, 0.07)',
    text: '#fdfcff',
    muted: '#a8a3c7',
    primary: '#ffd166',
    primaryText: '#14121f',
    good: '#06d6a0',
    bad: '#ef476f',
  },

  fontsUrl: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap',
  fonts: { display: "'Fredoka', system-ui, sans-serif", body: "'Fredoka', system-ui, sans-serif" },

  lifeIcon: '📗',
  lostLifeIcon: '📕',

  ranks: {
    Rookie: { name: 'Backbencher', emoji: '😴' },
    Sharp: { name: 'Class Rep', emoji: '🙋' },
    Lightning: { name: 'Topper', emoji: '🤓' },
    'Reflex God': { name: 'Gold Medalist', emoji: '🥇' },
  },

  messages: {
    ok: ['Full marks! 💯', 'Present, sir! 🙋', 'A+ reflexes!'],
    trapDodged: ['Smart! Prof never said 😏', 'Not falling for that!'],
    trap: ['Prof did NOT say! Detention! 📛', 'Caught in the act! 👀'],
    wrong_color: ['Wrong answer sheet! 📄'],
    wrong_action: ['Read the question properly! 📖'],
    timeout: ['Late submission! ⏰', 'Attendance marked absent 😬'],
    invalid_timing: ['Copying from someone? 🤨'],
  },

  celebrationEmoji: ['🎓', '💯', '📚', '🎉'],
};
