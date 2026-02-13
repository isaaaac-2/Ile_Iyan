import sys
import os

# Add the backend directory to Python path to import app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import and export the Flask app for Vercel serverless functions
from app import app

# The app is automatically used by Vercel's Python runtime
