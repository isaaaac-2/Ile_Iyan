import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { fetchMenu, createOrder } from "../services/api";

export default function OrderPage({ onNavigate }) {
  const { state, dispatch } = useCart();
  const [menu, setMenu] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState(state.customerName);

  useEffect(() => {
    fetchMenu()
      .then(setMenu)
      .catch(() => {});
  }, []);

  const getSoupName = (id) => menu?.soups.find((s) => s.id === id)?.name || id;
  const getProteinName = (id) =>
    menu?.proteins.find((p) => p.id === id)?.name || id;

  const calculateItemPrice = (item) => {
    if (!menu) return 0;
    const soupPrice = menu.soups
      .filter((s) => item.soups.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
    const proteinPrice = menu.proteins
      .filter((p) => item.proteins.includes(p.id))
      .reduce((sum, p) => {
        const pQty = item.protein_quantities?.[p.id] || "1";
        const mult =
          menu.protein_quantities?.find((q) => q.id === pQty)?.multiplier || 1;
        return sum + p.price * mult;
      }, 0);
    const iyanMult =
      menu.iyan_quantities?.find((q) => q.id === item.iyan_quantity)
        ?.multiplier || 1;

    let comboDiscount = 0;
    for (const combo of menu.combos) {
      if (
        combo.soups.length === item.soups.length &&
        combo.soups.every((s) => item.soups.includes(s))
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
      item.quantity
    );
  };

  const totalPrice = state.items.reduce(
    (sum, item) => sum + calculateItemPrice(item),
    0,
  );

  const handleSubmitOrder = async () => {
    if (state.items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await createOrder({
        customer_name: customerName || "Guest",
        items: state.items,
      });
      setOrderResult(result);
      dispatch({ type: "CLEAR_CART" });
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  if (orderResult) {
    return (
      <div className="order-page">
        <div className="order-confirmation">
          <div className="confirmation-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <div className="order-id-display">
            <span>Order ID</span>
            <strong>#{orderResult.id}</strong>
          </div>
          <p>
            Thank you
            {orderResult.customer_name !== "Guest"
              ? `, ${orderResult.customer_name}`
              : ""}
            ! Your order of ₦{orderResult.total.toLocaleString()} has been
            placed.
          </p>
          <div className="confirmation-items">
            {orderResult.items.map((item, i) => (
              <div key={i} className="confirmation-item">
                <span>
                  Iyan + {item.soups.map((id) => getSoupName(id)).join(" + ")}
                </span>
                <span>₦{item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="confirmation-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                setOrderResult(null);
                onNavigate("menu");
              }}
            >
              Order Again
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                setOrderResult(null);
                onNavigate("home");
              }}
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-header">
        <h1>Your Order</h1>
        {state.items.length > 0 && (
          <p>
            {state.items.length} item{state.items.length > 1 ? "s" : ""} in your
            cart
          </p>
        )}
      </div>

      {state.items.length === 0 ? (
        <div className="empty-cart">
          <span className="empty-icon">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add some delicious Iyan and soup combinations!</p>
          <div className="empty-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate("menu")}
            >
              Browse Menu
            </button>
            <button
              className="btn btn-accent btn-lg"
              onClick={() => onNavigate("bot")}
            >
              Voice Order 🎙️
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {state.items.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-info">
                  <h3>
                    🍲 Iyan +{" "}
                    {item.soups.map((id) => getSoupName(id)).join(" + ")}
                  </h3>
                  {item.proteins.length > 0 && (
                    <p className="cart-item-proteins">
                      🥩{" "}
                      {item.proteins
                        .map(
                          (id) =>
                            `${getProteinName(id)} (${item.protein_quantities?.[id] || "1"})`,
                        )
                        .join(", ")}
                    </p>
                  )}
                  <p className="cart-item-details">
                    🍖{" "}
                    {menu?.iyan_quantities?.find(
                      (q) => q.id === item.iyan_quantity,
                    )?.name || "2 Wraps"}{" "}
                    × {item.quantity}
                  </p>
                </div>
                <div className="cart-item-right">
                  <span className="cart-item-price">
                    ₦{calculateItemPrice(item).toLocaleString()}
                  </span>
                  <button
                    className="cart-remove-btn"
                    onClick={() =>
                      dispatch({ type: "REMOVE_ITEM", payload: index })
                    }
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-section">
            <div className="customer-name-input">
              <label htmlFor="customerName">Your Name (optional)</label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  dispatch({
                    type: "SET_CUSTOMER_NAME",
                    payload: e.target.value,
                  });
                }}
                placeholder="Enter your name"
              />
            </div>

            <div className="order-total">
              <span>Total</span>
              <strong>₦{totalPrice.toLocaleString()}</strong>
            </div>

            {error && <div className="order-error">⚠️ {error}</div>}

            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handleSubmitOrder}
              disabled={submitting}
            >
              {submitting
                ? "Placing Order..."
                : `Place Order — ₦${totalPrice.toLocaleString()}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
