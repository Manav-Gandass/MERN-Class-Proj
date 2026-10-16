const mongoose = require('mongoose')
const Customer = require('../models/customer.model')
const Product = require('../models/product.model')

async function addToWishlist(req, res) {
    try {
        const productId = req.params.productId
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }
        const customer = await Customer.findById(req.user._id)
        if (customer.wishlist.some(function (id) { return id.toString() === productId })) {
            return res.status(409).json({ success: false, message: 'Product is already in your wishlist' })
        }
        customer.wishlist.push(product._id)
        await customer.save()
        return res.status(201).json({ success: true, message: 'Added to wishlist', wishlist: await customer.populate('wishlist') })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to update wishlist' })
    }
}

async function getWishlist(req, res) {
    try {
        const customer = await Customer.findById(req.user._id).populate('wishlist')
        return res.status(200).json({ success: true, wishlist: customer.wishlist })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to load wishlist' })
    }
}

async function removeFromWishlist(req, res) {
    try {
        const productId = req.params.productId
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }
        const customer = await Customer.findById(req.user._id)
        const index = customer.wishlist.findIndex(function (id) { return id.toString() === productId })
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Product is not in your wishlist' })
        }
        customer.wishlist.splice(index, 1)
        await customer.save()
        return res.status(200).json({ success: true, message: 'Removed from wishlist' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to update wishlist' })
    }
}

module.exports = { addToWishlist, getWishlist, removeFromWishlist }
