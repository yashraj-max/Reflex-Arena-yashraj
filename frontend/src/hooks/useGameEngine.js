// ================================================================
//  THE GAME ENGINE (a custom React hook)
//  - shows each command and starts its timer
//  - turns pointer/keyboard presses into "click", "double", "hold"
//  - sends the answer to the server and shows the verdict
//
//  The engine NEVER decides if an answer is right. It only reports
//  what the player did. The server is the referee.
// ================================================================
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import { config } from '../config.js';
import { pickMessage } from '../lib/commandText.js';
import { sound } from '../lib/sound.js';

const COUNTDOWN_STEPS = ['3', '2', '1', 'GO!'];
const STEP_MS = 550;

/** Display-only copy of the server rule: 0-2 -> x1, 3-5 -> x2, 6+ -> x3 */
const nextMultiplier = (streak) => (streak >= 6 ? 3 : streak >= 3 ? 2 : 1);

export function useGameEngine(theme, { allowHold = false } = {}) {
  // phase: idle -> countdown -> starting -> playing <-> judging -> over
  const [phase, setPhase] = useState('idle');
  const [countdown, setCountdown] = useState(null);
  const [hud, setHud] = useState({ round: 1, maxRounds: 15, score: 0, lives: 3, maxLives: 3, streak: 0, multiplier: 1 });
  const [command, setCommand] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [activePad, setActivePad] = useState(null);

  // Values that change fast and must not trigger re-renders live in a ref.
  const s = useRef({
    runId: null,
    round: 0,
    shownAt: 0, // performance.now() when the command appeared
    locked: true, // true = pads ignore input
    press: null, // { color, t } while a pad is held down
    pending: null, // first tap waiting to see if a second tap comes (double)
    timers: new Set(),
  }).current;

  /** setTimeout that we can cancel all at once when the run ends. */
  const later = (fn, ms) => {
    const id = setTimeout(() => {
      s.timers.delete(id);
      fn();
    }, ms);
    s.timers.add(id);
    return id;
  };
  const cancel = (id) => {
    clearTimeout(id);
    s.timers.delete(id);
  };
  const cancelAll = () => {
    s.timers.forEach(clearTimeout);
    s.timers.clear();
  };

  useEffect(() => cancelAll, []); // clean up when the component unmounts

  // ---------------------------------------------------------------- start
  const start = useCallback(async (nickname) => {
    cancelAll();
    setError(null);
    setSummary(null);
    setFeedback(null);
    setCommand(null);
    setPhase('countdown');

    // 3, 2, 1, GO! (runs BEFORE we ask the server, so it does not eat into the timer)
    for (const step of COUNTDOWN_STEPS) {
      setCountdown(step);
      sound.tick();
      await new Promise((r) => later(r, STEP_MS));
    }
    setCountdown(null);
    setPhase('starting');

    try {
      const data = await api.startRun(nickname);
      s.runId = data.runId;
      setHud({ round: 1, maxRounds: data.maxRounds, score: 0, lives: data.lives, maxLives: data.lives, streak: 0, multiplier: 1 });
      setPhase('playing');
      setCommand(data.command);
    } catch (err) {
      setPhase('idle');
      setError({ message: err.message, retry: () => start(nickname) });
    }
  }, []);

  // ------------------------------------------ show a command, start the timer
  useLayoutEffect(() => {
    if (!command) return;
    s.shownAt = performance.now(); // measured in the same frame the command is painted
    s.round = command.round;
    s.press = null;
    s.pending = null;
    s.locked = false;
    s.roundTimer = later(onTimerExpired, command.timeLimitMs);
    return () => cancel(s.roundTimer);
  }, [command]);

  /** The timer bar hit zero. If nothing was pressed, the answer is "none". */
  function onTimerExpired() {
    if (s.locked || s.pending || s.press) return; // a press in progress will submit itself
    submit({ action: 'none', color: null, reactionMs: null });
  }

  // ------------------------------------------------------- input detection
  /** Finger/mouse/key goes DOWN on a pad. */
  function pressDown(color) {
    if (s.locked || s.press) return;
    // A different pad while waiting for a double-tap: the first tap was a single click.
    if (s.pending && s.pending.color !== color) {
      const first = s.pending;
      submit({ action: 'click', color: first.color, reactionMs: first.reactionMs });
      return;
    }
    s.press = { color, t: performance.now() };
    sound.pad(theme.pads[color].tone);
    setActivePad(color);
  }

  /** Finger/mouse/key goes UP. Decide: hold, double, or (maybe) click. */
  function pressUp(color) {
    setActivePad(null);
    if (!s.press || s.press.color !== color) return;
    const { t } = s.press;
    s.press = null;
    if (s.locked) return;

    const heldMs = Math.round(performance.now() - t);
    const reactionMs = Math.round(t - s.shownAt);

    // Stretch goal: a long press is a "hold", but only when the server has ENABLE_STRETCH=true
    if (allowHold && !s.pending && heldMs >= config.HOLD_THRESHOLD_MS) {
      submit({ action: 'hold', color, reactionMs, holdMs: heldMs });
      return;
    }

    // Second tap on the same pad inside the window -> double-click
    if (s.pending) {
      const first = s.pending;
      submit({ action: 'double', color, reactionMs: first.reactionMs }); // reaction = FIRST tap
      return;
    }

    // First tap: wait a moment to see if a second one comes.
    s.pending = { color, reactionMs };
    s.doubleTimer = later(() => {
      const first = s.pending;
      if (first) submit({ action: 'click', color: first.color, reactionMs: first.reactionMs });
    }, config.DOUBLE_CLICK_WINDOW_MS);
  }

  // ------------------------------------------------------- talk to server
  /** Locks the pads and sends the answer. */
  function submit(answer) {
    if (s.locked) return;
    s.locked = true;
    cancel(s.roundTimer);
    cancel(s.doubleTimer);
    s.pending = null;
    s.press = null;
    setActivePad(null);
    setPhase('judging');
    send({ runId: s.runId, round: s.round, holdMs: null, ...answer });
  }

  async function send(payload) {
    try {
      const res = await api.sendAnswer(payload);
      showVerdict(res, payload);
    } catch (err) {
      const outOfSync = err.status === 409 || err.status === 404;
      setError({
        message: outOfSync ? 'This run got out of sync with the server. Start a new one!' : err.message,
        retry: outOfSync ? null : () => send(payload),
      });
    }
  }

  /** Shows the server's verdict, then the next command (or game over). */
  function showVerdict(res, payload) {
    setError(null);
    const dodged = res.correct && payload.action === 'none';
    const key = res.correct ? (dodged ? 'trapDodged' : 'ok') : res.reason;
    res.correct ? sound.good() : sound.bad();
    setFeedback({
      id: `${res.round}-${Date.now()}`,
      good: res.correct,
      text: pickMessage(theme, key),
      points: res.pointsEarned,
      multiplier: res.multiplier,
    });
    setHud((h) => ({
      ...h,
      round: res.command?.round ?? res.round,
      score: res.score,
      lives: res.lives,
      streak: res.streak,
      multiplier: nextMultiplier(res.streak),
    }));

    // Keep this pause short: the server's clock is already running for the next command.
    later(() => {
      if (res.gameOver) {
        setSummary(res.summary);
        setCommand(null);
        setPhase('over');
        sound.fanfare();
      } else {
        setPhase('playing');
        setCommand(res.command);
      }
    }, config.FEEDBACK_PAUSE_MS);
  }

  /** Leave the current run (it never reaches the leaderboard). */
  const quit = useCallback(() => {
    cancelAll();
    s.locked = true;
    s.runId = null;
    setCommand(null);
    setError(null);
    setPhase('idle');
  }, []);

  return {
    phase,
    countdown,
    hud,
    command,
    feedback,
    summary,
    error,
    activePad,
    start,
    quit,
    pressDown,
    pressUp,
    dismissError: () => setError(null),
  };
}
