import sys
import os
from flask import Flask, jsonify

# Add backend directory to path so we can import the Flask app
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Try to import the main Flask app from backend
try:
    from app import app
    print("[Vercel] ✅ Successfully imported Flask app from backend")
except ImportError as e:
    print(f"[Vercel] ❌ ERROR: Failed to import app: {e}")
    import traceback
    traceback.print_exc()
    
    # Fallback - create a basic Flask app
    app = Flask(__name__)
    
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'error',
            'error': 'Failed to load backend app',
            'details': str(e)
        }), 500

# Add a simple test endpoint that always works
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'ok',
        'message': 'Serverless function is working!',
        'environment': 'Vercel'
    })

# The app is exported and will be used by Vercel's Python runtime
