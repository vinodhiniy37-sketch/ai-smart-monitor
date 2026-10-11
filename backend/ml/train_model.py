import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "model")
DATA_DIR = os.path.join(BASE_DIR, "data")

MODEL_PATH_VM = os.path.join(MODEL_DIR, "isolation_forest.pkl")
MODEL_PATH_CONTAINER = os.path.join(MODEL_DIR, "isolation_forest_container.pkl")
MODEL_PATH_WORKSTATION = os.path.join(MODEL_DIR, "isolation_forest_workstation.pkl")

# Default model path maintained for backward compatibility
MODEL_PATH = MODEL_PATH_VM

KAGGLE_DATA_PATH = os.path.join(DATA_DIR, "kaggle_server_metrics.csv")
HELD_OUT_VM_PATH = os.path.join(DATA_DIR, "held_out_test_metrics.csv")
HELD_OUT_CONTAINER_PATH = os.path.join(DATA_DIR, "held_out_container_metrics.csv")
HELD_OUT_WORKSTATION_PATH = os.path.join(DATA_DIR, "held_out_workstation_metrics.csv")

FEATURE_COLUMNS = [
    "cpu_usage",
    "memory_usage",
    "disk_usage",
    "network_sent",
    "running_processes"
]

def load_kaggle_dataset(csv_path=KAGGLE_DATA_PATH):
    """Loads Kaggle server telemetry data for the Cloud VM environment."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Kaggle dataset file not found at: {csv_path}")
    df = pd.read_csv(csv_path)
    return df[FEATURE_COLUMNS]

def train_cloud_vm_model(data_path=KAGGLE_DATA_PATH):
    """Trains the primary Cloud VM Isolation Forest on real Kaggle server metrics."""
    X = load_kaggle_dataset(data_path)
    model = IsolationForest(n_estimators=100, contamination=0.09, random_state=42)
    model.fit(X)
    with open(MODEL_PATH_VM, "wb") as f:
        pickle.dump(model, f)
    print(f"Cloud VM model trained on {len(X)} Kaggle samples -> {MODEL_PATH_VM}")
    return model

def generate_container_data(seed=42, n_norm=4000, n_anom=400):
    """Generates synthetic dataset parameterized for containerized microservice profiles."""
    np.random.seed(seed)
    norm_df = pd.DataFrame({
        "cpu_usage": np.random.uniform(5.0, 45.0, n_norm).round(1),
        "memory_usage": np.random.uniform(45.0, 78.0, n_norm).round(1),
        "disk_usage": np.random.uniform(60.0, 85.0, n_norm).round(1),
        "network_sent": np.random.exponential(5.0, n_norm).clip(0, 150).round(1),
        "running_processes": np.random.randint(2, 11, n_norm),
        "is_anomaly_ground_truth": 0
    })
    anom_df = pd.DataFrame({
        "cpu_usage": np.random.uniform(85.0, 100.0, n_anom).round(1),
        "memory_usage": np.random.uniform(88.0, 99.0, n_anom).round(1),
        "disk_usage": np.random.uniform(90.0, 99.0, n_anom).round(1),
        "network_sent": np.random.uniform(250.0, 2000.0, n_anom).round(1),
        "running_processes": np.random.randint(25, 100, n_anom),
        "is_anomaly_ground_truth": 1
    })
    return pd.concat([norm_df, anom_df]).sample(frac=1.0, random_state=seed).reset_index(drop=True)

def train_container_model():
    """Trains container-calibrated Isolation Forest model using training seed."""
    df_train = generate_container_data(seed=42, n_norm=4000, n_anom=400)
    model = IsolationForest(n_estimators=100, contamination=0.09, random_state=42)
    model.fit(df_train[FEATURE_COLUMNS])
    with open(MODEL_PATH_CONTAINER, "wb") as f:
        pickle.dump(model, f)
        
    # Generate and save independent held-out container test set with separate seed
    df_test = generate_container_data(seed=999, n_norm=4000, n_anom=1000)
    df_test.to_csv(HELD_OUT_CONTAINER_PATH, index=False)
    print(f"Container model trained on {len(df_train)} samples -> {MODEL_PATH_CONTAINER}")
    return model

def generate_workstation_data(seed=42, n_norm=4000, n_anom=400):
    """Generates synthetic dataset parameterized for developer desktop workstation profiles."""
    np.random.seed(seed)
    norm_df = pd.DataFrame({
        "cpu_usage": np.random.uniform(5.0, 50.0, n_norm).round(1),
        "memory_usage": np.random.uniform(35.0, 70.0, n_norm).round(1),
        "disk_usage": np.random.uniform(50.0, 80.0, n_norm).round(1),
        "network_sent": np.random.exponential(5.0, n_norm).clip(0, 150).round(1),
        "running_processes": np.random.randint(180, 290, n_norm),
        "is_anomaly_ground_truth": 0
    })
    anom_df = pd.DataFrame({
        "cpu_usage": np.random.uniform(90.0, 100.0, n_anom).round(1),
        "memory_usage": np.random.uniform(88.0, 99.0, n_anom).round(1),
        "disk_usage": np.random.uniform(92.0, 99.0, n_anom).round(1),
        "network_sent": np.random.uniform(300.0, 3000.0, n_anom).round(1),
        "running_processes": np.random.randint(450, 800, n_anom),
        "is_anomaly_ground_truth": 1
    })
    return pd.concat([norm_df, anom_df]).sample(frac=1.0, random_state=seed).reset_index(drop=True)

def train_workstation_model():
    """Trains workstation-calibrated Isolation Forest model using training seed."""
    df_train = generate_workstation_data(seed=42, n_norm=4000, n_anom=400)
    model = IsolationForest(n_estimators=100, contamination=0.09, random_state=42)
    model.fit(df_train[FEATURE_COLUMNS])
    with open(MODEL_PATH_WORKSTATION, "wb") as f:
        pickle.dump(model, f)
        
    # Generate and save independent held-out workstation test set with separate seed
    df_test = generate_workstation_data(seed=999, n_norm=4000, n_anom=1000)
    df_test.to_csv(HELD_OUT_WORKSTATION_PATH, index=False)
    print(f"Workstation model trained on {len(df_train)} samples -> {MODEL_PATH_WORKSTATION}")
    return model

def train_all_models():
    """Trains all environment-calibrated models."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    m_vm = train_cloud_vm_model()
    m_container = train_container_model()
    m_workstation = train_workstation_model()
    return {"cloud_vm": m_vm, "cloud_container": m_container, "workstation": m_workstation}

def train_isolation_forest(data_path=KAGGLE_DATA_PATH):
    """Compatibility wrapper that ensures all models are trained."""
    models = train_all_models()
    return models["cloud_vm"]

def run_evaluation(model_path, test_path, env_name):
    """Computes binary classification metrics and correctly oriented ROC AUC."""
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    test_df = pd.read_csv(test_path)
    X_test = test_df[FEATURE_COLUMNS]
    y_true = test_df["is_anomaly_ground_truth"].values
    
    raw_preds = model.predict(X_test)
    y_pred = (raw_preds == -1).astype(int)
    
    # Correctly oriented anomaly score: negative decision_function indicates higher anomaly likelihood
    anomaly_scores = -model.decision_function(X_test)
    
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    precision = precision_score(y_true, y_pred)
    recall = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    auc = roc_auc_score(y_true, anomaly_scores)
    
    metrics = {
        "environment": env_name,
        "total_test_samples": len(test_df),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "false_positive_rate": round(float(fpr), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(auc), 4)
    }
    
    print(f"=== {env_name.upper()} Held-Out Evaluation ===")
    print(f"Samples: {metrics['total_test_samples']} | CM: [TN={tn}, FP={fp}, FN={fn}, TP={tp}]")
    print(f"Precision: {metrics['precision']} | Recall: {metrics['recall']} | FPR: {metrics['false_positive_rate']} | F1: {metrics['f1_score']} | ROC AUC: {metrics['roc_auc']}\n")
    return metrics

def evaluate_all():
    """Evaluates all three environment models against their independent held-out datasets."""
    m_vm = run_evaluation(MODEL_PATH_VM, HELD_OUT_VM_PATH, "Cloud VM (Kaggle)")
    m_c = run_evaluation(MODEL_PATH_CONTAINER, HELD_OUT_CONTAINER_PATH, "Cloud Container (Render)")
    m_w = run_evaluation(MODEL_PATH_WORKSTATION, HELD_OUT_WORKSTATION_PATH, "Workstation (Windows)")
    return {"cloud_vm": m_vm, "cloud_container": m_c, "workstation": m_w}

if __name__ == "__main__":
    train_all_models()
    evaluate_all()
