// The controllers: what happens when each API route is called.
// Flow for every request:  validate -> load from DB -> ask the referee -> save -> reply
import { readFileSync } from 'node:fs';
import { env } from '../config/env.js';
import { dbStatus } from '../config/db.js';
import { Run } from '../models/Run.js';
import { MAX_ROUNDS, START_LIVES } from '../game/rules.js';
import {
  expectedAction,
  judge,
  makeCommand,
  publicCommand,
  rankTitle,
  scoreRound,
} from '../game/referee.js';
import { HttpError, cleanArena } from '../middleware/validate.js';

const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)));

/** Creates a fresh command and stamps the time the server issued it. */
function issueCommand(round) {
  const cmd = makeCommand(round, { enableStretch: env.ENABLE_STRETCH });
  return { ...cmd, issuedAt: Date.now() };
}

/** Position of a finished run: 1 + number of runs that sort ahead of it. */
async function rankOf(run) {
  const ahead = await Run.countDocuments({
    arena: run.arena,
    status: 'finished',
    $or: [
      { score: { $gt: run.score } },
      { score: run.score, sortReactionMs: { $lt: run.sortReactionMs } },
    ],
  });
  return ahead + 1;
}

// GET /api/health
export function health(_req, res) {
  res.json({
    status: 'ok',
    version,
    db: dbStatus(),
    stretch: env.ENABLE_STRETCH,
    uptimeSec: Math.round(process.uptime()),
  });
}

// POST /api/start
export async function startRun(req, res) {
  const { nickname, arena } = req.valid;
  const command = issueCommand(1);

  const run = await Run.create({ nickname, arena, lives: START_LIVES, currentCommand: command });

  res.status(201).json({
    runId: run._id,
    arena,
    lives: run.lives,
    maxRounds: MAX_ROUNDS,
    score: 0,
    command: publicCommand(command), // no simon/action/color: the answer stays secret
  });
}

// POST /api/answer
export async function answer(req, res) {
  const { runId, round, ...playerAnswer } = req.valid;

  const run = await Run.findById(runId);
  if (!run) throw new HttpError(404, 'Run not found');
  if (run.status === 'finished') throw new HttpError(409, 'Run already finished');
  if (round != null && round !== run.round) {
    throw new HttpError(409, `Expected an answer for round ${run.round}`);
  }

  // 1. The referee decides
  const cmd = run.currentCommand;
  const elapsedMs = Date.now() - cmd.issuedAt;
  const reason = judge(cmd, playerAnswer, elapsedMs);
  const correct = reason === 'ok';
  const { points, multiplier } = scoreRound(reason, cmd, playerAnswer.reactionMs, run.streak);

  // 2. Update the run
  if (correct) {
    run.score += points;
    run.streak += 1;
    if (expectedAction(cmd) !== 'none') {
      run.reactionSumMs += playerAnswer.reactionMs;
      run.reactionCount += 1;
    }
  } else {
    run.lives -= 1;
    run.streak = 0;
  }

  const judgedRound = run.round;
  const gameOver = run.lives <= 0 || judgedRound >= MAX_ROUNDS;
  let nextCommand = null;

  if (gameOver) {
    run.status = 'finished';
    run.finishedAt = new Date();
    if (run.reactionCount > 0) {
      run.avgReactionMs = Math.round(run.reactionSumMs / run.reactionCount);
      run.sortReactionMs = run.avgReactionMs;
    }
  } else {
    run.round += 1;
    nextCommand = issueCommand(run.round);
    run.currentCommand = nextCommand;
  }

  await run.save(); // throws a VersionError (-> 409) if this round was already answered

  const summary = gameOver
    ? {
        finalScore: run.score,
        title: rankTitle(run.score),
        rank: await rankOf(run),
        roundsPlayed: judgedRound,
        avgReactionMs: run.avgReactionMs,
      }
    : null;

  res.json({
    correct,
    reason,
    round: judgedRound,
    pointsEarned: points,
    multiplier,
    streak: run.streak,
    score: run.score,
    lives: run.lives,
    gameOver,
    command: nextCommand ? publicCommand(nextCommand) : null,
    summary,
  });
}

// GET /api/leaderboard?limit=10&arena=global
export async function leaderboard(req, res) {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
  const arena = cleanArena(req.query.arena);
  const filter = { arena, status: 'finished' };

  const [runs, totalRuns] = await Promise.all([
    Run.find(filter).sort({ score: -1, sortReactionMs: 1, finishedAt: 1 }).limit(limit).lean(),
    Run.countDocuments(filter),
  ]);

  res.json({
    arena,
    totalRuns,
    entries: runs.map((r, i) => ({
      rank: i + 1,
      nickname: r.nickname,
      score: r.score,
      avgReactionMs: r.avgReactionMs,
      title: rankTitle(r.score),
    })),
    generatedAt: new Date().toISOString(),
  });
}
