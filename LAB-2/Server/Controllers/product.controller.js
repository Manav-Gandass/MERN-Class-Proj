
const mongoose = require('mongoose')
const Product = require('../models/product.model')

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body

        if (
            typeof name !== 'string' || !name.trim() ||
            typeof description !== 'string' || !description.trim() ||
            typeof category !== 'string' || !category.trim() ||
            typeof image !== 'string' || !image.trim() ||
            price === undefined || price === null ||
            stock === undefined || stock === null
        ) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        if (
            typeof price !== 'number' ||
            !Number.isFinite(price) ||
            price <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Price must be greater than 0'
            })
        }

        if (
            typeof stock !== 'number' ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Stock must be a non-negative integer'
            })
        }

        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price,
            category: category.trim(),
            image: image.trim(),
            stock
        })

        return res.status(201).json({
            success: true,
            product
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }

        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query
        const query = {}

        if (search && search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&'
            )

            query.name = {
                $regex: escapedSearch,
                $options: 'i'
            }
        }

        if (
            category &&
            category.trim() &&
            category.trim() !== 'All Categories'
        ) {
            query.category = category.trim()
        }

        let productsQuery = Product.find(query).select(
            'name price category image stock'
        )

        if (sort === 'price_asc') {
            productsQuery = productsQuery.sort({ price: 1 })
        } else if (sort === 'price_desc') {
            productsQuery = productsQuery.sort({ price: -1 })
        }

        const products = await productsQuery

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            })
        }

        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        return res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductById
}
