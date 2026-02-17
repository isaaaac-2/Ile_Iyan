/**
 * Wonder Bread Navbar Component
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      alert('Please login to view your cart');
      navigate('/wonder-bread/login');
      return;
    }
    navigate('/wonder-bread/orders');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="wb-navbar">
      <div className="wb-navbar-container">
        <Link to="/wonder-bread" className="wb-navbar-brand">
          <span className="wb-navbar-icon">🍞</span>
          <span className="wb-navbar-title">Wonder Bread</span>
        </Link>

        <div className="wb-navbar-links">
          <Link to="/wonder-bread" className={`wb-nav-link ${isActive('/wonder-bread')}`}>
            Home
          </Link>
          <Link to="/wonder-bread/menu" className={`wb-nav-link ${isActive('/wonder-bread/menu')}`}>
            Menu
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/wonder-bread/orders" className={`wb-nav-link ${isActive('/wonder-bread/orders')}`}>
                My Orders
              </Link>
              <Link to="/wonder-bread/profile" className={`wb-nav-link ${isActive('/wonder-bread/profile')}`}>
                Profile
              </Link>
            </>
          )}
        </div>

        <div className="wb-navbar-actions">
          <button onClick={handleCartClick} className="wb-cart-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            🛒
            {getItemCount() > 0 && (
              <span className="wb-cart-badge">{getItemCount()}</span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="wb-user-menu">
              <span className="wb-user-name">👋 {user?.name}</span>
              <button onClick={handleLogout} className="wb-btn wb-btn-secondary wb-btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/wonder-bread/login" className="wb-btn wb-btn-primary wb-btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
