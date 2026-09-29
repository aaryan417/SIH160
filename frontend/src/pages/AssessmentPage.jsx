import { useState } from "react";
import { api } from "../api";
import RiskGauge from "../components/RiskGauge";
import StatusPill from "../components/StatusPill";

const THREAT_LABELS = {
  cipher_strength: "Cipher strength",
  forward_secrecy: "Forward secrecy",
  key_exchange_strength: "Key exchange",
};

export default function AssessmentPage() {
  const [sessionId, setSessionId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  async function handleRun(e) {
    e.preventDefault();
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.runAssessment(sessionId);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Risk assessment</h1>
      <p className="page-desc">
        Scores the classified configuration against known-weak ciphers, missing PFS, and weak DH
        groups. Requires classification to have run for this session first.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        <h3>Run assessment</h3>
        <form onSubmit={handleRun}>
          <div className="field-row">
            <div className="field">
              <label>Session ID</label>
              <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="uuid" required />
            </div>
          </div>
          <button className="btn" type="submit" disabled={running}>
            {running ? "Assessing…" : "Run assessment"}
          </button>
        </form>
      </div>

      {result && (
        <div className="panel">
          <h3>Result</h3>
          <div className="risk-readout">
            <RiskGauge score={result.risk_score} />
            <div>
              <StatusPill status={result.compliance_status} />
              <p className="page-desc" style={{ margin: "10px 0 0" }}>
                Generate a report for session {result.session_id.slice(0, 8)} once you're ready to
                export this finding.
              </p>
            </div>
          </div>

          {result.threat_matrix && (
            <div className="threat-grid">
              {Object.entries(result.threat_matrix).map(([key, value]) => (
                <div className="threat-cell" key={key}>
                  <div className="k">{THREAT_LABELS[key] || key}</div>
                  <div className="v">{value.replace(/_/g, " ")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
