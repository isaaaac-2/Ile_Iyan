import React, { useState, useEffect } from "react";
import SoupCard from "../components/SoupCard";
import { fetchMenu } from "../services/api";
import { useCart } from "../context/CartContext";

export default function MenuPage({ onNavigate }) {
  const [menu, setMenu] = useState(null);
  const [selectedSoups, setSelectedSoups] = useState([]);
  const [selectedProteins, setSelectedProteins] = useState([]);
  const [proteinQuantities, setProteinQuantities] = useState({});
  const [iyanQuantity, setIyanQuantity] = useState("2");
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
        setError(
          "Could not load menu. Please make sure the backend is running.",
        );
        setLoading(false);
      });
  }, []);

  const toggleSoup = (soupId) => {
    setSelectedSoups((prev) =>
      prev.includes(soupId)
        ? prev.filter((id) => id !== soupId)
        : [...prev, soupId],
    );
  };

  const toggleProtein = (proteinId) => {
    setSelectedProteins((prev) => {
      if (prev.includes(proteinId)) {
        const updated = prev.filter((id) => id !== proteinId);
        setProteinQuantities((prevQty) => {
          const newQty = { ...prevQty };
          delete newQty[proteinId];
          return newQty;
        });
        return updated;
      } else {
        setProteinQuantities((prevQty) => ({
          ...prevQty,
          [proteinId]: "1",
        }));
        return [...prev, proteinId];
      }
    });
  };

  const setProteinQuantity = (proteinId, quantity) => {
    setProteinQuantities((prev) => ({
      ...prev,
      [proteinId]: quantity,
    }));
  };

  const calculatePrice = () => {
    if (!menu || selectedSoups.length === 0) return 0;
    const soupPrice = menu.soups
      .filter((s) => selectedSoups.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
    const proteinPrice = menu.proteins
      .filter((p) => selectedProteins.includes(p.id))
      .reduce((sum, p) => {
        const pQty = proteinQuantities[p.id] || "1";
        const mult =
          menu.protein_quantities.find((q) => q.id === pQty)?.multiplier || 1;
        return sum + p.price * mult;
      }, 0);
    const iyanMult =
      menu.iyan_quantities.find((q) => q.id === iyanQuantity)?.multiplier || 1;

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
      (menu.iyan_base_price * iyanMult +
        soupPrice +
        proteinPrice -
        comboDiscount) *
      quantity
    );
  };

  const getActiveCombo = () => {
    if (!menu) return null;
    return menu.combos.find(
      (combo) =>
        combo.soups.length === selectedSoups.length &&
        combo.soups.every((s) => selectedSoups.includes(s)),
    );
  };

  const addToCart = () => {
    if (selectedSoups.length === 0) return;
    dispatch({
      type: "ADD_ITEM",
      payload: {
        soups: [...selectedSoups],
        proteins: [...selectedProteins],
        iyan_quantity: iyanQuantity,
        protein_quantities: { ...proteinQuantities },
        quantity,
      },
    });
    setSelectedSoups([]);
    setSelectedProteins([]);
    setProteinQuantities({});
    setIyanQuantity("2");
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
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
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
            <span className="selection-count">
              ({selectedSoups.length} selected)
            </span>
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

      {/* Protein Selection with Individual Quantities */}
      <section className="menu-section">
        <h2>Add Protein (Optional)</h2>
        <div className="protein-grid">
          {menu.proteins.map((protein) => (
            <div key={protein.id} className="protein-with-qty">
              <button
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
              {selectedProteins.includes(protein.id) && (
                <div className="protein-qty-selector">
                  {menu.protein_quantities &&
                    menu.protein_quantities.map((q) => (
                      <button
                        key={q.id}
                        className={`qty-mini-btn ${
                          proteinQuantities[protein.id] === q.id ? "active" : ""
                        }`}
                        onClick={() => setProteinQuantity(protein.id, q.id)}
                      >
                        {q.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Iyan Wraps */}
      <section className="menu-section">
        <div className="option-group">
          <h3>Wraps</h3>
          <div className="quantity-btns">
            {menu.iyan_quantities &&
              menu.iyan_quantities.map((q) => (
                <button
                  key={q.id}
                  className={`quantity-btn ${
                    iyanQuantity === q.id ? "selected" : ""
                  }`}
                  onClick={() => setIyanQuantity(q.id)}
                >
                  {q.name}
                </button>
              ))}
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
                .map((id) => menu.soups.find((s) => s.id === id)?.name)
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
