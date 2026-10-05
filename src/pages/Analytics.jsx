import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  Activity, 
  CheckCircle 
} from 'lucide-react';
import { fetchDashboardStats, fetchMonitoringHistory } from '../services/api.js';
import './Analytics.css';

export default function Analytics() {
  const [stats, setStats] = useState({
    current_cpu: 0,
    current_memory: 0,
    current_disk: 0,
    total_monitoring_records: 0,
    total_anomalies: 0,
    active_alerts: 0
  });

  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const statsRes = await fetchDashboardStats();
        if (statsRes.status === 'success' && statsRes.data) {
          setStats(statsRes.data);
        }

        const historyRes = await fetchMonitoringHistory(30);
        if (historyRes.status === 'success' && historyRes.data) {
          const formatted = historyRes.data.reverse().map((item, idx) => ({
            name: item.timestamp ? item.timestamp.split('T')[1]?.substring(0, 5) || `T-${idx}` : `T-${idx}`,
            cpu: item.cpu_usage,
            memory: item.memory_usage,
            disk: item.disk_usage,
            processes: item.running_processes
          }));
          setHistoryData(formatted);
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
      }
    };

    loadAnalyticsData();
  }, []);

  const summaries = [
    { title: "Total Monitoring Entries", value: stats.total_monitoring_records.toLocaleString(), icon: Activity, status: "up", change: "+Live", color: "text-blue", desc: "Stored in MongoDB `monitoring_data`" },
    { title: "Active MongoDB Alerts", value: stats.active_alerts, icon: AlertTriangle, status: "down", change: "MongoDB", color: "text-yellow", desc: "Pending/Active anomaly alerts" },
    { title: "Detected ML Anomalies", value: stats.total_anomalies, icon: Clock, status: "down", change: "Isolation Forest", color: "text-red", desc: "Logged in MongoDB `predictions`" },
    { title: "Current System Health", value: `${Math.max(0, Math.round(100 - ((stats.current_cpu + stats.current_memory) / 2)))}%`, icon: CheckCircle, status: "up", change: "+100%", color: "text-green", desc: "CPU/RAM aggregate index" }
  ];

  const distributionData = [
    { name: 'Normal Telemetry', value: Math.max(1, stats.total_monitoring_records - stats.total_anomalies), color: '#3B82F6' },
    { name: 'Detected Anomalies', value: stats.total_anomalies, color: '#EF4444' },
    { name: 'Active Alerts', value: stats.active_alerts, color: '#F59E0B' }
  ];

  const handleExportReport = () => {
    alert(`AI Smart Monitor System Report\n\nTotal Records: ${stats.total_monitoring_records}\nTotal Anomalies: ${stats.total_anomalies}\nActive Alerts: ${stats.active_alerts}\n\nExported successfully.`);
  };

  return (
    <div className="analytics-content">
      {/* Title Header */}
      <div className="page-header-row">
        <div>
          <h2>Analytics Engine (MongoDB Aggregates)</h2>
          <p>Evaluate overall node performance trends, alert distributions, and failure mitigations</p>
        </div>
        <button className="btn-gradient flex-align-gap" onClick={handleExportReport}>
          <Download className="btn-icon" />
          <span>Export Summary Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpis-row">
        {summaries.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="analytics-kpi-card glass-card">
              <div className="kpi-header-row">
                <span className="kpi-title">{item.title}</span>
                <div className={`kpi-icon-box ${item.color}`}>
                  <Icon className="icon" />
                </div>
              </div>
              <div className="kpi-metrics-row">
                <span className="metrics-value">{item.value}</span>
                <span className={`metrics-badge ${item.status === 'down' ? 'badge-desc-green' : 'badge-desc-red'}`}>
                  {item.change}
                </span>
              </div>
              <p className="kpi-description">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Monthly Error Trend */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Real CPU vs Memory History (psutil)</h3>
            <span className="chart-subtitle">Telemetry stream persisted in MongoDB</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', color: '#F8FAFC' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="cpu" name="CPU Usage (%)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                <Bar dataKey="memory" name="Memory Usage (%)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Score Line */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Disk Storage Utilization Trend</h3>
            <span className="chart-subtitle">Root drive % load history</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', color: '#F8FAFC' }} />
                <Area type="monotone" dataKey="disk" name="Disk Usage (%)" stroke="#10B981" fillOpacity={1} fill="url(#healthGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>MongoDB Document Allocation</h3>
            <span className="chart-subtitle">Records vs Anomalies vs Alerts ratio</span>
          </div>
          <div className="pie-widget-body" style={{ minHeight: '260px' }}>
            <div className="pie-container" style={{ height: '170px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pie-legend" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {distributionData.map((item, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-name">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Latency Bar chart */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Process Count Correlation</h3>
            <span className="chart-subtitle">Active process count per telemetry timestamp</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', color: '#F8FAFC' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="processes" name="Running Processes" stroke="#EC4899" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
