const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getDetails(score) {
  if (score >= 50) {
    return {
      color: "#ef4444",
      bgGlow: "rgba(239, 68, 68, 0.25)",
      label: "Critical Threat",
      statusClass: "pill risk",
    };
  }
  if (score >= 20) {
    return {
      color: "#f59e0b",
      bgGlow: "rgba(245, 158, 11, 0.25)",
      label: "Moderate Warning",
      statusClass: "pill warn",
    };
  }
  return {
    color: "#10b981",
    bgGlow: "rgba(16, 185, 129, 0.25)",
    label: "Hardened Security",
    statusClass: "pill safe",
  };
}

export default function RiskGauge({ score = 0 }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const details = getDetails(clamped);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <div className="risk-ring">
        <svg width="124" height="124" viewBox="0 0 124 124">
          <circle
            cx="62"
            cy="62"
            r={RADIUS}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="10"
          />
          <circle
            cx="62"
            cy="62"
            r={RADIUS}
            fill="none"
            stroke={details.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease",
              filter: `drop-shadow(0 0 8px ${details.color})`,
            }}
          />
        </svg>
        <div className="value">
          <span className="num" style={{ color: details.color }}>
            {Math.round(clamped)}
          </span>
          <span className="label">risk score</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "4px" }}>
          Threat Assessment
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: details.color, marginBottom: "6px" }}>
          {details.label}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "26ch", lineHeight: "1.4" }}>
          {clamped >= 50
            ? "Multiple cryptographic vulnerabilities detected that fail defense standards."
            : clamped >= 20
            ? "Non-critical weaknesses found. Recommended for upgrade."
            : "Cryptographic suite meets modern NIST SP 800-77 & CNSA standards."}
        </div>
      </div>
    </div>
  );
}
