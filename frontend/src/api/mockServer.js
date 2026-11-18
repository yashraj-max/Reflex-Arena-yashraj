// ================================================================
//  MOCK SERVER - a fake backend that runs inside the browser.
//  It returns exactly the same JSON shapes as the real API, so the
//  frontend can be built and played before the backend exists.
//  Turn it off by setting VITE_API_URL (see config.js).
//
//  The rules below are a simplified COPY of backend/src/game/.
//  The real referee is the backend - this is only for practice.
// ================================================================

const COLORS = ['red', 'blue', 'green', 'yellow'];
const LEVELS = [
  { to: 5, timeLimitMs: 3000, actions: ['click'], trapChance: 0.2 },
  { to: 10, timeLimitMs: 2000, actions: ['click', 'double'], trapChance: 0.3 },
  { to: 15, timeLimitMs: 1200, actions: ['click', 'double'], trapChance: 0.4 },
];
const RANKS = [
  [4500, 'Reflex God'],
  [2500, 'Lightning'],
  [1000, 'Sharp'],
  [0, 'Rookie'],
];
const BOARD_KEY = 'reflex-arena-mock-board';
const runs = new Map(); // runId -> run (lives only in this browser tab)

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const fakeNetwork = () => wait(40 + Math.random() * 80);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const rankTitle = (score) => RANKS.find(([min]) => score >= min)[1];

function makeCommand(round) {
  const level = LEVELS.find((l) => round <= l.to);
  const simon = Math.random() >= level.trapChance;
  const action = pick(level.actions);
  const color = pick(COLORS);
  const verb = action === 'double' ? 'double-click' : 'click';
  const text = simon
    ? `Simon says: ${verb} ${color.toUpperCase()}`
    : `${verb[0].toUpperCase()}${verb.slice(1)} ${color.toUpperCase()}`;
  return { round, text, simon, action, color, timeLimitMs: level.timeLimitMs, issuedAt: Date.now() };
}

const publicCommand = ({ round, text, timeLimitMs }) => ({ round, text, timeLimitMs });

function judge(cmd, { action, color, reactionMs }) {
  if (!cmd.simon) return action === 'none' ? 'ok' : 'trap';
  if (action === 'none') return 'timeout';
  if (action !== cmd.action) return 'wrong_action';
  if (color !== cmd.color) return 'wrong_color';
  if (reactionMs == null || reactionMs < 100) return 'invalid_timing';
  if (reactionMs > cmd.timeLimitMs) return 'timeout';
  return 'ok';
}

function scoreRound(reason, cmd, reactionMs, streak) {
  if (reason !== 'ok') return { points: 0, multiplier: 1 };
  const multiplier = streak >= 6 ? 3 : streak >= 3 ? 2 : 1;
  const bonus = !cmd.simon ? 50 : Math.max(0, Math.round(100 * (1 - reactionMs / cmd.timeLimitMs)));
  return { points: (100 + bonus) * multiplier, multiplier };
}

function readBoard() {
  try {
    return JSON.parse(localStorage.getItem(BOARD_KEY)) ?? seedBoard();
  } catch {
    return seedBoard();
  }
}

function seedBoard() {
  return [
    { nickname: 'Bot Blink', score: 3900, avgReactionMs: 610 },
    { nickname: 'Bot Bolt', score: 2100, avgReactionMs: 790 },
    { nickname: 'Bot Byte', score: 800, avgReactionMs: 1020 },
  ];
}

function sortBoard(board) {
  return board.sort((a, b) => b.score - a.score || (a.avgReactionMs || 1e9) - (b.avgReactionMs || 1e9));
}

function saveToBoard(entry) {
  const board = sortBoard([...readBoard(), entry]).slice(0, 50);
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(board));
  } catch {
    /* private mode: ignore */
  }
  return board.indexOf(entry) + 1 || board.length + 1;
}

export const mockApi = {
  async health() {
    await fakeNetwork();
    return { status: 'ok', version: 'mock', db: 'browser', stretch: false };
  },

  async startRun(nickname) {
    await fakeNetwork();
    const runId = crypto.randomUUID?.() ?? String(Math.random()).slice(2);
    const cmd = makeCommand(1);
    runs.set(runId, { nickname, round: 1, lives: 3, score: 0, streak: 0, sum: 0, count: 0, cmd });
    return { runId, arena: 'mock', lives: 3, maxRounds: 15, score: 0, command: publicCommand(cmd) };
  },

  async sendAnswer(answer) {
    await fakeNetwork();
    const run = runs.get(answer.runId);
    if (!run) throw new Error('Run not found');

    const reason = judge(run.cmd, answer);
    const correct = reason === 'ok';
    const { points, multiplier } = scoreRound(reason, run.cmd, answer.reactionMs, run.streak);
    if (correct) {
      run.score += points;
      run.streak += 1;
      if (run.cmd.simon) {
        run.sum += answer.reactionMs;
        run.count += 1;
      }
    } else {
      run.lives -= 1;
      run.streak = 0;
    }

    const judged = run.round;
    const gameOver = run.lives <= 0 || judged >= 15;
    let summary = null;
    if (gameOver) {
      runs.delete(answer.runId);
      const avgReactionMs = run.count ? Math.round(run.sum / run.count) : 0;
      const rank = saveToBoard({ nickname: run.nickname, score: run.score, avgReactionMs });
      summary = { finalScore: run.score, title: rankTitle(run.score), rank, roundsPlayed: judged, avgReactionMs };
    } else {
      run.round += 1;
      run.cmd = makeCommand(run.round);
    }

    return {
      correct,
      reason,
      round: judged,
      pointsEarned: points,
      multiplier,
      streak: run.streak,
      score: run.score,
      lives: Math.max(run.lives, 0),
      gameOver,
      command: gameOver ? null : publicCommand(run.cmd),
      summary,
    };
  },

  async getLeaderboard(limit = 10) {
    await fakeNetwork();
    const board = sortBoard(readBoard());
    return {
      arena: 'mock',
      totalRuns: board.length,
      entries: board.slice(0, limit).map((e, i) => ({ rank: i + 1, ...e, title: rankTitle(e.score) })),
      generatedAt: new Date().toISOString(),
    };
  },
};
