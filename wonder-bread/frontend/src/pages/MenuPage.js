/**
 * Wonder Bread Menu Page
 */

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getMenu } from '../services/api';
import './MenuPage.css';

function MenuPage({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await getMenu();
      setProducts(data.products || []);
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, quantity: 1 });
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="loading">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Our Bread Menu</h1>
        <p>Fresh baked daily. Quality you can trust at prices that make sense.</p>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img 
                src={`/images/${product.image}`} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/placeholder-bread.jpg';
                }}
              />
              {!product.available && (
                <div className="out-of-stock-badge">Out of Stock</div>
              )}
            </div>
            
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-details">
                <span className="weight">{product.weight}</span>
              </div>
              
              <div className="product-footer">
                <div className="price-section">
                  <span className="price">₦{product.price.toLocaleString()}</span>
                </div>
                
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.available}
                >
                  {product.available ? 'Add to Cart' : 'Unavailable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="menu-footer">
        <button className="btn btn-secondary" onClick={() => onNavigate('order')}>
          View Cart & Checkout
        </button>
      </div>
    </div>
  );
}

export default MenuPage;
