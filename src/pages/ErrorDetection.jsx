import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RefreshCw,
  Brain,
  X,
  FileJson,
  CheckCircle
} from 'lucide-react';
import { fetchAlerts, updateAlertStatus } from '../services/api.js';
import './ErrorDetection.css';

export default function ErrorDetection() {
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected error details for modal inspection
  const [selectedError, setSelectedError] = useState(null);

  const loadAlertsData = async () => {
    setLoading(true);
    try {
      const res = await fetchAlerts(severityFilter, statusFilter);
      if (res.status === 'success' && res.data) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertsData();
  }, [severityFilter, statusFilter]);

  // Client-side search filtering
  const filteredAlerts = alerts.filter(err => {
    const term = searchTerm.toLowerCase();
    const idMatch = (err.alert_id || '').toLowerCase().includes(term);
    const titleMatch = (err.title || '').toLowerCase().includes(term);
    const msgMatch = (err.message || '').toLowerCase().includes(term);
    return idMatch || titleMatch || msgMatch;
  });

  // Calculate pagination indices
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / itemsPerPage));

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleStatusUpdate = async (alertId, newStatus) => {
    try {
      const res = await updateAlertStatus(alertId, newStatus);
      if (res.status === 'success') {
        loadAlertsData();
        if (selectedError && selectedError.alert_id === alertId) {
          setSelectedError({ ...selectedError, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSeverityFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
    loadAlertsData();
  };

  return (
    <div className="error-detection-content">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2>Automated Alert Diagnostics (MongoDB)</h2>
          <p>Inspect ML anomaly alerts, trace system telemetry parameters, and update mitigation statuses in MongoDB</p>
        </div>
        <button className="btn-secondary flex-align-gap" onClick={handleResetFilters}>
          <RefreshCw className="btn-icon" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Query panel: Search bar & Filters */}
      <div className="query-panel-card glass-card">
        <div className="search-field-wrapper">
          <Search className="search-box-icon" />
          <input
            type="text"
            placeholder="Search by Alert ID, title, or message..."
            className="form-input search-input-field"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filters-row">
          <div className="filter-item">
            <label className="filter-label">Severity Level</label>
            <div className="select-wrapper">
              <select
                className="form-input select-field"
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Severities</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
            </div>
          </div>

          <div className="filter-item">
            <label className="filter-label">Status Flag</label>
            <div className="select-wrapper">
              <select
                className="form-input select-field"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results logs database table */}
      <div className="results-table-card glass-card">
        <div className="table-responsive">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Alert Title</th>
                <th>Severity</th>
                <th>Time Logged</th>
                <th>Status</th>
                <th className="align-center">ML Anomaly Score</th>
                <th className="align-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((err) => (
                  <tr key={err.alert_id}>
                    <td className="font-mono text-neon-blue">{err.alert_id}</td>
                    <td className="font-semibold">{err.title || err.message}</td>
                    <td>
                      <span className={`badge ${
                        err.severity === 'High' ? 'badge-danger' : 
                        err.severity === 'Medium' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {err.severity}
                      </span>
                    </td>
                    <td>{err.timestamp ? err.timestamp.replace('T', ' ') : 'N/A'}</td>
                    <td>
                      <span className={`status-pill ${
                        err.status === 'Resolved' ? 'status-resolved' :
                        err.status === 'Investigating' ? 'status-investigating' : 'status-pending'
                      }`}>
                        {err.status}
                      </span>
                    </td>
                    <td className="align-center">
                      <span className="badge badge-ai">Score: {err.anomaly_score}</span>
                    </td>
                    <td className="align-right">
                      <button 
                        className="inspect-btn-action" 
                        onClick={() => setSelectedError(err)}
                        title="Inspect ML payload & update status"
                      >
                        <Eye className="eye-action-icon" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-row">
                    {loading ? "Fetching alerts from MongoDB..." : "No alert documents found matching criteria in MongoDB database."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination-footer">
          <span className="pagination-info">
            Showing <strong className="text-secondary">{filteredAlerts.length > 0 ? indexOfFirstItem + 1 : 0}</strong> to{' '}
            <strong className="text-secondary">{Math.min(indexOfLastItem, filteredAlerts.length)}</strong> of{' '}
            <strong className="text-secondary">{filteredAlerts.length}</strong> entries
          </span>

          <div className="pagination-nav-btns">
            <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="arrow-icon" />
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`pagination-btn page-num-btn ${currentPage === index + 1 ? 'active-page' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight className="arrow-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspector Drawer modal */}
      {selectedError && (
        <div className="modal-backdrop">
          <div className="modal-container glass-card neon-glow-purple">
            <div className="modal-header">
              <div className="header-badge-title">
                <Brain className="modal-header-brain-icon" />
                <h3>ML Diagnostics Analysis: {selectedError.alert_id}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedError(null)}>
                <X className="close-icon" />
              </button>
            </div>
            
            <div className="modal-body-scroll">
              <div className="modal-summary-panel">
                <div className="modal-meta-grid">
                  <div className="meta-col">
                    <span className="meta-lbl">Alert Title</span>
                    <span className="meta-val font-semibold">{selectedError.title}</span>
                  </div>
                  <div className="meta-col">
                    <span className="meta-lbl">Severity Risk</span>
                    <span>
                      <span className={`badge ${
                        selectedError.severity === 'High' ? 'badge-danger' : 
                        selectedError.severity === 'Medium' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {selectedError.severity}
                      </span>
                    </span>
                  </div>
                  <div className="meta-col">
                    <span className="meta-lbl">Isolation Forest Score</span>
                    <span className="badge badge-ai">Score: {selectedError.anomaly_score}</span>
                  </div>
                  <div className="meta-col">
                    <span className="meta-lbl">Current MongoDB Status</span>
                    <span className="meta-val font-semibold">{selectedError.status}</span>
                  </div>
                </div>

                <div className="modal-detail-section">
                  <h4 className="detail-heading">Telemetry Payload (psutil)</h4>
                  <div className="console-trace-log">
                    {selectedError.message}
                  </div>
                </div>

                <div className="modal-detail-section">
                  <div className="json-header-row">
                    <FileJson className="json-icon" />
                    <h4 className="detail-heading">MongoDB Feature Vector Document</h4>
                  </div>
                  <pre className="json-payload-code">
{JSON.stringify(selectedError, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => handleStatusUpdate(selectedError.alert_id, "Investigating")}>
                Mark Investigating
              </button>
              <button className="btn-gradient" onClick={() => handleStatusUpdate(selectedError.alert_id, "Resolved")}>
                <CheckCircle className="btn-icon" />
                Resolve Alert in MongoDB
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
