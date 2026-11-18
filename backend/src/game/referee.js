// ================================================================
//  THE REFEREE
//  Pure functions only: no database, no Express, no network.
//  That makes them easy to test (see tests/referee.test.js).
// ================================================================
import {
  BASE_POINTS,
  COLORS,
  DIFFICULTY,
  HOLD_MIN_MS,
  MAX_NETWORK_GAP_MS,
  MAX_SPEED_BONUS,
  MIN_REACTION_MS,
  MULTIPLIERS,
  RANKS,
  STRETCH_CHANCE,
  TRAP_BONUS,
  TRAP_EARLY_TOLERANCE_MS,
} from './rules.js';

/** Returns the difficulty level for a round number. */
export function getDifficulty(round) {
  return DIFFICULTY.find((d) => round >= d.fromRound && round <= d.toRound) ?? DIFFICULTY.at(-1);
}

/** Picks a random item from a list using the given random function. */
function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

/** Builds the text the player sees, e.g. "Simon says: double-click BLUE". */
export function commandText({ simon, action, color }) {
  if (action === 'none') return 'Simon says: DON\'T click';
  const verb = { click: 'click', double: 'double-click', hold: 'hold' }[action];
  const target = color.toUpperCase();
  if (simon) return `Simon says: ${verb} ${target}`;
  // A trap: same command but without "Simon says" (first letter capitalised).
  return `${verb[0].toUpperCase()}${verb.slice(1)} ${target}`;
}

/**
 * Creates a new random command for a round.
 * Returns { round, text, simon, action, color, timeLimitMs }.
 * Only round, text and timeLimitMs are ever sent to the browser.
 */
export function makeCommand(round, { rng = Math.random, enableStretch = false } = {}) {
  const level = getDifficulty(round);
  const simon = rng() >= level.trapChance;
  let action = pick(level.actions, rng);
  let color = pick(COLORS, rng);

  // Bonus commands, only for real ("Simon says") commands in hard rounds.
  if (enableStretch && level.stretch && simon && rng() < STRETCH_CHANCE) {
    action = pick(['hold', 'none'], rng);
    if (action === 'none') color = null; // "Simon says: DON'T click"
  }

  const cmd = { round, simon, action, color, timeLimitMs: level.timeLimitMs };
  return { ...cmd, text: commandText(cmd) };
}

/** What the player SHOULD do: "none" for traps and DON'T-click, else the action. */
export function expectedAction(cmd) {
  return cmd.simon ? cmd.action : 'none';
}

/**
 * Judges one answer. Returns a reason string:
 * "ok" | "trap" | "timeout" | "wrong_action" | "wrong_color" | "invalid_timing"
 * Checks run in order and stop at the first problem.
 */
export function judge(cmd, answer, elapsedMs) {
  const { action, color, reactionMs, holdMs } = answer;

  // 1. Trap (or DON'T click): the only right move is to do nothing.
  if (expectedAction(cmd) === 'none') {
    if (action !== 'none') return 'trap';
    if (elapsedMs < cmd.timeLimitMs - TRAP_EARLY_TOLERANCE_MS) return 'invalid_timing';
    return 'ok';
  }

  // 2. A real command: right action, right pad.
  if (action === 'none') return 'timeout';
  if (action !== cmd.action) return 'wrong_action';
  if (action === 'hold' && (holdMs ?? 0) < HOLD_MIN_MS) return 'wrong_action';
  if (color !== cmd.color) return 'wrong_color';

  // 3. Timing sanity checks (this is the anti-cheat part).
  if (reactionMs == null || reactionMs < MIN_REACTION_MS) return 'invalid_timing';
  const busyMs = action === 'hold' ? holdMs : 0; // a long hold delays the request
  if (reactionMs > elapsedMs) return 'invalid_timing';
  if (elapsedMs - reactionMs - busyMs > MAX_NETWORK_GAP_MS) return 'invalid_timing';
  if (reactionMs > cmd.timeLimitMs) return 'timeout';

  return 'ok';
}

/** Multiplier from the streak BEFORE this answer: 0-2 -> x1, 3-5 -> x2, 6+ -> x3. */
export function multiplierFor(streak) {
  return MULTIPLIERS.find((m) => streak >= m.minStreak).multiplier;
}

/**
 * Points for one round. Returns { points, multiplier }.
 * points = (100 + speedBonus) x multiplier
 */
export function scoreRound(reason, cmd, reactionMs, streak) {
  if (reason !== 'ok') return { points: 0, multiplier: 1 };
  const multiplier = multiplierFor(streak);
  const speedBonus =
    expectedAction(cmd) === 'none'
      ? TRAP_BONUS
      : Math.max(0, Math.round(MAX_SPEED_BONUS * (1 - reactionMs / cmd.timeLimitMs)));
  return { points: (BASE_POINTS + speedBonus) * multiplier, multiplier };
}

/** Rank title for a final score. */
export function rankTitle(score) {
  return RANKS.find((r) => score >= r.minScore).title;
}

/** The safe version of a command that can be sent to the browser (no answers!). */
export function publicCommand(cmd) {
  return { round: cmd.round, text: cmd.text, timeLimitMs: cmd.timeLimitMs };
}
