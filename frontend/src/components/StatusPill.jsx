const STATUS_MAP = {
  compliant: { cls: "safe", text: "Compliant" },
  needs_review: { cls: "warn", text: "Needs review" },
  non_compliant: { cls: "risk", text: "Non-compliant" },
};

export default function StatusPill({ status }) {
  const info = STATUS_MAP[status] || { cls: "warn", text: status };
  return <span className={`pill ${info.cls}`}>{info.text}</span>;
}
