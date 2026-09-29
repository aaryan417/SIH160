import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import RiskGauge from "../components/RiskGauge";
import StatusPill from "../components/StatusPill";
import SessionSelector from "../components/SessionSelector";

const THREAT_LABELS = {
  cipher_strength: "Symmetric Cipher Integrity",
  forward_secrecy: "Perfect Forward Secrecy (PFS)",
  key_exchange_strength: "Diffie-Hellman Key Exchange",
};

const THREAT_DESCRIPTIONS = {
  cipher_strength: {
    high_risk: "Legacy cipher (e.g. 3DES, DES) prone to Sweet32 collision attacks & birthday paradox degradation.",
    low_risk: "High-grade modern cipher (AES-GCM / AES-256) resistant to known cryptanalytic attacks.",
    medium_risk: "Standard cipher (AES-128) acceptable for commercial traffic, upgrade recommended for defense.",
  },
  forward_secrecy: {
    at_risk: "PFS disabled: Compromise of long-term private key allows retroactive bulk decryption of all captured sessions.",
    protected: "Ephemeral Diffie-Hellman keys rotated per phase-2 Child SA exchange. Retroactive decryption impossible.",
  },
  key_exchange_strength: {
    weak: "Sub-2048 bit modulus (MODP768/1024) vulnerable to nation-state discrete logarithm pre-computation (Logjam).",
    adequate: "Robust elliptic curve or 2048+ bit modulus compliant with NSA Suite B & NIST standards.",
  },
};

export default function AssessmentPage() {
  const [searchParams] = useSearchParams();
  const initialSession = searchParams.get("session") || "";

  const [sessionId, setSessionId] = useState(initialSession);
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
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            Cryptographic Risk Assessment
            <span className="page-title-badge">NIST SP 800-77 Engine</span>
          </h1>
          <p className="page-desc">
            Auditable, rule-based security scoring of the classified VPN deployment against known vulnerabilities,
            deprecated symmetric ciphers, disabled forward secrecy, and weak key-exchange groups.
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

      {/* Target Session Selector */}
      <SessionSelector
        value={sessionId}
        onChange={setSessionId}
        label="Target Classified Session to Audit"
      />

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Initiate Security Audit</h3>
            <div className="panel-subtitle">Evaluate cryptographic posture against defense intelligence baselines.</div>
          </div>
        </div>

        <form onSubmit={handleRun}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
              Requires that the session has already undergone AI protocol classification.
            </div>
            <button className="btn" type="submit" disabled={running || !sessionId}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              {running ? "Auditing Cryptographic Parameters…" : "Execute Risk Assessment"}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Results */}
      {result && (
        <div className="panel" style={{ border: "1px solid var(--border-strong)" }}>
          <div className="panel-header">
            <div>
              <h3>Cryptographic Audit Finding</h3>
              <div className="panel-subtitle">Session {result.session_id.slice(0, 8)}... comprehensive posture score.</div>
            </div>
            <StatusPill status={result.compliance_status} />
          </div>

          <div style={{ padding: "8px 0 16px" }}>
            <RiskGauge score={result.risk_score} />
          </div>

          {result.threat_matrix && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginTop: "16px", marginBottom: "8px" }}>
                Threat Vector Matrix
              </div>
              <div className="threat-grid">
                {Object.entries(result.threat_matrix).map(([key, value]) => {
                  const isHighThreat = value === "high_risk" || value === "at_risk" || value === "weak";
                  const desc = THREAT_DESCRIPTIONS[key]?.[value] || "Standard parameter compliance verified.";
                  return (
                    <div
                      className="threat-cell"
                      key={key}
                      style={{
                        borderLeft: isHighThreat ? "3px solid var(--risk)" : "3px solid var(--safe)",
                      }}
                    >
                      <div className="k">{THREAT_LABELS[key] || key}</div>
                      <div className="v" style={{ color: isHighThreat ? "var(--risk)" : "var(--safe)" }}>
                        {value.replace(/_/g, " ")}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.4" }}>
                        {desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Next Step Banner */}
          <div style={{ background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-md)", padding: "16px 20px", marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontWeight: "600", fontSize: "13.5px", color: "#fff" }}>
                Next Phase: Export Intelligence Briefing
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Compile findings into an official Executive or Technical security document with verification hashes.
              </div>
            </div>

            <Link
              to={`/reports?session=${result.session_id}`}
              className="btn"
            >
              Generate Intelligence Report ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
