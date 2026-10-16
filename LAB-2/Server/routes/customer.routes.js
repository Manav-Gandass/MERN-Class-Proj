const express = require('express')

const {
    registerCustomer,
    loginCustomer,
    getMe,
    logoutCustomer
} = require('../Controllers/customer.controller')

const authMiddleware = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/register', registerCustomer)

router.post('/login', loginCustomer)

router.get('/me', authMiddleware, getMe)

router.post('/logout', authMiddleware, logoutCustomer)

module.exports = router