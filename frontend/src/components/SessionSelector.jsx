import { useEffect, useState } from "react";
import { api } from "../api";

export default function SessionSelector({ value, onChange, label = "Select Capture Session" }) {
  const [sessions, setSessions] = useState([]);
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    Promise.all([api.listCaptures(), api.listConfigurations()])
      .then(([sessionList, configList]) => {
        setSessions(sessionList || []);
        const configMap = {};
        (configList || []).forEach((c) => {
          configMap[c.config_id] = c;
        });
        setConfigs(configMap);
        // If no value is provided, pre-select the most recent session
        if (!value && sessionList && sessionList.length > 0) {
          onChange(sessionList[0].session_id);
        }
      })
      .catch((e) => console.error("Error loading sessions for selector:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="panel" style={{ padding: "16px 20px", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ fontWeight: "600", fontSize: "13.5px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          {label}
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setIsManual(!isManual)}
          style={{ fontSize: "11px", padding: "4px 10px" }}
        >
          {isManual ? "Switch to Session Dropdown" : "Enter Manual UUID"}
        </button>
      </div>

      {isManual ? (
        <div className="field">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            className="mono"
            required
          />
        </div>
      ) : (
        <div className="field">
          {sessions.length === 0 ? (
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
              {loading ? "Loading sessions..." : "No sessions found in database. Upload or seed a session first."}
            </div>
          ) : (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="">-- Choose a Capture Session --</option>
              {sessions.map((s) => {
                const cfg = configs[s.config_id];
                const cfgLabel = cfg ? `${cfg.mode.toUpperCase()} · ${cfg.cipher_suite} · ${cfg.dh_group}` : `Config ${s.config_id.slice(0, 8)}`;
                const time = new Date(s.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <option key={s.session_id} value={s.session_id}>
                    Session {s.session_id.slice(0, 8)}... — [{cfgLabel}] — {time}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
