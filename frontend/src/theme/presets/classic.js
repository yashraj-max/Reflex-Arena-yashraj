// ================================================================
//  CLASSIC THEME - the original neon arcade Reflex Arena.
//  Every theme file has exactly this shape. Copy it, change the
//  values, and you have your own game. Nothing here touches the
//  backend: the server still says "click RED", and the theme
//  decides how "RED" LOOKS and SOUNDS.
// ================================================================
export default {
  id: 'classic',

  // ---- Words -------------------------------------------------------
  gameTitle: 'Reflex Arena',
  tagline: 'Obey only when Simon says. Be fast. Be fearless.',
  logoEmoji: '⚡', // also used as the browser-tab icon
  commander: 'Simon says', // replaces "Simon says" in every command
  verbs: { click: 'tap', double: 'double-tap', hold: 'hold' }, // how actions are worded
  madeBy: '', // your name in the footer, e.g. 'Asha (CSE, 1st year)'. Empty = hidden.

  // ---- The four pads ---------------------------------------------
  // Keys (red/blue/green/yellow) must stay the same: they are the ids the server uses.
  // Everything inside is yours to change. tone = beep pitch in Hz (200-1000 sounds nice).
  pads: {
    red: { label: 'RED', emoji: '🔴', color: '#ff3b5c', tone: 329.63 },
    blue: { label: 'BLUE', emoji: '🔵', color: '#3b82f6', tone: 261.63 },
    green: { label: 'GREEN', emoji: '🟢', color: '#22c55e', tone: 392.0 },
    yellow: { label: 'YELLOW', emoji: '🟡', color: '#facc15', tone: 523.25 },
  },

  // ---- Colors (any CSS color works) --------------------------------
  colors: {
    background: '#0b1020',
    backgroundAccent: '#2a1a5e', // used in the glowing background gradient
    surface: 'rgba(255, 255, 255, 0.06)', // cards and panels
    text: '#f8fafc',
    muted: '#94a3b8',
    primary: '#a78bfa', // buttons and highlights
    primaryText: '#0b1020', // text ON primary buttons
    good: '#22c55e',
    bad: '#ff3b5c',
  },

  // ---- Fonts (pick any from fonts.google.com) ---------------------------------
  fontsUrl: 'https://fonts.googleapis.com/css2?family=Bungee&family=Outfit:wght@400;600;800&display=swap',
  fonts: { display: "'Bungee', system-ui, sans-serif", body: "'Outfit', system-ui, sans-serif" },

  // ---- Lives -------------------------------------------------------
  lifeIcon: '❤️',
  lostLifeIcon: '🖤',

  // ---- Rank names -----------------------------------------------
  // The server decides the rank (left side). You decide what it is CALLED (right side).
  ranks: {
    Rookie: { name: 'Rookie', emoji: '🐣' },
    Sharp: { name: 'Sharp', emoji: '🎯' },
    Lightning: { name: 'Lightning', emoji: '⚡' },
    'Reflex God': { name: 'Reflex God', emoji: '👑' },
  },

  // ---- Feedback messages (one is picked at random) --------------------------------
  // {commander} is replaced with the commander text above.
  messages: {
    ok: ['Nice!', 'Sharp!', 'Too quick!', 'Clean!', 'Boom!'],
    trapDodged: ['Not fooled! 😎', 'Nice dodge!', 'Ice cold 🧊'],
    trap: ['{commander}... NOT! 😈', 'Gotcha! Nobody said it!', 'Trap! 🪤'],
    wrong_color: ['Wrong pad!', 'Other one! 🙈'],
    wrong_action: ['Wrong move!', 'Read it again! 👀'],
    timeout: ['Too slow! 🐢', 'Time up! ⌛'],
    invalid_timing: ['Suspiciously fast... 🤨'],
  },

  // ---- Celebration -----------------------------------------------
  celebrationEmoji: ['⚡', '🎉', '✨', '💜'],
};
