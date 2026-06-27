import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { FaStar, FaMagnifyingGlass } from "react-icons/fa6";
import ProductModal from "./ProductModal";
import { productService } from "../services/api";
import "../App.css";

const Products = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Filter & Search states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("");

  const getProducts = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search.trim()) params.search = search;
      if (category !== "all") params.category = category;
      if (sort) params.sort = sort;

      const data = await productService.getProducts(params);
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Unable to load products. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a slight debounce for search input
    const delayDebounceFn = setTimeout(() => {
      getProducts();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, sort]);

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: "20px",
        padding: "20px",
        textAlign: "center"
      }}>
        <p style={{ color: "#ef4444", fontSize: "1.1rem", fontWeight: "600" }}>{error}</p>
        <button 
          onClick={getProducts}
          style={{
            padding: "10px 24px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "background-color 0.2s ease"
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "40px 40px 10px 40px" }}>
        
        {/* Search, Filter, Sort Controls Panel */}
        <div style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          padding: "20px 24px",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)"
        }}>
          {/* Search bar */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            backgroundColor: "rgba(11, 15, 25, 0.6)", 
            border: "1px solid rgba(255, 255, 255, 0.1)", 
            borderRadius: "10px", 
            padding: "4px 14px",
            flex: 1.5,
            minWidth: "260px"
          }}>
            <FaMagnifyingGlass style={{ color: "#94a3b8", marginRight: "10px" }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#fff",
                padding: "8px 0",
                fontSize: "0.95rem",
                outline: "none"
              }}
            />
          </div>

          {/* Filters right side */}
          <div style={{ display: "flex", gap: "12px", flex: 1.2, minWidth: "260px", justifyContent: "flex-end" }}>
            {/* Category dropdown */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "10px 16px",
                backgroundColor: "rgba(11, 15, 25, 0.6)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                outline: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                flex: 1
              }}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="jewelery">Jewelery</option>
              <option value="men's clothing">Men's Clothing</option>
              <option value="women's clothing">Women's Clothing</option>
            </select>

            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "10px 16px",
                backgroundColor: "rgba(11, 15, 25, 0.6)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                outline: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                flex: 1
              }}
            >
              <option value="">Sort by Price</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {isLoading ? (
        <div className="loader-container" style={{ minHeight: "40vh" }}>
          <PulseLoader color="#6366f1" size={15} margin={3} />
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", fontSize: "1.1rem" }}>
          No products matched your criteria.
        </div>
      ) : (
        <div className="main-products-container" style={{ paddingTop: "20px" }}>
          {products.map((eachProduct) => {
            return (
              <div key={eachProduct.id} className="product-container">
                <div
                  className="product-clickable"
                  onClick={() => setSelectedProduct(eachProduct)}
                  title="Click to view details"
                >
                  <img src={eachProduct.image} alt={eachProduct.title} />
                  <p className="product-title">{eachProduct.title}</p>
                  <div className="product-rating-badge">
                    <FaStar className="star-icon active" />
                    <span>{eachProduct.rating?.rate || 0}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%" }}>
                    <p className="product-price">${eachProduct.price.toFixed(2)}</p>
                    <span style={{ fontSize: "0.78rem", color: eachProduct.stock <= 5 ? "#ef4444" : "#94a3b8", fontWeight: "600" }}>
                      {eachProduct.stock <= 5 ? `Only ${eachProduct.stock} left!` : `${eachProduct.stock} in stock`}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onAddToCart(eachProduct)}
                  disabled={eachProduct.stock <= 0}
                  style={{
                    opacity: eachProduct.stock <= 0 ? 0.6 : 1,
                    cursor: eachProduct.stock <= 0 ? "not-allowed" : "pointer"
                  }}
                >
                  {eachProduct.stock <= 0 ? "Out of stock" : "Add to cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  );
};

export default Products;
