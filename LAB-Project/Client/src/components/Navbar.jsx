import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

function Navbar() {
    const navigate = useNavigate()
    const { itemCount, clearCartState } = useCart()

    async function handleLogout() {
        try {
            await api.post('/customers/logout')
        } catch {
        } finally {
            clearCartState()
            navigate('/login')
        }
    }

    return (
        <nav>
            <Link to="/home" className="navbar-brand">ShopKart</Link>
            <Link to="/products" className="navbar-products-link">Products</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/cart">Cart ({itemCount})</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/home">Home</Link>
            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
        </nav>
    )
}

export default Navbar
