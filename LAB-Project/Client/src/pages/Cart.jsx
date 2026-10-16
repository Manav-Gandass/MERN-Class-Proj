import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'

function Cart() {
    const { cart, loading, cartError, subtotal, updateQuantity, removeFromCart, refreshCart } = useCart()
    const [busyId, setBusyId] = useState('')
    const [actionError, setActionError] = useState('')

    async function changeQuantity(productId, quantity) {
        setBusyId(productId)
        setActionError('')
        try {
            await updateQuantity(productId, quantity)
        } catch (requestError) {
            setActionError(requestError.response?.data?.message || 'Unable to update cart')
            await refreshCart()
        } finally {
            setBusyId('')
        }
    }

    async function removeProduct(productId) {
        setBusyId(productId)
        setActionError('')
        try {
            await removeFromCart(productId)
        } catch (requestError) {
            setActionError(requestError.response?.data?.message || 'Unable to remove product')
        } finally {
            setBusyId('')
        }
    }

    if (loading) {
        return (
            <main className="products-page">
                <p className="products-message">Loading your cart...</p>
            </main>
        )
    }

    if (cartError) {
        return (
            <main className="products-page">
                <div className="products-message error-message">
                    <p>{cartError}</p>
                    <button onClick={refreshCart}>Try Again</button>
                </div>
            </main>
        )
    }

    return (
        <main className="products-page">
            <div className="products-heading">
                <p className="products-eyebrow">YOUR SELECTION</p>
                <h1>Shopping Cart</h1>
            </div>
            {actionError && <p className="error-message">{actionError}</p>}
            {cart.length === 0 ? (
                <div className="empty-state">
                    <p>Your cart is empty 🛒</p>
                    <p>Looks like you haven't added anything yet.</p>
                    <Link className="btn btn-primary" to="/products">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-lines">
                        {cart
                            .filter(function (item) {
                                return item.product
                            })
                            .map(function (item) {
                                const product = item.product
                                return (
                                    <article className="cart-line" key={product._id}>
                                        <img src={product.image} alt={product.name} />
                                        <div className="cart-line-details">
                                            <h2>{product.name}</h2>
                                            <p>₹{product.price.toLocaleString('en-IN')}</p>
                                            <p>{product.stock} available</p>
                                            <div className="quantity-controls">
                                                <button
                                                    disabled={busyId === product._id || item.quantity <= 1}
                                                    onClick={function () {
                                                        changeQuantity(product._id, item.quantity - 1)
                                                    }}
                                                >
                                                    −
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    disabled={busyId === product._id || item.quantity >= product.stock}
                                                    onClick={function () {
                                                        changeQuantity(product._id, item.quantity + 1)
                                                    }}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    className="remove-action"
                                                    disabled={busyId === product._id}
                                                    onClick={function () {
                                                        removeProduct(product._id)
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        <strong>₹{(product.price * item.quantity).toLocaleString('en-IN')}</strong>
                                    </article>
                                )
                            })}
                    </div>
                    <aside className="order-summary">
                        <h2>Order Summary</h2>
                        <p>
                            <span>Subtotal</span>
                            <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
                        </p>
                        <p>
                            <span>Shipping</span>
                            <strong>Calculated at checkout</strong>
                        </p>
                        <Link className="btn btn-primary" to="/checkout">
                            Proceed to Checkout
                        </Link>
                    </aside>
                </div>
            )}
        </main>
    )
}

export default Cart