// ================================================================
//  THE RULE BOOK
//  Every number that decides how the game plays lives here.
//  Change a number, restart the server, and the game changes for
//  every player - because the server is the referee.
// ================================================================

export const MAX_ROUNDS = 15;
export const START_LIVES = 3;

// The four pads. The frontend may DISPLAY them as anything
// (pizza, planets, cricket bats...) but the data always uses these ids.
export const COLORS = ['red', 'blue', 'green', 'yellow'];

// Difficulty table: rounds get faster and trickier.
// trapChance = share of commands that do NOT start with "Simon says".
export const DIFFICULTY = [
  { fromRound: 1, toRound: 5, timeLimitMs: 3000, actions: ['click'], trapChance: 0.2 },
  { fromRound: 6, toRound: 10, timeLimitMs: 2000, actions: ['click', 'double'], trapChance: 0.3 },
  { fromRound: 11, toRound: 15, timeLimitMs: 1200, actions: ['click', 'double'], trapChance: 0.4, stretch: true },
];

// Stretch commands ("hold" and "DON'T click") only appear when the
// server has ENABLE_STRETCH=true, in levels marked stretch: true.
export const STRETCH_CHANCE = 0.25;
export const HOLD_MIN_MS = 600;

// Scoring
export const BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 100;
export const TRAP_BONUS = 50;

// Streak -> multiplier. Uses the streak BEFORE the current answer.
export const MULTIPLIERS = [
  { minStreak: 6, multiplier: 3 },
  { minStreak: 3, multiplier: 2 },
  { minStreak: 0, multiplier: 1 },
];

// Rank titles by final score (checked from the top down).
export const RANKS = [
  { minScore: 4500, title: 'Reflex God' },
  { minScore: 2500, title: 'Lightning' },
  { minScore: 1000, title: 'Sharp' },
  { minScore: 0, title: 'Rookie' },
];

// Anti-cheat timing checks (see docs/02-api-contract.md).
export const MIN_REACTION_MS = 100; // nobody reacts faster than this
export const TRAP_EARLY_TOLERANCE_MS = 200; // "none" may arrive this much before the limit
// Allowed gap between what the browser says and what the server saw.
// Covers internet delay + the 400 ms double-click window + the 350 ms feedback pause.
// The PDF plan used 1500 ms for one server; Vercel -> Render -> Atlas needs a bit more room.
export const MAX_NETWORK_GAP_MS = 2500;
