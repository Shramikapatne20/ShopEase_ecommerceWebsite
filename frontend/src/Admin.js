import React, { useState, useEffect } from "react";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image_url: "",
  });
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [soldPerCategory, setSoldPerCategory] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchDashboardMetrics = async () => {
    try {
      const usersRes = await fetch("http://localhost:3000/api/admin/users-count");
      const usersData = await usersRes.json();
      setUserCount(usersData.count);

      const ordersRes = await fetch("http://localhost:3000/api/admin/orders-count");
      const ordersData = await ordersRes.json();
      setOrderCount(ordersData.count);

      const revenueRes = await fetch("http://localhost:3000/api/admin/total-revenue");
      const revenueData = await revenueRes.json();
      setTotalRevenue(revenueData.total_revenue);

      const categoryRes = await fetch("http://localhost:3000/api/admin/sold-per-category");
      const categoryData = await categoryRes.json();
      setSoldPerCategory(categoryData);
    } catch (err) {
      console.error("Error fetching dashboard metrics:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDashboardMetrics();
    const interval = setInterval(fetchDashboardMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("category", formData.category);
    if (file) formDataToSend.append("image", file);
    if (formData.image_url) formDataToSend.append("image_url", formData.image_url);

    try {
      let url = "http://localhost:3000/api/products";
      let method = "POST";
      if (editId) {
        url = `http://localhost:3000/api/products/${editId}`;
        method = "PUT";
      }
      const res = await fetch(url, { method, body: formDataToSend });
      if (!res.ok) throw new Error("Failed to save product");

      alert(editId ? "Product updated successfully!" : "Product added successfully!");
      fetchProducts();
      setFormData({ name: "", price: "", category: "", image_url: "" });
      setFile(null);
      setEditId(null);
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`http://localhost:3000/api/products/${id}`, {
        method: "DELETE",
      });
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleEdit = (p) => {
    setFormData({
      name: p.name,
      price: p.price,
      category: p.category,
      image_url: p.image_url,
    });
    setFile(null);
    setEditId(p.product_id);
  };

  const categories = ["Electronics", "Fashion", "Books", "Home Appliances"];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg shadow-sm sticky-top px-4 mb-4"
        style={{ background: "linear-gradient(90deg, #6f42c1, #007bff)" }}
      >
        <span className="navbar-brand fw-bold text-white">
          <i className="bi bi-speedometer2 me-2"></i> Admin Panel
        </span>
      </nav>

      <div className="container">
        {/* Dashboard */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 text-center p-3" style={{ background: "#6f42c1", color: "white" }}>
              <h5>Total Users</h5>
              <h2>{userCount}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 text-center p-3" style={{ background: "#007bff", color: "white" }}>
              <h5>Total Orders</h5>
              <h2>{orderCount}</h2>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 text-center p-3" style={{ background: "#ffb400", color: "black" }}>
              <h5>Total Revenue</h5>
              <h2>₹{totalRevenue}</h2>
            </div>
          </div>
        </div>

        {/* Products Sold per Category */}
        <div className="card shadow-sm border-0 rounded-4 mb-4 p-3">
          <h5 className="fw-bold text-primary mb-3">Products Sold per Category</h5>
          <ul className="list-group">
            {soldPerCategory.map((cat, i) => (
              <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                {cat.category}
                <span className="badge bg-primary rounded-pill">{cat.total_sold}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Form */}
        <div className="card shadow-sm border-0 rounded-4 mb-4 p-4">
          <h5 className="fw-bold text-primary mb-3">{editId ? "Edit Product" : "Add Product"}</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
              <input
                name="name"
                className="form-control"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <input
                name="price"
                className="form-control"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <input type="file" className="form-control" onChange={handleFileChange} />
              {file && <img src={URL.createObjectURL(file)} alt="preview" className="mt-2 rounded" width="100" />}
              {formData.image_url && !file && (
                <img src={`http://localhost:3000/uploads/${formData.image_url}`} alt="current" className="mt-2 rounded" width="100" />
              )}
            </div>
            <div className="col-md-12">
              <button type="submit" className="btn btn-primary px-4 rounded-pill">
                {editId ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </div>

        {/* Product List */}
        <h3 className="fw-bold text-primary mb-3">Products</h3>
        <div className="row">
          {products.map((p) => (
            <div key={p.product_id} className="col-md-4 mb-4">
              <div className="card shadow-sm border-0 h-100 rounded-4">
                {p.image_url && (
                  <img
                    src={`http://localhost:3000/uploads/${p.image_url}`}
                    alt={p.name}
                    className="card-img-top"
                    style={{ height: "200px", objectFit: "contain", background: "#f8f9fa" }}
                  />
                )}
                <div className="card-body text-center">
                  <h5 className="fw-bold">{p.name}</h5>
                  <p className="text-muted">₹{p.price}</p>
                  <p className="badge bg-secondary">{p.category}</p>
                  <div className="mt-3">
                    <button className="btn btn-sm btn-warning me-2 rounded-pill" onClick={() => handleEdit(p)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger rounded-pill" onClick={() => handleDelete(p.product_id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
