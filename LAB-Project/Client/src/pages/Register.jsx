import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
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

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      setError('All fields are required')
      return
    }

    if (formData.password.length < 6) {
      setError(
        'Password must contain at least 6 characters'
      )
      return
    }

    try {
      await api.post(
        '/customers/register',
        formData
      )

      navigate('/login')
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.message ||
          'Registration failed'
        )
      } else {
        setError('Unable to connect to server')
      }
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>ShopKart</h1>

        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />

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

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
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
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <button
            className="link-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register