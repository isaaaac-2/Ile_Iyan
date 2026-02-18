"""
Wonder Bread API Entry Point for Vercel
Routes requests to the Flask backend serverless function
"""
import os
import sys

# Add backend directory to path for imports
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import Flask app from backend
from wonder_bread_app import app

# Vercel serverless handler
def handler(request):
    return app(request)

# For local testing
if __name__ == '__main__':
    app.run(debug=True, port=5001)
