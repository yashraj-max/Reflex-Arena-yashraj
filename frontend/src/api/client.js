// ================================================================
//  The ONLY file that talks to the backend.
//  Every function returns a Promise with the JSON from the server,
//  or throws an ApiError with a friendly message.
//  If config.USE_MOCK is true, the fake server in mockServer.js answers instead.
// ================================================================
import { config } from '../config.js';
import { mockApi } from './mockServer.js';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status; // 0 = network problem, otherwise the HTTP status
  }
}

/** fetch() + timeout + JSON + readable errors. */
async function request(path, { method = 'GET', body, timeoutMs = config.ANSWER_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(`${config.API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    const msg =
      err.name === 'AbortError'
        ? 'The server took too long to answer.'
        : "Can't reach the server. Check your internet and try again.";
    throw new ApiError(msg, 0);
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.detail || `Server error (${res.status})`, res.status);
  return data;
}

const realApi = {
  /** GET /api/health - also wakes up a sleeping Render server. */
  health: () => request('/api/health', { timeoutMs: config.WAKE_TIMEOUT_MS }),

  /** POST /api/start - creates a run and returns command 1. */
  startRun: (nickname) =>
    request('/api/start', {
      method: 'POST',
      body: { nickname, arena: config.ARENA },
      timeoutMs: config.WAKE_TIMEOUT_MS,
    }),

  /** POST /api/answer - { runId, round, action, color, reactionMs, holdMs } */
  sendAnswer: (payload) => request('/api/answer', { method: 'POST', body: payload }),

  /** GET /api/leaderboard - top runs for this arena. */
  getLeaderboard: (limit = 10) =>
    request(`/api/leaderboard?limit=${limit}&arena=${encodeURIComponent(config.ARENA)}`, {
      timeoutMs: config.WAKE_TIMEOUT_MS,
    }),
};

export const api = config.USE_MOCK ? mockApi : realApi;
