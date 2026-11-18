// Screen 4: top 10 players. Refreshes itself every 15 s, so it works
// great on a projector during the workshop competition.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { config } from '../config.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ theme, nickname, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.getLeaderboard(10));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const rankName = (title) => {
    const r = theme.ranks[title];
    return r ? `${r.emoji} ${r.name}` : title;
  };

  return (
    <section className="screen board">
      <h2 className="title title-small">🏆 Leaderboard</h2>
      <p className="tagline">
        {config.USE_MOCK ? 'Mock mode: scores saved in this browser only' : `Arena: ${data?.arena ?? config.ARENA}`}
        {data && ` · ${data.totalRuns} runs played`}
      </p>

      <div className="card table-wrap">
        {error && <p className="help is-error">⚠️ {error}</p>}
        {!data && !error && <p className="help">Loading...</p>}
        {data && data.entries.length === 0 && <p className="help">No finished runs yet. Be the first legend!</p>}
        {data && data.entries.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th className="num">Score</th>
                <th className="num hide-sm">Avg</th>
                <th className="hide-sm">Title</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((e) => (
                <tr key={`${e.rank}-${e.nickname}`} className={e.nickname === nickname.trim() ? 'is-me' : ''}>
                  <td>{MEDALS[e.rank - 1] ?? e.rank}</td>
                  <td className="player">{e.nickname}</td>
                  <td className="num">{e.score.toLocaleString()}</td>
                  <td className="num hide-sm">{e.avgReactionMs ? `${e.avgReactionMs} ms` : '-'}</td>
                  <td className="hide-sm">{rankName(e.title)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="btn-row">
        <button type="button" className="btn" onClick={load} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh ↻'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>
    </section>
  );
}
