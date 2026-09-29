import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import SessionSelector from "../components/SessionSelector";
import StatusPill from "../components/StatusPill";

export default function ReportsPage() {
  const [searchParams] = useSearchParams();
  const initialSession = searchParams.get("session") || "";

  const [sessionId, setSessionId] = useState(initialSession);
  const [reportType, setReportType] = useState("executive");
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (initialSession) {
      setSessionId(initialSession);
    }
  }, [initialSession]);

  async function handleGenerate(e) {
    if (e) e.preventDefault();
    if (!sessionId) {
      setError("Please select or enter a valid Session ID.");
      return;
    }
    setGenerating(true);
    setError(null);
    setReport(null);
    try {
      const res = await api.generateReport(sessionId, reportType);
      setReport(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadJSON() {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vpn_report_${report.report_id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <div>
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            Intelligence & Audit Reports
            <span className="page-title-badge">Formal Verification</span>
          </h1>
          <p className="page-desc">
            Generate formal intelligence briefing documents combining AI side-channel inference,
            traffic capture parameters, and rule-based compliance scores for decision makers.
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
        label="Select Assessed Session for Report Generation"
      />

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Generate Verification Report</h3>
            <div className="panel-subtitle">Select between high-level executive summary or deep technical cryptanalysis.</div>
          </div>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="field-row">
            <div className="field" style={{ flex: 1 }}>
              <label>
                Report Format & Scope
                <span className="field-hint">Target Audience</span>
              </label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="executive">Executive Summary (Decision Maker Risk Brief)</option>
                <option value="technical">Technical Cryptographic Audit (Full Protocol Breakdown)</option>
              </select>
            </div>

            <div className="field" style={{ display: "flex", justifyContent: "flex-end" }}>
              <label style={{ visibility: "hidden" }}>Action</label>
              <button className="btn" type="submit" disabled={generating || !sessionId}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                {generating ? "Compiling Document…" : "Compile Verification Report"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Official Rendered Security Document */}
      {report && (
        <div className="security-report-document">
          <div className="report-watermark">NTRO VERIFIED</div>

          <div className="report-header-banner">
            <div>
              <div className="report-doc-agency">National Technical Research Organisation · SIH26160</div>
              <div className="report-doc-title">
                {report.report_type === "executive"
                  ? "EXECUTIVE IPSEC CRYPTOGRAPHIC RISK BRIEFING"
                  : "TECHNICAL IPSEC PROTOCOL AUDIT & TELEMETRY REPORT"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Automated Side-Channel Cryptanalysis and Defense Verification
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print or Save as PDF">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print / Save PDF
              </button>
              <button onClick={handleDownloadJSON} className="btn btn-secondary btn-sm" title="Export Raw JSON Data">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export JSON
              </button>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="report-meta-grid">
            <div className="report-meta-item">
              <div className="meta-k">Document Reference ID</div>
              <div className="meta-v mono" style={{ color: "var(--cyan)" }}>{report.report_id}</div>
            </div>
            <div className="report-meta-item">
              <div className="meta-k">Verified Session Hash</div>
              <div className="meta-v mono">{sessionId}</div>
            </div>
            <div className="report-meta-item">
              <div className="meta-k">Assessment Record ID</div>
              <div className="meta-v mono">{report.assessment_id}</div>
            </div>
            <div className="report-meta-item">
              <div className="meta-k">Generation Timestamp</div>
              <div className="meta-v">{new Date(report.generated_at).toUTCString()}</div>
            </div>
          </div>

          {/* Body Sections */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: "15px", marginBottom: "8px" }}>
              1. Executive Cryptographic Summary
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", lineHeight: "1.6", margin: 0 }}>
              This audit evaluates opaque IPsec network traffic without decrypting payload data. Using side-channel
              packet timing distributions, encapsulation header overheads, and IKE exchange sequencing,
              the AI model has classified the deployment and scored its cryptographic posture against NIST SP 800-77
              (Guidelines for IPsec VPNs) and CNSA Suite standards.
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: "15px", marginBottom: "8px" }}>
              2. Strategic Recommendations & Roadmap
            </h4>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 16px", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--cyan)", fontSize: "13px" }}>
                <strong>Mandate AEAD Ciphers:</strong> Ensure all Phase-2 Child SAs enforce authenticated encryption (AES-GCM or ChaCha20-Poly1305) to eliminate padding oracle vulnerabilities.
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 16px", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--safe)", fontSize: "13px" }}>
                <strong>Enforce Perfect Forward Secrecy:</strong> Configure <code className="mono">pfs=yes</code> with elliptic curve groups (ECP256 or ECP384) to eliminate single-point key compromise exposure.
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px 16px", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--warn)", fontSize: "13px" }}>
                <strong>Deprecate Sub-2048bit MODP:</strong> Explicitly block Diffie-Hellman Groups 1, 2, and 5 in IKE proposal daemon configurations to defeat Logjam attacks.
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-muted)" }}>
            <div>CONFIDENTIAL · AUTOMATED AI CRYPTO-AUDIT ENGINE</div>
            <div>VERIFIED BY SIH26160 SCORER</div>
          </div>
        </div>
      )}
    </div>
  );
}
