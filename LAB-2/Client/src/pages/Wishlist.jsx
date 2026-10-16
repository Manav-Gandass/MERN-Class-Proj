import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function Wishlist() {
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [busyId, setBusyId] = useState('')

    const loadWishlist = useCallback(async function () {
        setLoading(true)
        setError(false)
        try {
            const response = await api.get('/wishlist')
            setWishlist(response.data.wishlist || [])
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(function () {
        loadWishlist()
    }, [loadWishlist])

    async function removeProduct(productId) {
        setBusyId(productId)
        try {
            await api.delete('/wishlist/' + productId)
            setWishlist(function (current) {
                return current.filter(function (product) {
                    return product._id !== productId
                })
            })
        } catch {
            setError(true)
        } finally {
            setBusyId('')
        }
    }

    return (
        <main className="products-page">
            <div className="products-heading">
                <p className="products-eyebrow">SAVED FOR LATER</p>
                <h1>Your Wishlist</h1>
            </div>
            {loading && <p className="products-message">Loading your wishlist...</p>}
            {!loading && error && (
                <div className="products-message error-message">
                    <p>Unable to load wishlist.</p>
                    <button onClick={loadWishlist}>Try Again</button>
                </div>
            )}
            {!loading && !error && wishlist.length === 0 && (
                <div className="empty-state">
                    <p>Your wishlist is empty ❤️</p>
                    <p>Start saving products you love.</p>
                    <Link className="btn btn-primary" to="/products">
                        Browse Products
                    </Link>
                </div>
            )}
            {!loading && !error && wishlist.length > 0 && (
                <div className="product-grid">
                    {wishlist.map(function (product) {
                        return (
                            <article className="product-card" key={product._id}>
                                <img
                                    className="product-card-image"
                                    src={product.image}
                                    alt={product.name}
                                />
                                <div className="product-card-content">
                                    <p className="product-category">{product.category}</p>
                                    <h2>{product.name}</h2>
                                    <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
                                    <p className="product-stock">
                                        {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                                    </p>
                                    <Link className="product-details-link" to={'/products/' + product._id}>
                                        View Details
                                    </Link>
                                    <button
                                        className="secondary-action"
                                        disabled={busyId === product._id}
                                        onClick={function () {
                                            removeProduct(product._id)
                                        }}
                                    >
                                        {busyId === product._id ? 'Removing...' : 'Remove from Wishlist'}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export default Wishlist