import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

const initialAddress = { fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' }

function Checkout() {
    const { cart, subtotal, loading, clearCartState, refreshCart } = useCart()
    const [address, setAddress] = useState(initialAddress)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const navigate = useNavigate()

    useEffect(function () {
        api.get('/customers/me').then(function (response) {
            setAddress(function (current) {
                return { ...current, fullName: response.data.fullName || '', phone: response.data.phone || '' }
            })
        }).catch(function () {})
    }, [])

    function handleChange(event) {
        setAddress({ ...address, [event.target.name]: event.target.value })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        if (Object.values(address).some(function (value) { return !value.trim() })) {
            setError('Please complete all shipping details.')
            return
        }
        if (!/^[0-9]{10}$/.test(address.phone)) {
            setError('Enter a valid 10-digit phone number.')
            return
        }
        if (!/^[0-9]{6}$/.test(address.pincode)) {
            setError('Enter a valid 6-digit pincode.')
            return
        }
        setBusy(true)
        try {
            const response = await api.post('/orders/create-payment-order', { shippingAddress: address })
            const details = response.data

            if (!window.Razorpay) {
                await new Promise(function (resolve, reject) {
                    const script = document.createElement('script')
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                    script.onload = resolve
                    script.onerror = reject
                    document.body.appendChild(script)
                })
            }

            const checkout = new window.Razorpay({
                key: details.keyId,
                amount: details.amount,
                currency: details.currency,
                name: 'ShopKart',
                description: 'Order payment',
                order_id: details.razorpayOrderId,
                prefill: details.customer,
                notes: { shopkartOrderId: details.orderId },
                theme: { color: '#111111' },
                handler: async function (paymentResponse) {
                    try {
                        const verified = await api.post('/orders/verify-payment', {
                            orderId: details.orderId,
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature
                        })
                        clearCartState()
                        await refreshCart()
                        navigate('/orders/' + details.orderId, { state: { successMessage: verified.data.message } })
                    } catch (verificationError) {
                        setError(verificationError.response?.data?.message || 'Payment was received but verification failed. Contact support with order ID ' + details.orderId)
                        setBusy(false)
                    }
                },
                modal: {
                    ondismiss: function () {
                        setBusy(false)
                        setError('Payment was cancelled or closed. Your cart has been kept.')
                    }
                }
            })
            checkout.on('payment.failed', function (failure) {
                setError(failure.error?.description || 'Payment failed. Your cart has been kept.')
                setBusy(false)
            })
            checkout.open()
            setBusy(false)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to start checkout. Please try again.')
            setBusy(false)
        }
    }

    if (loading) return <main className="products-page"><p className="products-message">Loading checkout...</p></main>
    if (!cart.length) return <main className="products-page"><div className="empty-state"><h1>Your cart is empty</h1><Link className="btn btn-primary" to="/products">Browse Products</Link></div></main>

    return (
        <main className="products-page">
            <div className="products-heading"><p className="products-eyebrow">ALMOST YOURS</p><h1>Checkout</h1></div>
            <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    <h2>Shipping Details</h2>
                    <label>Full Name<input name="fullName" value={address.fullName} onChange={handleChange} required /></label>
                    <label>Phone<input name="phone" inputMode="numeric" maxLength="10" value={address.phone} onChange={handleChange} required /></label>
                    <label>Address<input name="addressLine1" value={address.addressLine1} onChange={handleChange} required /></label>
                    <div className="checkout-two-col">
                        <label>City<input name="city" value={address.city} onChange={handleChange} required /></label>
                        <label>State<input name="state" value={address.state} onChange={handleChange} required /></label>
                    </div>
                    <label>Pincode<input name="pincode" inputMode="numeric" maxLength="6" value={address.pincode} onChange={handleChange} required /></label>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" disabled={busy}>{busy ? 'Preparing payment...' : 'Place Order & Pay'}</button>
                    <p className="payment-note">Razorpay Test Mode only. No real payment should be made.</p>
                </form>
                <aside className="order-summary">
                    <h2>Order Summary</h2>
                    {cart.filter(function (item) { return item.product }).map(function (item) {
                        return <p key={item.product._id}><span>{item.product.name} × {item.quantity}</span><strong>₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</strong></p>
                    })}
                    <p className="summary-total"><span>Total</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></p>
                    <p className="payment-note">The server recalculates the final total and checks stock before creating payment.</p>
                </aside>
            </div>
        </main>
    )
}

export default Checkout
