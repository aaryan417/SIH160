const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function colorFor(score) {
  if (score >= 50) return "var(--risk)";
  if (score >= 20) return "var(--warn)";
  return "var(--safe)";
}

export default function RiskGauge({ score }) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const color = colorFor(clamped);

  return (
    <div className="risk-ring">
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="9" />
        <circle
          cx="54"
          cy="54"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="value">
        <span className="num" style={{ color }}>
          {Math.round(clamped)}
        </span>
        <span className="label">risk score</span>
      </div>
    </div>
  );
}
