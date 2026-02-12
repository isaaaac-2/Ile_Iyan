import React, { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

const initialState = {
  items: [],
  customerName: "",
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((_, idx) => idx !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const newItems = [...state.items];
      newItems[action.payload.index] = {
        ...newItems[action.payload.index],
        quantity: action.payload.quantity,
      };
      return { ...state, items: newItems };
    }
    case "SET_CUSTOMER_NAME":
      return { ...state, customerName: action.payload };
    case "CLEAR_CART":
      return { ...initialState };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
