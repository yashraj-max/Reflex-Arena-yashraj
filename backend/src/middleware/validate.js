// Request validation, written by hand so you can see exactly what is checked.
// Never trust the browser: anything can be sent with a tool like curl.
import { COLORS } from '../game/rules.js';

const NICKNAME_RE = /^[A-Za-z0-9 _-]{2,16}$/;
const ARENA_RE = /^[a-z0-9-]{2,32}$/;
const ACTIONS = ['click', 'double', 'hold', 'none'];

/** Error with an HTTP status code. The error handler turns it into JSON. */
export class HttpError extends Error {
  constructor(status, detail) {
    super(detail);
    this.status = status;
  }
}

const isInt = (v) => Number.isInteger(v) && v >= 0;

/** Cleans and checks the arena id. Missing means the "global" leaderboard. */
export function cleanArena(raw) {
  if (raw == null || raw === '') return 'global';
  const arena = String(raw).trim().toLowerCase();
  if (!ARENA_RE.test(arena)) {
    throw new HttpError(422, 'arena must be 2-32 characters: a-z, 0-9 and hyphen');
  }
  return arena;
}

/** Validates the body of POST /api/start. */
export function validateStart(req, _res, next) {
  const body = req.body ?? {};
  const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : '';
  if (!NICKNAME_RE.test(nickname)) {
    throw new HttpError(422, 'nickname must be 2-16 characters: letters, digits, space, _ or -');
  }
  req.valid = { nickname, arena: cleanArena(body.arena) };
  next();
}

/** Validates the body of POST /api/answer. */
export function validateAnswer(req, _res, next) {
  const { runId, round, action, color = null, reactionMs = null, holdMs = null } = req.body ?? {};

  if (typeof runId !== 'string' || runId.length < 8) throw new HttpError(422, 'runId is required');
  if (round != null && !isInt(round)) throw new HttpError(422, 'round must be an integer');
  if (!ACTIONS.includes(action)) throw new HttpError(422, `action must be one of ${ACTIONS.join(', ')}`);

  if (action === 'none') {
    if (color !== null) throw new HttpError(422, 'color must be null when action is none');
  } else {
    if (!COLORS.includes(color)) throw new HttpError(422, `color must be one of ${COLORS.join(', ')}`);
    if (!isInt(reactionMs)) throw new HttpError(422, 'reactionMs must be a whole number of milliseconds');
  }
  if (action === 'hold' && !isInt(holdMs)) throw new HttpError(422, 'holdMs is required for hold');

  req.valid = { runId, round, action, color, reactionMs: action === 'none' ? null : reactionMs, holdMs };
  next();
}
