/**
 * Wonder Bread Profile Page
 * User dashboard with tabs for profile, orders, and settings
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getOrders } from '../services/api';
import './ProfilePage.css';

function ProfilePage({ onNavigate }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('login');
      return;
    }
    loadProfile();
    loadOrders();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || ''
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#2196F3',
      baking: '#FF9800',
      ready: '#4CAF50',
      out_for_delivery: '#9C27B0',
      delivered: '#4CAF50'
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Account</h1>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Order History
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Information</h2>
                {!editing ? (
                  <button className="btn btn-primary" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                ) : (
                  <div className="edit-buttons">
                    <button className="btn btn-primary" onClick={handleSaveProfile}>
                      Save
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: profile.name || '',
                          email: profile.email || '',
                          phone: profile.phone || ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="form-value">{profile?.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Order History</h2>
              {orders.length === 0 ? (
                <div className="no-orders">
                  <p>You haven't placed any orders yet.</p>
                  <button className="btn btn-primary" onClick={() => onNavigate('menu')}>
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-item">
                      <div className="order-header">
                        <div>
                          <h3>Order #{order.id}</h3>
                          <p className="order-date">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      <div className="order-items">
                        {JSON.parse(order.items).map((item, idx) => (
                          <div key={idx} className="order-item-detail">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-footer">
                        <span className="order-total">Total: ₦{order.total.toLocaleString()}</span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigate('tracking')}
                        >
                          Track Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
