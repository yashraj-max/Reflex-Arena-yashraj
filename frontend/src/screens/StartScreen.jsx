// Screen 1: title, how to play, nickname, Start.
import { useState } from 'react';
import ServerBadge from '../components/ServerBadge.jsx';
import { describeCommand } from '../lib/commandText.js';

const NICKNAME_RE = /^[A-Za-z0-9 _-]{2,16}$/; // same rule the server checks

const EXAMPLES = [
  { text: 'Simon says: click RED', verdict: 'Do it!', good: true },
  { text: 'Click GREEN', verdict: 'Trap! Do nothing', good: false },
  { text: 'Simon says: double-click BLUE', verdict: 'Tap twice, fast', good: true },
];

function Example({ text, verdict, good, theme }) {
  const d = describeCommand(text, theme);
  return (
    <li className="example">
      <span className="example-cmd">
        {d.commander && <b>{d.commander}: </b>}
        {d.verb} {d.pad.emoji} {d.pad.label}
      </span>
      <span className={`example-verdict ${good ? 'is-good' : 'is-bad'}`}>{good ? '✅' : '🚫'} {verdict}</span>
    </li>
  );
}

export default function StartScreen({ theme, server, nickname, setNickname, onStart, onLeaderboard }) {
  const [touched, setTouched] = useState(false);
  const clean = nickname.trim();
  const valid = NICKNAME_RE.test(clean);
  const blocked = server.state === 'offline';

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (valid && !blocked) onStart(clean);
  };

  return (
    <section className="screen start">
      <div className="logo" aria-hidden="true">{theme.logoEmoji}</div>
      <h1 className="title">{theme.gameTitle}</h1>
      <p className="tagline">{theme.tagline}</p>

      <ul className="examples card" aria-label="How to play">
        {EXAMPLES.map((ex) => (
          <Example key={ex.text} {...ex} theme={theme} />
        ))}
      </ul>

      <form className="start-form" onSubmit={submit} noValidate>
        <label htmlFor="nickname" className="sr-only">
          Nickname
        </label>
        <input
          id="nickname"
          className="input"
          placeholder="Your nickname"
          autoComplete="nickname"
          maxLength={16}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && !valid}
          aria-describedby="nickname-help"
        />
        <p id="nickname-help" className={`help ${touched && !valid ? 'is-error' : ''}`}>
          {touched && !valid ? '2-16 characters: letters, numbers, space, _ or -' : '15 rounds · 3 lives · keys 1 2 3 4 work too'}
        </p>
        <button type="submit" className="btn btn-primary btn-big" disabled={blocked}>
          Start ▶
        </button>
        <button type="button" className="btn btn-ghost" onClick={onLeaderboard}>
          🏆 Leaderboard
        </button>
      </form>

      <ServerBadge server={server} />
    </section>
  );
}
