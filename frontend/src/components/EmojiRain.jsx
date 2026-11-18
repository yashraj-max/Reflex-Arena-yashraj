// Celebration! Emojis from the theme fall down the screen.
import { useMemo } from 'react';

export default function EmojiRain({ emojis, count = 36 }) {
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: emojis[i % emojis.length],
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: 2.2 + Math.random() * 2,
        size: 1.2 + Math.random() * 1.6,
      })),
    [emojis, count]
  );

  return (
    <div className="rain" aria-hidden="true">
      {drops.map((d) => (
        <span
          key={d.id}
          style={{
            left: `${d.left}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            fontSize: `${d.size}rem`,
          }}
        >
          {d.emoji}
        </span>
      ))}
    </div>
  );
}
