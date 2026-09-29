import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, createSyntheticPcapBlob } from "../api";
import {
  ProtocolBarChart,
  TrafficTimelineChart,
  DonutChart,
  SpeedometerRiskGauge,
} from "../components/Charts";

export default function DashboardPage() {
  const [configs, setConfigs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("monitoring");
  const [threatFilter, setThreatFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    Promise.all([
      api.listConfigurations().catch(() => []),
      api.listCaptures().catch(() => []),
    ])
      .then(([cfgList, sessList]) => {
        setConfigs(cfgList || []);
        setSessions(sessList || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleQuickSeed() {
    setSeeding(true);
    try {
      const createdConfigs = await api.seedDemoData();
      if (createdConfigs && createdConfigs.length > 0) {
        const dummyPcap1 = createSyntheticPcapBlob("AES-GCM", 36);
        const s1 = await api.uploadCapture(createdConfigs[0].config_id, dummyPcap1);

        const dummyPcap2 = createSyntheticPcapBlob("3DES", 22);
        const s2 = await api.uploadCapture(createdConfigs[1].config_id, dummyPcap2);

        if (s1 && s1.session_id) {
          try {
            await api.runClassification(s1.session_id, "10.0.0.2");
            await api.runAssessment(s1.session_id);
            await api.generateReport(s1.session_id, "executive");
          } catch (e) {
            console.warn(e);
          }
        }
      }
      loadData();
    } catch (e) {
      alert("Error seeding scenario: " + e.message);
    } finally {
      setSeeding(false);
    }
  }

  // Derived counts
  const totalCaptures = sessions.length;
  const legacyVulnerable = configs.filter(
    (c) => c.cipher_suite === "3DES" || c.cipher_suite === "DES" || c.dh_group === "MODP1024"
  ).length;
  const compliantModern = configs.filter(
    (c) => c.cipher_suite?.includes("AES-256") || c.cipher_suite?.includes("AES-GCM")
  ).length;

  const totalPackets = Math.max(4623, totalCaptures * 1420);
  const totalAlerts = Math.max(6, legacyVulnerable * 3 + 2);
  const securityScore = legacyVulnerable > 0 ? 640 : configs.length > 0 ? 940 : 850;

  // Filtered incidents
  const allIncidents = [
    {
      id: 1,
      title: "3DES Sweet32 Collision Attack Risk",
      target: "VPN Gateway Node 01",
      time: "2 min ago",
      severity: "critical",
    },
    {
      id: 2,
      title: "MODP1024 Weak Key Exchange (Logjam)",
      target: "Auth Exchange Phase 1",
      time: "15 min ago",
      severity: "high",
    },
    {
      id: 3,
      title: "Perfect Forward Secrecy Disabled",
      target: "Child SA (Phase 2)",
      time: "32 min ago",
      severity: "medium",
    },
    {
      id: 4,
      title: "IKEv2 Timing Anomaly Spike",
      target: "Gateway Port 500",
      time: "1h ago",
      severity: "medium",
    },
    {
      id: 5,
      title: "NIST SP 800-77 Rule Baseline Active",
      target: "Policy Verifier Engine",
      time: "2h ago",
      severity: "resolved",
    },
  ];

  const filteredIncidents =
    threatFilter === "all"
      ? allIncidents
      : allIncidents.filter((inc) => inc.severity === threatFilter);

  // Security tools matching Image 1
  const securityTools = [
    {
      name: "SIEM Analyzer",
      desc: "Security Telemetry & IKE Logs",
      status: "Active",
      color: "#00f0ff",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      name: "Vulnerability Audit",
      desc: "NIST SP 800-77 Crypto Rules",
      status: "Running",
      color: "#f59e0b",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      name: "AI Classifier",
      desc: "Side-Channel Heuristic Engine",
      status: "Active",
      color: "#8b5cf6",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      name: "ESP Inspector",
      desc: "Encapsulation & SPI Integrity",
      status: "Monitoring",
      color: "#38bdf8",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      ),
    },
    {
      name: "PFS Verifier",
      desc: "Phase-2 Ephemeral Key Rotation",
      status: "Protected",
      color: "#10b981",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      name: "DH Key Scanner",
      desc: "MODP & Elliptic Curve Groups",
      status: "Configured",
      color: "#ec4899",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      name: "PCAP Engine",
      desc: "Scapy Packet Stream Extraction",
      status: "Active",
      color: "#06b6d4",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      name: "SOAR Reporter",
      desc: "Intelligence Briefing Generator",
      status: "Automating",
      color: "#e11d48",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Top SOC Navigation Bar (Matching Image 1 & 2) */}
      <div className="soc-top-bar">
        <div className="soc-tabs-group">
          <button
            className={`soc-tab ${activeTab === "monitoring" ? "active" : ""}`}
            onClick={() => setActiveTab("monitoring")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Security Monitoring
          </button>
          <button
            className={`soc-tab ${activeTab === "analysis" ? "active" : ""}`}
            onClick={() => setActiveTab("analysis")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Threat Analysis
          </button>
          <button
            className={`soc-tab ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
            Incident Reports
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div className="soc-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              placeholder="Search threat telemetry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar">
              NT
              <span className="user-badge-notif" />
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff", lineHeight: "1.1" }}>
                NTRO Analyst
              </div>
              <div style={{ fontSize: "10px", color: "var(--cyan)" }}>Security Clearance L1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Title & Threat Pill Filters (Image 1) */}
      <div className="page-header-container" style={{ alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: "28px" }}>
            Security Operations Center
          </h1>
          <p className="page-desc" style={{ fontSize: "13.5px" }}>
            Real-time IPsec VPN cryptographic posture, side-channel metadata feature extraction, and threat analytics.
          </p>
        </div>

        <div className="threat-pills-row">
          <button
            className={`threat-filter-pill all ${threatFilter === "all" ? "active" : ""}`}
            onClick={() => setThreatFilter("all")}
          >
            All Threats · {allIncidents.length}
          </button>
          <button
            className={`threat-filter-pill critical ${threatFilter === "critical" ? "active" : ""}`}
            onClick={() => setThreatFilter("critical")}
          >
            Critical · 1
          </button>
          <button
            className={`threat-filter-pill high ${threatFilter === "high" ? "active" : ""}`}
            onClick={() => setThreatFilter("high")}
          >
            High · 1
          </button>
          <button
            className={`threat-filter-pill medium ${threatFilter === "medium" ? "active" : ""}`}
            onClick={() => setThreatFilter("medium")}
          >
            Medium · 2
          </button>
          <button
            className={`threat-filter-pill low ${threatFilter === "resolved" ? "active" : ""}`}
            onClick={() => setThreatFilter("resolved")}
          >
            Low/Resolved · 1
          </button>

          <button
            className="btn btn-secondary btn-icon"
            onClick={handleQuickSeed}
            disabled={seeding}
            title="Seed sample testbed & capture sessions"
            style={{ marginLeft: "4px" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Hero 4-Card SOC Row (Matching Image 1) */}
      <div className="soc-hero-grid">
        {/* Card 1: Threat Detection with red sparkline */}
        <div className="soc-hero-card">
          <div className="soc-hero-card-header">
            <span className="soc-card-label">Threat Detection</span>
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>•••</span>
          </div>
          <div className="soc-card-val" style={{ color: "#f87171" }}>
            {totalAlerts}
          </div>
          <div style={{ marginTop: "auto" }}>
            <TrafficTimelineChart color="#ef4444" height={65} />
          </div>
        </div>

        {/* Card 2: Security Events with Matrix Heat Blocks */}
        <div className="soc-hero-card">
          <div className="soc-hero-card-header">
            <span className="soc-card-label">Security Events</span>
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>•••</span>
          </div>
          <div className="soc-card-val" style={{ color: "#38bdf8" }}>
            {totalPackets.toLocaleString()}
          </div>
          <div className="event-matrix-grid">
            {Array.from({ length: 24 }).map((_, i) => {
              const opacities = [0.15, 0.35, 0.6, 0.85, 1];
              const opacity = opacities[i % opacities.length];
              return (
                <div
                  key={i}
                  className="event-matrix-dot"
                  style={{
                    backgroundColor: `rgba(56, 189, 248, ${opacity})`,
                    boxShadow: opacity > 0.5 ? "0 0 6px rgba(56, 189, 248, 0.3)" : "none",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Card 3: System Health with Day Bars */}
        <div className="soc-hero-card">
          <div className="soc-hero-card-header">
            <span className="soc-card-label">System Health</span>
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>•••</span>
          </div>
          <div className="soc-card-val" style={{ color: "#10b981" }}>
            98.7%
          </div>
          <div className="health-bars-row">
            {[
              { day: "Mon", h: 48 },
              { day: "Tue", h: 54 },
              { day: "Wed", h: 42 },
              { day: "Thu", h: 58 },
              { day: "Fri", h: 52 },
              { day: "Sat", h: 60 },
            ].map((d) => (
              <div key={d.day} className="health-day-col">
                <div className="health-day-bar" style={{ height: `${d.h}px` }} />
                <span className="health-day-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Recent Security Incidents Feed */}
        <div className="soc-hero-card" style={{ padding: "16px 18px" }}>
          <div className="soc-hero-card-header" style={{ marginBottom: "8px" }}>
            <span className="soc-card-label">Recent Security Incidents</span>
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>•••</span>
          </div>
          <div className="incident-list">
            {filteredIncidents.slice(0, 3).map((inc) => (
              <div key={inc.id} className="incident-item">
                <div style={{ maxWidth: "180px" }}>
                  <div className="incident-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {inc.title}
                  </div>
                  <div className="incident-meta">{inc.target} · {inc.time}</div>
                </div>
                <span className={`incident-badge ${inc.severity}`}>{inc.severity}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "right", marginTop: "8px" }}>
            <Link to="/assessment" style={{ fontSize: "11px", color: "var(--cyan)", textDecoration: "none", fontWeight: "600" }}>
              View All Incidents ➔
            </Link>
          </div>
        </div>
      </div>

      {/* Security Score Banner Bar (Matching Image 1) */}
      <div
        className="panel"
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          border: "1px solid var(--border-strong)",
        }}
      >
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Security Posture Score
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: "800", color: "#fff" }}>
              {securityScore} <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>/ 1000</span>
            </span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: securityScore > 800 ? "var(--safe)" : "var(--warn)" }}>
              {securityScore > 800 ? "Strong (NIST Compliant)" : "Action Required"}
            </span>
          </div>
          {/* Progress Bar */}
          <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", marginTop: "8px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(securityScore / 1000) * 100}%`,
                background: "linear-gradient(90deg, #10b981, #00f0ff)",
                boxShadow: "0 0 10px rgba(0, 240, 255, 0.5)",
                borderRadius: "999px",
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", textAlign: "right" }}>
            {legacyVulnerable > 0
              ? `AI identified ${legacyVulnerable} critical cipher/PFS weaknesses.`
              : "All analyzed profiles satisfy NIST SP 800-77 & CNSA."}
          </div>
          <Link to="/assessment" className="btn" style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", boxShadow: "0 0 16px rgba(249, 115, 22, 0.4)", color: "#fff" }}>
            Improve Security Score
          </Link>
        </div>
      </div>

      {/* Network Traffic Analytics Grid (Matching Image 2 & 3) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Protocol Distribution Bar Chart */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <h3>Protocol Telemetry Distribution</h3>
              <div className="panel-subtitle">Extracted traffic breakdown: ESP encrypted payload vs IKEv2 exchanges.</div>
            </div>
            <Link to="/sessions" className="btn btn-secondary btn-sm">
              PCAP Inspector
            </Link>
          </div>

          <ProtocolBarChart />
        </div>

        {/* Protocol Mix Donut Chart (Image 2 & 4) */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <h3>Protocol Mix & Composition</h3>
              <div className="panel-subtitle">Ratio of encrypted SAs to control plane handshakes.</div>
            </div>
          </div>

          <DonutChart
            total={totalPackets}
            segments={[
              { label: "ESP Encrypted", value: Math.round(totalPackets * 0.76), color: "#00f0ff" },
              { label: "IKEv2 Handshake", value: Math.round(totalPackets * 0.16), color: "#10b981" },
              { label: "Auth / AH Header", value: Math.round(totalPackets * 0.08), color: "#f59e0b" },
            ]}
          />
        </div>
      </div>

      {/* Speedometer Risk Gauge & Traffic Spline (Matching Image 4 & 3) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "20px", marginBottom: "24px" }}>
        {/* Semi-circular Speedometer */}
        <div className="panel" style={{ marginBottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="panel-header">
            <div>
              <h3>Cryptographic Risk Gauge</h3>
              <div className="panel-subtitle">NIST SP 800-77 aggregate deployment risk score.</div>
            </div>
          </div>

          <div style={{ padding: "12px 0 20px" }}>
            <SpeedometerRiskGauge score={legacyVulnerable > 0 ? 75 : 15} maxScore={100} />
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <span style={{ color: "var(--text-muted)" }}>Compliant Configurations:</span>
            <span style={{ fontWeight: "700", color: "var(--safe)" }}>{compliantModern}</span>
          </div>
        </div>

        {/* Traffic Over Time Area Spline */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div>
              <h3>Traffic Activity Timeline</h3>
              <div className="panel-subtitle">Ingested packet volume and inter-arrival rate over 24-hour cycle.</div>
            </div>
            <span className="page-title-badge">Live Monitor</span>
          </div>

          <TrafficTimelineChart color="#00f0ff" height={190} />
        </div>
      </div>

      {/* Security Tools 8-Card Grid (Matching Image 1 & 5) */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Security Capabilities & Defense Modules</h3>
            <div className="panel-subtitle">Integrated cryptographic toolset for end-to-end IPsec verification.</div>
          </div>
        </div>

        <div className="tools-grid">
          {securityTools.map((t, idx) => (
            <div key={idx} className="tool-card">
              <div className="tool-icon-box" style={{ background: `${t.color}20`, color: t.color }}>
                {t.icon}
              </div>
              <div className="tool-name">{t.name}</div>
              <div className="tool-desc">{t.desc}</div>
              <div className="tool-status-dot">{t.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Capture Sessions Table with Quick Launch Actions */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Active Capture Sessions ({sessions.length})</h3>
            <div className="panel-subtitle">Recently ingested PCAP files ready for AI inference and compliance audit.</div>
          </div>
          <Link to="/sessions" className="btn btn-secondary btn-sm">
            + Ingest New PCAP
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="empty-state-text">
              No capture sessions ingested yet. Click "⚡ Ingest Synthetic Lab PCAP" or click the Quick Demo Scenario button to initialize the dashboard.
            </div>
            <button className="btn" onClick={handleQuickSeed} disabled={seeding}>
              {seeding ? "Populating Demo Data…" : "⚡ Quick Demo Scenario"}
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Linked Configuration</th>
                  <th>Storage Destination</th>
                  <th>Captured At</th>
                  <th style={{ textAlign: "right" }}>Analysis Pipeline Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 6).map((s) => (
                  <tr key={s.session_id}>
                    <td>
                      <span className="mono" style={{ color: "var(--cyan)", fontWeight: "600" }}>
                        {s.session_id.slice(0, 8)}...
                      </span>
                    </td>
                    <td>
                      <span className="mono">{s.config_id.slice(0, 8)}</span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {s.pcap_path}
                      </span>
                    </td>
                    <td>{new Date(s.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Link to={`/classification?session=${s.session_id}`} className="btn btn-secondary btn-sm">
                          ⚡ Classify
                        </Link>
                        <Link to={`/assessment?session=${s.session_id}`} className="btn btn-secondary btn-sm">
                          🛡️ Audit
                        </Link>
                        <Link to={`/reports?session=${s.session_id}`} className="btn btn-secondary btn-sm">
                          📑 Report
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
