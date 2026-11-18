// ================================================================
//  LOAD TEST - simulates many players at once against a backend.
//  Use it BEFORE the workshop to check the shared server can cope.
//
//  Usage:
//    node scripts/load-test.js <backendUrl> [players=20] [arena=load-test]
//  Example:
//    node scripts/load-test.js https://reflex-arena-api.onrender.com 40
//
//  Each bot plays a perfect game (reads the command text, taps the
//  right pad after ~300 ms, waits out traps), like a real player would.
//  Bot runs go into the "load-test" arena so they don't spam the real board.
// ================================================================

const [, , baseArg, playersArg = '20', arena = 'load-test'] = process.argv;
if (!baseArg) {
  console.log('Usage: node scripts/load-test.js <backendUrl> [players] [arena]');
  process.exit(1);
}
const BASE = baseArg.replace(/\/+$/, '');
const PLAYERS = Number(playersArg);
const COMMAND_RE = /^(Simon says: )?(click|double-click|hold) (RED|BLUE|GREEN|YELLOW)$/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const latencies = [];
const reasons = {};
let errors = 0;

async function call(path, body) {
  const t = Date.now();
  const res = await fetch(BASE + path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  latencies.push(Date.now() - t);
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

/** Works out what a perfect player would send for a command. */
function perfectAnswer(cmd) {
  const m = cmd.text.match(COMMAND_RE);
  if (!m || !m[1]) return { action: 'none', color: null, waitMs: cmd.timeLimitMs + 50 };
  const verb = m[2].toLowerCase();
  const action = verb === 'double-click' ? 'double' : verb === 'hold' ? 'hold' : 'click';
  return { action, color: m[3].toLowerCase(), waitMs: 250 + Math.random() * 150 };
}

async function bot(i) {
  await sleep(Math.random() * 3000); // players don't all press Start at the same instant
  try {
    const start = await call('/api/start', { nickname: `bot-${i}`, arena });
    let { runId, command } = start;
    let last;
    while (command) {
      const shown = Date.now();
      const plan = perfectAnswer(command);
      await sleep(plan.waitMs);
      const reactionMs = plan.action === 'none' ? null : Date.now() - shown;
      if (plan.action === 'double') await sleep(400); // the double-tap window a browser waits
      last = await call('/api/answer', {
        runId,
        round: command.round,
        action: plan.action,
        color: plan.color,
        reactionMs,
        holdMs: plan.action === 'hold' ? 700 : null,
      });
      reasons[last.reason] = (reasons[last.reason] || 0) + 1;
      await sleep(350); // the frontend's feedback pause
      command = last.command;
    }
    return last.summary.finalScore;
  } catch (err) {
    errors += 1;
    console.error(`bot-${i}:`, err.message);
    return null;
  }
}

const pct = (arr, p) => arr.slice().sort((a, b) => a - b)[Math.floor((arr.length - 1) * p)] ?? 0;

console.log(`Waking ${BASE} ...`);
const wake = Date.now();
try {
  await call('/api/health');
} catch (err) {
  console.error(`Could not reach ${BASE}/api/health: ${err.cause?.message ?? err.message}`);
  process.exit(1);
}
console.log(`Awake in ${Date.now() - wake} ms. Starting ${PLAYERS} bots in arena "${arena}"...\n`);
latencies.length = 0;

const t0 = Date.now();
const scores = await Promise.all(Array.from({ length: PLAYERS }, (_, i) => bot(i + 1)));
const done = scores.filter((s) => s != null);

console.log('\n================ RESULT ================');
console.log(`Players finished : ${done.length}/${PLAYERS}  (errors: ${errors})`);
console.log(`Total time       : ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log(`Requests         : ${latencies.length}`);
console.log(`Latency p50/p95  : ${pct(latencies, 0.5)} ms / ${pct(latencies, 0.95)} ms`);
console.log('Verdicts         :', reasons);
console.log('\nHealthy if: no errors, almost every verdict is "ok", and p95 < 800 ms.');
console.log('Many "invalid_timing"? The server is too slow: raise MAX_NETWORK_GAP_MS or use a bigger instance.');
