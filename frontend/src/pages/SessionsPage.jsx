import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, createSyntheticPcapBlob } from "../api";

export default function SessionsPage() {
  const [searchParams] = useSearchParams();
  const preselectedConfig = searchParams.get("config");

  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(preselectedConfig || "");
  const [file, setFile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    api
      .listConfigurations()
      .then((data) => {
        setConfigs(data || []);
        if (preselectedConfig) {
          setSelectedConfig(preselectedConfig);
        } else if (data && data.length && !selectedConfig) {
          setSelectedConfig(data[0].config_id);
        }
      })
      .catch((e) => setError(e.message));
    loadSessions();
  }, [preselectedConfig]);

  function loadSessions() {
    api.listCaptures().then((data) => setSessions(data || [])).catch((e) => setError(e.message));
  }

  async function handleUpload(e) {
    if (e) e.preventDefault();
    if (!selectedConfig || !file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.uploadCapture(selectedConfig, file);
      loadSessions();
      setFile(null);
      setSuccess(`Capture successfully ingested! Session ID: ${res.session_id.slice(0, 8)}...`);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSyntheticCapture() {
    if (!selectedConfig) {
      alert("Please select a testbed configuration first.");
      return;
    }
    setGeneratingDemo(true);
    setError(null);
    setSuccess(null);
    try {
      const targetConfig = configs.find((c) => c.config_id === selectedConfig);
      const cipher = targetConfig ? targetConfig.cipher_suite : "AES-GCM";
      const dummyBlob = createSyntheticPcapBlob(cipher, 30);
      const res = await api.uploadCapture(selectedConfig, dummyBlob);
      loadSessions();
      setSuccess(`Synthetic PCAP traffic created and ingested for ${cipher}! Session ID: ${res.session_id.slice(0, 8)}...`);
    } catch (e) {
      setError(e.message);
    } finally {
      setGeneratingDemo(false);
    }
  }

  function copyToClipboard(id) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const configMap = {};
  configs.forEach((c) => {
    configMap[c.config_id] = c;
  });

  return (
    <div>
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            Capture Sessions
            <span className="page-title-badge">{sessions.length} Ingested</span>
          </h1>
          <p className="page-desc">
            Upload Wireshark / tcpdump PCAP traffic files associated with each testbed configuration.
            The ingested stream is pre-processed for side-channel packet timings and IKE/ESP protocol counts.
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

      {success && (
        <div className="success-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {success}
        </div>
      )}

      {/* Upload Box */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Ingest Traffic Capture</h3>
            <div className="panel-subtitle">Associate raw pcap packets with a registered testbed configuration profile.</div>
          </div>
        </div>

        {configs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">
              No testbed configurations found. Register a testbed profile first to upload traffic.
            </div>
            <Link to="/testbed" className="btn">
              Configure Testbed Profile
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpload}>
            <div className="field-row">
              <div className="field" style={{ flex: 1.5 }}>
                <label>
                  Associated VPN Configuration
                  <span className="field-hint">Ground Truth Profile</span>
                </label>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                >
                  {configs.map((c) => (
                    <option key={c.config_id} value={c.config_id}>
                      {c.mode.toUpperCase()} · {c.cipher_suite} · {c.dh_group} · ({c.config_id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ flex: 2 }}>
                <label>
                  PCAP Stream File
                  <span className="field-hint">.pcap or .pcapng format</span>
                </label>
                <input
                  type="file"
                  accept=".pcap,.pcapng"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ padding: "8px 12px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", flexWrap: "wrap", gap: "12px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSyntheticCapture}
                disabled={generatingDemo || uploading}
                title="Generates and uploads an immediate synthetic PCAP binary with valid IP/IKE/ESP headers for testing"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                {generatingDemo ? "Synthesizing Traffic…" : "⚡ Ingest Synthetic Lab PCAP"}
              </button>

              <button className="btn" type="submit" disabled={uploading || !file}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploading ? "Ingesting Stream…" : "Upload & Archive PCAP"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Ingested Sessions Table */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>All Ingested Capture Sessions ({sessions.length})</h3>
            <div className="panel-subtitle">Sessions available for AI feature extraction, classification, and risk scoring.</div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div className="empty-state-text">
              No sessions ingested yet. Upload an exported capture file or click "⚡ Ingest Synthetic Lab PCAP" above.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Linked Configuration</th>
                  <th>PCAP Storage Path</th>
                  <th>Ingested Timestamp</th>
                  <th style={{ textAlign: "right" }}>Analysis Shortcuts</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const cfg = configMap[s.config_id];
                  const cfgText = cfg ? `${cfg.mode.toUpperCase()} · ${cfg.cipher_suite}` : s.config_id.slice(0, 8);
                  return (
                    <tr key={s.session_id}>
                      <td>
                        <button
                          type="button"
                          className="copy-pill"
                          onClick={() => copyToClipboard(s.session_id)}
                          title="Click to copy Session UUID"
                        >
                          <span style={{ color: "var(--cyan)", fontWeight: "600" }}>{s.session_id.slice(0, 8)}...</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {copiedId === s.session_id ? (
                              <polyline points="20 6 9 17 4 12" />
                            ) : (
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            )}
                          </svg>
                        </button>
                      </td>
                      <td>
                        <span className="mono" style={{ color: "var(--text-primary)", fontWeight: "500" }}>
                          {cfgText}
                        </span>
                      </td>
                      <td>
                        <span className="mono" style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                          {s.pcap_path}
                        </span>
                      </td>
                      <td>{new Date(s.captured_at).toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <Link
                            to={`/classification?session=${s.session_id}`}
                            className="btn btn-secondary btn-sm"
                            title="Run side-channel AI classification"
                          >
                            ⚡ Classify
                          </Link>
                          <Link
                            to={`/assessment?session=${s.session_id}`}
                            className="btn btn-secondary btn-sm"
                            title="Run automated cryptographic audit"
                          >
                            🛡️ Assess
                          </Link>
                          <Link
                            to={`/reports?session=${s.session_id}`}
                            className="btn btn-secondary btn-sm"
                            title="Generate Intelligence Brief"
                          >
                            📑 Report
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
