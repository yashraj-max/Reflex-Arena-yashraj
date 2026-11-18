// The floating "+175  Nice!" or "Trap! 😈" after each answer.
export default function FeedbackPop({ feedback }) {
  if (!feedback) return null;
  return (
    <div key={feedback.id} className={`feedback ${feedback.good ? 'is-good' : 'is-bad'}`} role="status">
      <span className="feedback-text">{feedback.text}</span>
      {feedback.good && (
        <span className="feedback-points">
          +{feedback.points}
          {feedback.multiplier > 1 && <small> (×{feedback.multiplier})</small>}
        </span>
      )}
    </div>
  );
}
