import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "./CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const userId = localStorage.getItem("user_id");
  const username = localStorage.getItem("username");

  // ✅ Access cart from context
  const { cartItems, fetchCart } = useContext(CartContext);

  // Fetch products
  const fetchProducts = async (query = "") => {
    try {
      const res = await axios.get("http://localhost:3000/api/products", {
        params: { search: query },
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Add to cart with cart refresh
  const addToCart = async (product_id) => {
    try {
      await axios.post("http://localhost:3000/api/cart/add", {
        user_id: userId,
        product_id,
        quantity: 1,
      });

      fetchCart(); // 🔥 Refresh cart so navbar badge updates

      setMessage("Item added to cart");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error(err);
      setMessage("Error adding to cart");
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* 🔹 Navigation Bar */}
      <nav
        className="navbar navbar-expand-lg shadow-sm sticky-top px-4"
        style={{
          background: "linear-gradient(90deg, #6f42c1, #007bff)",
        }}
      >
        {/* Logo */}
        <a
          className="navbar-brand fw-bold text-white"
          href="/"
          style={{ letterSpacing: "1px" }}
        >
          <i className="bi bi-cart4 me-2"></i> SHOP EASE
        </a>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler border-0 text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* Search Bar */}
          <form
            className="d-flex mx-auto my-2 my-lg-0"
            style={{ maxWidth: "450px", flex: 1 }}
            onSubmit={(e) => {
              e.preventDefault();
              fetchProducts(searchTerm);
            }}
          >
            <div className="input-group rounded-pill shadow-sm">
              <input
                className="form-control border-0 rounded-start-pill"
                type="search"
                placeholder="🔍 Search products..."
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value === "") fetchProducts();
                }}
                style={{
                  padding: "12px",
                  boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
                }}
              />
              <button
                className="btn text-white rounded-end-pill"
                type="submit"
                style={{ backgroundColor: "#ffb400" }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <ul className="navbar-nav ms-auto align-items-center">
            {["Home", "Products", "Cart"].map((item, idx) => (
              <li className="nav-item mx-2" key={idx}>
                <a
                  className="nav-link fw-semibold text-white position-relative"
                  href={`/${item === "Home" ? "Home" : item.toLowerCase()}`}
                  style={{ fontSize: "16px" }}
                >
                  {item}
                  {/* ✅ Cart Badge */}
                  {item === "Cart" && cartItems.length > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "12px" }}
                    >
                      {cartItems.length}
                    </span>
                  )}
                </a>
              </li>
            ))}

            {/* User Profile / Login */}
            {username ? (
              <li className="nav-item dropdown mx-2">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center btn btn-link text-white fw-semibold"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-5 me-2"></i>
                  {username}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                  <li>
                    <a className="dropdown-item" href="/Orders">
                      My Orders
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/EditProfile">
                      Edit Profile
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = "/Login";
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <a
                  className="btn text-dark ms-3 px-4 py-2 fw-semibold"
                  href="/Login"
                  style={{
                    backgroundColor: "#ffb400",
                    borderRadius: "30px",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  Login
                </a>
              </li>
            )}
          </ul>
        </div>
      </nav>

     {/* Hero Section */}
<section
  className="hero d-flex flex-column justify-content-center align-items-center text-center"
  style={{
    height: "80vh",
    background:
      "linear-gradient(135deg, rgba(111,66,193,0.85), rgba(0,123,255,0.85)), url('/banner.jpg') center/cover no-repeat",
    color: "white",
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* Floating Decorative Shapes */}
  <div
    style={{
      position: "absolute",
      top: "10%",
      left: "5%",
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "rgba(255, 180, 0, 0.7)",
      animation: "float 6s ease-in-out infinite",
    }}
  ></div>
  <div
    style={{
      position: "absolute",
      bottom: "15%",
      right: "8%",
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.2)",
      animation: "float 8s ease-in-out infinite",
    }}
  ></div>

  {/* Hero Content */}
  <h1
    className="fw-bold mb-3"
    style={{
      fontSize: "3rem",
      textShadow: "2px 2px 10px rgba(0,0,0,0.4)",
    }}
  >
    Welcome to <span style={{ color: "#ffb400" }}>Shop Ease</span>!
  </h1>
  <p
    className="lead mb-4"
    style={{
      maxWidth: "650px",
      fontSize: "1.25rem",
      lineHeight: "1.8",
    }}
  >
    Discover <strong>premium products</strong> at unbeatable prices.  
    Experience shopping like never before – easy, fast, and stylish!
  </p>
  <a
    href="#products"
    className="btn btn-lg fw-semibold px-5 py-3 shadow"
    style={{
      background: "#ffb400",
      border: "none",
      borderRadius: "50px",
      color: "#000",
      fontSize: "1.1rem",
      transition: "all 0.3s ease",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = "#e0a800")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.background = "#ffb400")
    }
  >
    🛒 Shop Now
  </a>
</section>


      {/* 🔹 Products Section */}
      <section id="products" className="container py-5">
        <h2
          className="mb-4 fw-bold text-center"
          style={{ color: "#6f42c1" }}
        >
          Featured Products
        </h2>
        <div className="row">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div key={product.product_id} className="col-md-4 mb-4">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "15px",
                    overflow: "hidden",
                    transition: "0.3s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-8px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  {product.image_url && (
                    <img
                      src={`http://localhost:3000/uploads/${product.image_url}`}
                      className="card-img-top"
                      alt={product.name}
                      style={{
                        height: "230px",
                        objectFit: "contain",
                        backgroundColor: "#f8f9fa",
                      }}
                    />
                  )}
                  <div className="card-body text-center">
                    <h5 className="card-title fw-bold">{product.name}</h5>
                    <p className="text-muted small mb-2">₹{product.price}</p>
                    <button
                      className="btn text-white px-3 py-2"
                      style={{
                        backgroundColor: "#6f42c1",
                        borderRadius: "50px",
                        fontWeight: "600",
                      }}
                      onClick={() => addToCart(product.product_id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No products found</p>
          )}
        </div>
        {message && (
          <p className="mt-3 text-success text-center">{message}</p>
        )}
      </section>

      {/* 🔹 Footer */}
      <footer className="bg-dark text-light pt-5 pb-4 mt-5">
        <div className="container text-md-left">
          <div className="row text-md-left">
            {/* Column 1: About */}
            <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 fw-bold text-warning">
                ShopEase
              </h5>
              <p>
                Your one-stop shop for amazing products at unbeatable prices.
                We deliver quality and trust with every order. Shop with
                confidence!
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 fw-bold text-warning">
                Quick Links
              </h5>
              <p>
                <a href="/" className="text-light text-decoration-none">
                  Home
                </a>
              </p>
              <p>
                <a href="/products" className="text-light text-decoration-none">
                  Products
                </a>
              </p>
              <p>
                <a href="/cart" className="text-light text-decoration-none">
                  Cart
                </a>
              </p>
              <p>
                <a href="/contact" className="text-light text-decoration-none">
                  Contact Us
                </a>
              </p>
            </div>

            {/* Column 3: Customer Service */}
            <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 fw-bold text-warning">
                Customer Service
              </h5>
              <p>
                <a href="/faq" className="text-light text-decoration-none">
                  FAQ
                </a>
              </p>
              <p>
                <a href="/returns" className="text-light text-decoration-none">
                  Returns
                </a>
              </p>
              <p>
                <a href="/shipping" className="text-light text-decoration-none">
                  Shipping
                </a>
              </p>
              <p>
                <a href="/support" className="text-light text-decoration-none">
                  Support
                </a>
              </p>
            </div>

            {/* Column 4: Contact */}
            <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
              <h5 className="text-uppercase mb-4 fw-bold text-warning">
                Contact
              </h5>
              <p>
                <i className="bi bi-house-door me-2"></i> Mumbai, India
              </p>
              <p>
                <i className="bi bi-envelope me-2"></i> support@estore.com
              </p>
              <p>
                <i className="bi bi-phone me-2"></i> +91 98765 43210
              </p>
              <p>
                <i className="bi bi-printer me-2"></i> +91 11223 44556
              </p>
            </div>
          </div>

          <hr className="mb-4" />

          {/* Footer Bottom */}
          <div className="row align-items-center">
            <div className="col-md-7 col-lg-8">
              <p className="text-center text-md-start">
                © {new Date().getFullYear()}{" "}
                <strong className="text-warning">ShopEase</strong> | All
                Rights Reserved
              </p>
            </div>
            <div className="col-md-5 col-lg-4">
              <div className="text-center text-md-end">
                <a
                  href="https://facebook.com"
                  className="text-light me-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-facebook"></i>
                </a>
                <a
                  href="https://twitter.com"
                  className="text-light me-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-twitter"></i>
                </a>
                <a
                  href="https://instagram.com"
                  className="text-light me-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-instagram"></i>
                </a>
                <a
                  href="https://linkedin.com"
                  className="text-light"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
