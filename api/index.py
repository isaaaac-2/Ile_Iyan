import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app
# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from app import app
except ImportError as e:
    print(f"Error importing app: {e}")
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/', methods=['GET'])
    def error():
        return {'error': 'Failed to load main app'}, 500

# Export the Flask app for Vercel serverless
# Vercel will automatically use this 'app' variable
