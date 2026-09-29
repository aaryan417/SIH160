import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

const CIPHERS = ["AES-128", "AES-256", "AES-GCM", "AES-CBC+HMAC", "3DES"];
const DH_GROUPS = ["MODP1024", "MODP2048", "MODP3072", "ECP256", "ECP384"];

const PRESETS = [
  {
    name: "NIST SP 800-77 Defense Standard",
    mode: "tunnel",
    cipher_suite: "AES-GCM",
    dh_group: "ECP384",
    pfs_enabled: true,
    ip_version: "IPv4",
    badge: "Recommended",
  },
  {
    name: "Commercial High-Throughput",
    mode: "tunnel",
    cipher_suite: "AES-256",
    dh_group: "ECP256",
    pfs_enabled: true,
    ip_version: "IPv4",
    badge: "Strong",
  },
  {
    name: "Legacy Insecure (Audit Target)",
    mode: "tunnel",
    cipher_suite: "3DES",
    dh_group: "MODP1024",
    pfs_enabled: false,
    ip_version: "IPv4",
    badge: "Vulnerable",
  },
];

export default function TestbedPage() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    mode: "tunnel",
    cipher_suite: "AES-GCM",
    dh_group: "ECP384",
    pfs_enabled: true,
    ip_version: "IPv4",
  });

  const load = () => api.listConfigurations().then(setConfigs).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  function applyPreset(preset) {
    setForm({
      mode: preset.mode,
      cipher_suite: preset.cipher_suite,
      dh_group: preset.dh_group,
      pfs_enabled: preset.pfs_enabled,
      ip_version: preset.ip_version,
    });
    setSuccess(`Applied preset: ${preset.name}`);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.createConfiguration(form);
      await load();
      setSuccess("VPN Configuration successfully registered to testbed!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(id) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <div className="page-header-container">
        <div>
          <h1 className="page-title">
            Testbed Configurations
            <span className="page-title-badge">{configs.length} Active</span>
          </h1>
          <p className="page-desc">
            Register each IPsec VPN profile standing up in your defense lab (strongSwan / Libreswan).
            Every pcap capture session is tied to a configuration to ground AI predictions against ground truth.
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

      {/* Configuration Builder Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Register New IPsec Profile</h3>
            <div className="panel-subtitle">Define cryptographic encapsulation, key exchange algorithms, and forward secrecy.</div>
          </div>
        </div>

        {/* Quick Presets Strip */}
        <div className="presets-bar">
          <span className="preset-title">Security Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className="preset-chip"
              onClick={() => applyPreset(p)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>
                Encapsulation Mode
                <span className="field-hint">RFC 4301 / 4303</span>
              </label>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                <option value="tunnel">Tunnel (Gateway-to-Gateway)</option>
                <option value="transport">Transport (Host-to-Host)</option>
              </select>
            </div>

            <div className="field">
              <label>
                Cipher Suite
                <span className="field-hint">Payload Encryption</span>
              </label>
              <select
                value={form.cipher_suite}
                onChange={(e) => setForm({ ...form, cipher_suite: e.target.value })}
              >
                {CIPHERS.map((c) => (
                  <option key={c} value={c}>
                    {c} {c === "3DES" ? "⚠️ Deprecated" : c === "AES-GCM" ? "⚡ AEAD High Perf" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>
                Diffie-Hellman Group
                <span className="field-hint">IKE Key Exchange</span>
              </label>
              <select value={form.dh_group} onChange={(e) => setForm({ ...form, dh_group: e.target.value })}>
                {DH_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g} {g === "MODP1024" ? "⚠️ Weak (Logjam)" : g.startsWith("ECP") ? "🛡️ Elliptic Curve" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row" style={{ alignItems: "center" }}>
            <div className="field">
              <label>
                IP Version
                <span className="field-hint">Network Layer</span>
              </label>
              <select
                value={form.ip_version}
                onChange={(e) => setForm({ ...form, ip_version: e.target.value })}
              >
                <option value="IPv4">IPv4 (Standard 32-bit)</option>
                <option value="IPv6">IPv6 (Next-Gen 128-bit)</option>
              </select>
            </div>

            <div className="field" style={{ justifyContent: "flex-end" }}>
              <div className="checkbox-row" style={{ padding: "0 0 10px 0" }}>
                <input
                  type="checkbox"
                  id="pfs"
                  checked={form.pfs_enabled}
                  onChange={(e) => setForm({ ...form, pfs_enabled: e.target.checked })}
                />
                <label htmlFor="pfs">
                  <strong>Enable Perfect Forward Secrecy (PFS)</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    Generates ephemeral keys per phase-2 Child SA exchange
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button className="btn" type="submit" disabled={submitting}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {submitting ? "Registering Profile…" : "Save Configuration Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Configurations Table Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Registered Testbed Profiles ({configs.length})</h3>
            <div className="panel-subtitle">Profiles actively loaded into the analyzer ground-truth database.</div>
          </div>
        </div>

        {configs.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <div className="empty-state-text">
              No testbed configurations defined yet. Select a preset above or click "⚡ Quick Demo Scenario" in the top bar to generate standard configurations.
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Cipher Suite</th>
                  <th>DH Key Exchange</th>
                  <th>Forward Secrecy</th>
                  <th>Network</th>
                  <th>Config ID</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((c) => {
                  const isWeak = c.cipher_suite === "3DES" || c.dh_group === "MODP1024";
                  return (
                    <tr key={c.config_id}>
                      <td>
                        <span style={{ fontWeight: "600", textTransform: "capitalize", color: "#fff" }}>
                          {c.mode}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span className="mono" style={{ fontWeight: "600", color: isWeak ? "var(--risk)" : "var(--cyan)" }}>
                            {c.cipher_suite}
                          </span>
                          {isWeak && <span className="pill risk" style={{ padding: "1px 6px", fontSize: "10px" }}>Weak</span>}
                        </span>
                      </td>
                      <td>
                        <span className="mono">{c.dh_group}</span>
                      </td>
                      <td>
                        {c.pfs_enabled ? (
                          <span style={{ color: "var(--safe)", display: "flex", alignItems: "center", gap: "4px", fontSize: "12.5px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            PFS Active
                          </span>
                        ) : (
                          <span style={{ color: "var(--warn)", display: "flex", alignItems: "center", gap: "4px", fontSize: "12.5px" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            No PFS
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="mono">{c.ip_version}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="copy-pill"
                          onClick={() => copyToClipboard(c.config_id)}
                          title="Click to copy full UUID"
                        >
                          <span>{c.config_id.slice(0, 8)}...</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {copiedId === c.config_id ? (
                              <polyline points="20 6 9 17 4 12" />
                            ) : (
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            )}
                          </svg>
                        </button>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Link
                          to={`/sessions?config=${c.config_id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          + Upload Capture
                        </Link>
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
