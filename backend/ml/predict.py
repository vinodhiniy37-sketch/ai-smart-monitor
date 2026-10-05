import os
import pickle
import numpy as np
import pandas as pd
from datetime import datetime

from ml.train_model import MODEL_PATH, FEATURE_COLUMNS, train_isolation_forest
from database.mongodb import db_manager

_cached_model = None

def get_loaded_model():
    """Loads and caches the trained Isolation Forest model from disk."""
    global _cached_model
    if _cached_model is not None:
        return _cached_model
        
    if not os.path.exists(MODEL_PATH):
        print("⚠️ Model file not found. Training initial Isolation Forest model...")
        _cached_model = train_isolation_forest()
    else:
        with open(MODEL_PATH, "rb") as f:
            _cached_model = pickle.load(f)
            
    return _cached_model

def predict_metrics(metrics_dict):
    """
    Evaluates a system metrics vector against the Scikit-learn Isolation Forest model.
    
    Returns:
        dict: {
            "prediction": "NORMAL" or "ANOMALY",
            "anomaly_score": float,
            "is_anomaly": bool
        }
    """
    model = get_loaded_model()
    
    # Extract feature values, providing safe defaults if any key is missing
    cpu = float(metrics_dict.get("cpu_usage", 0.0))
    memory = float(metrics_dict.get("memory_usage", 0.0))
    disk = float(metrics_dict.get("disk_usage", 0.0))
    net_sent = float(metrics_dict.get("network_sent", 0.0))
    processes = float(metrics_dict.get("running_processes", 0.0))
    
    feature_df = pd.DataFrame([[cpu, memory, disk, net_sent, processes]], columns=FEATURE_COLUMNS)
    
    # Isolation Forest predict returns 1 for Normal, -1 for Anomaly
    raw_pred = model.predict(feature_df)[0]
    
    # Isolation Forest decision_function returns anomaly score (negative values indicate higher anomaly likelihood)
    raw_score = model.decision_function(feature_df)[0]
    
    prediction_label = "NORMAL" if raw_pred == 1 else "ANOMALY"
    anomaly_score_val = round(float(raw_score), 4)
    is_anomaly = bool(raw_pred == -1)
    
    # Store prediction log in MongoDB if record is an anomaly or requested
    prediction_record = {
        "prediction": prediction_label,
        "anomaly_score": anomaly_score_val,
        "is_anomaly": is_anomaly,
        "metrics": {
            "cpu_usage": cpu,
            "memory_usage": memory,
            "disk_usage": disk,
            "network_sent": net_sent,
            "running_processes": processes
        },
        "timestamp": metrics_dict.get("timestamp", datetime.now().isoformat(timespec='seconds'))
    }
    
    if is_anomaly:
        save_prediction_to_db(prediction_record)
        
    return {
        "prediction": prediction_label,
        "anomaly_score": anomaly_score_val,
        "is_anomaly": is_anomaly
    }

def save_prediction_to_db(pred_record):
    """Saves anomaly prediction record into MongoDB predictions collection."""
    try:
        collection = db_manager.get_collection("predictions")
        if collection is not None:
            collection.insert_one(dict(pred_record))
    except Exception as e:
        print(f"⚠️ Failed to save prediction to MongoDB: {e}")
