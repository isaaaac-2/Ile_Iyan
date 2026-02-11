import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="brand-icon">🍲</span>
          <h3>Ilé Ìyán</h3>
          <p>The Home of Pounded Yam</p>
        </div>
        <div className="footer-info">
          <p>📍 Lagos, Nigeria</p>
          <p>📞 +234 800 ILE IYAN</p>
          <p>⏰ Mon - Sun: 10am - 10pm</p>
        </div>
        <div className="footer-tagline">
          <p>
            <em>"Where every morsel tells a story of tradition and flavor"</em>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ilé Ìyán. All rights reserved.</p>
      </div>
    </footer>
  );
}
