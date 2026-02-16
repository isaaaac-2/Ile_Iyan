"""
Tests for Wonder Bread Backend API
"""

import os
import sys
import unittest
import json
import tempfile

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from wonder_bread_app import app, init_db_if_needed
from init_wonder_bread_db import init_database


class WonderBreadAPITestCase(unittest.TestCase):
    """Test cases for Wonder Bread API."""
    
    def setUp(self):
        """Set up test client and test database."""
        # Create temporary database
        self.db_fd, app.config['DATABASE'] = tempfile.mkstemp()
        self.test_db_path = os.path.join(tempfile.gettempdir(), 'test_wonder_bread.db')
        
        # Initialize test database
        init_database(self.test_db_path)
        
        # Update app to use test database
        import wonder_bread_app
        wonder_bread_app.DB_PATH = self.test_db_path
        
        app.config['TESTING'] = True
        app.config['JWT_SECRET_KEY'] = 'test-secret-key'
        self.client = app.test_client()
        
        # Test user data
        self.test_user = {
            'email': 'test@wonderbread.com',
            'password': 'testpass123',
            'name': 'Test User',
            'phone': '08012345678'
        }
    
    def tearDown(self):
        """Clean up after tests."""
        os.close(self.db_fd)
        if os.path.exists(self.test_db_path):
            os.unlink(self.test_db_path)
    
    def test_root_endpoint(self):
        """Test root endpoint returns API info."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['service'], 'Wonder Bread API')
        self.assertIn('endpoints', data)
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
    
    def test_get_menu(self):
        """Test menu endpoint returns bread products."""
        response = self.client.get('/api/menu')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('products', data)
        self.assertTrue(len(data['products']) > 0)
        
        # Check large loaf is ₦1000
        large_loaf = next((p for p in data['products'] if p['id'] == 'large_loaf'), None)
        self.assertIsNotNone(large_loaf)
        self.assertEqual(large_loaf['price'], 1000)
    
    def test_user_registration(self):
        """Test user registration."""
        response = self.client.post('/api/auth/register',
                                   data=json.dumps(self.test_user),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
        self.assertEqual(data['user']['email'], self.test_user['email'])
    
    def test_user_registration_duplicate_email(self):
        """Test registration with duplicate email fails."""
        # Register first user
        self.client.post('/api/auth/register',
                        data=json.dumps(self.test_user),
                        content_type='application/json')
        
        # Try to register again with same email
        response = self.client.post('/api/auth/register',
                                   data=json.dumps(self.test_user),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_user_login(self):
        """Test user login."""
        # Register user first
        self.client.post('/api/auth/register',
                        data=json.dumps(self.test_user),
                        content_type='application/json')
        
        # Login
        login_data = {
            'email': self.test_user['email'],
            'password': self.test_user['password']
        }
        response = self.client.post('/api/auth/login',
                                   data=json.dumps(login_data),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('access_token', data)
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials fails."""
        login_data = {
            'email': 'nonexistent@test.com',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/auth/login',
                                   data=json.dumps(login_data),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 401)
    
    def test_get_current_user(self):
        """Test getting current authenticated user."""
        # Register and get token
        reg_response = self.client.post('/api/auth/register',
                                       data=json.dumps(self.test_user),
                                       content_type='application/json')
        token = json.loads(reg_response.data)['access_token']
        
        # Get current user
        headers = {'Authorization': f'Bearer {token}'}
        response = self.client.get('/api/auth/user', headers=headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['email'], self.test_user['email'])
    
    def test_protected_route_without_token(self):
        """Test that protected routes require authentication."""
        response = self.client.get('/api/profile')
        self.assertEqual(response.status_code, 401)
    
    def test_get_profile(self):
        """Test getting user profile."""
        # Register and get token
        reg_response = self.client.post('/api/auth/register',
                                       data=json.dumps(self.test_user),
                                       content_type='application/json')
        token = json.loads(reg_response.data)['access_token']
        
        # Get profile
        headers = {'Authorization': f'Bearer {token}'}
        response = self.client.get('/api/profile', headers=headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('user', data)
        self.assertIn('addresses', data)
        self.assertIn('preferences', data)
    
    def test_add_address(self):
        """Test adding delivery address."""
        # Register and get token
        reg_response = self.client.post('/api/auth/register',
                                       data=json.dumps(self.test_user),
                                       content_type='application/json')
        token = json.loads(reg_response.data)['access_token']
        
        # Add address
        address_data = {
            'street': '123 Test Street',
            'city': 'Lagos',
            'state': 'Lagos',
            'postal_code': '100001',
            'is_default': 1
        }
        headers = {'Authorization': f'Bearer {token}'}
        response = self.client.post('/api/profile/addresses',
                                   data=json.dumps(address_data),
                                   content_type='application/json',
                                   headers=headers)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('address', data)
        self.assertEqual(data['address']['street'], '123 Test Street')
    
    def test_create_order(self):
        """Test creating an order."""
        # Register and get token
        reg_response = self.client.post('/api/auth/register',
                                       data=json.dumps(self.test_user),
                                       content_type='application/json')
        token = json.loads(reg_response.data)['access_token']
        
        # Create order
        order_data = {
            'items': [
                {'product_id': 'large_loaf', 'quantity': 2},
                {'product_id': 'whole_wheat', 'quantity': 1}
            ]
        }
        headers = {'Authorization': f'Bearer {token}'}
        response = self.client.post('/api/orders',
                                   data=json.dumps(order_data),
                                   content_type='application/json',
                                   headers=headers)
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn('order', data)
        self.assertEqual(data['order']['total'], 3200)  # (1000*2) + (1200*1)
    
    def test_get_orders(self):
        """Test getting user orders."""
        # Register and get token
        reg_response = self.client.post('/api/auth/register',
                                       data=json.dumps(self.test_user),
                                       content_type='application/json')
        token = json.loads(reg_response.data)['access_token']
        
        # Create order
        order_data = {
            'items': [
                {'product_id': 'large_loaf', 'quantity': 1}
            ]
        }
        headers = {'Authorization': f'Bearer {token}'}
        self.client.post('/api/orders',
                        data=json.dumps(order_data),
                        content_type='application/json',
                        headers=headers)
        
        # Get orders
        response = self.client.get('/api/orders', headers=headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('orders', data)
        self.assertTrue(len(data['orders']) > 0)
    
    def test_get_order_by_id(self):
        """Test getting specific order with tracking."""
        # Register and get token
        reg_response = self.client.post('/api/auth/register',
                                       data=json.dumps(self.test_user),
                                       content_type='application/json')
        token = json.loads(reg_response.data)['access_token']
        
        # Create order
        order_data = {
            'items': [
                {'product_id': 'large_loaf', 'quantity': 1}
            ]
        }
        headers = {'Authorization': f'Bearer {token}'}
        create_response = self.client.post('/api/orders',
                                          data=json.dumps(order_data),
                                          content_type='application/json',
                                          headers=headers)
        order_id = json.loads(create_response.data)['order']['id']
        
        # Get order by ID
        response = self.client.get(f'/api/orders/{order_id}', headers=headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('order', data)
        self.assertIn('tracking', data['order'])
    
    def test_update_preferences(self):
        """Test updating notification preferences."""
        # Register and get token
        reg_response = self.client.post('/api/auth/register',
                                       data=json.dumps(self.test_user),
                                       content_type='application/json')
        token = json.loads(reg_response.data)['access_token']
        
        # Update preferences
        prefs_data = {
            'email_notifications': False,
            'sms_notifications': True,
            'promotional_offers': False
        }
        headers = {'Authorization': f'Bearer {token}'}
        response = self.client.put('/api/profile/preferences',
                                   data=json.dumps(prefs_data),
                                   content_type='application/json',
                                   headers=headers)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('preferences', data)


if __name__ == '__main__':
    unittest.main()
