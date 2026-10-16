const mongoose = require('mongoose')
const Customer = require('../models/customer.model')
const Product = require('../models/product.model')

async function getCart(req, res) {
    try {
        const customer = await Customer.findById(req.user._id).populate('cart.product')
        const cart = customer.cart.filter(function (item) { return item.product })
        return res.status(200).json({ success: true, cart })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to load cart' })
    }
}

async function addToCart(req, res) {
    try {
        const productId = req.params.productId
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
        if (product.stock < 1) return res.status(400).json({ success: false, message: 'Product is out of stock' })

        const customer = await Customer.findById(req.user._id)
        const item = customer.cart.find(function (entry) { return entry.product.toString() === productId })
        const nextQuantity = item ? item.quantity + 1 : 1
        if (nextQuantity > product.stock) {
            return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' })
        }
        if (item) item.quantity = nextQuantity
        else customer.cart.push({ product: product._id, quantity: 1 })
        await customer.save()
        await customer.populate('cart.product')
        return res.status(200).json({ success: true, message: 'Cart updated', cart: customer.cart })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to update cart' })
    }
}

async function updateCartQuantity(req, res) {
    try {
        const productId = req.params.productId
        const quantity = Number(req.body.quantity)
        if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' })
        if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' })
        const customer = await Customer.findById(req.user._id)
        const item = customer.cart.find(function (entry) { return entry.product.toString() === productId })
        if (!item) return res.status(404).json({ success: false, message: 'Product is not in your cart' })
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
        if (quantity > product.stock) return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' })
        item.quantity = quantity
        await customer.save()
        await customer.populate('cart.product')
        return res.status(200).json({ success: true, cart: customer.cart })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to update cart' })
    }
}

async function removeFromCart(req, res) {
    try {
        const productId = req.params.productId
        if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' })
        const customer = await Customer.findById(req.user._id)
        const index = customer.cart.findIndex(function (entry) { return entry.product.toString() === productId })
        if (index === -1) return res.status(404).json({ success: false, message: 'Product is not in your cart' })
        customer.cart.splice(index, 1)
        await customer.save()
        await customer.populate('cart.product')
        return res.status(200).json({ success: true, cart: customer.cart })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to remove product' })
    }
}

module.exports = { getCart, addToCart, updateCartQuantity, removeFromCart }
