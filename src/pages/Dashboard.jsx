import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  ShieldAlert,
  Brain
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  fetchDashboardStats, 
  fetchRecentAlerts, 
  fetchMonitoringHistory, 
  postPredictMetrics 
} from '../services/api.js';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    current_cpu: 0,
    current_memory: 0,
    current_disk: 0,
    total_monitoring_records: 0,
    total_anomalies: 0,
    active_alerts: 0,
    last_updated: ""
  });

  const [mlPrediction, setMlPrediction] = useState({
    prediction: "NORMAL",
    anomaly_score: 0.12,
    is_anomaly: false
  });

  const [alerts, setAlerts] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real backend data from Flask APIs
  const loadDashboardData = async () => {
    try {
      const statsRes = await fetchDashboardStats();
      if (statsRes.status === "success" && statsRes.data) {
        setStats(statsRes.data);
      }

      const alertsRes = await fetchRecentAlerts(5);
      if (alertsRes.status === "success" && alertsRes.data) {
        setAlerts(alertsRes.data);
      }

      const historyRes = await fetchMonitoringHistory(15);
      if (historyRes.status === "success" && historyRes.data) {
        // Map history for Recharts
        const chartFormatted = historyRes.data.reverse().map((item, index) => ({
          name: item.timestamp ? item.timestamp.split('T')[1]?.substring(0, 5) || `T-${index}` : `T-${index}`,
          cpu: item.cpu_usage,
          memory: item.memory_usage,
          processes: item.running_processes,
          netSent: Math.round((item.network_sent || 0) / 1024)
        }));
        setHistoryData(chartFormatted);
      }

      // Execute ML Prediction on current live metrics
      const predictRes = await postPredictMetrics({});
      if (predictRes.status === "success") {
        setMlPrediction(predictRes);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  const healthPercentage = Math.max(0, Math.round(100 - ((stats.current_cpu + stats.current_memory) / 2)));

  const pieData = [
    { name: 'Normal Records', value: Math.max(1, stats.total_monitoring_records - stats.total_anomalies), color: '#22C55E' },
    { name: 'Active Alerts', value: stats.active_alerts, color: '#F59E0B' },
    { name: 'ML Anomalies', value: stats.total_anomalies, color: '#EF4444' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip glass-card">
          <p className="tooltip-label">{`Time: ${label}`}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="tooltip-value">
              {`${pld.name}: ${pld.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-content">
      {/* Page Title */}
      <div className="page-header-row">
        <div>
          <h2>System Overview</h2>
          <p>Real-time telemetry and automated Scikit-learn ML anomaly classification</p>
        </div>
        <div className="date-badge">
          <span>Backend Connected: Flask + MongoDB</span>
          <span className="live-dot"></span>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span className="kpi-title">System Health</span>
            <CheckCircle className="kpi-icon icon-success" />
          </div>
          <div className="kpi-value">{healthPercentage}%</div>
          <div className="kpi-footer">
            <span className="footer-green">CPU: {stats.current_cpu}% | RAM: {stats.current_memory}%</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Alerts</span>
            <AlertTriangle className="kpi-icon icon-warning" />
          </div>
          <div className="kpi-value">{stats.active_alerts}</div>
          <div className="kpi-footer">
            <span className="footer-red">Stored in MongoDB `alerts`</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span className="kpi-title">Monitoring Records</span>
            <Database className="kpi-icon icon-blue" />
          </div>
          <div className="kpi-value">{stats.total_monitoring_records.toLocaleString()}</div>
          <div className="kpi-footer">
            <span className="footer-green">Real psutil telemetry entries</span>
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span className="kpi-title">AI Classification</span>
            <ShieldAlert className="kpi-icon icon-purple" />
          </div>
          <div className="kpi-value">{mlPrediction.prediction}</div>
          <div className="kpi-footer">
            <span className={mlPrediction.prediction === 'ANOMALY' ? 'footer-red' : 'footer-purple'}>
              Anomaly Score: {mlPrediction.anomaly_score}
            </span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="dashboard-charts-grid">
        {/* Error Trend Line Chart */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Real CPU & Memory Telemetry Trend</h3>
            <span className="chart-subtitle">Historical metrics stream collected via psutil</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="cpu" name="CPU Usage (%)" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="memory" name="Memory Usage (%)" stroke="#7C3AED" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Activity Chart */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Running Processes & Network Rate</h3>
            <span className="chart-subtitle">Active process count vs KB outbound traffic</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="processes" name="Running Processes" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorRequests)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid of bottom widgets */}
      <div className="widgets-grid">
        {/* Recent Alerts Feed from MongoDB */}
        <div className="widget-card glass-card span-2">
          <div className="widget-header">
            <h3>MongoDB Alerts Feed</h3>
            <span className="badge badge-warning">Live MongoDB Stream</span>
          </div>
          <div className="table-responsive">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Alert ID</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length > 0 ? (
                  alerts.map(alert => (
                    <tr key={alert.alert_id || alert.timestamp}>
                      <td className="font-mono text-neon-blue">{alert.alert_id}</td>
                      <td>{alert.title || alert.message}</td>
                      <td>
                        <span className={`badge ${
                          alert.severity === 'High' ? 'badge-danger' : 
                          alert.severity === 'Medium' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-ai">{alert.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-secondary-label" style={{ textAlign: 'center', padding: '24px' }}>
                      No active alerts found in MongoDB. System status nominal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine Learning Model Status */}
        <div className="widget-card glass-card">
          <div className="widget-header">
            <div className="ml-header-title">
              <Brain className="ml-brain-icon" />
              <h3>Scikit-Learn Classifier</h3>
            </div>
            <span className="badge badge-ai">Isolation Forest</span>
          </div>
          <div className="ml-body">
            <div className="ml-status-row">
              <span className="label">ML Classification</span>
              <span className={mlPrediction.prediction === 'ANOMALY' ? 'value text-error' : 'value text-success'}>
                {mlPrediction.prediction}
              </span>
            </div>
            <div className="ml-status-row">
              <span className="label">Decision Score</span>
              <span className="value">{mlPrediction.anomaly_score}</span>
            </div>
            
            {/* Live Model Anomaly Score Track */}
            <div className="anomaly-gauge-wrapper">
              <div className="gauge-label-row">
                <span>Anomaly Risk Level</span>
                <span className={mlPrediction.prediction === 'ANOMALY' ? 'text-error' : 'text-success'}>
                  {mlPrediction.prediction === 'ANOMALY' ? 'High Risk' : 'Low Risk'}
                </span>
              </div>
              <div className="gauge-track">
                <div 
                  className={`gauge-fill ${mlPrediction.prediction === 'ANOMALY' ? 'gauge-danger' : 'gauge-primary'}`} 
                  style={{ width: `${Math.min(100, Math.max(10, (0.5 - mlPrediction.anomaly_score) * 100))}%` }}
                ></div>
              </div>
              <p className="ml-gauge-note">
                Isolation Forest decision score &lt; 0 flags anomaly.
              </p>
            </div>
          </div>
        </div>

        {/* System Node Distribution Pie chart */}
        <div className="widget-card glass-card">
          <div className="widget-header">
            <h3>Database Collection Ratios</h3>
            <span className="chart-subtitle">MongoDB record allocations</span>
          </div>
          <div className="pie-widget-body">
            <div className="pie-container">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
