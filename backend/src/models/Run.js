// One document in MongoDB = one game ("run") played by one player.
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

// The command the player is currently answering.
// It contains the secret answer, so it is NEVER sent to the browser as-is.
const commandSchema = new mongoose.Schema(
  {
    round: Number,
    text: String,
    simon: Boolean, // true if it starts with "Simon says"
    action: { type: String, enum: ['click', 'double', 'hold', 'none'] },
    color: { type: String, default: null },
    timeLimitMs: Number,
    issuedAt: Number, // server time (ms since 1970) when the command was sent
  },
  { _id: false }
);

const runSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => randomUUID() }, // sent to the browser as runId
    arena: { type: String, default: 'global' }, // which leaderboard this run belongs to
    nickname: { type: String, required: true },
    status: { type: String, enum: ['active', 'finished'], default: 'active' },
    round: { type: Number, default: 1 },
    lives: { type: Number, default: 3 },
    score: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    reactionSumMs: { type: Number, default: 0 }, // sum of reaction times on correct actions
    reactionCount: { type: Number, default: 0 }, // how many of those there were
    avgReactionMs: { type: Number, default: 0 }, // filled in when the run finishes
    // Tie-breaker for the leaderboard. Runs with no reaction data sort last.
    sortReactionMs: { type: Number, default: Number.MAX_SAFE_INTEGER },
    currentCommand: commandSchema,
    finishedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    // If two answers for the same round arrive at once, only the first one is saved.
    optimisticConcurrency: true,
  }
);

// Makes the leaderboard query fast.
runSchema.index({ arena: 1, status: 1, score: -1, sortReactionMs: 1 });

export const Run = mongoose.model('Run', runSchema);
