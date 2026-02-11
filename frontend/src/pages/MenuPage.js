import React, { useState, useEffect } from "react";
import SoupCard from "../components/SoupCard";
import { fetchMenu } from "../services/api";
import { useCart } from "../context/CartContext";

export default function MenuPage({ onNavigate }) {
  const [menu, setMenu] = useState(null);
  const [selectedSoups, setSelectedSoups] = useState([]);
  const [selectedProteins, setSelectedProteins] = useState([]);
  const [portion, setPortion] = useState("small");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { dispatch } = useCart();

  useEffect(() => {
    fetchMenu()
      .then((data) => {
        setMenu(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not load menu. Please make sure the backend is running.");
        setLoading(false);
      });
  }, []);

  const toggleSoup = (soupId) => {
    setSelectedSoups((prev) =>
      prev.includes(soupId)
        ? prev.filter((id) => id !== soupId)
        : [...prev, soupId]
    );
  };

  const toggleProtein = (proteinId) => {
    setSelectedProteins((prev) =>
      prev.includes(proteinId)
        ? prev.filter((id) => id !== proteinId)
        : [...prev, proteinId]
    );
  };

  const calculatePrice = () => {
    if (!menu || selectedSoups.length === 0) return 0;
    const soupPrice = menu.soups
      .filter((s) => selectedSoups.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
    const proteinPrice = menu.proteins
      .filter((p) => selectedProteins.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
    const portionMult =
      menu.portions.find((p) => p.id === portion)?.multiplier || 1;

    let comboDiscount = 0;
    for (const combo of menu.combos) {
      if (
        combo.soups.length === selectedSoups.length &&
        combo.soups.every((s) => selectedSoups.includes(s))
      ) {
        comboDiscount = combo.discount;
        break;
      }
    }

    return (
      ((menu.iyan_base_price + soupPrice + proteinPrice) * portionMult -
        comboDiscount) *
      quantity
    );
  };

  const getActiveCombo = () => {
    if (!menu) return null;
    return menu.combos.find(
      (combo) =>
        combo.soups.length === selectedSoups.length &&
        combo.soups.every((s) => selectedSoups.includes(s))
    );
  };

  const addToCart = () => {
    if (selectedSoups.length === 0) return;
    dispatch({
      type: "ADD_ITEM",
      payload: {
        soups: [...selectedSoups],
        proteins: [...selectedProteins],
        portion,
        quantity,
      },
    });
    setSelectedSoups([]);
    setSelectedProteins([]);
    setPortion("small");
    setQuantity(1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const activeCombo = getActiveCombo();

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Our Soups</h1>
        <p>
          Every order starts with our signature <strong>Ìyán</strong> (Pounded
          Yam) — Base price: ₦{menu.iyan_base_price.toLocaleString()}
        </p>
        <p className="menu-hint">
          💡 Select one or more soups to combine with your Iyan
        </p>
      </div>

      {/* Soup Selection */}
      <section className="menu-section">
        <h2>
          Choose Your Soup{selectedSoups.length > 0 ? "s" : ""}{" "}
          {selectedSoups.length > 0 && (
            <span className="selection-count">({selectedSoups.length} selected)</span>
          )}
        </h2>
        <div className="soups-grid">
          {menu.soups.map((soup) => (
            <SoupCard
              key={soup.id}
              soup={soup}
              selected={selectedSoups.includes(soup.id)}
              onToggle={toggleSoup}
            />
          ))}
        </div>
      </section>

      {activeCombo && (
        <div className="combo-banner">
          🎉 <strong>{activeCombo.name}</strong> — {activeCombo.description}!
          You save ₦{activeCombo.discount}!
        </div>
      )}

      {/* Protein Selection */}
      <section className="menu-section">
        <h2>Add Protein (Optional)</h2>
        <div className="protein-grid">
          {menu.proteins.map((protein) => (
            <button
              key={protein.id}
              className={`protein-btn ${
                selectedProteins.includes(protein.id) ? "selected" : ""
              }`}
              onClick={() => toggleProtein(protein.id)}
            >
              <span className="protein-name">{protein.name}</span>
              <span className="protein-price">
                +₦{protein.price.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Portion & Quantity */}
      <section className="menu-section options-row">
        <div className="option-group">
          <h3>Portion Size</h3>
          <div className="portion-btns">
            {menu.portions.map((p) => (
              <button
                key={p.id}
                className={`portion-btn ${portion === p.id ? "selected" : ""}`}
                onClick={() => setPortion(p.id)}
              >
                {p.name}
                {p.multiplier > 1 && (
                  <span className="portion-mult">×{p.multiplier}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="option-group">
          <h3>Quantity</h3>
          <div className="quantity-control">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(20, quantity + 1))}
              disabled={quantity >= 20}
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Order Summary Bar */}
      <div className="order-bar">
        <div className="order-bar-info">
          <span className="order-bar-total">
            ₦{calculatePrice().toLocaleString()}
          </span>
          {selectedSoups.length > 0 && (
            <span className="order-bar-items">
              Iyan +{" "}
              {selectedSoups
                .map(
                  (id) => menu.soups.find((s) => s.id === id)?.name
                )
                .join(" + ")}
            </span>
          )}
        </div>
        <div className="order-bar-actions">
          <button
            className="btn btn-primary"
            onClick={addToCart}
            disabled={selectedSoups.length === 0}
          >
            {addedFeedback ? "✓ Added!" : "Add to Cart"}
          </button>
          <button
            className="btn btn-accent"
            onClick={() => onNavigate("order")}
          >
            View Cart →
          </button>
        </div>
      </div>
    </div>
  );
}
