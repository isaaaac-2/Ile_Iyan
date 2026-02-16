import React, { useState, useEffect } from "react";
import { fetchMenu } from "../services/api";
import { useCart } from "../context/CartContext";

export default function HomePage({ onNavigate }) {
  const [menu, setMenu] = useState(null);
  const { dispatch } = useCart();

  useEffect(() => {
    fetchMenu()
      .then((data) => setMenu(data))
      .catch(() => {});
  }, []);

  const addComboToCart = (combo) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        soups: combo.soups,
        proteins: [],
        iyan_quantity: "2",
        protein_quantities: {},
        quantity: 1,
      },
    });
    // Navigate to cart/order page
    onNavigate("order");
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">
              Ilé Ìyán
              <span className="hero-subtitle">The Home of Pounded Yam</span>
            </h1>
            <p className="hero-desc">
              Experience the finest pounded yam paired with rich, authentic
              Nigerian soups. Combine flavors, customize your order, and let our
              voice assistant guide you through a seamless ordering experience.
            </p>
            <div className="hero-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate("menu")}
              >
                View Our Soups 🍲
              </button>
              <button
                className="btn btn-accent btn-lg"
                onClick={() => onNavigate("bot")}
              >
                Voice Order 🎙️
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why Ilé Ìyán?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🫕</span>
            <h3>Premium Iyan</h3>
            <p>
              Smooth, perfectly pounded yam made fresh daily with the finest yam
              tubers
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🥘</span>
            <h3>10+ Soup Options</h3>
            <p>
              From Egusi to Afang — explore a rich variety of Nigerian soups and
              combine them
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎤</span>
            <h3>Voice Ordering</h3>
            <p>
              Our AI assistant takes your order hands-free using text-to-speech
              technology
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔀</span>
            <h3>Mix & Match</h3>
            <p>
              Combine any soups together — try the classic Ewedu + Gbegiri or
              create your own combo
            </p>
          </div>
        </div>
      </section>

      <section className="combos-preview">
        <h2 className="section-title">Popular Combos</h2>
        <div className="combos-grid">
          {menu &&
            menu.combos.map((combo, idx) => (
              <div
                key={combo.id}
                className={`combo-card ${idx === 0 ? "highlight" : ""}`}
              >
                {idx === 0 && (
                  <span className="combo-badge">🔥 Most Popular</span>
                )}
                <h3>{combo.name}</h3>
                <p>{combo.description}</p>
                <span className="combo-savings">Save ₦{combo.discount}</span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => addComboToCart(combo)}
                  style={{ marginTop: "12px", width: "100%" }}
                >
                  Quick Add →
                </button>
              </div>
            ))}
        </div>
        <button
          className="btn btn-outline btn-lg"
          onClick={() => onNavigate("menu")}
        >
          See Full Menu →
        </button>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Order?</h2>
          <p>
            Let our voice assistant help you build the perfect meal, or browse
            the menu at your own pace.
          </p>
          <div className="cta-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate("order")}
            >
              Start Ordering
            </button>
            <button
              className="btn btn-accent btn-lg"
              onClick={() => onNavigate("bot")}
            >
              Try Voice Order 🎙️
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
