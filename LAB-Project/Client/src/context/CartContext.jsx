import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])
    const [loading, setLoading] = useState(true)
    const [cartError, setCartError] = useState('')

    const refreshCart = useCallback(async function () {
        setCartError('')
        try {
            const response = await api.get('/cart')
            setCart(response.data.cart || [])
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setCart([])
            } else {
                setCartError('Unable to load your cart.')
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(function () {
        refreshCart()
    }, [refreshCart])

    const addToCart = useCallback(async function (productId) {
        const response = await api.post('/cart/' + productId)
        setCart(response.data.cart || [])
        return response.data
    }, [])

    const updateQuantity = useCallback(async function (productId, quantity) {
        const response = await api.patch('/cart/' + productId, { quantity })
        setCart(response.data.cart || [])
        return response.data
    }, [])

    const removeFromCart = useCallback(async function (productId) {
        const response = await api.delete('/cart/' + productId)
        setCart(response.data.cart || [])
        return response.data
    }, [])

    const clearCartState = useCallback(function () {
        setCart([])
        setCartError('')
    }, [])

    const value = useMemo(function () {
        const itemCount = cart.reduce(function (total, item) {
            return total + item.quantity
        }, 0)
        const subtotal = cart.reduce(function (total, item) {
            return total + (item.product ? item.product.price * item.quantity : 0)
        }, 0)
        return {
            cart,
            loading,
            cartError,
            itemCount,
            subtotal,
            refreshCart,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCartState
        }
    }, [cart, loading, cartError, refreshCart, addToCart, updateQuantity, removeFromCart, clearCartState])

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used inside CartProvider')
    return context
}