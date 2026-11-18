// Small chip that shows whether the backend is reachable.
const LABELS = {
  mock: ['🧪', 'Mock mode: fake server in your browser'],
  checking: ['⏳', 'Checking server...'],
  waking: ['😴', 'Waking up the server (free tier, up to 1 min)...'],
  online: ['🟢', 'Server online'],
  offline: ['🔴', 'Server offline'],
};

export default function ServerBadge({ server }) {
  const [icon, text] = LABELS[server.state];
  return (
    <div className={`badge badge-${server.state}`}>
      <span aria-hidden="true">{icon}</span> {text}
      {server.state === 'online' && server.version && <span className="badge-dim"> · v{server.version}</span>}
      {server.state === 'offline' && (
        <button type="button" className="link-btn" onClick={server.retry}>
          try again
        </button>
      )}
    </div>
  );
}
