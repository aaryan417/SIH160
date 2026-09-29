import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import SessionSelector from "../components/SessionSelector";

export default function ClassificationPage() {
  const [searchParams] = useSearchParams();
  const initialSession = searchParams.get("session") || "";

  const [sessionId, setSessionId] = useState(initialSession);
  const [localIp, setLocalIp] = useState("10.0.0.2");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (initialSession) {
      setSessionId(initialSession);
    }
  }, [initialSession]);

  async function handleRun(e) {
    if (e) e.preventDefault();
    if (!sessionId) {
      setError("Please select or enter a valid Session ID.");
      return;
    }
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.runClassification(sessionId, localIp);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  const confidencePct = result ? Math.round(result.confidence_score * 100) : 0;
  const isWeakCipher = result && (result.predicted_cipher === "3DES" || result.predicted_cipher === "DES");

  return (
    <div>
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            AI Protocol Classification
            <span className="page-title-badge">Side-Channel Inference</span>
          </h1>
          <p className="page-desc">
            Extracts opaque metadata features (packet size distributions, inter-arrival timing variances,
            ESP and IKE exchange frequency) to predict the active cipher suite, encapsulation mode, and key exchange.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Session Selector */}
      <SessionSelector
        value={sessionId}
        onChange={setSessionId}
        label="Target Capture Session for AI Inference"
      />

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Execute Machine Learning Model</h3>
            <div className="panel-subtitle">Identify local interface boundary to tag inbound vs outbound directional flows.</div>
          </div>
        </div>

        <form onSubmit={handleRun}>
          <div className="field-row">
            <div className="field">
              <label>
                Local Interface IP Address
                <span className="field-hint">Testbed Lab Endpoint</span>
              </label>
              <input
                value={localIp}
                onChange={(e) => setLocalIp(e.target.value)}
                placeholder="e.g. 10.0.0.2"
                className="mono"
                required
              />
            </div>

            <div className="field" style={{ display: "flex", justifyContent: "flex-end" }}>
              <label style={{ visibility: "hidden" }}>Action</label>
              <button className="btn" type="submit" disabled={running || !sessionId}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {running ? "Extracting Features & Inferring…" : "Run AI Protocol Classifier"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Prediction Showcase */}
      {result && (
        <div className="panel" style={{ border: "1px solid var(--border-strong)" }}>
          <div className="panel-header">
            <div>
              <h3>Inference Telemetry Output</h3>
              <div className="panel-subtitle">Predicted cryptographic parameters derived purely from packet headers.</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                CONFIDENCE:
              </span>
              <span style={{ fontSize: "15px", fontWeight: "700", color: confidencePct > 70 ? "var(--cyan)" : "var(--warn)" }}>
                {confidencePct}%
              </span>
            </div>
          </div>

          <div className="prediction-grid">
            <div className="prediction-card">
              <div className="card-label">Predicted Cipher Suite</div>
              <div className="card-value" style={{ color: isWeakCipher ? "var(--risk)" : "var(--cyan)" }}>
                {result.predicted_cipher}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                {isWeakCipher ? "⚠️ Critical Security Vulnerability" : "🛡️ High Grade Encryption"}
              </div>
            </div>

            <div className="prediction-card">
              <div className="card-label">Encapsulation Mode</div>
              <div className="card-value" style={{ color: "#fff", textTransform: "capitalize" }}>
                {result.predicted_mode}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                {result.predicted_mode === "tunnel" ? "Site-to-Site Gateway" : "Host-to-Host SA"}
              </div>
            </div>

            <div className="prediction-card">
              <div className="card-label">Diffie-Hellman Group</div>
              <div className="card-value" style={{ color: "var(--blue)" }}>
                {result.predicted_dh_group || "MODP2048 (Default)"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Key Exchange Protocol
              </div>
            </div>

            <div className="prediction-card">
              <div className="card-label">Model Confidence Score</div>
              <div className="card-value" style={{ color: "var(--safe)" }}>
                {(result.confidence_score).toFixed(2)}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Metadata statistical fit
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-md)", padding: "16px 20px", marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontWeight: "600", fontSize: "13.5px", color: "#fff" }}>
                Next Phase: Cryptographic Risk & Compliance Audit
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Evaluate predicted cipher ({result.predicted_cipher}) and key exchange against NIST SP 800-77 rules.
              </div>
            </div>

            <Link
              to={`/assessment?session=${result.session_id}`}
              className="btn"
            >
              Proceed to Risk Assessment ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
