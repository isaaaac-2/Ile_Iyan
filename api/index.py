import sys
import os
import logging

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
logger.info(f"Backend path: {backend_path}")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from app import app as flask_app
    logger.info("Successfully imported Flask app from backend")
except ImportError as e:
    logger.error(f"Error importing app: {e}")
    from flask import Flask
    from flask_cors import CORS
    
    flask_app = Flask(__name__)
    CORS(flask_app)
    
    @flask_app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'failed', 'error': 'Failed to load main app', 'details': str(e)}, 500

# Export the Flask app for Vercel serverless
app = flask_app
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
