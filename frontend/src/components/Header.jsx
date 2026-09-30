import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { api, createSyntheticPcapBlob, BASE_URL } from "../api";

const STEPS = [
  { path: "/testbed", label: "1. Testbed" },
  { path: "/sessions", label: "2. Captures" },
  { path: "/classification", label: "3. AI Classifier" },
  { path: "/assessment", label: "4. Risk Audit" },
  { path: "/reports", label: "5. Reports" },
];

export default function Header({ onRefresh }) {
  const location = useLocation();
  const [seeding, setSeeding] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    api.checkHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

    const interval = setInterval(() => {
      api.checkHealth()
        .then(() => setApiOnline(true))
        .catch(() => setApiOnline(false));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function handleSeedDemo() {
    setSeeding(true);
    try {
      const configs = await api.seedDemoData();
      if (configs && configs.length > 0) {
        const dummyPcap1 = createSyntheticPcapBlob("AES-GCM", 36);
        const session1 = await api.uploadCapture(configs[0].config_id, dummyPcap1);

        const dummyPcap2 = createSyntheticPcapBlob("3DES", 22);
        const session2 = await api.uploadCapture(configs[1].config_id, dummyPcap2);

        if (session1 && session1.session_id) {
          try {
            await api.runClassification(session1.session_id, "10.0.0.2");
            await api.runAssessment(session1.session_id);
            await api.generateReport(session1.session_id, "executive");
          } catch (e) {
            console.warn(e);
          }
        }
      }
      if (onRefresh) onRefresh();
      window.location.reload();
    } catch (e) {
      alert("Error generating demo data: " + e.message);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <header className="top-header">
      <div className="header-left">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="classification-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            LIVE COMMAND CENTER
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", padding: "2px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
              ENGINE: <strong style={{ color: "var(--safe)" }}>Rules Active</strong>
            </span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", padding: "2px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", border: "1px solid var(--border-subtle)" }}>
              FOCUS: <strong style={{ color: "var(--cyan)" }}>Risk First</strong>
            </span>
          </div>
        </div>

        <nav className="workflow-stepper">
          {STEPS.map((step, idx) => {
            const isActive = location.pathname === step.path;
            return (
              <span key={step.path} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Link to={step.path} className={`step-item ${isActive ? "active" : ""}`}>
                  {step.label}
                </Link>
                {idx < STEPS.length - 1 && <span className="step-arrow">➔</span>}
              </span>
            );
          })}
        </nav>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Quick Action Buttons Matching Reference Image 3 */}
        <Link
          to="/sessions"
          className="btn btn-secondary btn-sm"
          style={{
            borderColor: "rgba(0, 240, 255, 0.4)",
            color: "var(--cyan)",
            background: "rgba(0, 240, 255, 0.08)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload PCAP
        </Link>

        <Link
          to="/classification"
          className="btn btn-sm"
          style={{
            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            color: "#fff",
            boxShadow: "0 0 14px rgba(139, 92, 246, 0.35)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          AI Analysis
        </Link>

        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="btn btn-secondary btn-sm"
          title="Seed realistic compliant & vulnerable testbed VPN configs and synthetic capture sessions"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          {seeding ? "Seeding…" : "⚡ Quick Demo"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-secondary)", background: "rgba(255,255,255,0.04)", padding: "5px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
          <span className={`pulse-dot ${apiOnline ? "online" : "offline"}`} />
          <span>{apiOnline ? `${new URL(BASE_URL).host} Online` : "Backend Offline"}</span>
        </div>
      </div>
    </header>
  );
}
