
function SearchBar({
    search,
    setSearch,
    category,
    setCategory
}) {
    function handleSearchChange(event) {
        setSearch(event.target.value)
    }

    function handleCategoryChange(event) {
        setCategory(event.target.value)
    }

    return (
        <div className="product-filters">
            <input
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search products..."
                aria-label="Search products"
            />

            <select
                value={category}
                onChange={handleCategoryChange}
                aria-label="Filter by category"
            >
                <option value="All Categories">
                    All Categories
                </option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Books">Books</option>
                <option value="Home">Home</option>
            </select>
        </div>
    )
}

export default SearchBar
