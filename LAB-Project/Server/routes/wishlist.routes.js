const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const { addToWishlist, getWishlist, removeFromWishlist } = require('../Controllers/wishlist.controller')
const router = express.Router()
router.use(authMiddleware)
router.get('/', getWishlist)
router.post('/:productId', addToWishlist)
router.delete('/:productId', removeFromWishlist)
module.exports = router
