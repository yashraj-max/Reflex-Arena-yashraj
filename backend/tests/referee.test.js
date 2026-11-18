// Tests for the referee. Run with:  npm test
// They prove the rules work BEFORE any frontend exists.
// Uses Node's built-in test runner, so there is nothing extra to install.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  commandText,
  getDifficulty,
  judge,
  makeCommand,
  multiplierFor,
  publicCommand,
  rankTitle,
  scoreRound,
} from '../src/game/referee.js';

// Helpers to build commands quickly
const real = (action, color, timeLimitMs = 3000) => ({ simon: true, action, color, timeLimitMs });
const trap = (action, color, timeLimitMs = 3000) => ({ simon: false, action, color, timeLimitMs });
const ans = (action, color = null, reactionMs = null, holdMs = null) => ({ action, color, reactionMs, holdMs });

// A fake random generator that returns the given numbers in order.
const seq = (...nums) => {
  let i = 0;
  return () => nums[i++ % nums.length];
};

test('command text: real click, real double, trap click, trap double', () => {
  assert.equal(commandText(real('click', 'red')), 'Simon says: click RED');
  assert.equal(commandText(real('double', 'blue')), 'Simon says: double-click BLUE');
  assert.equal(commandText(trap('click', 'green')), 'Click GREEN');
  assert.equal(commandText(trap('double', 'yellow')), 'Double-click YELLOW');
});

test('command text: stretch commands', () => {
  assert.equal(commandText(real('hold', 'yellow')), 'Simon says: hold YELLOW');
  assert.equal(commandText({ simon: true, action: 'none', color: null }), "Simon says: DON'T click");
});

test('difficulty for rounds 1, 6 and 11', () => {
  assert.deepEqual([getDifficulty(1).timeLimitMs, getDifficulty(1).trapChance], [3000, 0.2]);
  assert.deepEqual([getDifficulty(6).timeLimitMs, getDifficulty(6).trapChance], [2000, 0.3]);
  assert.deepEqual([getDifficulty(11).timeLimitMs, getDifficulty(11).trapChance], [1200, 0.4]);
  assert.deepEqual(getDifficulty(1).actions, ['click']);
});

test('makeCommand is predictable with a seeded rng', () => {
  // rng: 0.9 -> not a trap, 0 -> first action (click), 0 -> first color (red)
  const cmd = makeCommand(1, { rng: seq(0.9, 0, 0) });
  assert.equal(cmd.text, 'Simon says: click RED');
  assert.equal(cmd.timeLimitMs, 3000);
  // rng: 0.1 -> a trap (0.1 < 0.2)
  assert.equal(makeCommand(1, { rng: seq(0.1, 0, 0.5) }).text, 'Click GREEN');
});

test('publicCommand never leaks the answer', () => {
  const pub = publicCommand(makeCommand(3));
  assert.deepEqual(Object.keys(pub).sort(), ['round', 'text', 'timeLimitMs']);
});

test('judge: ok, wrong_color, wrong_action', () => {
  const cmd = real('click', 'red');
  assert.equal(judge(cmd, ans('click', 'red', 742), 1200), 'ok');
  assert.equal(judge(cmd, ans('click', 'blue', 742), 1200), 'wrong_color');
  assert.equal(judge(cmd, ans('double', 'red', 742), 1200), 'wrong_action');
});

test('judge: trap', () => {
  const cmd = trap('click', 'green');
  assert.equal(judge(cmd, ans('click', 'green', 500), 900), 'trap');
  assert.equal(judge(cmd, ans('none'), 3100), 'ok');
});

test('judge: timeout (no action, and late reaction)', () => {
  const cmd = real('click', 'red');
  assert.equal(judge(cmd, ans('none'), 3100), 'timeout');
  assert.equal(judge(cmd, ans('click', 'red', 3200), 3500), 'timeout');
});

test('judge: invalid_timing', () => {
  const cmd = real('click', 'red');
  assert.equal(judge(cmd, ans('click', 'red', 50), 600), 'invalid_timing'); // under 100 ms
  assert.equal(judge(cmd, ans('click', 'red', 900), 800), 'invalid_timing'); // reaction > elapsed
  assert.equal(judge(cmd, ans('click', 'red', 500), 3600), 'invalid_timing'); // gap over limit
  assert.equal(judge(trap('click', 'red'), ans('none'), 1000), 'invalid_timing'); // "none" too early
});

test('judge: stretch hold and DON\'T click', () => {
  const hold = real('hold', 'yellow', 1200);
  assert.equal(judge(hold, ans('hold', 'yellow', 400, 700), 1500), 'ok');
  assert.equal(judge(hold, ans('hold', 'yellow', 400, 300), 1000), 'wrong_action');
  const dont = { simon: true, action: 'none', color: null, timeLimitMs: 1200 };
  assert.equal(judge(dont, ans('click', 'red', 300), 600), 'trap');
  assert.equal(judge(dont, ans('none'), 1300), 'ok');
});

test('multiplier from streak', () => {
  assert.deepEqual([0, 2, 3, 5, 6, 10].map(multiplierFor), [1, 1, 2, 2, 3, 3]);
});

test('worked example: 742 ms on a 3000 ms limit at streak 0 gives 175', () => {
  assert.deepEqual(scoreRound('ok', real('click', 'red'), 742, 0), { points: 175, multiplier: 1 });
});

test('score_round for streaks 0, 3 and 6, real and trap', () => {
  const cmd = real('click', 'red', 2000);
  assert.equal(scoreRound('ok', cmd, 1000, 0).points, 150); // (100+50) x1
  assert.equal(scoreRound('ok', cmd, 1000, 3).points, 300); // x2
  assert.equal(scoreRound('ok', cmd, 1000, 6).points, 450); // x3
  assert.equal(scoreRound('ok', trap('click', 'red'), null, 0).points, 150); // 100 + flat 50
  assert.equal(scoreRound('ok', trap('click', 'red'), null, 6).points, 450);
  assert.deepEqual(scoreRound('trap', cmd, 500, 6), { points: 0, multiplier: 1 });
});

test('rank titles at the boundaries', () => {
  assert.equal(rankTitle(999), 'Rookie');
  assert.equal(rankTitle(1000), 'Sharp');
  assert.equal(rankTitle(2499), 'Sharp');
  assert.equal(rankTitle(2500), 'Lightning');
  assert.equal(rankTitle(4499), 'Lightning');
  assert.equal(rankTitle(4500), 'Reflex God');
});
