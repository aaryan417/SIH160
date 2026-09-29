import { useState } from "react";
import { api } from "../api";

export default function ReportsPage() {
  const [sessionId, setSessionId] = useState("");
  const [reportType, setReportType] = useState("executive");
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
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

  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-desc">
        Generates a report record for a session that's already been classified and assessed.
        Rendering to PDF/HTML is a separate step — wire your renderer onto the backend's
        report_generator module.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="panel">
        <h3>Generate a report</h3>
        <form onSubmit={handleGenerate}>
          <div className="field-row">
            <div className="field">
              <label>Session ID</label>
              <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="uuid" required />
            </div>
            <div className="field">
              <label>Report type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="executive">Executive</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>
          <button className="btn" type="submit" disabled={generating}>
            {generating ? "Generating…" : "Generate report"}
          </button>
        </form>
      </div>

      {report && (
        <div className="panel">
          <h3>Generated</h3>
          <table>
            <tbody>
              <tr>
                <td>Report ID</td>
                <td className="mono">{report.report_id}</td>
              </tr>
              <tr>
                <td>Type</td>
                <td className="mono">{report.report_type}</td>
              </tr>
              <tr>
                <td>Generated at</td>
                <td>{new Date(report.generated_at).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
