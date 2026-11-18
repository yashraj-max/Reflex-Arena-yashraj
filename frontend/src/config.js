// App settings. Values come from environment variables (.env.local or Vercel).
const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

export const config = {
  API_URL,
  // No backend URL? Then play against the fake server in src/api/mockServer.js
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || !API_URL,
  ARENA: (import.meta.env.VITE_ARENA || 'global').trim().toLowerCase(),

  // Input timing (must match what the server expects - see docs/02-api-contract.md)
  DOUBLE_CLICK_WINDOW_MS: 400, // second tap must come within this time
  HOLD_THRESHOLD_MS: 600, // pressing longer than this counts as "hold"
  FEEDBACK_PAUSE_MS: 350, // keep it <= 350 or the server may reject timing

  // Network timeouts. A sleeping Render free server needs up to ~60 s to wake up.
  WAKE_TIMEOUT_MS: 75000,
  ANSWER_TIMEOUT_MS: 10000,
};
