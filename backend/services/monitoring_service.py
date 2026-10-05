import os
import psutil
from datetime import datetime
from database.mongodb import db_manager

def get_current_system_metrics(save_to_db=True):
    """
    Collects real-time system performance metrics using psutil,
    and automatically persists the record into MongoDB monitoring_data collection.
    """
    # Sample CPU percent over a short interval (0.1s)
    cpu_percent = psutil.cpu_percent(interval=0.1)
    
    # Virtual memory usage percentage
    memory_percent = psutil.virtual_memory().percent
    
    # Disk usage percentage (Root drive C:\ on Windows or / on Linux)
    root_path = os.getenv('SYSTEMDRIVE', 'C:') + '\\' if os.name == 'nt' else '/'
    try:
        disk_percent = psutil.disk_usage(root_path).percent
    except Exception:
        disk_percent = psutil.disk_usage('/').percent
        
    # Network I/O byte counters
    net_counters = psutil.net_io_counters()
    bytes_sent = net_counters.bytes_sent
    bytes_recv = net_counters.bytes_recv
    
    # Total count of currently running processes
    running_processes_count = len(psutil.pids())
    
    # ISO 8601 formatted timestamp
    timestamp_str = datetime.now().isoformat(timespec='seconds')
    
    metrics = {
        "cpu_usage": round(cpu_percent, 1),
        "memory_usage": round(memory_percent, 1),
        "disk_usage": round(disk_percent, 1),
        "network_sent": bytes_sent,
        "network_received": bytes_recv,
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
            # Create a copy so MongoDB's _id assignment does not alter the original dict
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
