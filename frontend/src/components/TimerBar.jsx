// A bar that shrinks from full to empty over the command's time limit.
// It is a pure CSS animation, so it stays smooth even on slow phones.
export default function TimerBar({ command, paused }) {
  return (
    <div className="timer" role="presentation">
      {command && (
        <div
          key={command.round}
          className={`timer-fill${paused ? ' is-paused' : ''}`}
          style={{ animationDuration: `${command.timeLimitMs}ms` }}
        />
      )}
    </div>
  );
}
