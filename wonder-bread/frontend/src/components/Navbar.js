/**
 * Wonder Bread Navbar Component
 */

import React from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const Navbar = ({ currentPage, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();

  const handleLogout = async () => {
    await logout();
    onNavigate("landing");
  };

  const isActive = (page) => {
    return currentPage === page ? "active" : "";
  };

  return (
    <nav className="wb-navbar">
      <div className="wb-navbar-container">
        <button
          onClick={() => onNavigate("landing")}
          className="wb-navbar-brand"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span className="wb-navbar-icon">🍞</span>
          <span className="wb-navbar-title">Wonder Bread</span>
        </button>

        <div className="wb-navbar-links">
          <button
            onClick={() => onNavigate("landing")}
            className={`wb-nav-link ${isActive("landing")}`}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate("menu")}
            className={`wb-nav-link ${isActive("menu")}`}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Menu
          </button>

          {isAuthenticated && (
            <>
              <button
                onClick={() => onNavigate("tracking")}
                className={`wb-nav-link ${isActive("tracking")}`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                My Orders
              </button>
              <button
                onClick={() => onNavigate("profile")}
                className={`wb-nav-link ${isActive("profile")}`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Profile
              </button>
            </>
          )}
        </div>

        <div className="wb-navbar-actions">
          {isAuthenticated && (
            <button
              onClick={() => onNavigate("order")}
              className="wb-cart-link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              🛒
              {getItemCount() > 0 && (
                <span className="wb-cart-badge">{getItemCount()}</span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <div className="wb-user-menu">
              <span className="wb-user-name">👋 {user?.name}</span>
              <button
                onClick={handleLogout}
                className="wb-btn wb-btn-secondary wb-btn-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onNavigate("login")}
                className="wb-btn wb-btn-primary wb-btn-sm"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate("signup")}
                className="wb-btn wb-btn-primary wb-btn-sm"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
