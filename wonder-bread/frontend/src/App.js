/**
 * Wonder Bread - Main Application Component
 * Routes and application structure for Wonder Bread bakery
 */

import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MenuPage from "./pages/MenuPage";
import OrderPage from "./pages/OrderPage";
import ProfilePage from "./pages/ProfilePage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./WonderBreadApp.css";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onNavigate={navigate} />;
      case "login":
        return <LoginPage onNavigate={navigate} />;
      case "signup":
        return <SignupPage onNavigate={navigate} />;
      case "menu":
        return <MenuPage onNavigate={navigate} />;
      case "order":
        return <OrderPage onNavigate={navigate} />;
      case "profile":
        return <ProfilePage onNavigate={navigate} />;
      case "tracking":
        return <OrderTrackingPage onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="wonder-bread-app">
          <Navbar currentPage={currentPage} onNavigate={navigate} />
          <main className="main-content">{renderPage()}</main>
          <Footer currentPage={currentPage} onNavigate={navigate} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
