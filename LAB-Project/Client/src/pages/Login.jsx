import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Login() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('All fields are required')
      return
    }

    try {
      await api.post('/customers/login', formData)
      navigate('/home')
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid Credentials')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>ShopKart</h1>

        <h2>Customer Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
          >
            Login
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <button
            className="link-button"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login