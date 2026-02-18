"""
Wonder Bread API Entry Point for Vercel
Routes requests to the Flask backend
"""
import sys
import os

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app import app

# Export for Vercel
handler = app
