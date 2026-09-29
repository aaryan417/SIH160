const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listConfigurations: () => request("/testbed/configurations"),
  createConfiguration: (payload) =>
    request("/testbed/configurations", { method: "POST", body: JSON.stringify(payload) }),

  uploadCapture: (configId, file) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/capture/sessions/${configId}`, { method: "POST", body: form });
  },
  listCaptures: () => request("/capture/sessions"),
  getCapture: (sessionId) => request(`/capture/sessions/${sessionId}`),

  runClassification: (sessionId, localIp) =>
    request(`/classify/${sessionId}?local_ip=${encodeURIComponent(localIp)}`, { method: "POST" }),

  runAssessment: (sessionId) => request(`/assess/${sessionId}`, { method: "POST" }),

  generateReport: (sessionId, reportType) =>
    request(`/reports/${sessionId}?report_type=${reportType}`, { method: "POST" }),
  getReport: (reportId) => request(`/reports/${reportId}`),
};
