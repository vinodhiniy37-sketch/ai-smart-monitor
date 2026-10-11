# AI-Based Smart Monitoring and Automated Error Detection System
# Flask Backend - Phase 5: Automated Error Detection & Alerting

import os
from flask import Flask, jsonify
from flask_cors import CORS

from database.mongodb import db_manager
from routes.monitoring_routes import monitoring_bp
from routes.dashboard_routes import dashboard_bp
from routes.prediction_routes import prediction_bp
from routes.alert_routes import alert_bp

# ---------------------------------------------------------------------------
# Application Setup & Database Connection
# ---------------------------------------------------------------------------

app = Flask(__name__)
CORS(app)

# Initialize MongoDB connection on server startup
db_manager.connect()

# Register Blueprints
app.register_blueprint(monitoring_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(prediction_bp)
app.register_blueprint(alert_bp)

# ---------------------------------------------------------------------------
# Core Routes & Health Check
# ---------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Health-check endpoint.
    Returns a simple JSON response confirming the backend is running.
    """
    return jsonify({
        "status": "success",
        "message": "AI Smart Monitoring Backend is running"
    }), 200

# ---------------------------------------------------------------------------
# Error Handlers
# ---------------------------------------------------------------------------

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "status": "error",
        "message": "The requested resource was not found"
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "status": "error",
        "message": "This HTTP method is not allowed for the requested URL"
    }), 405


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "status": "error",
        "message": "An internal server error occurred"
    }), 500

# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", os.environ.get("FLASK_PORT", 5000)))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"

    print(f"\n  AI Smart Monitoring Backend")
    print(f"  Running on http://{host}:{port}")
    print(f"  Health Check:     http://{host}:{port}/api/health")
    print(f"  Live Monitoring:  http://{host}:{port}/api/monitoring/current")
    print(f"  History Logs:     http://{host}:{port}/api/monitoring/history")
    print(f"  Dashboard Stats:  http://{host}:{port}/api/dashboard/stats")
    print(f"  ML Prediction:    POST http://{host}:{port}/api/predict")
    print(f"  Alerts List:      http://{host}:{port}/api/alerts")
    print(f"  Recent Alerts:    http://{host}:{port}/api/alerts/recent\n")

    app.run(host=host, port=port, debug=debug, use_reloader=False)
