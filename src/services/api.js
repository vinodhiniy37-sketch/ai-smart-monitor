const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`)
  : 'http://127.0.0.1:5000/api';

/**
 * Health check endpoint
 */
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    console.error("API Error (health):", err);
    return { status: "error", message: err.message };
  }
}

/**
 * Fetch current live telemetry metrics (psutil) & save to MongoDB
 */
export async function fetchCurrentMonitoring() {
  try {
    const res = await fetch(`${API_BASE_URL}/monitoring/current`);
    return await res.json();
  } catch (err) {
    console.error("API Error (monitoring/current):", err);
    return { status: "error", message: err.message };
  }
}

/**
 * Fetch historical monitoring telemetry from MongoDB
 */
export async function fetchMonitoringHistory(limit = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/monitoring/history?limit=${limit}`);
    return await res.json();
  } catch (err) {
    console.error("API Error (monitoring/history):", err);
    return { status: "error", message: err.message };
  }
}

/**
 * Fetch dashboard overview stats & database aggregates from Flask/MongoDB
 */
export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return await res.json();
  } catch (err) {
    console.error("API Error (dashboard/stats):", err);
    return { status: "error", message: err.message };
  }
}

/**
 * Send metrics to Scikit-learn Isolation Forest model endpoint for anomaly prediction
 */
export async function postPredictMetrics(metricsData = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metricsData)
    });
    return await res.json();
  } catch (err) {
    console.error("API Error (predict):", err);
    return { status: "error", message: err.message };
  }
}

/**
 * Fetch automated alerts from MongoDB with optional severity and status filters
 */
export async function fetchAlerts(severity = null, status = null) {
  try {
    let url = `${API_BASE_URL}/alerts`;
    const params = [];
    if (severity && severity !== 'All') params.push(`severity=${encodeURIComponent(severity)}`);
    if (status && status !== 'All') params.push(`status=${encodeURIComponent(status)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error("API Error (alerts):", err);
    return { status: "error", message: err.message };
  }
}

/**
 * Fetch recent alerts for notifications
 */
export async function fetchRecentAlerts(limit = 5) {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts/recent?limit=${limit}`);
    return await res.json();
  } catch (err) {
    console.error("API Error (alerts/recent):", err);
    return { status: "error", message: err.message };
  }
}

/**
 * Update alert status in MongoDB (e.g. Pending -> Investigating -> Resolved)
 */
export async function updateAlertStatus(alertId, newStatus) {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts/${encodeURIComponent(alertId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    return await res.json();
  } catch (err) {
    console.error("API Error (alerts/status):", err);
    return { status: "error", message: err.message };
  }
}
