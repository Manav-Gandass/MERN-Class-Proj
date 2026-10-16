const crypto = require('crypto')
const mongoose = require('mongoose')
const Razorpay = require('razorpay')
const Customer = require('../models/customer.model')
const Product = require('../models/product.model')
const Order = require('../models/order.model')

function getRazorpay() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay test keys are not configured in Server/.env')
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
}

function validShippingAddress(address) {
    if (!address || typeof address !== 'object') return false
    const fields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']
    return fields.every(function (field) {
        return typeof address[field] === 'string' && address[field].trim().length > 0
    })
}

async function createPaymentOrder(req, res) {
    let savedOrder
    try {
        const shippingAddress = req.body.shippingAddress
        if (!validShippingAddress(shippingAddress)) {
            return res.status(400).json({ success: false, message: 'Please complete all shipping details' })
        }

        const customer = await Customer.findById(req.user._id).populate('cart.product')
        const cart = customer.cart.filter(function (item) { return item.product })
        if (!cart.length) return res.status(400).json({ success: false, message: 'Your cart is empty' })

        const items = []
        let totalAmount = 0
        for (const cartItem of cart) {
            const product = await Product.findById(cartItem.product._id)
            if (!product) return res.status(400).json({ success: false, message: 'A product in your cart is no longer available' })
            if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1 || cartItem.quantity > product.stock) {
                return res.status(400).json({ success: false, message: 'Insufficient stock for ' + product.name })
            }
            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            })
            totalAmount += product.price * cartItem.quantity
        }
        totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100

        const razorpay = getRazorpay()
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: 'shopkart_' + Date.now().toString()
        })

        savedOrder = await Order.create({
            user: req.user._id,
            items,
            shippingAddress: {
                fullName: shippingAddress.fullName.trim(),
                phone: shippingAddress.phone.trim(),
                addressLine1: shippingAddress.addressLine1.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                pincode: shippingAddress.pincode.trim()
            },
            totalAmount,
            paymentStatus: 'PENDING',
            status: 'PENDING_PAYMENT',
            razorpayOrderId: razorpayOrder.id
        })

        return res.status(201).json({
            success: true,
            orderId: savedOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            customer: {
                name: req.user.fullName,
                email: req.user.email,
                contact: req.user.phone
            }
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message.includes('Razorpay test keys') ? error.message : 'Unable to create payment order' })
    }
}

async function verifyPayment(req, res) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({ success: false, message: 'Payment verification details are incomplete' })
        }
        if (!mongoose.isValidObjectId(orderId)) return res.status(400).json({ success: false, message: 'Invalid order ID' })

        const order = await Order.findOne({ _id: orderId, user: req.user._id })
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
        if (order.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ success: false, message: 'Payment order does not match' })
        if (order.paymentStatus === 'PAID') {
            return res.status(200).json({ success: true, message: 'Payment already verified', order })
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex')
        const received = Buffer.from(razorpay_signature)
        const expected = Buffer.from(expectedSignature)
        if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' })
        }

        for (const item of order.items) {
            const updated = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            )
            if (!updated) {
                order.paymentStatus = 'PAID'
                order.status = 'PLACED'
                order.razorpayPaymentId = razorpay_payment_id
                await order.save()
                await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } })
                return res.status(200).json({
                    success: true,
                    message: 'Payment verified. Some stock changed; contact support for fulfillment.',
                    order
                })
            }
        }

        order.paymentStatus = 'PAID'
        order.status = 'PLACED'
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()
        await Customer.findByIdAndUpdate(req.user._id, { $set: { cart: [] } })

        return res.status(200).json({ success: true, message: 'Payment verified successfully', order })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to verify payment' })
    }
}

async function getOrders(req, res) {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
        return res.status(200).json({ success: true, orders })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to load orders' })
    }
}

async function getOrderById(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid order ID' })
        const order = await Order.findById(req.params.id)
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
        if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'You cannot access this order' })
        return res.status(200).json({ success: true, order })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to load order' })
    }
}

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrderById }
