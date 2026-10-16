
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

function ProductDetails() {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [cartMessage, setCartMessage] = useState('')
    const [cartBusy, setCartBusy] = useState(false)
    const { addToCart } = useCart()

    useEffect(function () {
        let active = true

        async function loadProduct() {
            setLoading(true)
            setError(false)
            setProduct(null)

            try {
                const response = await api.get(`/products/${id}`)

                if (active) {
                    setProduct(response.data.product)
                }
            } catch {
                if (active) {
                    setError(true)
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadProduct()

        return function () {
            active = false
        }
    }, [id])

    if (loading) {
        return (
            <main className="products-page">
                <p className="products-message">
                    Loading product...
                </p>
            </main>
        )
    }

    if (error || !product) {
        return (
            <main className="products-page">
                <p className="products-message error-message">
                    Unable to load this product.
                </p>
                <Link to="/products">Back to Products</Link>
            </main>
        )
    }

    return (
        <main className="products-page">
            <Link className="back-link" to="/products">
                ← Back to Products
            </Link>

            <section className="product-detail">
                <div className="product-detail-image-container">
                    <img
                        className="product-detail-image"
                        src={product.image}
                        alt={product.name}
                    />
                </div>

                <div className="product-detail-content">
                    <p className="product-category">
                        {product.category}
                    </p>

                    <h1>{product.name}</h1>

                    <p className="product-detail-price">
                        ₹{product.price.toLocaleString('en-IN')}
                    </p>

                    <p className="product-description">
                        {product.description}
                    </p>

                    <p className="product-stock">
                        {product.stock > 0
                            ? `${product.stock} units available`
                            : 'Out of stock'}
                    </p>

                    <button
                        type="button"
                        disabled={product.stock === 0 || cartBusy}
                        onClick={async function () {
                            setCartBusy(true)
                            setCartMessage('')
                            try {
                                await addToCart(product._id)
                                setCartMessage('Added to cart')
                            } catch (requestError) {
                                setCartMessage(requestError.response?.data?.message || 'Unable to add to cart. Log in first.')
                            } finally {
                                setCartBusy(false)
                            }
                        }}
                    >
                        {cartBusy ? 'Adding...' : 'Add to Cart'}
                    </button>
                    {cartMessage && <p className="inline-message">{cartMessage}</p>}
                </div>
            </section>
        </main>
    )
}

export default ProductDetails
