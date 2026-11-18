// The big command text, e.g.  "Mummy says:  grab 🌶️ MIRCHI"
import { commandSentence, describeCommand } from '../lib/commandText.js';

export default function CommandBanner({ command, theme, waiting }) {
  if (!command) {
    return (
      <div className="command">
        <span className="command-commander">&nbsp;</span>
        <span className="command-main command-wait">{waiting || 'Get ready...'}</span>
      </div>
    );
  }

  const d = describeCommand(command.text, theme);
  return (
    // key = round, so the pop-in animation replays for every new command
    <div className="command" key={command.round} aria-live="polite" aria-label={commandSentence(command.text, theme)}>
      {d.raw ? (
        <span className="command-main">{d.raw}</span>
      ) : (
        <>
          {/* Always render this line so the layout does not jump (and give away traps!) */}
          <span className="command-commander">{d.commander ? `${d.commander}:` : ' '}</span>
          <span className="command-main">
            {d.verb}{' '}
            {d.pad && (
              <span className="command-target" style={{ color: d.pad.color }}>
                {d.pad.emoji} {d.pad.label}
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
}
