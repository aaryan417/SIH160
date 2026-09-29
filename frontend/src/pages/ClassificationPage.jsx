import { useState } from "react";
import { api } from "../api";

export default function ClassificationPage() {
  const [sessionId, setSessionId] = useState("");
  const [localIp, setLocalIp] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  async function handleRun(e) {
    e.preventDefault();
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

  return (
    <div>
      <h1 className="page-title">Classification</h1>
      <p className="page-desc">
        Runs feature extraction over the capture's metadata (packet sizes, timing, IKE/ESP counts)
        and predicts the cipher, mode, and key-exchange group in use.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        <h3>Run classifier</h3>
        <form onSubmit={handleRun}>
          <div className="field-row">
            <div className="field">
              <label>Session ID</label>
              <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="uuid" required />
            </div>
            <div className="field">
              <label>Local interface IP</label>
              <input
                value={localIp}
                onChange={(e) => setLocalIp(e.target.value)}
                placeholder="e.g. 10.0.0.2"
                required
              />
            </div>
          </div>
          <button className="btn" type="submit" disabled={running}>
            {running ? "Classifying…" : "Run classification"}
          </button>
        </form>
      </div>

      {result && (
        <div className="panel">
          <h3>Prediction</h3>
          <table>
            <tbody>
              <tr>
                <td>Predicted cipher</td>
                <td className="mono">{result.predicted_cipher}</td>
              </tr>
              <tr>
                <td>Predicted mode</td>
                <td className="mono">{result.predicted_mode}</td>
              </tr>
              <tr>
                <td>Predicted DH group</td>
                <td className="mono">{result.predicted_dh_group || "—"}</td>
              </tr>
              <tr>
                <td>Confidence</td>
                <td className="mono">{confidencePct}%</td>
              </tr>
            </tbody>
          </table>
          <p className="page-desc" style={{ marginTop: 14, marginBottom: 0 }}>
            Next: run the risk assessment on session {result.session_id.slice(0, 8)} to score this
            configuration.
          </p>
        </div>
      )}
    </div>
  );
}
