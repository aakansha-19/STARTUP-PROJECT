const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function extractErrorMessage(errData, fallback) {
  if (!errData) return fallback;
  if (typeof errData.detail === 'string') return errData.detail;
  if (Array.isArray(errData.detail)) {
    return errData.detail
      .map((item) => {
        if (typeof item === 'string') return item;
        const loc = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
        const msg = item.msg || JSON.stringify(item);
        return loc ? `${loc}: ${msg}` : msg;
      })
      .join('; ');
  }
  if (errData.detail && typeof errData.detail === 'object') {
    return JSON.stringify(errData.detail);
  }
  return errData.message || fallback;
}

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchRoles() {
  const res = await fetch(`${BASE_URL}/roles`);
  if (!res.ok) throw new Error('Failed to load roles');
  return res.json();
}

export async function fetchRole(roleId) {
  const res = await fetch(`${BASE_URL}/roles/${roleId}`);
  if (!res.ok) throw new Error(`Failed to load role ${roleId}`);
  return res.json();
}

export async function fetchAnalyses(limit = 20) {
  const res = await fetch(`${BASE_URL}/analyses?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load analyses history');
  return res.json();
}

export async function fetchAnalysis(id) {
  const res = await fetch(`${BASE_URL}/analyses/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, `Analysis #${id} not found`));
  }
  return res.json();
}

export async function analyzeResumeFile(formData) {
  const res = await fetch(`${BASE_URL}/analyses/analyze-resume`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, 'Resume analysis failed. Please verify the PDF format.'));
  }
  return res.json();
}

export async function analyzeResumeText(payload) {
  const res = await fetch(`${BASE_URL}/analyses/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractErrorMessage(err, 'Text analysis failed. Please verify the inputs.'));
  }
  return res.json();
}

export async function fetchRoleRecommendations(roleId) {
  const res = await fetch(`${BASE_URL}/recommendations/${roleId}`);
  if (!res.ok) throw new Error('Failed to load recommendations');
  return res.json();
}

export async function fetchMLMetrics() {
  const res = await fetch(`${BASE_URL}/ml/metrics`);
  if (!res.ok) throw new Error('Failed to load ML model metrics');
  return res.json();
}

export async function retrainMLModel() {
  const res = await fetch(`${BASE_URL}/ml/retrain`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to retrain ML model');
  return res.json();
}

export function getReportDownloadUrl(analysisId, format = 'pdf') {
  return `${BASE_URL}/analyses/${analysisId}/report?format=${format}`;
}
