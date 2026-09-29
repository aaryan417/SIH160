export default function StatusPill({ status }) {
  const norm = (status || "").toLowerCase().replace(/[\s-]/g, "_");

  const label =
    {
      compliant: "Compliant · Low Risk",
      safe: "Compliant · Low Risk",
      needs_review: "Needs Review · Warning",
      warn: "Needs Review · Warning",
      non_compliant: "Non-Compliant · High Risk",
      risk: "Non-Compliant · High Risk",
    }[norm] || status;

  const className =
    norm === "compliant" || norm === "safe"
      ? "pill compliant"
      : norm === "needs_review" || norm === "warn"
      ? "pill needs_review"
      : "pill non_compliant";

  return <span className={className}>{label}</span>;
}
