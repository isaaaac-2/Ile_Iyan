import sys
import os

# Add the backend directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Export the Flask app for Vercel serverless
# Vercel's Python runtime will use this exported app
