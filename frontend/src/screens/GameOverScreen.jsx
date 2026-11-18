// Screen 3: final score, rank title, position on the leaderboard, share.
import { useEffect, useState } from 'react';
import EmojiRain from '../components/EmojiRain.jsx';

/** Counts a number up from 0 for a bit of drama. */
function useCountUp(target, ms = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / ms, 1);
      setValue(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return value;
}

export default function GameOverScreen({ summary, theme, nickname, onPlayAgain, onLeaderboard, onHome }) {
  const score = useCountUp(summary.finalScore);
  const [copied, setCopied] = useState(false);
  const rank = theme.ranks[summary.title] ?? { name: summary.title, emoji: '🏅' };
  const celebrate = summary.title === 'Lightning' || summary.title === 'Reflex God' || summary.rank <= 3;

  const share = async () => {
    const text = `${theme.logoEmoji} I scored ${summary.finalScore} in ${theme.gameTitle} and became "${rank.name}" ${rank.emoji}. Beat me:`;
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: theme.gameTitle, text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
      }
    } catch {
      /* user cancelled share */
    }
  };

  return (
    <section className="screen over">
      {celebrate && <EmojiRain emojis={theme.celebrationEmoji} />}
      <p className="over-kicker">Game over, {nickname}!</p>
      <div className="rank-emoji" aria-hidden="true">{rank.emoji}</div>
      <h2 className="rank-name">{rank.name}</h2>
      <div className="final-score" aria-label={`Final score ${summary.finalScore}`}>
        {score.toLocaleString()}
      </div>

      <div className="stats card">
        <div>
          <span className="stat-value">#{summary.rank}</span>
          <span className="stat-label">on the leaderboard</span>
        </div>
        <div>
          <span className="stat-value">{summary.roundsPlayed}</span>
          <span className="stat-label">rounds played</span>
        </div>
        <div>
          <span className="stat-value">{summary.avgReactionMs ? `${summary.avgReactionMs} ms` : '-'}</span>
          <span className="stat-label">avg reaction</span>
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-primary btn-big" onClick={onPlayAgain}>
          Play again ↻
        </button>
        <button type="button" className="btn" onClick={onLeaderboard}>
          🏆 Leaderboard
        </button>
        <button type="button" className="btn btn-ghost" onClick={share}>
          {copied ? 'Link copied! ✅' : 'Share 📣'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onHome}>
          Home
        </button>
      </div>
    </section>
  );
}
