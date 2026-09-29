import { useEffect, useState } from "react";
import { api } from "../api";

export default function SessionsPage() {
  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState("");
  const [file, setFile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api
      .listConfigurations()
      .then((data) => {
        setConfigs(data);
        if (data.length) setSelectedConfig(data[0].config_id);
      })
      .catch((e) => setError(e.message));
    loadSessions();
  }, []);

  function loadSessions() {
    api.listCaptures().then(setSessions).catch((e) => setError(e.message));
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedConfig || !file) return;
    setUploading(true);
    setError(null);
    try {
      await api.uploadCapture(selectedConfig, file);
      loadSessions();
      setFile(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Capture sessions</h1>
      <p className="page-desc">
        Upload the pcap exported from Wireshark/tcpdump for a given configuration. This session ID
        is what you'll feed into classification and assessment next.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        <h3>Upload a capture</h3>
        {configs.length === 0 ? (
          <div className="empty-state">Register a testbed configuration first.</div>
        ) : (
          <form onSubmit={handleUpload}>
            <div className="field-row">
              <div className="field">
                <label>Configuration</label>
                <select value={selectedConfig} onChange={(e) => setSelectedConfig(e.target.value)}>
                  {configs.map((c) => (
                    <option key={c.config_id} value={c.config_id}>
                      {c.mode} · {c.cipher_suite} · {c.config_id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Pcap file</label>
                <input type="file" accept=".pcap,.pcapng" onChange={(e) => setFile(e.target.files[0])} />
              </div>
            </div>
            <button className="btn" type="submit" disabled={uploading || !file}>
              {uploading ? "Uploading…" : "Upload capture"}
            </button>
          </form>
        )}
      </div>

      <div className="panel">
        <h3>All capture sessions ({sessions.length})</h3>
        {sessions.length === 0 ? (
          <div className="empty-state">
            No sessions yet — upload a capture above, then copy its session ID into classification.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Config ID</th>
                <th>Pcap path</th>
                <th>Captured at</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.session_id}>
                  <td className="mono">{s.session_id}</td>
                  <td className="mono">{s.config_id.slice(0, 8)}</td>
                  <td className="mono">{s.pcap_path}</td>
                  <td>{new Date(s.captured_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
