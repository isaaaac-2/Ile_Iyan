"""
Wonder Bread - Affordable Bakery Backend API
Flask application for managing orders, authentication, and user profiles.
"""

import os
import sqlite3
import json
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, 
    get_jwt_identity, get_jwt
)

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'wonder-bread-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
CORS(app)

jwt = JWTManager(app)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'wonder_bread.db')

# Product catalog - Bread only
BREAD_PRODUCTS = [
    {
        "id": "large_loaf",
        "name": "Large Loaf",
        "description": "Our signature large loaf - affordable quality at ₦1000 (vs ₦1500 market price). Fresh baked daily, stays soft for 5+ days.",
        "price": 1000,
        "weight": "800g",
        "image": "large_loaf.jpg",
        "available": True
    },
    {
        "id": "medium_loaf",
        "name": "Medium Loaf",
        "description": "Perfect size for small families. Same quality, smaller portion.",
        "price": 700,
        "weight": "500g",
        "image": "medium_loaf.jpg",
        "available": True
    },
    {
        "id": "small_loaf",
        "name": "Small Loaf",
        "description": "Individual serving size. Great for breakfast or snacks.",
        "price": 500,
        "weight": "300g",
        "image": "small_loaf.jpg",
        "available": True
    },
    {
        "id": "sliced_large",
        "name": "Sliced Bread (Large)",
        "description": "Pre-sliced for your convenience. 20 slices per loaf.",
        "price": 1000,
        "weight": "800g",
        "image": "sliced_large.jpg",
        "available": True
    },
    {
        "id": "sliced_small",
        "name": "Sliced Bread (Small)",
        "description": "Pre-sliced small loaf. 12 slices per loaf.",
        "price": 600,
        "weight": "400g",
        "image": "sliced_small.jpg",
        "available": True
    },
    {
        "id": "whole_wheat",
        "name": "Whole Wheat Bread",
        "description": "Healthy whole wheat option. Rich in fiber and nutrients.",
        "price": 1200,
        "weight": "750g",
        "image": "whole_wheat.jpg",
        "available": True
    }
]

# ─── Database Helper Functions ────────────────────────────────────────────────

def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db_if_needed():
    """Initialize database if it doesn't exist."""
    if not os.path.exists(DB_PATH):
        from init_db import init_database
        init_database(DB_PATH)

def get_current_user_id():
    """Get current authenticated user ID from JWT token."""
    user_id_str = get_jwt_identity()
    return int(user_id_str)

# ─── Root Route ───────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def index():
    """Root endpoint - API information."""
    return jsonify({
        "service": "Wonder Bread API",
        "version": "1.0.0",
        "description": "Backend API for Wonder Bread - Affordable quality bakery",
        "tagline": "Quality Bread, Prices That Make Sense",
        "endpoints": {
            "menu": "/api/menu",
            "auth": {
                "register": "/api/auth/register",
                "login": "/api/auth/login",
                "logout": "/api/auth/logout",
                "user": "/api/auth/user"
            },
            "profile": {
                "get": "/api/profile",
                "update": "/api/profile",
                "addresses": "/api/profile/addresses",
                "preferences": "/api/profile/preferences"
            },
            "orders": {
                "create": "/api/orders",
                "list": "/api/orders",
                "details": "/api/orders/:id"
            }
        }
    })

# ─── Menu Endpoint ────────────────────────────────────────────────────────────

@app.route("/api/menu", methods=["GET"])
def get_menu():
    """Get bread products menu."""
    return jsonify({
        "products": BREAD_PRODUCTS,
        "message": "Fresh baked daily. Large loaf at ₦1000 - Save ₦500 vs market price!"
    })

# ─── Authentication Endpoints ─────────────────────────────────────────────────

@app.route("/api/auth/register", methods=["POST"])
def register():
    """Register a new user."""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'name']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    name = data['name'].strip()
    phone = data.get('phone', '').strip()
    promotional_offers = data.get('promotional_offers', True)
    
    # Validate email format
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Invalid email format"}), 400
    
    # Validate password strength
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    
    # Hash password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Insert user
        cursor.execute(
            'INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)',
            (email, password_hash, name, phone)
        )
        user_id = cursor.lastrowid
        
        # Create default preferences
        cursor.execute(
            'INSERT INTO preferences (user_id, email_notifications, sms_notifications, promotional_offers) VALUES (?, ?, ?, ?)',
            (user_id, 1, 1, 1 if promotional_offers else 0)
        )
        
        conn.commit()
        conn.close()
        
        # Create access token (identity must be a string)
        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": user_id,
                "email": email,
                "name": name,
                "phone": phone
            },
            "access_token": access_token
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already registered"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    """Login user."""
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email and password required"}), 400
    
    email = data['email'].lower().strip()
    password = data['password']
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Create access token (identity must be a string)
        access_token = create_access_token(identity=str(user['id']))
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "phone": user['phone']
            },
            "access_token": access_token
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/logout", methods=["POST"])
@jwt_required()
def logout():
    """Logout user (client should discard token)."""
    return jsonify({"message": "Logout successful"}), 200

@app.route("/api/auth/user", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current authenticated user."""
    user_id = get_current_user_id()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id, email, name, phone, created_at FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "phone": user['phone'],
            "created_at": user['created_at']
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── Profile Management Endpoints ─────────────────────────────────────────────

@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Get user profile with addresses and preferences."""
    user_id = get_current_user_id()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get user info
        cursor.execute('SELECT id, email, name, phone, created_at FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        # Get addresses
        cursor.execute('SELECT * FROM addresses WHERE user_id = ?', (user_id,))
        addresses = [dict(row) for row in cursor.fetchall()]
        
        # Get preferences
        cursor.execute('SELECT * FROM preferences WHERE user_id = ?', (user_id,))
        prefs = cursor.fetchone()
        preferences = dict(prefs) if prefs else {
            "email_notifications": 1,
            "sms_notifications": 1,
            "promotional_offers": 1
        }
        
        conn.close()
        
        return jsonify({
            "user": dict(user),
            "addresses": addresses,
            "preferences": preferences
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Update user profile information."""
    user_id = get_current_user_id()
    data = request.get_json()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Update allowed fields
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append('name = ?')
            update_values.append(data['name'])
        
        if 'phone' in data:
            update_fields.append('phone = ?')
            update_values.append(data['phone'])
        
        if update_fields:
            update_values.append(user_id)
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, update_values)
            conn.commit()
        
        # Get updated user
        cursor.execute('SELECT id, email, name, phone FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": dict(user)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile/addresses", methods=["GET"])
@jwt_required()
def get_addresses():
    """Get user delivery addresses."""
    user_id = get_current_user_id()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM addresses WHERE user_id = ?', (user_id,))
        addresses = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({"addresses": addresses}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile/addresses", methods=["POST"])
@jwt_required()
def add_address():
    """Add a new delivery address."""
    user_id = get_current_user_id()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['street', 'city', 'state']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required address fields"}), 400
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # If this is set as default, unset other defaults
        is_default = data.get('is_default', 0)
        if is_default:
            cursor.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', (user_id,))
        
        # Insert new address
        cursor.execute(
            'INSERT INTO addresses (user_id, street, city, state, postal_code, is_default) VALUES (?, ?, ?, ?, ?, ?)',
            (user_id, data['street'], data['city'], data['state'], data.get('postal_code', ''), is_default)
        )
        address_id = cursor.lastrowid
        
        conn.commit()
        
        # Get created address
        cursor.execute('SELECT * FROM addresses WHERE id = ?', (address_id,))
        address = dict(cursor.fetchone())
        conn.close()
        
        return jsonify({
            "message": "Address added successfully",
            "address": address
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/profile/preferences", methods=["PUT"])
@jwt_required()
def update_preferences():
    """Update user notification preferences."""
    user_id = get_current_user_id()
    data = request.get_json()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if preferences exist
        cursor.execute('SELECT * FROM preferences WHERE user_id = ?', (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing preferences
            update_fields = []
            update_values = []
            
            if 'email_notifications' in data:
                update_fields.append('email_notifications = ?')
                update_values.append(1 if data['email_notifications'] else 0)
            
            if 'sms_notifications' in data:
                update_fields.append('sms_notifications = ?')
                update_values.append(1 if data['sms_notifications'] else 0)
            
            if 'promotional_offers' in data:
                update_fields.append('promotional_offers = ?')
                update_values.append(1 if data['promotional_offers'] else 0)
            
            if update_fields:
                update_values.append(user_id)
                query = f"UPDATE preferences SET {', '.join(update_fields)} WHERE user_id = ?"
                cursor.execute(query, update_values)
        else:
            # Insert new preferences
            cursor.execute(
                'INSERT INTO preferences (user_id, email_notifications, sms_notifications, promotional_offers) VALUES (?, ?, ?, ?)',
                (
                    user_id,
                    1 if data.get('email_notifications', True) else 0,
                    1 if data.get('sms_notifications', True) else 0,
                    1 if data.get('promotional_offers', True) else 0
                )
            )
        
        conn.commit()
        
        # Get updated preferences
        cursor.execute('SELECT * FROM preferences WHERE user_id = ?', (user_id,))
        preferences = dict(cursor.fetchone())
        conn.close()
        
        return jsonify({
            "message": "Preferences updated successfully",
            "preferences": preferences
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── Order Management Endpoints ───────────────────────────────────────────────

@app.route("/api/orders", methods=["POST"])
@jwt_required()
def create_order():
    """Create a new order."""
    user_id = get_current_user_id()
    data = request.get_json()
    
    # Validate required fields
    if 'items' not in data or not data['items']:
        return jsonify({"error": "Order must contain at least one item"}), 400
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Calculate total
        total = 0
        items = data['items']
        
        for item in items:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 1)
            
            # Find product
            product = next((p for p in BREAD_PRODUCTS if p['id'] == product_id), None)
            if not product:
                return jsonify({"error": f"Invalid product: {product_id}"}), 400
            
            if not product['available']:
                return jsonify({"error": f"Product not available: {product['name']}"}), 400
            
            total += product['price'] * quantity
        
        # Get delivery address
        delivery_address_id = data.get('delivery_address_id')
        if delivery_address_id:
            cursor.execute('SELECT * FROM addresses WHERE id = ? AND user_id = ?', (delivery_address_id, user_id))
            if not cursor.fetchone():
                return jsonify({"error": "Invalid delivery address"}), 400
        
        # Create order
        cursor.execute(
            'INSERT INTO orders (user_id, items, total, delivery_address_id, status) VALUES (?, ?, ?, ?, ?)',
            (user_id, json.dumps(items), total, delivery_address_id, 'pending')
        )
        order_id = cursor.lastrowid
        
        conn.commit()
        
        # Get created order
        cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
        order = dict(cursor.fetchone())
        order['items'] = json.loads(order['items'])
        
        conn.close()
        
        return jsonify({
            "message": "Order created successfully",
            "order": order
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders", methods=["GET"])
@jwt_required()
def get_orders():
    """Get user orders."""
    user_id = get_current_user_id()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', (user_id,))
        orders = []
        
        for row in cursor.fetchall():
            order = dict(row)
            order['items'] = json.loads(order['items'])
            orders.append(order)
        
        conn.close()
        
        return jsonify({"orders": orders}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders/<int:order_id>", methods=["GET"])
@jwt_required()
def get_order_by_id(order_id):
    """Get order by ID with tracking information."""
    user_id = get_current_user_id()
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', (order_id, user_id))
        order_row = cursor.fetchone()
        
        if not order_row:
            return jsonify({"error": "Order not found"}), 404
        
        order = dict(order_row)
        order['items'] = json.loads(order['items'])
        
        # Get delivery address if exists
        if order['delivery_address_id']:
            cursor.execute('SELECT * FROM addresses WHERE id = ?', (order['delivery_address_id'],))
            address_row = cursor.fetchone()
            order['delivery_address'] = dict(address_row) if address_row else None
        
        conn.close()
        
        # Add status tracking information
        status_order = ['pending', 'confirmed', 'baking', 'ready', 'out_for_delivery', 'delivered']
        current_status_index = status_order.index(order['status']) if order['status'] in status_order else 0
        
        order['tracking'] = {
            "current_status": order['status'],
            "status_index": current_status_index,
            "total_statuses": len(status_order),
            "estimated_delivery": "30-45 minutes"  # Placeholder
        }
        
        return jsonify({"order": order}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── Health Check ─────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Wonder Bread API",
        "tagline": "Quality Bread, Prices That Make Sense"
    })

# ─── Application Initialization ───────────────────────────────────────────────

if __name__ == "__main__":
    # Initialize database if needed
    init_db_if_needed()
    
    # Run on different port than Ile Iyan (5001 instead of 5000)
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    
    print(f"Wonder Bread API starting on port {port}...")
    print("Tagline: Quality Bread, Prices That Make Sense")
    
    app.run(debug=debug, host="0.0.0.0", port=port)
