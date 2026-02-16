"""
Database initialization script for Wonder Bread application.
Creates SQLite database with all required tables.
"""

import sqlite3
import os
from datetime import datetime


def init_database(db_path='wonder_bread.db'):
    """Initialize the Wonder Bread database with all required tables."""
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Addresses table
    cursor.execute('''
        CREATE TABLE addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            street TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            postal_code TEXT,
            is_default INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    # Orders table
    cursor.execute('''
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            items TEXT NOT NULL,
            total REAL NOT NULL,
            delivery_address_id INTEGER,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (delivery_address_id) REFERENCES addresses(id) ON DELETE SET NULL
        )
    ''')
    
    # Preferences table
    cursor.execute('''
        CREATE TABLE preferences (
            user_id INTEGER PRIMARY KEY,
            email_notifications INTEGER DEFAULT 1,
            sms_notifications INTEGER DEFAULT 1,
            promotional_offers INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()
    
    print(f"Database initialized successfully: {db_path}")
    print("Tables created: users, addresses, orders, preferences")


if __name__ == '__main__':
    init_database()
