import os
import time
import psutil
from datetime import datetime
from database.mongodb import db_manager

def get_loopback_bytes_sent():
    """
    Extracts cumulative bytes_sent specifically on the loopback network interface.
    Identifies 'lo' on Linux/Unix or interface containing 'loopback' on Windows.
    """
    try:
        pernic = psutil.net_io_counters(pernic=True)
        for name, stats in pernic.items():
            if name.lower() == "lo" or "loopback" in name.lower():
                return stats.bytes_sent
    except Exception:
        pass
    return 0

def get_current_system_metrics(save_to_db=True):
    """
    Collects real-time system performance metrics using psutil,
    with exact unit, scope, and time basis consistency matching the ML training pipeline.
    Automatically persists the record into MongoDB monitoring_data collection.
    """
    # 1. Sample Loopback transmission rate over a precise 0.1s measurement window
    t1 = time.time()
    lo_b1 = get_loopback_bytes_sent()
    
    # 2. Total CPU utilization percent over the 0.1s interval (matches Kaggle cpu_total)
    cpu_percent = psutil.cpu_percent(interval=0.1)
    
    t2 = time.time()
    lo_b2 = get_loopback_bytes_sent()
    dt = max(t2 - t1, 0.001)
    
    # Loopback transmission rate in bytes/second (matches Kaggle network_lo_tx rate)
    lo_tx_rate = round(max(0.0, (lo_b2 - lo_b1) / dt), 1)
    
    # 3. Virtual memory usage percentage (matches Kaggle mem_percent)
    memory_percent = psutil.virtual_memory().percent
    
    # 4. Root partition disk usage percentage (matches Kaggle fs_/_percent)
    root_path = os.getenv('SYSTEMDRIVE', 'C:') + '\\' if os.name == 'nt' else '/'
    try:
        disk_percent = psutil.disk_usage(root_path).percent
    except Exception:
        disk_percent = psutil.disk_usage('/').percent
        
    # System-wide cumulative byte counters for dashboard display
    net_counters = psutil.net_io_counters()
    system_bytes_sent = net_counters.bytes_sent
    system_bytes_recv = net_counters.bytes_recv
    
    # 5. Total count of currently active processes (matches Kaggle processcount_total)
    running_processes_count = len(psutil.pids())
    
    timestamp_str = datetime.now().isoformat(timespec='seconds')
    
    metrics = {
        "cpu_usage": round(cpu_percent, 1),
        "memory_usage": round(memory_percent, 1),
        "disk_usage": round(disk_percent, 1),
        "network_sent": lo_tx_rate,
        "network_sent_system_total": system_bytes_sent,
        "network_received": system_bytes_recv,
        "running_processes": running_processes_count,
        "timestamp": timestamp_str
    }
    
    if save_to_db:
        save_monitoring_record(metrics)
        
    return metrics

def save_monitoring_record(metrics):
    """Saves a monitoring telemetry dict into MongoDB monitoring_data collection."""
    try:
        collection = db_manager.get_collection("monitoring_data")
        if collection is not None:
            record = dict(metrics)
            collection.insert_one(record)
    except Exception as e:
        print(f"⚠️ Failed to save record to MongoDB: {e}")

def get_monitoring_history(limit=50):
    """
    Retrieves historical monitoring records from MongoDB sorted by timestamp descending.
    """
    try:
        collection = db_manager.get_collection("monitoring_data")
        if collection is None:
            return []
            
        cursor = collection.find({}, {'_id': 0}).sort("timestamp", -1).limit(limit)
        return list(cursor)
    except Exception as e:
        print(f"⚠️ Error fetching monitoring history: {e}")
        return []
