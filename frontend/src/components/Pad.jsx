// One big colored pad. Uses pointer events so mouse, touch and pen all work the same.
export default function Pad({ id, pad, keyHint, active, onDown, onUp }) {
  const handleDown = (e) => {
    e.preventDefault(); // stops double-tap zoom / text selection on phones
    e.currentTarget.setPointerCapture?.(e.pointerId); // we still get "up" if the finger slides off
    onDown(id);
  };

  return (
    <button
      type="button"
      className={`pad${active ? ' is-active' : ''}`}
      style={{ '--pad': pad.color }}
      data-color={id}
      aria-label={`${pad.label} pad, key ${keyHint}`}
      onPointerDown={handleDown}
      onPointerUp={() => onUp(id)}
      onPointerCancel={() => onUp(id)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="pad-emoji" aria-hidden="true">{pad.emoji}</span>
      <span className="pad-label">{pad.label}</span>
      <kbd className="pad-key">{keyHint}</kbd>
    </button>
  );
}
