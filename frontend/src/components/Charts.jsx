import React from "react";

/**
 * Protocol Distribution Bar Chart (similar to NetCapture Pro & NETWATCH)
 */
export function ProtocolBarChart({ data = [] }) {
  const defaultData = [
    { label: "ESP", count: 3772, color: "#00f0ff" },
    { label: "IKEv2", count: 851, color: "#10b981" },
    { label: "UDP 500", count: 480, color: "#f59e0b" },
    { label: "UDP 4500", count: 320, color: "#8b5cf6" },
    { label: "AH", count: 140, color: "#ec4899" },
    { label: "IPv6", count: 860, color: "#38bdf8" },
    { label: "Other", count: 110, color: "#64748b" },
  ];

  const items = data.length > 0 ? data : defaultData;
  const maxCount = Math.max(...items.map((d) => d.count), 1);
  const chartHeight = 160;

  return (
    <div className="chart-wrapper">
      <div className="chart-bars-container" style={{ height: chartHeight }}>
        {items.map((item, idx) => {
          const barHeight = Math.max(12, Math.round((item.count / maxCount) * (chartHeight - 30)));
          return (
            <div key={idx} className="chart-bar-col">
              <div className="chart-bar-tooltip">
                {item.count.toLocaleString()} packets
              </div>
              <div
                className="chart-bar-fill"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: item.color,
                  boxShadow: `0 0 12px ${item.color}40`,
                }}
              />
              <span className="chart-bar-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Traffic Activity Spline/Area Chart (similar to Security Operations Center & NetCapture Pro)
 */
export function TrafficTimelineChart({ color = "#00f0ff", height = 150 }) {
  // 12 data points representing time slices
  const points = [
    { time: "00:00", val: 35 },
    { time: "02:00", val: 55 },
    { time: "04:00", val: 40 },
    { time: "06:00", val: 85 },
    { time: "08:00", val: 120 },
    { time: "10:00", val: 95 },
    { time: "12:00", val: 140 },
    { time: "14:00", val: 110 },
    { time: "16:00", val: 165 },
    { time: "18:00", val: 130 },
    { time: "20:00", val: 80 },
    { time: "22:00", val: 65 },
  ];

  const width = 500;
  const maxVal = Math.max(...points.map((p) => p.val));
  const minVal = 0;

  // Build SVG path
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - 40) + 20;
    const y = height - 25 - ((p.val - minVal) / (maxVal - minVal)) * (height - 45);
    return { x, y, ...p };
  });

  // Smooth cubic bezier path string
  let dPath = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cpX = (curr.x + next.x) / 2;
    dPath += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  const fillPath = `${dPath} L ${coords[coords.length - 1].x} ${height - 15} L ${coords[0].x} ${height - 15} Z`;

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: `${height}px`, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="20" y1={height - 25} x2={width - 20} y2={height - 25} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
        <line x1="20" y1={(height - 25) / 2} x2={width - 20} y2={(height - 25) / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

        {/* Area fill */}
        <path d={fillPath} fill="url(#timelineGrad)" />

        {/* Spline line */}
        <path
          d={dPath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />

        {/* Data points */}
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="3.5"
            fill="#090e1a"
            stroke={color}
            strokeWidth="2"
          />
        ))}

        {/* Bottom time labels */}
        {coords.filter((_, i) => i % 3 === 0).map((c, i) => (
          <text
            key={i}
            x={c.x}
            y={height - 5}
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            {c.time}
          </text>
        ))}
      </svg>
    </div>
  );
}

/**
 * Protocol Mix / Severity Donut Chart (similar to NETWATCH & AppSec Phoenix)
 */
export function DonutChart({
  title = "Protocol Breakdown",
  total = 4623,
  segments = [
    { label: "ESP Encrypted", value: 3772, color: "#00f0ff" },
    { label: "IKEv2 Handshake", value: 651, color: "#10b981" },
    { label: "Auth / AH", value: 200, color: "#f59e0b" },
  ],
  size = 140,
}) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const sum = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  let accumulatedOffset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Base background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segments.map((seg, i) => {
            const ratio = seg.value / sum;
            const strokeDasharray = `${ratio * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += ratio * circumference;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{
                  transition: "stroke-dashoffset 0.6s ease",
                  filter: `drop-shadow(0 0 4px ${seg.color}60)`,
                }}
              />
            );
          })}
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "#fff" }}>
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: seg.color }} />
              <span style={{ color: "var(--text-secondary)" }}>{seg.label}</span>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: "600", color: "#fff" }}>
              {Math.round((seg.value / sum) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Semi-Circular Speedometer Risk Gauge (similar to AppSec Phoenix in Image 4)
 */
export function SpeedometerRiskGauge({ score = 75, maxScore = 100 }) {
  const percentage = Math.max(0, Math.min(100, (score / maxScore) * 100));

  // Determine status
  let statusColor = "#10b981";
  let statusText = "Compliant";
  let statusBadge = "Low Risk";

  if (percentage >= 50) {
    statusColor = "#ef4444";
    statusText = "Critical Threat";
    statusBadge = "Action Required";
  } else if (percentage >= 20) {
    statusColor = "#f59e0b";
    statusText = "Moderate Warning";
    statusBadge = "Audit Needed";
  }

  // Semi-circle SVG (180 deg)
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const halfCircumference = Math.PI * radius;
  const dashOffset = halfCircumference * (1 - percentage / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size / 2 + 20, overflow: "hidden" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${size / 2}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d={`M ${strokeWidth} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${size / 2}`}
            fill="none"
            stroke={statusColor}
            strokeWidth={strokeWidth}
            strokeDasharray={halfCircumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: `drop-shadow(0 0 8px ${statusColor}80)`,
            }}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "800", color: statusColor, lineHeight: "1" }}>
            {statusText}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Score: {Math.round(score)} / {maxScore}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "12px",
          display: "inline-block",
          padding: "3px 10px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: "700",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          backgroundColor: `${statusColor}18`,
          color: statusColor,
          border: `1px solid ${statusColor}40`,
        }}
      >
        {statusBadge}
      </div>
    </div>
  );
}
