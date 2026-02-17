/**
 * Wonder Bread Order Tracking Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../services/api';
import './OrderTrackingPage.css';

function OrderStatusTracker({ status }) {
  const statuses = [
    { id: 'pending', label: 'Order Confirmed', icon: '✓' },
    { id: 'confirmed', label: 'Confirmed', icon: '✓' },
    { id: 'baking', label: 'Baking', icon: '🔄' },
    { id: 'ready', label: 'Ready', icon: '⏳' },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { id: 'delivered', label: 'Delivered', icon: '✓' }
  ];
  
  const currentIndex = statuses.findIndex(s => s.id === status);
  
  return (
    <div className="status-tracker">
      {statuses.map((s, i) => (
        <div
          key={s.id}
          className={`status-step ${i <= currentIndex ? 'completed' : ''} ${i === currentIndex ? 'active' : ''}`}
        >
          <div className="status-icon">{s.icon}</div>
          <div className="status-label">{s.label}</div>
          {i < statuses.length - 1 && <div className="status-line"></div>}
        </div>
      ))}
    </div>
  );
}

function OrderTrackingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/wonder-bread/login');
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      const activeOrders = (data.orders || []).filter(
        order => order.status !== 'delivered'
      );
      setOrders(activeOrders);
      if (activeOrders.length > 0) {
        setSelectedOrder(activeOrders[0]);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="tracking-page">
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No Active Orders</h2>
          <p>You don't have any orders in progress.</p>
          <button className="btn btn-primary" onClick={() => navigate('/wonder-bread/menu')}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <h1>Track Your Order</h1>

        {orders.length > 1 && (
          <div className="order-selector">
            <label>Select Order:</label>
            <select
              value={selectedOrder?.id}
              onChange={(e) => {
                const order = orders.find(o => o.id === parseInt(e.target.value));
                setSelectedOrder(order);
              }}
            >
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  Order #{order.id} - ₦{order.total.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedOrder && (
          <div className="order-tracking-details">
            <div className="order-info-card">
              <h2>Order #{selectedOrder.id}</h2>
              <p className="order-date">
                Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
              </p>
            </div>

            <OrderStatusTracker status={selectedOrder.status} />

            <div className="order-items-card">
              <h3>Order Items</h3>
              <div className="items-list">
                {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items).map((item, idx) => (
                  <div key={idx} className="tracking-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="item-price">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-total-row">
                <span>Total:</span>
                <span className="total-amount">₦{selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="estimated-delivery">
              <div className="delivery-icon">🚚</div>
              <div className="delivery-info">
                <h4>Estimated Delivery</h4>
                <p>
                  {selectedOrder.status === 'out_for_delivery'
                    ? 'Arriving today'
                    : selectedOrder.status === 'ready'
                    ? 'Ready for pickup/delivery'
                    : selectedOrder.status === 'baking'
                    ? 'Baking in progress - Ready in 30-45 minutes'
                    : 'Processing your order'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderTrackingPage;
