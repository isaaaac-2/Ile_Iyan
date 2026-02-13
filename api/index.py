import sys
import os

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

try:
    from app import app
    print("[Vercel] Successfully imported Flask app from backend")
except ImportError as e:
    print(f"[Vercel] ERROR: Failed to import app: {e}")
    import traceback
    traceback.print_exc()
    
    # Fallback - create a basic Flask app
    from flask import Flask, jsonify
    app = Flask(__name__)
    
    @app.route('/api/health')
    def health():
        return jsonify({'error': 'Backend import failed', 'details': str(e)})
