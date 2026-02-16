import React, { useState } from "react";

export default function Navbar({ currentPage, onNavigate, cartCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { id: "home", label: "Home" },
    { id: "menu", label: "Our Soups" },
    { id: "order", label: "Order" },
    { id: "bot", label: "🎙️ Voice Order" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => onNavigate("home")}>
        <span className="brand-icon">🍲</span>
        <span className="brand-text">Ilé Ìyán</span>
      </div>
      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {links.map((link) => (
          <li key={link.id}>
            <button
              className={`nav-link ${currentPage === link.id ? "active" : ""}`}
              onClick={() => {
                onNavigate(link.id);
                setMenuOpen(false);
              }}
            >
              {link.label}
              {link.id === "order" && cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
