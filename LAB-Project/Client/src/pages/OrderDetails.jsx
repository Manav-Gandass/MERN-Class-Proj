import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import api from '../services/api'

function OrderDetails() {
    const { id } = useParams()
    const location = useLocation()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(function () {
        let active = true
        api.get('/orders/' + id).then(function (response) {
            if (active) setOrder(response.data.order)
        }).catch(function (requestError) {
            if (active) setError(requestError.response?.data?.message || 'Unable to load order')
        }).finally(function () {
            if (active) setLoading(false)
        })
        return function () { active = false }
    }, [id])

    if (loading) return <main className="products-page"><p className="products-message">Loading order...</p></main>
    if (error || !order) return <main className="products-page"><p className="error-message">{error || 'Order not found'}</p><Link to="/orders">Back to Orders</Link></main>

    return (
        <main className="products-page">
            <div className="products-heading">
                <p className="products-eyebrow">ORDER CONFIRMATION</p>
                <h1>{order.paymentStatus === 'PAID' ? 'Thank you for your order!' : 'Order created'}</h1>
                {location.state?.successMessage && <p>{location.state.successMessage}</p>}
                <p>Order #{order._id}</p>
                <p>Payment: {order.paymentStatus} · Status: {order.status.replaceAll('_', ' ')}</p>
            </div>
            <section className="order-detail-panel">
                <h2>Items</h2>
                {order.items.map(function (item, index) {
                    return <div className="order-item-row" key={item.product || index}>
                        {item.image && <img src={item.image} alt={item.name} />}
                        <span>{item.name} × {item.quantity}</span>
                        <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                    </div>
                })}
                <p className="summary-total"><span>Total paid</span><strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong></p>
                <h2>Shipping Address</h2>
                <p>{order.shippingAddress.fullName}</p><p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <div className="order-links"><Link className="btn btn-primary" to="/orders">My Orders</Link><Link className="btn btn-outline" to="/products">Continue Shopping</Link></div>
            </section>
        </main>
    )
}

export default OrderDetails
