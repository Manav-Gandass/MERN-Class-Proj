import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

const CATEGORIES = [
  {
    name: 'Electronics',
    icon: '⚡',
    tagline: 'Smart Tech & Gadgets',
    description: 'High-performance audio, computing & smart accessories',
    badge: 'Popular',
    bgClass: 'cat-card-electronics',
  },
  {
    name: 'Fashion',
    icon: '✨',
    tagline: 'Modern Apparel',
    description: 'Curated styles, apparel, footwear & trending looks',
    badge: 'New Season',
    bgClass: 'cat-card-fashion',
  },
  {
    name: 'Books',
    icon: '📚',
    tagline: 'Knowledge & Bestsellers',
    description: 'Inspiring reads, fiction, tech guides & self-growth',
    badge: 'Editor Pick',
    bgClass: 'cat-card-books',
  },
  {
    name: 'Home',
    icon: '🏡',
    tagline: 'Interior & Comfort',
    description: 'Modern decor, living essentials & cozy aesthetics',
    badge: 'Curated',
    bgClass: 'cat-card-home',
  },
]

function Home() {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  useEffect(() => {
    async function initHome() {
      try {
        await api.get('/customers/me')
      } catch {
        navigate('/login')
        return
      } finally {
        setLoading(false)
      }

      try {
        const prodRes = await api.get('/products')
        if (prodRes.data && prodRes.data.products) {
          // Take top 4 items for featured showcase
          setFeaturedProducts(prodRes.data.products.slice(0, 4))
        }
      } catch (prodErr) {
        console.error('Failed to load featured products', prodErr)
      } finally {
        setLoadingProducts(false)
      }
    }

    initHome()
  }, [navigate])

  function handleCopyPromo(code) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2200)
    }
  }

  function handleNewsletter(e) {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSubscribed(false), 4000)
    }
  }

  if (loading) {
    return (
      <div className="home-loading-screen">
        <div className="home-spinner"></div>
        <p>Loading your ShopKart experience...</p>
      </div>
    )
  }

  return (
    <div className="home-page-wrapper">
      {/* Top Banner Ticker */}
      <div className="home-announcement">
        <div className="announcement-content">
          <span className="announcement-pill">LIMITED TIME DROP</span>
          <span className="announcement-text">
            Get Flat 15% OFF across top electronics & fashion with code <strong>SHOPFIRST</strong>
          </span>
          <button
            type="button"
            className="announcement-copy-btn"
            onClick={() => handleCopyPromo('SHOPFIRST')}
          >
            {copiedCode ? '✓ Copied' : 'Copy Code'}
          </button>
        </div>
      </div>

      <div className="home-main-content">
        {/* Hero Section */}
        <section className="home-hero">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-dot"></span>
              <span>ShopKart Season Catalog Live</span>
            </div>

            <h1 className="hero-title">
              Elevate Your Everyday <span className="hero-highlight">Lifestyle</span>
            </h1>

            <p className="hero-description">
              Discover hand-picked electronics, season's freshest apparel, inspiring books, and cozy home essentials. Fast delivery, 100% genuine products, and seamless checkout.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="btn-hero-primary">
                Explore Catalog
                <span className="hero-btn-arrow">→</span>
              </Link>
              <Link to="/orders" className="btn-hero-secondary">
                Track Orders
              </Link>
            </div>

            <div className="hero-perks-row">
              <div className="hero-perk-item">
                <span className="hero-perk-icon">⚡</span>
                <div>
                  <strong>Express Dispatch</strong>
                  <p>Ships within 24 hours</p>
                </div>
              </div>
              <div className="hero-perk-item">
                <span className="hero-perk-icon">🛡️</span>
                <div>
                  <strong>100% Authentic</strong>
                  <p>Guaranteed genuine brands</p>
                </div>
              </div>
              <div className="hero-perk-item">
                <span className="hero-perk-icon">💳</span>
                <div>
                  <strong>Instant Checkout</strong>
                  <p>Razorpay secure payments</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Showcase */}
        <section className="home-categories-section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">EXPLORE DEPARTMENTS</p>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">
                Browse through our curated selections designed for performance, comfort, and taste.
              </p>
            </div>
            <Link to="/products" className="section-link">
              See All Products →
            </Link>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className={`category-card ${cat.bgClass}`}
              >
                <div className="category-card-top">
                  <div className="category-icon-bubble">{cat.icon}</div>
                  <span className="category-pill">{cat.badge}</span>
                </div>
                <h3 className="category-card-title">{cat.name}</h3>
                <p className="category-card-tagline">{cat.tagline}</p>
                <p className="category-card-desc">{cat.description}</p>
                <div className="category-card-cta">
                  <span>Explore {cat.name}</span>
                  <span className="cta-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="home-featured-section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">HANDPICKED DEALS</p>
              <h2 className="section-title">Featured Highlights</h2>
              <p className="section-subtitle">
                Top products trending right now with highest customer satisfaction.
              </p>
            </div>
            <Link to="/products" className="section-link">
              View Full Catalog →
            </Link>
          </div>

          {loadingProducts ? (
            <div className="featured-loading">
              <div className="home-spinner"></div>
              <p>Fetching top trending products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="featured-empty">
              <p>Ready to discover amazing products?</p>
              <Link to="/products" className="btn btn-primary">
                Browse All Products
              </Link>
            </div>
          )}
        </section>

        {/* Promo Flash Deal Banner */}
        <section className="home-promo-banner">
          <div className="promo-banner-glow"></div>
          <div className="promo-banner-content">
            <span className="promo-tag">LIMITED SPECIAL DEAL</span>
            <h2>Upgrade Your Shopping Experience with 15% Instant Savings</h2>
            <p>
              Apply coupon code <code className="promo-inline-code">SHOPFIRST</code> at checkout to unlock instant discounts on eligible items with zero shipping fees.
            </p>
            <div className="promo-buttons">
              <Link to="/products" className="btn-promo-cta">
                Shop Trending Items Now
              </Link>
              <button
                type="button"
                className="btn-promo-copy"
                onClick={() => handleCopyPromo('SHOPFIRST')}
              >
                {copiedCode ? '✓ Promo Code Copied' : 'Copy Code: SHOPFIRST'}
              </button>
            </div>
          </div>
        </section>

        {/* Trust & Value Proposition */}
        <section className="home-trust-section">
          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">🚚</div>
              <h3>Lightning Fast Delivery</h3>
              <p>Reliable doorstep shipping across thousands of pin codes with live delivery updates.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>Bank-grade encryption powered by Razorpay for cards, UPI, and instant NetBanking.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🔄</div>
              <h3>7-Day Easy Returns</h3>
              <p>Not 100% satisfied? Easy doorstep pickups with prompt refund turnaround.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🎧</div>
              <h3>24/7 Priority Support</h3>
              <p>Friendly customer success team always ready to resolve questions quickly.</p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="home-newsletter-section">
          <div className="newsletter-card">
            <div className="newsletter-copy">
              <span className="newsletter-badge">BE THE FIRST TO KNOW</span>
              <h3>Join The ShopKart Insiders</h3>
              <p>Get exclusive early access to flash drops, seasonal clearance, and VIP coupon codes.</p>
            </div>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">
                Join Club
              </button>
            </form>
            {newsletterSubscribed && (
              <p className="newsletter-success">🎉 Thank you! You're now on the VIP list.</p>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-brand-title">ShopKart✦</span>
            <p>Your one-stop destination for quality lifestyle products, electronics, and books.</p>
          </div>
          <div className="footer-links">
            <Link to="/products">All Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">Order History</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ShopKart Inc. All rights reserved. Built with MERN Stack.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home