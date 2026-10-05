from flask import Blueprint, jsonify, request
from services.alert_service import get_all_alerts, get_recent_alerts, update_alert_status

alert_bp = Blueprint('alert', __name__, url_prefix='/api/alerts')

@alert_bp.route('', methods=['GET'])
def get_alerts_endpoint():
    """
    Endpoint: GET /api/alerts
    Returns list of automated alerts with optional query filtering by severity and status.
    Query params: severity, status, limit
    """
    try:
        severity = request.args.get('severity', default=None, type=str)
        status = request.args.get('status', default=None, type=str)
        limit = request.args.get('limit', default=50, type=int)
        
        alerts = get_all_alerts(limit=limit, severity=severity, status=status)
        return jsonify({
            "status": "success",
            "count": len(alerts),
            "data": alerts
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve alerts: {str(e)}"
        }), 500

@alert_bp.route('/recent', methods=['GET'])
def get_recent_alerts_endpoint():
    """
    Endpoint: GET /api/alerts/recent
    Returns the most recent automated anomaly alerts.
    Query params: limit (default: 5)
    """
    try:
        limit = request.args.get('limit', default=5, type=int)
        alerts = get_recent_alerts(limit=limit)
        return jsonify({
            "status": "success",
            "count": len(alerts),
            "data": alerts
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve recent alerts: {str(e)}"
        }), 500

@alert_bp.route('/<alert_id>/status', methods=['PUT'])
def update_alert_status_endpoint(alert_id):
    """
    Endpoint: PUT /api/alerts/<alert_id>/status
    Updates status field of an alert (e.g., Pending -> Investigating -> Resolved).
    Body JSON: { "status": "Resolved" }
    """
    try:
        body = request.get_json(silent=True) or {}
        new_status = body.get("status")
        
        if not new_status:
            return jsonify({
                "status": "error",
                "message": "Field 'status' is required in request body"
            }), 400
            
        success, message = update_alert_status(alert_id, new_status)
        
        if success:
            return jsonify({
                "status": "success",
                "message": message,
                "alert_id": alert_id,
                "new_status": new_status
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": message
            }), 404
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to update alert status: {str(e)}"
        }), 500
