import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function Orders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const loadOrders = useCallback(async function () {
        setLoading(true)
        setError(false)
        try {
            const response = await api.get('/orders')
            setOrders(response.data.orders || [])
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(function () { loadOrders() }, [loadOrders])

    return (
        <main className="products-page">
            <div className="products-heading"><p className="products-eyebrow">YOUR PURCHASES</p><h1>My Orders</h1></div>
            {loading && <p className="products-message">Loading your orders...</p>}
            {!loading && error && <div className="products-message error-message"><p>Unable to load orders.</p><button onClick={loadOrders}>Try Again</button></div>}
            {!loading && !error && orders.length === 0 && <div className="empty-state"><p>You haven't placed any orders yet.</p><Link className="btn btn-primary" to="/products">Browse Products</Link></div>}
            {!loading && !error && orders.length > 0 && <div className="orders-list">
                {orders.map(function (order) {
                    return <Link className="order-list-card" key={order._id} to={'/orders/' + order._id}>
                        <div><p className="product-category">ORDER #{order._id.slice(-8).toUpperCase()}</p><h2>{new Date(order.createdAt).toLocaleDateString('en-IN')}</h2><p>{order.items.length} product line(s)</p></div>
                        <div><strong>₹{order.totalAmount.toLocaleString('en-IN')}</strong><p>{order.status.replaceAll('_', ' ')}</p><p>{order.paymentStatus}</p></div>
                    </Link>
                })}
            </div>}
        </main>
    )
}

export default Orders
