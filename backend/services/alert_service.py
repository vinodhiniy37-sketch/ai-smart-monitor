import time
from datetime import datetime
from database.mongodb import db_manager

def determine_severity(metrics, anomaly_score):
    """
    Determines alert severity level based on metric thresholds and anomaly score.
    """
    cpu = float(metrics.get("cpu_usage", 0))
    memory = float(metrics.get("memory_usage", 0))
    
    if cpu >= 90.0 or memory >= 90.0 or anomaly_score <= -0.2:
        return "High"
    elif cpu >= 75.0 or memory >= 75.0 or anomaly_score <= -0.1:
        return "Medium"
    else:
        return "Low"

def create_alert_from_anomaly(metrics, prediction_result):
    """
    Creates an alert record from ML anomaly detection results and saves it into MongoDB.
    """
    alert_id = f"ALT-{int(time.time() * 1000)}"
    severity = determine_severity(metrics, prediction_result.get("anomaly_score", 0.0))
    
    cpu = metrics.get("cpu_usage", 0)
    mem = metrics.get("memory_usage", 0)
    
    alert_doc = {
        "alert_id": alert_id,
        "title": f"System Anomaly Detected ({severity} Severity)",
        "message": f"Scikit-learn Isolation Forest flagged system behavior anomaly. CPU: {cpu}%, Memory: {mem}%.",
        "severity": severity,
        "status": "Pending",  # Status options: Pending, Investigating, Resolved
        "metrics": metrics,
        "anomaly_score": prediction_result.get("anomaly_score", 0.0),
        "is_ml_flagged": True,
        "timestamp": metrics.get("timestamp", datetime.now().isoformat(timespec='seconds'))
    }
    
    try:
        collection = db_manager.get_collection("alerts")
        if collection is not None:
            # Insert copy so _id mutation does not affect returned dict
            record = dict(alert_doc)
            collection.insert_one(record)
    except Exception as e:
        print(f"⚠️ Failed to save alert to MongoDB: {e}")
        
    return alert_doc

def get_all_alerts(limit=50, severity=None, status=None):
    """
    Queries alerts from MongoDB with optional severity and status filters.
    """
    try:
        collection = db_manager.get_collection("alerts")
        if collection is None:
            return []
            
        query_filter = {}
        if severity and severity.lower() != 'all':
            query_filter['severity'] = severity
        if status and status.lower() != 'all':
            query_filter['status'] = status
            
        cursor = collection.find(query_filter, {'_id': 0}).sort("timestamp", -1).limit(limit)
        return list(cursor)
    except Exception as e:
        print(f"⚠️ Error fetching alerts: {e}")
        return []

def get_recent_alerts(limit=5):
    """
    Queries recent alerts from MongoDB sorted by timestamp descending.
    """
    return get_all_alerts(limit=limit)

def update_alert_status(alert_id, new_status):
    """
    Updates status field of an alert document in MongoDB.
    """
    try:
        collection = db_manager.get_collection("alerts")
        if collection is None:
            return False, "Database not connected"
            
        result = collection.update_one(
            {"alert_id": alert_id},
            {"$set": {"status": new_status}}
        )
        
        if result.matched_count > 0:
            return True, f"Alert {alert_id} status updated to {new_status}"
        else:
            return False, f"Alert {alert_id} not found"
    except Exception as e:
        return False, f"Failed to update alert: {str(e)}"
