/**
 * Wonder Bread Order/Cart Page
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder, getOrders } from "../services/api";
import "./OrderPage.css";

function OrderPage() {
  const navigate = useNavigate();
  const cartContext = useCart();
  const cartItems = cartContext?.cart || [];
  const removeFromCart = cartContext?.removeFromCart || (() => {});
  const updateQuantity = cartContext?.updateQuantity || (() => {});
  const clearCart = cartContext?.clearCart || (() => {});
  const getCartTotal = cartContext?.getTotal || (() => 0);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("cart");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/wonder-bread/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load orders when tab changes to ongoing or completed
  useEffect(() => {
    if (
      (activeTab === "ongoing" || activeTab === "completed") &&
      isAuthenticated
    ) {
      loadOrders();
    }
  }, [activeTab, isAuthenticated]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="order-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert("Please login to complete your order");
      navigate("/wonder-bread/login");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: getCartTotal(),
        delivery_address_id: null, // Will be set in future version
      };

      console.log("Creating order with data:", orderData);
      const response = await createOrder(orderData);
      console.log("Order created successfully:", response);
      clearCart();
      navigate("/wonder-bread/tracking");
    } catch (err) {
      console.error("Order creation error:", err);
      console.error("Error details:", err.message);
      setError(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="order-page">
        <div className="order-header">
          <button
            className="back-btn"
            onClick={() => navigate("/wonder-bread/menu")}
          >
            ← Orders
          </button>
        </div>

        <div className="order-tabs">
          <button
            className={`tab ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => setActiveTab("cart")}
          >
            My Cart
          </button>
          <button
            className={`tab ${activeTab === "ongoing" ? "active" : ""}`}
            onClick={() => setActiveTab("ongoing")}
          >
            Ongoing
          </button>
          <button
            className={`tab ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
        </div>

        <div className="order-container">
          {activeTab === "cart" && (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some fresh bread to get started!</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/wonder-bread/menu")}
              >
                Browse Menu
              </button>
            </div>
          )}

          {activeTab === "ongoing" && (
            <div className="tab-content orders-tab">
              {ordersLoading ? (
                <div className="loading">Loading orders...</div>
              ) : orders.some((o) =>
                  [
                    "pending",
                    "confirmed",
                    "baking",
                    "ready",
                    "out_for_delivery",
                  ].includes(o.status || "pending"),
                ) ? (
                <div className="orders-list">
                  {orders.map((order) => {
                    const orderStatus = order.status || "pending";
                    const isOngoing = [
                      "pending",
                      "confirmed",
                      "baking",
                      "ready",
                      "out_for_delivery",
                    ].includes(orderStatus);

                    if (!isOngoing) return null;

                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-header-row">
                          <div className="order-location">
                            <p className="location-name">Order #{order.id}</p>
                            <p className="location-date">
                              {new Date(order.created_at).toLocaleDateString()}{" "}
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="order-amount">
                            <p className="amount">
                              ₦{order.total.toLocaleString()}
                            </p>
                            <p className="order-id">ORDER {order.id}</p>
                          </div>
                        </div>

                        <div className="order-status-section">
                          <p className="status-label">
                            Status:{" "}
                            <strong>
                              {orderStatus.replace("_", " ").toUpperCase()}
                            </strong>
                          </p>
                          <div className="status-bar">
                            <div className="progress-container">
                              <div className="progress-line"></div>
                            </div>
                          </div>
                          <p className="status-time">
                            Placed -{" "}
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>

                        <button
                          className="track-btn"
                          onClick={() => navigate(`/wonder-bread/tracking`)}
                        >
                          TRACK ORDER →
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state ongoing-empty">
                  <div className="empty-icon">📦</div>
                  <h2>No active orders</h2>
                  <p>Start your first order and it will appear here</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/wonder-bread/menu")}
                  >
                    Place an Order
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="tab-content orders-tab">
              {ordersLoading ? (
                <div className="loading">Loading orders...</div>
              ) : orders.some((o) =>
                  ["delivered", "cancelled"].includes(o.status || "pending"),
                ) ? (
                <div className="orders-list">
                  {orders.map((order) => {
                    const orderStatus = order.status || "pending";
                    const isCompleted = ["delivered", "cancelled"].includes(
                      orderStatus,
                    );

                    if (!isCompleted) return null;

                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-header-row">
                          <div className="order-location">
                            <p className="location-name">Order #{order.id}</p>
                            <p className="location-date">
                              {new Date(order.created_at).toLocaleDateString()}{" "}
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="order-amount">
                            <p className="amount">
                              ₦{order.total.toLocaleString()}
                            </p>
                            <p className="order-id">ORDER {order.id}</p>
                          </div>
                        </div>

                        <div className="order-status-section">
                          <p className="status-label">
                            Status:{" "}
                            <strong>
                              {orderStatus.replace("_", " ").toUpperCase()}
                            </strong>
                          </p>
                          <div className="status-bar">
                            <div className="progress-container">
                              <div
                                className="progress-line"
                                style={{ width: "100%" }}
                              ></div>
                            </div>
                          </div>
                          <p className="status-time">
                            {orderStatus === "delivered"
                              ? "Delivered"
                              : "Cancelled"}
                          </p>
                        </div>

                        <button
                          className="track-btn"
                          onClick={() => navigate(`/wonder-bread/tracking`)}
                        >
                          TRACK ORDER →
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state completed-empty">
                  <div className="empty-icon">✓</div>
                  <h2>No completed orders yet</h2>
                  <p>Your delivered orders will show up here</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/wonder-bread/menu")}
                  >
                    Order Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-header">
        <button
          className="back-btn"
          onClick={() => navigate("/wonder-bread/menu")}
        >
          ← Orders
        </button>
      </div>

      <div className="order-tabs">
        <button
          className={`tab ${activeTab === "cart" ? "active" : ""}`}
          onClick={() => setActiveTab("cart")}
        >
          My Cart
        </button>
        <button
          className={`tab ${activeTab === "ongoing" ? "active" : ""}`}
          onClick={() => setActiveTab("ongoing")}
        >
          Ongoing
        </button>
        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      <div className="order-container">
        {activeTab === "cart" && (
          <div className="tab-content cart-tab">
            {error && <div className="error-message">{error}</div>}

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    <img
                      src={`/images/${item.image}`}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/images/placeholder-bread.jpg";
                      }}
                    />
                  </div>

                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-weight">{item.weight}</p>
                    <p className="item-price">
                      ₦{item.price.toLocaleString()} each
                    </p>
                  </div>

                  <div className="item-quantity">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <p className="total-label">Total</p>
                    <p className="total-amount">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₦{getCartTotal().toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Delivery:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₦{getCartTotal().toLocaleString()}</span>
              </div>

              <button
                className="btn btn-primary btn-full checkout-btn"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>

              <button
                className="btn btn-secondary btn-full"
                onClick={() => navigate("/wonder-bread/menu")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {(activeTab === "ongoing" || activeTab === "completed") && (
          <div className="tab-content orders-tab">
            {ordersLoading ? (
              <div className="loading">Loading orders...</div>
            ) : activeTab === "ongoing" ? (
              orders.some((o) =>
                [
                  "pending",
                  "confirmed",
                  "baking",
                  "ready",
                  "out_for_delivery",
                ].includes(o.status || "pending"),
              ) ? (
                <div className="orders-list">
                  {orders.map((order) => {
                    const orderStatus = order.status || "pending";
                    const isOngoing = [
                      "pending",
                      "confirmed",
                      "baking",
                      "ready",
                      "out_for_delivery",
                    ].includes(orderStatus);

                    if (!isOngoing) return null;

                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-header-row">
                          <div className="order-location">
                            <p className="location-name">Order #{order.id}</p>
                            <p className="location-date">
                              {new Date(order.created_at).toLocaleDateString()}{" "}
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="order-amount">
                            <p className="amount">
                              ₦{order.total.toLocaleString()}
                            </p>
                            <p className="order-id">ORDER {order.id}</p>
                          </div>
                        </div>

                        <div className="order-status-section">
                          <p className="status-label">
                            Status:{" "}
                            <strong>
                              {orderStatus.replace("_", " ").toUpperCase()}
                            </strong>
                          </p>
                          <div className="status-bar">
                            <div className="progress-container">
                              <div className="progress-line"></div>
                            </div>
                          </div>
                          <p className="status-time">
                            Placed -{" "}
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>

                        <button
                          className="track-btn"
                          onClick={() => navigate(`/wonder-bread/tracking`)}
                        >
                          TRACK ORDER →
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state ongoing-empty">
                  <div className="empty-icon">📦</div>
                  <h2>No active orders</h2>
                  <p>Start your first order and it will appear here</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("cart")}
                  >
                    Back to Cart
                  </button>
                </div>
              )
            ) : orders.some((o) =>
                ["delivered", "cancelled"].includes(o.status || "pending"),
              ) ? (
              <div className="orders-list">
                {orders.map((order) => {
                  const orderStatus = order.status || "pending";
                  const isCompleted = ["delivered", "cancelled"].includes(
                    orderStatus,
                  );

                  if (!isCompleted) return null;

                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-header-row">
                        <div className="order-location">
                          <p className="location-name">Order #{order.id}</p>
                          <p className="location-date">
                            {new Date(order.created_at).toLocaleDateString()}{" "}
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="order-amount">
                          <p className="amount">
                            ₦{order.total.toLocaleString()}
                          </p>
                          <p className="order-id">ORDER {order.id}</p>
                        </div>
                      </div>

                      <div className="order-status-section">
                        <p className="status-label">
                          Status:{" "}
                          <strong>
                            {orderStatus.replace("_", " ").toUpperCase()}
                          </strong>
                        </p>
                        <div className="status-bar">
                          <div className="progress-container">
                            <div
                              className="progress-line"
                              style={{ width: "100%" }}
                            ></div>
                          </div>
                        </div>
                        <p className="status-time">
                          {orderStatus === "delivered"
                            ? "Delivered"
                            : "Cancelled"}
                        </p>
                      </div>

                      <button
                        className="track-btn"
                        onClick={() => navigate(`/wonder-bread/tracking`)}
                      >
                        TRACK ORDER →
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state completed-empty">
                <div className="empty-icon">✓</div>
                <h2>No completed orders yet</h2>
                <p>Your delivered orders will show up here</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab("cart")}
                >
                  Back to Cart
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderPage;
