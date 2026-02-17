/**
 * Wonder Bread Order/Cart Page
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/api";
import "./OrderPage.css";

function OrderPage() {
  const navigate = useNavigate();
  const cartContext = useCart();
  const cartItems = cartContext?.cart || [];
  const {
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal: getCartTotal,
  } = cartContext || {};
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/wonder-bread/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="order-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

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
      alert("Your cart is empty");
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

      await createOrder(orderData);
      clearCart();
      alert("Order placed successfully!");
      navigate("/wonder-bread/tracking");
    } catch (err) {
      setError(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="order-page">
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
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-container">
        <h1>Your Cart</h1>

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
    </div>
  );
}

export default OrderPage;
