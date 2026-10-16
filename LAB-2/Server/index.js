
const dns = require('dns')

dns.setServers(['8.8.8.8', '1.1.1.1'])

require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const customerRoutes = require('./routes/customer.routes')
const productRoutes = require('./routes/product.routes')
const wishlistRoutes = require('./routes/wishlist.routes')
const cartRoutes = require('./routes/cart.routes')
const orderRoutes = require('./routes/order.routes')

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected')

        app.listen(process.env.PORT || 4002, () => {
            console.log(`Server Started at port ${process.env.PORT || 4002}`)
        })
    })
    .catch((error) => {
        console.log('MongoDB Connection Error:', error.message)
    })
