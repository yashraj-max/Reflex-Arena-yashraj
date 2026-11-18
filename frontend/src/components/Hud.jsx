// Top bar during a run: round, score, lives and streak multiplier.
export default function Hud({ hud, theme }) {
  const hearts = Array.from({ length: hud.maxLives }, (_, i) => (i < hud.lives ? theme.lifeIcon : theme.lostLifeIcon));

  return (
    <div className="hud">
      <div className="hud-item">
        <span className="hud-label">Round</span>
        <span className="hud-value">
          {Math.min(hud.round, hud.maxRounds)}
          <small> / {hud.maxRounds}</small>
        </span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Score</span>
        <span className="hud-value" key={hud.score}>
          {hud.score.toLocaleString()}
        </span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Lives</span>
        <span className="hud-value hud-lives" aria-label={`${hud.lives} lives left`}>
          {hearts.map((h, i) => (
            <span key={`${i}-${h}`} className={i < hud.lives ? '' : 'life-lost'}>
              {h}
            </span>
          ))}
        </span>
      </div>
      <div className="hud-item">
        <span className="hud-label">Streak {hud.streak}</span>
        <span className={`hud-value multiplier m${hud.multiplier}`}>×{hud.multiplier}</span>
      </div>
    </div>
  );
}
