from flask import Blueprint, jsonify
from services.monitoring_service import get_current_system_metrics
from database.mongodb import db_manager

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    """
    Endpoint: GET /api/dashboard/stats
    Returns overall system dashboard statistics from live psutil data & MongoDB records.
    """
    try:
        # Collect live metric sample
        current_metrics = get_current_system_metrics(save_to_db=True)
        
        # Access MongoDB collections
        monitoring_col = db_manager.get_collection("monitoring_data")
        predictions_col = db_manager.get_collection("predictions")
        alerts_col = db_manager.get_collection("alerts")
        
        # Aggregated record counts
        total_records = monitoring_col.count_documents({}) if monitoring_col is not None else 0
        total_anomalies = predictions_col.count_documents({"prediction": "ANOMALY"}) if predictions_col is not None else 0
        active_alerts = alerts_col.count_documents({"status": {"$in": ["Pending", "Active"]}}) if alerts_col is not None else 0
        
        stats = {
            "current_cpu": current_metrics["cpu_usage"],
            "current_memory": current_metrics["memory_usage"],
            "current_disk": current_metrics["disk_usage"],
            "total_monitoring_records": total_records,
            "total_anomalies": total_anomalies,
            "active_alerts": active_alerts,
            "last_updated": current_metrics["timestamp"]
        }
        
        return jsonify({
            "status": "success",
            "data": stats
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to compute dashboard statistics: {str(e)}"
        }), 500
