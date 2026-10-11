from flask import Blueprint, jsonify, request
from services.prediction_service import evaluate_system_metrics

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api')

@prediction_bp.route('/predict', methods=['POST'])
def predict_endpoint():
    """
    Endpoint: POST /api/predict
    Receives system monitoring metrics and returns an ML classification (NORMAL vs ANOMALY)
    along with the Isolation Forest decision anomaly score and detected environment profile.
    """
    try:
        input_data = request.get_json(silent=True) or {}
        save_telemetry = bool(input_data.pop("save_telemetry", False)) if isinstance(input_data, dict) else False
        
        result = evaluate_system_metrics(input_data, save_telemetry=save_telemetry)
        
        return jsonify({
            "status": "success",
            "prediction": result["prediction"],
            "anomaly_score": result["anomaly_score"],
            "environment": result.get("environment")
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Prediction failed: {str(e)}"
        }), 500
