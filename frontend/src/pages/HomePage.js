import React from "react";

export default function HomePage({ onNavigate }) {
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
              Smooth, perfectly pounded yam made fresh daily with the finest
              yam tubers
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🥘</span>
            <h3>10+ Soup Options</h3>
            <p>
              From Egusi to Afang — explore a rich variety of Nigerian soups
              and combine them
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
          <div className="combo-card highlight">
            <span className="combo-badge">🔥 Most Popular</span>
            <h3>The Abula Special</h3>
            <p>Ewedu + Gbegiri — the legendary combo</p>
            <span className="combo-savings">Save ₦500</span>
          </div>
          <div className="combo-card">
            <h3>Double Green</h3>
            <p>Egusi + Efo Riro — rich and nutritious</p>
            <span className="combo-savings">Save ₦300</span>
          </div>
          <div className="combo-card">
            <h3>Draw & Thick</h3>
            <p>Ogbono + Egusi — ultimate texture</p>
            <span className="combo-savings">Save ₦400</span>
          </div>
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
