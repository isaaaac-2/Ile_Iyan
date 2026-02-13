import React, { useState } from "react";
import { CartProvider, useCart } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import OrderPage from "./pages/OrderPage";
import BotPage from "./pages/BotPage";
import "./App.css";

function AppContent() {
  const [page, setPage] = useState("home");
  const { state } = useCart();

  const renderPage = () => {
    switch (page) {
      case "menu":
        return <MenuPage onNavigate={setPage} />;
      case "order":
        return <OrderPage onNavigate={setPage} />;
      case "bot":
        return <BotPage onNavigate={setPage} />;
      default:
        return <HomePage onNavigate={setPage} />;
    }
  };

  return (
    <div className="app">
      <Navbar
        currentPage={page}
        onNavigate={setPage}
        cartCount={state.items.length}
      />
      <main className="main-content">{renderPage()}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
