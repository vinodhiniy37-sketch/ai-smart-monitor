import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

# Define model save path
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.pkl")

FEATURE_COLUMNS = ["cpu_usage", "memory_usage", "disk_usage", "network_sent", "running_processes"]

def generate_synthetic_training_data(n_samples=500):
    """
    Generates baseline system telemetry data representing normal system behavior
    for initial training if historical database records are limited.
    """
    np.random.seed(42)
    
    cpu_usage = np.random.uniform(5.0, 50.0, n_samples)
    memory_usage = np.random.uniform(20.0, 70.0, n_samples)
    disk_usage = np.random.uniform(30.0, 65.0, n_samples)
    network_sent = np.random.randint(10000, 500000, n_samples)
    running_processes = np.random.randint(120, 260, n_samples)
    
    # Introduce ~5% synthetic anomalies (extreme spikes)
    n_anomalies = int(n_samples * 0.05)
    anom_indices = np.random.choice(n_samples, n_anomalies, replace=False)
    
    cpu_usage[anom_indices] = np.random.uniform(90.0, 100.0, n_anomalies)
    memory_usage[anom_indices] = np.random.uniform(92.0, 99.0, n_anomalies)
    running_processes[anom_indices] = np.random.randint(450, 700, n_anomalies)

    df = pd.DataFrame({
        "cpu_usage": cpu_usage,
        "memory_usage": memory_usage,
        "disk_usage": disk_usage,
        "network_sent": network_sent,
        "running_processes": running_processes
    })
    return df

def train_isolation_forest(df_data=None):
    """
    Trains an Isolation Forest anomaly detection model on system monitoring features.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    if df_data is None or len(df_data) < 20:
        print("  Generating baseline dataset for model training...")
        df_data = generate_synthetic_training_data()
        
    X = df_data[FEATURE_COLUMNS]
    
    # Initialize Isolation Forest classifier
    # contamination=0.1 assumes approx 10% expected anomaly threshold
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42
    )
    
    model.fit(X)
    
    # Save trained model to disk
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
        
    print(f"  Isolation Forest model trained successfully on {len(X)} samples!")
    print(f"  Model saved to: {MODEL_PATH}")
    return model

if __name__ == "__main__":
    train_isolation_forest()
