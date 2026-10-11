import os
import pickle
import pandas as pd
from datetime import datetime

from ml.train_model import (
    MODEL_PATH_VM,
    MODEL_PATH_CONTAINER,
    MODEL_PATH_WORKSTATION,
    FEATURE_COLUMNS,
    train_all_models
)
from database.mongodb import db_manager

_cached_models = {}
VALID_ENVIRONMENTS = {"cloud_vm", "cloud_container", "workstation"}

def get_loaded_models():
    """Loads and caches all environment-calibrated Isolation Forest models."""
    global _cached_models
    if _cached_models:
        return _cached_models
        
    # Check if models exist on disk, train if missing
    if not (os.path.exists(MODEL_PATH_VM) and os.path.exists(MODEL_PATH_CONTAINER) and os.path.exists(MODEL_PATH_WORKSTATION)):
        print("⚠️ Calibrated model artifacts not found. Training initial models...")
        _cached_models = train_all_models()
    else:
        with open(MODEL_PATH_VM, "rb") as f:
            m_vm = pickle.load(f)
        with open(MODEL_PATH_CONTAINER, "rb") as f:
            m_container = pickle.load(f)
        with open(MODEL_PATH_WORKSTATION, "rb") as f:
            m_workstation = pickle.load(f)
        _cached_models = {
            "cloud_vm": m_vm,
            "cloud_container": m_container,
            "workstation": m_workstation
        }
    return _cached_models

def detect_environment(metrics_dict):
    """
    Selects the environment profile using explicit configuration first,
    falling back to PID heuristics only when unconfigured:
    1. Validated request parameter: metrics_dict.get("environment")
    2. Validated server configuration: os.getenv("MONITORING_ENVIRONMENT")
    3. Structural fallback heuristic: running_processes range
    """
    # 1. Explicit request payload parameter
    explicit_env = metrics_dict.get("environment")
    if explicit_env in VALID_ENVIRONMENTS:
        return explicit_env
        
    # 2. Explicit server configuration via environment variable
    config_env = os.getenv("MONITORING_ENVIRONMENT")
    if config_env in VALID_ENVIRONMENTS:
        return config_env
        
    # 3. Fallback heuristic based on active PID count
    procs = float(metrics_dict.get("running_processes", 0.0))
    if procs <= 20:
        return "cloud_container"
    elif procs >= 150:
        return "workstation"
    else:
        return "cloud_vm"

def predict_metrics(metrics_dict):
    """
    Evaluates a system metrics vector against the environment-calibrated Isolation Forest model.
    Preserves existing API response schema while eliminating false-positive domain shift alerts.
    
    Returns:
        dict: {
            "prediction": "NORMAL" or "ANOMALY",
            "anomaly_score": float,
            "is_anomaly": bool,
            "environment": str
        }
    """
    models = get_loaded_models()
    env = detect_environment(metrics_dict)
    model = models.get(env, models["cloud_vm"])
    
    cpu = float(metrics_dict.get("cpu_usage", 0.0))
    memory = float(metrics_dict.get("memory_usage", 0.0))
    disk = float(metrics_dict.get("disk_usage", 0.0))
    net_sent = float(metrics_dict.get("network_sent", 0.0))
    processes = float(metrics_dict.get("running_processes", 0.0))
    
    feature_df = pd.DataFrame([[cpu, memory, disk, net_sent, processes]], columns=FEATURE_COLUMNS)
    
    raw_pred = model.predict(feature_df)[0]
    raw_score = model.decision_function(feature_df)[0]
    
    prediction_label = "NORMAL" if raw_pred == 1 else "ANOMALY"
    anomaly_score_val = round(float(raw_score), 4)
    is_anomaly = bool(raw_pred == -1)
    
    prediction_record = {
        "prediction": prediction_label,
        "anomaly_score": anomaly_score_val,
        "is_anomaly": is_anomaly,
        "environment": env,
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
        "is_anomaly": is_anomaly,
        "environment": env
    }

def save_prediction_to_db(pred_record):
    """Saves anomaly prediction record into MongoDB predictions collection."""
    try:
        collection = db_manager.get_collection("predictions")
        if collection is not None:
            collection.insert_one(dict(pred_record))
    except Exception as e:
        print(f"⚠️ Failed to save prediction to MongoDB: {e}")
