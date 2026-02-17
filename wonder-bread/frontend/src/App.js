/**
 * Wonder Bread - Main Application Component
 * Routes and application structure for Wonder Bread bakery
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import ProfilePage from './pages/ProfilePage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './WonderBreadApp.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="wonder-bread-app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/wonder-bread" element={<LandingPage />} />
                <Route path="/wonder-bread/login" element={<LoginPage />} />
                <Route path="/wonder-bread/signup" element={<SignupPage />} />
                <Route path="/wonder-bread/menu" element={<MenuPage />} />
                <Route path="/wonder-bread/orders" element={<OrderPage />} />
                <Route path="/wonder-bread/profile" element={<ProfilePage />} />
                <Route path="/wonder-bread/tracking" element={<OrderTrackingPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
