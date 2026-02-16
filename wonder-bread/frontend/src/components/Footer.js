/**
 * Wonder Bread Footer Component
 */

import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="wb-footer">
      <div className="wb-footer-container">
        <div className="wb-footer-section">
          <h3 className="wb-footer-title">🍞 Wonder Bread</h3>
          <p className="wb-footer-tagline">Quality Bread, Prices That Make Sense</p>
          <p className="wb-footer-text">
            Fresh baked daily. Save ₦500 on every large loaf!
          </p>
        </div>

        <div className="wb-footer-section">
          <h4 className="wb-footer-heading">Quick Links</h4>
          <ul className="wb-footer-links">
            <li><a href="/wonder-bread">Home</a></li>
            <li><a href="/wonder-bread/menu">Menu</a></li>
            <li><a href="/wonder-bread/orders">Orders</a></li>
            <li><a href="/wonder-bread/profile">Profile</a></li>
          </ul>
        </div>

        <div className="wb-footer-section">
          <h4 className="wb-footer-heading">Why Wonder Bread?</h4>
          <ul className="wb-footer-features">
            <li>✓ Baked Fresh Daily</li>
            <li>✓ Stays Soft 5+ Days</li>
            <li>✓ No Preservatives</li>
            <li>✓ 100% Quality Guaranteed</li>
          </ul>
        </div>

        <div className="wb-footer-section">
          <h4 className="wb-footer-heading">Contact Us</h4>
          <p className="wb-footer-text">📍 Lagos, Nigeria</p>
          <p className="wb-footer-text">📞 +234 XXX XXX XXXX</p>
          <p className="wb-footer-text">✉️ info@wonderbread.ng</p>
        </div>
      </div>

      <div className="wb-footer-bottom">
        <p>&copy; 2026 Wonder Bread. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
