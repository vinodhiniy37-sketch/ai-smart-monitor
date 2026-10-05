from flask import Blueprint, jsonify, request
from services.prediction_service import evaluate_system_metrics

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api')

@prediction_bp.route('/predict', methods=['POST'])
def predict_endpoint():
    """
    Endpoint: POST /api/predict
    Receives system monitoring metrics and returns an ML classification (NORMAL vs ANOMALY)
    along with the Isolation Forest decision anomaly score.
    """
    try:
        # Get optional JSON body input
        input_data = request.get_json(silent=True) or {}
        
        result = evaluate_system_metrics(input_data)
        
        return jsonify({
            "status": "success",
            "prediction": result["prediction"],
            "anomaly_score": result["anomaly_score"]
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Prediction failed: {str(e)}"
        }), 500
