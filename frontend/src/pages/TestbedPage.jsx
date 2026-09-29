import { useEffect, useState } from "react";
import { api } from "../api";

const CIPHERS = ["AES-128", "AES-256", "AES-GCM", "AES-CBC+HMAC", "3DES"];
const DH_GROUPS = ["MODP1024", "MODP2048", "MODP3072", "ECP256", "ECP384"];

export default function TestbedPage() {
  const [configs, setConfigs] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    mode: "tunnel",
    cipher_suite: "AES-GCM",
    dh_group: "ECP256",
    pfs_enabled: true,
    ip_version: "IPv4",
  });

  const load = () => api.listConfigurations().then(setConfigs).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createConfiguration(form);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Testbed configurations</h1>
      <p className="page-desc">
        Register each IPsec configuration standing up in your lab. Every capture session is tied
        back to one of these, so the classifier's predictions can be checked against ground truth.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        <h3>Register a configuration</h3>
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Mode</label>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                <option value="tunnel">Tunnel</option>
                <option value="transport">Transport</option>
              </select>
            </div>
            <div className="field">
              <label>Cipher suite</label>
              <select
                value={form.cipher_suite}
                onChange={(e) => setForm({ ...form, cipher_suite: e.target.value })}
              >
                {CIPHERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>DH group</label>
              <select value={form.dh_group} onChange={(e) => setForm({ ...form, dh_group: e.target.value })}>
                {DH_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>IP version</label>
              <select
                value={form.ip_version}
                onChange={(e) => setForm({ ...form, ip_version: e.target.value })}
              >
                <option value="IPv4">IPv4</option>
                <option value="IPv6">IPv6</option>
              </select>
            </div>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="pfs"
                checked={form.pfs_enabled}
                onChange={(e) => setForm({ ...form, pfs_enabled: e.target.checked })}
              />
              <label htmlFor="pfs">Perfect forward secrecy enabled</label>
            </div>
          </div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save configuration"}
          </button>
        </form>
      </div>

      <div className="panel">
        <h3>Registered configurations ({configs.length})</h3>
        {configs.length === 0 ? (
          <div className="empty-state">No configurations yet — add one above to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Cipher</th>
                <th>DH group</th>
                <th>PFS</th>
                <th>IP</th>
                <th>Config ID</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c) => (
                <tr key={c.config_id}>
                  <td>{c.mode}</td>
                  <td>{c.cipher_suite}</td>
                  <td>{c.dh_group}</td>
                  <td>{c.pfs_enabled ? "Yes" : "No"}</td>
                  <td>{c.ip_version}</td>
                  <td className="mono">{c.config_id.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
