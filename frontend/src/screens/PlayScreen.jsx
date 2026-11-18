// Screen 2: the game itself.
import { useEffect, useRef } from 'react';
import CommandBanner from '../components/CommandBanner.jsx';
import FeedbackPop from '../components/FeedbackPop.jsx';
import Hud from '../components/Hud.jsx';
import Pad from '../components/Pad.jsx';
import TimerBar from '../components/TimerBar.jsx';

const PAD_ORDER = ['red', 'blue', 'green', 'yellow'];
const KEY_TO_PAD = { 1: 'red', 2: 'blue', 3: 'green', 4: 'yellow' };

export default function PlayScreen({ engine, theme, onQuit }) {
  const { phase, countdown, hud, command, feedback, activePad, pressDown, pressUp } = engine;

  // Keyboard support: keys 1-4 press the pads.
  useEffect(() => {
    const down = (e) => {
      const pad = KEY_TO_PAD[e.key];
      if (pad && !e.repeat) pressDown(pad);
    };
    const up = (e) => {
      const pad = KEY_TO_PAD[e.key];
      if (pad) pressUp(pad);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [pressDown, pressUp]);

  // Shake on a mistake, glow on a correct answer (Web Animations API).
  const arenaRef = useRef(null);
  useEffect(() => {
    const el = arenaRef.current;
    if (!feedback || !el?.animate) return;
    if (feedback.good) {
      el.animate(
        [{ boxShadow: '0 0 0 0 var(--good)' }, { boxShadow: '0 0 0 6px var(--good)' }, { boxShadow: '0 0 0 0 transparent' }],
        { duration: 450, easing: 'ease-out' }
      );
    } else {
      el.animate(
        [0, -14, 12, -9, 7, -4, 0].map((x) => ({ transform: `translateX(${x}px)` })),
        { duration: 420, easing: 'ease-out' }
      );
    }
  }, [feedback]);

  const waiting = phase === 'starting' ? 'Connecting to server...' : null;

  return (
    <section className="screen play">
      <div className="play-top">
        <Hud hud={hud} theme={theme} />
        <button type="button" className="btn btn-small btn-ghost quit" onClick={onQuit} aria-label="Quit run">
          ✕
        </button>
      </div>

      <div className="arena" ref={arenaRef}>
        <CommandBanner command={command} theme={theme} waiting={waiting} />
        <TimerBar command={command} paused={phase === 'judging'} />
        <div className={`pads${phase === 'judging' ? ' is-locked' : ''}`}>
          {PAD_ORDER.map((id, i) => (
            <Pad
              key={id}
              id={id}
              pad={theme.pads[id]}
              keyHint={i + 1}
              active={activePad === id}
              onDown={pressDown}
              onUp={pressUp}
            />
          ))}
        </div>
      </div>

      <FeedbackPop feedback={feedback} />

      {phase === 'countdown' && (
        <div className="overlay countdown" key={countdown}>
          <span>{countdown}</span>
        </div>
      )}

      {phase === 'idle' && (
        <div className="overlay">
          <div className="card center">
            <p>Could not start the run.</p>
            <button type="button" className="btn btn-primary" onClick={onQuit}>
              Back to start
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
