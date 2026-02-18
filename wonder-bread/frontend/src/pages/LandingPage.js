/**
 * Wonder Bread Landing Page
 * Marketing-focused landing page with animations and compelling messaging
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [loavesBaked, setLoavesBaked] = useState(1247);
  const [countdown, setCountdown] = useState(45);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const testimonials = [
    {
      name: "Amara Okafor",
      rating: 5,
      text: "Best bread in Lagos! Stays fresh for over a week. I save so much money now!",
    },
    {
      name: "Chidi Nwosu",
      rating: 5,
      text: "Quality bread at amazing prices. My family loves it. Highly recommend!",
    },
    {
      name: "Fatima Hassan",
      rating: 5,
      text: "Can't believe the price! Large loaf for ₦1000 is a steal. Perfect quality!",
    },
    {
      name: "Tunde Adeyemi",
      rating: 5,
      text: "Ordered once and now I'm a regular customer. Fresh bread every time!",
    },
  ];

  // Simulate loaves baked counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLoavesBaked((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 45));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title wb-fade-in">
            Quality Bread, Prices That Make Sense
          </h1>
          <p className="hero-subtitle wb-fade-in">
            Fresh baked daily. Large loaf at{" "}
            <span className="price-highlight">₦1,000</span>
          </p>
          <div className="hero-actions wb-fade-in">
            <Link
              to="/wonder-bread/menu"
              className="wb-btn wb-btn-primary wb-btn-lg"
            >
              Order Now
            </Link>
            {isAuthenticated ? (
              <Link
                to="/wonder-bread/orders"
                className="wb-btn wb-btn-outline wb-btn-lg"
              >
                My Orders
              </Link>
            ) : (
              <Link
                to="/wonder-bread/signup"
                className="wb-btn wb-btn-outline wb-btn-lg"
              >
                Sign Up for Deals
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Price Comparison Section */}
      <section className="comparison-section wb-container">
        <h2 className="section-title">Save ₦500 on Every Large Loaf!</h2>
        <div className="comparison-grid">
          <div className="comparison-card competitor">
            <div className="comparison-badge">Market Price</div>
            <div className="comparison-price">₦1,500</div>
            <p className="comparison-label">Large Loaf</p>
          </div>
          <div className="comparison-arrow">→</div>
          <div className="comparison-card wonder-bread">
            <div className="comparison-badge wonder">Wonder Bread</div>
            <div className="comparison-price special">₦1,000</div>
            <p className="comparison-label">Large Loaf</p>
            <div className="savings-badge">Save ₦500!</div>
          </div>
        </div>
        <div className="savings-counter">
          <p className="savings-text">
            That's <strong>₦2,000 saved</strong> on every 4 loaves!
          </p>
        </div>
      </section>

      {/* Quality Guarantee Section */}
      <section className="quality-section">
        <div className="wb-container">
          <h2 className="section-title">Our Quality Promise</h2>
          <div className="quality-grid">
            <div className="quality-card">
              <div className="quality-icon">🔥</div>
              <h3 className="quality-title">Baked Fresh Daily</h3>
              <p className="quality-text">
                Every loaf is baked fresh each morning. No day-old bread here!
              </p>
            </div>
            <div className="quality-card">
              <div className="quality-icon">⏰</div>
              <h3 className="quality-title">Lasting Freshness</h3>
              <p className="quality-text">
                Stays soft and delicious for 5+ days. Superior quality
                ingredients.
              </p>
            </div>
            <div className="quality-card">
              <div className="quality-icon">🌿</div>
              <h3 className="quality-title">No Preservatives</h3>
              <p className="quality-text">
                100% natural ingredients. No artificial preservatives or
                additives.
              </p>
            </div>
            <div className="quality-card">
              <div className="quality-icon">✅</div>
              <h3 className="quality-title">Quality Guaranteed</h3>
              <p className="quality-text">
                Not satisfied? Full refund, no questions asked. We stand by our
                bread.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Features Section */}
      <section className="dynamic-section wb-container">
        <div className="dynamic-grid">
          <div className="dynamic-card">
            <h3 className="dynamic-title">Baked Today</h3>
            <div className="dynamic-number">{loavesBaked.toLocaleString()}</div>
            <p className="dynamic-label">Fresh loaves and counting!</p>
          </div>
          <div className="dynamic-card">
            <h3 className="dynamic-title">Fresh Batch In</h3>
            <div className="dynamic-number">{countdown} min</div>
            <p className="dynamic-label">Next baking cycle</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="wb-container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="testimonial-card">
            <div className="testimonial-stars">
              {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                <span key={i} className="star">
                  ⭐
                </span>
              ))}
            </div>
            <p className="testimonial-text">
              "{testimonials[testimonialIndex].text}"
            </p>
            <p className="testimonial-author">
              - {testimonials[testimonialIndex].name}
            </p>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === testimonialIndex ? "active" : ""}`}
                onClick={() => setTestimonialIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Banner */}
      <section className="offers-section">
        <div className="wb-container">
          <div className="offer-banner">
            <h3 className="offer-title">🎉 Special Launch Offer!</h3>
            <p className="offer-text">
              Sign up today and get <strong>10% off</strong> your first order!
            </p>
            <Link to="/wonder-bread/signup" className="wb-btn wb-btn-secondary">
              Claim Your Discount
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="wb-container wb-text-center">
          <h2 className="cta-title">Ready to Experience Quality Bread?</h2>
          <p className="cta-text">
            Join thousands of satisfied customers. Order now and taste the
            difference!
          </p>
          <Link
            to="/wonder-bread/menu"
            className="wb-btn wb-btn-primary wb-btn-lg"
          >
            View Our Menu
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
