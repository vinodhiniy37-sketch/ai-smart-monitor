import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Network, 
  Users, 
  Clock, 
  Server, 
  Activity, 
  TrendingUp 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { fetchCurrentMonitoring, fetchMonitoringHistory } from '../services/api.js';
import './Monitoring.css';

export default function Monitoring() {
  const [metrics, setMetrics] = useState({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_sent: 0,
    network_received: 0,
    running_processes: 0,
    timestamp: ""
  });

  const [history, setHistory] = useState([]);
  const [responseTime, setResponseTime] = useState(15);

  const loadMonitoringData = async () => {
    const startTime = performance.now();
    try {
      const res = await fetchCurrentMonitoring();
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      if (res.status === "success" && res.data) {
        setMetrics(res.data);
      }

      const histRes = await fetchMonitoringHistory(20);
      if (histRes.status === "success" && histRes.data) {
        const formatted = histRes.data.reverse().map((item, idx) => ({
          time: item.timestamp ? item.timestamp.split('T')[1]?.substring(0, 8) || `T-${idx}` : `T-${idx}`,
          cpu: item.cpu_usage,
          memory: item.memory_usage,
          disk: item.disk_usage,
          netSent: Math.round((item.network_sent || 0) / 1024),
          netRecv: Math.round((item.network_received || 0) / 1024),
          processes: item.running_processes
        }));
        setHistory(formatted);
      }
    } catch (err) {
      console.error("Monitoring fetch error:", err);
    }
  };

  useEffect(() => {
    loadMonitoringData();
    const timer = setInterval(loadMonitoringData, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="monitoring-content">
      {/* Title */}
      <div className="page-header-row">
        <div>
          <h2>Real System Telemetry (psutil)</h2>
          <p>Live system metrics stream collected via Python psutil and stored in MongoDB</p>
        </div>
        <div className="telemetry-badge-active">
          <Server className="pulse-icon" />
          <span>Status: Live Sockets Active</span>
        </div>
      </div>

      {/* 2x3 Grid of telemetry parameters */}
      <div className="telemetry-cards-grid">
        {/* CPU */}
        <div className="telemetry-card glass-card">
          <div className="t-card-header">
            <div className="t-card-icon-box bg-purple">
              <Cpu className="t-icon text-purple" />
            </div>
            <div>
              <span className="t-label">CPU Usage</span>
              <h3 className="t-value">{metrics.cpu_usage}%</h3>
            </div>
          </div>
          <div className="t-progress-wrapper">
            <div className="t-progress-track">
              <div className="t-progress-fill gradient-purple" style={{ width: `${metrics.cpu_usage}%` }}></div>
            </div>
          </div>
          <div className="t-chart-container">
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={history}>
                <Line type="monotone" dataKey="cpu" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory */}
        <div className="telemetry-card glass-card">
          <div className="t-card-header">
            <div className="t-card-icon-box bg-blue">
              <Activity className="t-icon text-blue" />
            </div>
            <div>
              <span className="t-label">Memory Allocation</span>
              <h3 className="t-value">{metrics.memory_usage}%</h3>
            </div>
          </div>
          <div className="t-progress-wrapper">
            <div className="t-progress-track">
              <div className="t-progress-fill gradient-blue" style={{ width: `${metrics.memory_usage}%` }}></div>
            </div>
          </div>
          <div className="t-chart-container">
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={history}>
                <Line type="monotone" dataKey="memory" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disk */}
        <div className="telemetry-card glass-card">
          <div className="t-card-header">
            <div className="t-card-icon-box bg-yellow">
              <HardDrive className="t-icon text-yellow" />
            </div>
            <div>
              <span className="t-label">Disk Storage</span>
              <h3 className="t-value">{metrics.disk_usage}%</h3>
            </div>
          </div>
          <div className="t-progress-wrapper">
            <div className="t-progress-track">
              <div className="t-progress-fill gradient-yellow" style={{ width: `${metrics.disk_usage}%` }}></div>
            </div>
          </div>
          <div className="t-chart-container">
            <ResponsiveContainer width="100%" height={50}>
              <LineChart data={history}>
                <Line type="monotone" dataKey="disk" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network */}
        <div className="telemetry-card glass-card">
          <div className="t-card-header">
            <div className="t-card-icon-box bg-green">
              <Network className="t-icon text-green" />
            </div>
            <div>
              <span className="t-label">Network Sent</span>
              <h3 className="t-value">{Math.round((metrics.network_sent || 0) / (1024 * 1024))} MB</h3>
            </div>
          </div>
          <div className="t-progress-wrapper">
            <div className="t-progress-track">
              <div className="t-progress-fill gradient-green" style={{ width: `65%` }}></div>
            </div>
          </div>
          <div className="t-info-row">
            <TrendingUp className="trend-arrow" />
            <span className="trend-lbl">Received: {Math.round((metrics.network_received || 0) / (1024 * 1024))} MB</span>
          </div>
        </div>

        {/* Response Latency */}
        <div className="telemetry-card glass-card">
          <div className="t-card-header">
            <div className="t-card-icon-box bg-purple">
              <Clock className="t-icon text-purple" />
            </div>
            <div>
              <span className="t-label">API Latency</span>
              <h3 className="t-value">{responseTime} ms</h3>
            </div>
          </div>
          <div className="t-progress-wrapper">
            <div className="t-progress-track">
              <div className="t-progress-fill gradient-purple" style={{ width: `${Math.min(100, responseTime * 2)}%` }}></div>
            </div>
          </div>
          <div className="t-info-row">
            <TrendingUp className="trend-arrow" />
            <span className="trend-lbl">Flask REST Response Time</span>
          </div>
        </div>

        {/* Processes */}
        <div className="telemetry-card glass-card">
          <div className="t-card-header">
            <div className="t-card-icon-box bg-blue">
              <Users className="t-icon text-blue" />
            </div>
            <div>
              <span className="t-label">Running Processes</span>
              <h3 className="t-value">{metrics.running_processes}</h3>
            </div>
          </div>
          <div className="t-progress-wrapper">
            <div className="t-progress-track">
              <div className="t-progress-fill gradient-blue" style={{ width: `${Math.min(100, (metrics.running_processes / 400) * 100)}%` }}></div>
            </div>
          </div>
          <div className="t-info-row">
            <TrendingUp className="trend-arrow" />
            <span className="trend-lbl">psutil.pids() active count</span>
          </div>
        </div>
      </div>

      {/* Live traffic graph */}
      <div className="live-traffic-container glass-card">
        <div className="traffic-header-row">
          <div>
            <h3>Live Telemetry Stream (MongoDB History)</h3>
            <span className="subtitle">Real-time system CPU & memory telemetry stream over time</span>
          </div>
          <div className="badge badge-ai pulse-purple">
            MongoDB: Synced
          </div>
        </div>
        <div className="traffic-chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="liveTrafficGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '10px',
                  color: '#F8FAFC'
                }}
              />
              <Area type="monotone" dataKey="cpu" name="CPU Usage (%)" stroke="#3B82F6" fillOpacity={1} fill="url(#liveTrafficGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
