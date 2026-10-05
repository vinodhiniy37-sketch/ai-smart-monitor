from flask import Blueprint, jsonify, request
from services.monitoring_service import get_current_system_metrics, get_monitoring_history

monitoring_bp = Blueprint('monitoring', __name__, url_prefix='/api/monitoring')

@monitoring_bp.route('/current', methods=['GET'])
def get_current_monitoring():
    """
    Endpoint: GET /api/monitoring/current
    Returns real-time system metrics collected live via psutil and stores them in MongoDB.
    """
    try:
        metrics = get_current_system_metrics(save_to_db=True)
        return jsonify({
            "status": "success",
            "data": metrics
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to retrieve system metrics: {str(e)}"
        }), 500

@monitoring_bp.route('/history', methods=['GET'])
def get_history_monitoring():
    """
    Endpoint: GET /api/monitoring/history
    Returns historical monitoring records stored in MongoDB.
    Query params: limit (default: 50)
    """
    try:
        limit = request.args.get('limit', default=50, type=int)
        records = get_monitoring_history(limit=limit)
        return jsonify({
            "status": "success",
            "count": len(records),
            "data": records
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to fetch monitoring history: {str(e)}"
        }), 500
