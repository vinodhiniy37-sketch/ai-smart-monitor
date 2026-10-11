from ml.predict import predict_metrics
from services.monitoring_service import get_current_system_metrics
from services.alert_service import create_alert_from_anomaly

def evaluate_system_metrics(input_metrics=None, save_telemetry=False):
    """
    Evaluates system metrics with the trained Isolation Forest ML model.
    If input_metrics is None or empty, fetches live real-time metrics via psutil.
    Only persists sampled telemetry to monitoring_data if save_telemetry is True.
    If ANOMALY is detected, creates an automated alert in MongoDB.
    """
    if not input_metrics:
        input_metrics = get_current_system_metrics(save_to_db=save_telemetry)
        
    result = predict_metrics(input_metrics)
    
    # If ML model predicts ANOMALY, trigger automated alert generation & MongoDB storage
    if result.get("is_anomaly"):
        alert_doc = create_alert_from_anomaly(input_metrics, result)
        result["alert_generated"] = alert_doc["alert_id"]
        
    return result
