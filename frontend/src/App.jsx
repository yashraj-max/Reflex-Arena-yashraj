// The root component: decides which screen is visible.
//   start  ->  play  ->  over  ->  board
import { useEffect, useState } from 'react';
import Toast from './components/Toast.jsx';
import { useGameEngine } from './hooks/useGameEngine.js';
import { useServerStatus } from './hooks/useServerStatus.js';
import { sound } from './lib/sound.js';
import theme from './theme/index.js';
import GameOverScreen from './screens/GameOverScreen.jsx';
import LeaderboardScreen from './screens/LeaderboardScreen.jsx';
import PlayScreen from './screens/PlayScreen.jsx';
import StartScreen from './screens/StartScreen.jsx';

function savedNickname() {
  try {
    return localStorage.getItem('reflex-nickname') ?? '';
  } catch {
    return '';
  }
}

export default function App() {
  const [screen, setScreen] = useState('start'); // start | play | board
  const [nickname, setNickname] = useState(savedNickname);
  const [muted, setMuted] = useState(sound.isMuted());
  const server = useServerStatus();
  const engine = useGameEngine(theme, { allowHold: Boolean(server.stretch) });

  // Remember the nickname for next time.
  useEffect(() => {
    try {
      localStorage.setItem('reflex-nickname', nickname);
    } catch {
      /* private mode: ignore */
    }
  }, [nickname]);

  const play = (name = nickname.trim()) => {
    setScreen('play');
    engine.start(name);
  };
  const goHome = () => {
    engine.quit();
    setScreen('start');
  };

  // When a run ends, the play screen turns into the game-over screen.
  const view = screen === 'play' && engine.phase === 'over' ? 'over' : screen;
  const outOfSync = engine.error && !engine.error.retry && screen === 'play';

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={goHome} aria-label="Home">
          <span aria-hidden="true">{theme.logoEmoji}</span> {theme.gameTitle}
        </button>
        <button
          type="button"
          className="btn btn-small btn-ghost"
          onClick={() => setMuted(sound.toggleMute())}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </header>

      <main className="main">
        {view === 'start' && (
          <StartScreen
            theme={theme}
            server={server}
            nickname={nickname}
            setNickname={setNickname}
            onStart={play}
            onLeaderboard={() => setScreen('board')}
          />
        )}
        {view === 'play' && <PlayScreen engine={engine} theme={theme} onQuit={goHome} />}
        {view === 'over' && (
          <GameOverScreen
            summary={engine.summary}
            theme={theme}
            nickname={nickname}
            onPlayAgain={() => play()}
            onLeaderboard={() => {
              engine.quit();
              setScreen('board');
            }}
            onHome={goHome}
          />
        )}
        {view === 'board' && <LeaderboardScreen theme={theme} nickname={nickname} onBack={() => setScreen('start')} />}
      </main>

      <Toast
        error={engine.error}
        onClose={engine.dismissError}
        extraAction={
          outOfSync && (
            <button type="button" className="btn btn-small btn-primary" onClick={() => play()}>
              New run
            </button>
          )
        }
      />

      {theme.madeBy && <footer className="footer">Made with 💜 by {theme.madeBy}</footer>}
    </div>
  );
}
