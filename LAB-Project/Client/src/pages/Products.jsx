
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'

function Products() {
    const [searchParams] = useSearchParams()
    const urlCategory = searchParams.get('category')

    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState(urlCategory || 'All Categories')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(function () {
        let active = true

        async function loadProducts() {
            setLoading(true)
            setError(false)

            try {
                const response = await api.get('/products', {
                    params: {
                        search: search,
                        category: category
                    }
                })

                if (active) {
                    setProducts(response.data.products)
                }
            } catch {
                if (active) {
                    setError(true)
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadProducts()

        return function () {
            active = false
        }
    }, [search, category])

    return (
        <main className="products-page">
            <div className="products-heading">
                <p className="products-eyebrow">SHOPKART COLLECTION</p>
                <h1>Discover Products</h1>
                <p>Find something you'll love.</p>
            </div>

            <SearchBar
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
            />

            {loading && (
                <p className="products-message">
                    Loading products...
                </p>
            )}

            {!loading && error && (
                <p className="products-message error-message">
                    Something went wrong while loading products.
                </p>
            )}

            {!loading && !error && products.length === 0 && (
                <p className="products-message">
                    No products found.
                </p>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="product-grid">
                    {products.map(function (product) {
                        return (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export default Products
