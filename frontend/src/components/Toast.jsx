// Friendly error message with an optional Retry button. The game never crashes.
export default function Toast({ error, onClose, extraAction }) {
  if (!error) return null;
  return (
    <div className="toast" role="alert">
      <span className="toast-msg">⚠️ {error.message}</span>
      <div className="toast-actions">
        {error.retry && (
          <button type="button" className="btn btn-small" onClick={error.retry}>
            Retry
          </button>
        )}
        {extraAction}
        <button type="button" className="btn btn-small btn-ghost" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
}
