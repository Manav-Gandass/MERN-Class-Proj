import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
    const [wishlistBusy, setWishlistBusy] = useState(false)
    const [cartBusy, setCartBusy] = useState(false)
    const [message, setMessage] = useState('')
    const [saved, setSaved] = useState(false)
    const { addToCart } = useCart()

    async function handleWishlist() {
        setWishlistBusy(true)
        setMessage('')
        try {
            if (saved) {
                await api.delete('/wishlist/' + product._id)
                setSaved(false)
                setMessage('Removed from wishlist')
            } else {
                await api.post('/wishlist/' + product._id)
                setSaved(true)
                setMessage('Added to wishlist')
            }
        } catch (error) {
            if (error.response?.status === 409) setSaved(true)
            setMessage(error.response?.data?.message || 'Unable to update wishlist. Log in first.')
        } finally {
            setWishlistBusy(false)
        }
    }

    async function handleAddToCart() {
        setCartBusy(true)
        setMessage('')
        try {
            await addToCart(product._id)
            setMessage('Added to cart')
        } catch (error) {
            setMessage(error.response?.data?.message || 'Unable to add to cart. Log in first.')
        } finally {
            setCartBusy(false)
        }
    }

    return (
        <article className="product-card">
            <img className="product-card-image" src={product.image} alt={product.name} />
            <div className="product-card-content">
                <p className="product-category">{product.category}</p>
                <h2>{product.name}</h2>
                <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
                <p className="product-stock">{product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}</p>
                <Link className="product-details-link" to={`/products/${product._id}`}>View Details</Link>
                <button type="button" className="secondary-action" onClick={handleWishlist} disabled={wishlistBusy}>
                    {wishlistBusy ? 'Saving...' : saved ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
                </button>
                <button type="button" onClick={handleAddToCart} disabled={cartBusy || product.stock < 1}>
                    {cartBusy ? 'Adding...' : 'Add to Cart'}
                </button>
                {message && <p className="inline-message">{message}</p>}
            </div>
        </article>
    )
}

export default ProductCard
