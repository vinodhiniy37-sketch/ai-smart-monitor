// Mock service layer representing database content & machine learning predictions.
// Perfect for demonstrating Scikit-learn predictions and future Flask backend integration.

export const mockDashboardMetrics = {
  systemHealth: 98,
  activeAlerts: 12,
  totalRequests: "24,532",
  requestTrend: "+12.5%",
  riskLevel: "Medium",
  riskDescription: "Keep monitoring",
  uptime: "99.8%"
};

// Machine Learning Classifier Insights (e.g. Scikit-learn Random Forest/XGBoost output)
export const mockMLPredictionInfo = {
  modelName: "SystemAnomalyClassifier v2.1",
  modelType: "Random Forest Classifier",
  accuracy: "97.4%",
  f1Score: "96.8%",
  lastTrained: "12 hours ago",
  featureImportance: [
    { name: "CPU Temperature", weight: 0.35 },
    { name: "Memory Allocation", weight: 0.28 },
    { name: "Network Packet Drop Rate", weight: 0.21 },
    { name: "Disk Write Latency", weight: 0.16 }
  ],
  predictionStatus: {
    anomalyProbability: 0.18, // 18% anomaly probability right now
    riskStatus: "Normal",
    predictedCause: "None detected"
  }
};

// Line charts - Error trends
export const mockErrorTrendData = [
  { name: "Mon", errors: 80, anomalies: 12 },
  { name: "Tue", errors: 120, anomalies: 18 },
  { name: "Wed", errors: 95, anomalies: 10 },
  { name: "Thu", errors: 175, anomalies: 34 },
  { name: "Fri", errors: 140, anomalies: 22 },
  { name: "Sat", errors: 85, anomalies: 8 },
  { name: "Sun", errors: 110, anomalies: 15 }
];

// Area charts - System activity (Requests per minute)
export const mockSystemActivityData = [
  { name: "Mon", requests: 12000, latency: 230 },
  { name: "Tue", requests: 15000, latency: 245 },
  { name: "Wed", requests: 14000, latency: 220 },
  { name: "Thu", requests: 22000, latency: 290 },
  { name: "Fri", requests: 19000, latency: 250 },
  { name: "Sat", requests: 11000, latency: 210 },
  { name: "Sun", requests: 13000, latency: 225 }
];

// Reusable static monitoring logs
export const recentAlerts = [
  { id: 1, message: "High CPU Usage detected", time: "2 min ago", severity: "High", isMLFlagged: true },
  { id: 2, message: "Multiple failed login attempts", time: "15 min ago", severity: "Medium", isMLFlagged: false },
  { id: 3, message: "Memory usage is high", time: "30 min ago", severity: "Medium", isMLFlagged: true },
  { id: 4, message: "Disk space running low", time: "1 hour ago", severity: "Low", isMLFlagged: false },
  { id: 5, message: "Unusual activity detected", time: "2 hours ago", severity: "High", isMLFlagged: true }
];

// 20 Mock errors with pagination support
export const mockErrorsDatabase = [
  { id: "ERR-001", type: "Login Failure", severity: "High", timeDetected: "12 May 2026, 10:25 AM", status: "Resolved", action: "Investigated", mlConfidence: 0.98, notes: "Failed login threshold exceeded (IP: 192.168.1.45)" },
  { id: "ERR-002", type: "High CPU Usage", severity: "Medium", timeDetected: "12 May 2026, 11:15 AM", status: "Pending", action: "Review", mlConfidence: 0.85, notes: "CPU throttled at 96% due to worker node load" },
  { id: "ERR-003", type: "Memory Leak", severity: "High", timeDetected: "12 May 2026, 11:50 AM", status: "Resolved", action: "Rebooted container", mlConfidence: 0.94, notes: "Heap utilization grew exponentially over 4 hours" },
  { id: "ERR-004", type: "Disk Space Low", severity: "Low", timeDetected: "12 May 2026, 12:20 PM", status: "Resolved", action: "Purged cache logs", mlConfidence: 0.60, notes: "Partition /dev/sda1 utilization at 89%" },
  { id: "ERR-005", type: "Unusual Activity", severity: "High", timeDetected: "12 May 2026, 01:05 PM", status: "Pending", action: "Review", mlConfidence: 0.91, notes: "API throttling limit triggered by token 0x8a92" },
  { id: "ERR-006", type: "Service Timeout", severity: "Medium", timeDetected: "12 May 2026, 01:40 PM", status: "Investigating", action: "Tracing router", mlConfidence: 0.76, notes: "Microservice 'AuthGate' did not respond in 5000ms" },
  { id: "ERR-007", type: "Database Lock", severity: "High", timeDetected: "12 May 2026, 02:10 PM", status: "Pending", action: "Optimize Query", mlConfidence: 0.89, notes: "Deadlock detected on transaction table" },
  { id: "ERR-008", type: "Network Dropout", severity: "Medium", timeDetected: "12 May 2026, 02:50 PM", status: "Resolved", action: "Rerouted gateway", mlConfidence: 0.79, notes: "Packet loss spiked to 14% on interface eth0" },
  { id: "ERR-009", type: "SSL Expiry Warning", severity: "Low", timeDetected: "12 May 2026, 03:00 PM", status: "Investigating", action: "Auto-renewing", mlConfidence: 0.99, notes: "Let's Encrypt cert expires in 7 days" },
  { id: "ERR-010", type: "Auth Token Expired", severity: "Low", timeDetected: "12 May 2026, 03:15 PM", status: "Resolved", action: "Cleared sessions", mlConfidence: 0.50, notes: "Refresh token failed validation check" },
  { id: "ERR-011", type: "Kubernetes Pod Crash", severity: "High", timeDetected: "12 May 2026, 03:45 PM", status: "Pending", action: "Reschedule Pod", mlConfidence: 0.92, notes: "OOMKilled status code 137 on api-v2 node" },
  { id: "ERR-012", type: "Redis Buffer Overflow", severity: "Medium", timeDetected: "12 May 2026, 04:10 PM", status: "Investigating", action: "Flush Cache", mlConfidence: 0.83, notes: "Redis memory reached maximum eviction cap" },
  { id: "ERR-013", type: "S3 Write Failure", severity: "Medium", timeDetected: "12 May 2026, 04:30 PM", status: "Resolved", action: "Retried request", mlConfidence: 0.67, notes: "IAM Role lacked inline permissions temporarily" },
  { id: "ERR-014", type: "CORS Rejection", severity: "Low", timeDetected: "12 May 2026, 05:00 PM", status: "Resolved", action: "Header updated", mlConfidence: 0.81, notes: "Origin dev.local blocked by Access-Control-Allow-Origin" },
  { id: "ERR-015", type: "GraphQL Error", severity: "Medium", timeDetected: "12 May 2026, 05:22 PM", status: "Pending", action: "Check Schema", mlConfidence: 0.74, notes: "Query signature requested undefined resolver field" },
  { id: "ERR-016", type: "SMTP Server Down", severity: "High", timeDetected: "12 May 2026, 06:11 PM", status: "Investigating", action: "Check Relays", mlConfidence: 0.95, notes: "Mail queue backlog exceeded 500 messages" },
  { id: "ERR-017", type: "API Latency Spike", severity: "Medium", timeDetected: "12 May 2026, 06:40 PM", status: "Pending", action: "Scale Node", mlConfidence: 0.88, notes: "P99 Response time reached 4200ms" },
  { id: "ERR-018", type: "DNS Resolution Fail", severity: "High", timeDetected: "12 May 2026, 07:05 PM", status: "Resolved", action: "Updated Nameserver", mlConfidence: 0.97, notes: "Public DNS servers timed out on remote API resolve" },
  { id: "ERR-019", type: "Nginx Gateway Error", severity: "High", timeDetected: "12 May 2026, 07:35 PM", status: "Pending", action: "Restart Nginx", mlConfidence: 0.90, notes: "502 Bad Gateway returned on upstream services" },
  { id: "ERR-020", type: "Disk Write Block", severity: "Medium", timeDetected: "12 May 2026, 08:00 PM", status: "Investigating", action: "Release Mounts", mlConfidence: 0.78, notes: "Filesystem mounted as Read-Only due to corruption flags" }
];

// Profile data for Settings Page
export const defaultUserProfile = {
  fullName: "Admin User",
  email: "admin@example.com",
  role: "Administrator",
  avatarUrl: null, // Custom generated file or initials
  theme: "Dark",
  language: "English",
  timezone: "(UTC+05:30) India Standard Time",
  dateFormat: "DD/MM/YYYY"
};
