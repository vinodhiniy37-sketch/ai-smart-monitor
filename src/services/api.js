const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`)
  : 'http://127.0.0.1:5000/api';

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Formats loopback network rate (bytes per second) into a human-readable string.
 * network_sent is an instantaneous throughput rate in B/s.
 */
export function formatNetworkRate(bytesPerSec) {
  const val = Number(bytesPerSec);
  if (isNaN(val) || val <= 0) return '0.0 B/s';
  if (val < 1024) return `${val.toFixed(1)} B/s`;
  if (val < 1024 * 1024) return `${(val / 1024).toFixed(1)} KB/s`;
  return `${(val / (1024 * 1024)).toFixed(1)} MB/s`;
}

/**
 * Formats cumulative byte totals (system-wide sent/received counters) into MB or GB.
 */
export function formatByteTotal(bytes) {
  const val = Number(bytes);
  if (isNaN(val) || val <= 0) return '0.0 MB';
  const mb = val / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

/**
 * Safe fetch wrapper with AbortController timeout and resource cleanup.
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      try {
        const errorJson = await response.json();
        return errorJson;
      } catch {
        return {
          status: "error",
          message: `HTTP ${response.status}: ${response.statusText || 'Request failed'}`
        };
      }
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError' || controller.signal.aborted;
    const message = isTimeout
      ? `Request timed out after ${timeoutMs}ms`
      : (err.message || 'Network request failed');

    return {
      status: "error",
      message,
      isTimeout: Boolean(isTimeout)
    };
  }
}

/**
 * Health check endpoint
 */
export async function fetchHealth() {
  return await fetchWithTimeout(`${API_BASE_URL}/health`);
}

/**
 * Fetch current live telemetry metrics (psutil) & save to MongoDB
 */
export async function fetchCurrentMonitoring() {
  return await fetchWithTimeout(`${API_BASE_URL}/monitoring/current`);
}

/**
 * Fetch historical monitoring telemetry from MongoDB
 */
export async function fetchMonitoringHistory(limit = 50) {
  return await fetchWithTimeout(`${API_BASE_URL}/monitoring/history?limit=${limit}`);
}

/**
 * Fetch dashboard overview stats & database aggregates from Flask/MongoDB
 */
export async function fetchDashboardStats() {
  return await fetchWithTimeout(`${API_BASE_URL}/dashboard/stats`);
}

/**
 * Send metrics to Scikit-learn Isolation Forest model endpoint for anomaly prediction
 */
export async function postPredictMetrics(metricsData = {}) {
  return await fetchWithTimeout(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metricsData)
  });
}

/**
 * Fetch automated alerts from MongoDB with optional severity and status filters
 */
export async function fetchAlerts(severity = null, status = null) {
  let url = `${API_BASE_URL}/alerts`;
  const params = [];
  if (severity && severity !== 'All') params.push(`severity=${encodeURIComponent(severity)}`);
  if (status && status !== 'All') params.push(`status=${encodeURIComponent(status)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  
  return await fetchWithTimeout(url);
}

/**
 * Fetch recent alerts for notifications
 */
export async function fetchRecentAlerts(limit = 5) {
  return await fetchWithTimeout(`${API_BASE_URL}/alerts/recent?limit=${limit}`);
}

/**
 * Update alert status in MongoDB (e.g. Pending -> Investigating -> Resolved)
 */
export async function updateAlertStatus(alertId, newStatus) {
  return await fetchWithTimeout(`${API_BASE_URL}/alerts/${encodeURIComponent(alertId)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
}
