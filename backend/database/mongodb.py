import os
from pymongo import MongoClient

def load_env_file():
    """Simple helper to load key-value pairs from .env file into os.environ if present."""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ.setdefault(key.strip(), val.strip())

load_env_file()

class MongoDBManager:
    """
    Manages connection to local MongoDB instance and provides access to collections.
    Collections:
      - monitoring_data: Stores real-time psutil metrics records
      - alerts: Stores automated anomaly detection alerts
      - predictions: Stores ML model prediction outputs
    """
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
        db_name = os.environ.get("MONGO_DB_NAME", "ai_smart_monitor")
        
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
            # Send a ping to confirm connection
            self.client.admin.command('ping')
            self.db = self.client[db_name]
            print(f"  Connected to MongoDB successfully! [Database: {db_name}]")
        except Exception as e:
            print(f"⚠️ MongoDB Connection Warning: {e}")
            self.db = None

    def get_collection(self, collection_name):
        if self.db is not None:
            return self.db[collection_name]
        return None

# Singleton database manager instance
db_manager = MongoDBManager()
