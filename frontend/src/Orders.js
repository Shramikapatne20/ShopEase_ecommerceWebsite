import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`http://localhost:3000/api/orders/${userId}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, [userId]);

  if (!orders || orders.length === 0)
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <h3 className="text-muted">🛒 You have no orders yet.</h3>
        <a
          href="/products"
          className="btn mt-3 px-4 py-2 fw-semibold"
          style={{
            backgroundColor: "#ffb400",
            borderRadius: "30px",
            boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
          }}
        >
          Start Shopping
        </a>
      </div>
    );

  return (
    <div>
      {/* 🔹 Hero Banner */}
      <section
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{
          height: "40vh",
          background:
            "linear-gradient(135deg, rgba(111,66,193,0.9), rgba(0,123,255,0.9)), url('/orders-bg.jpg') center/cover no-repeat",
          color: "white",
          position: "relative",
        }}
      >
        <h1
          className="fw-bold mb-3"
          style={{
            fontSize: "2.5rem",
            textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          My <span style={{ color: "#ffb400" }}>Orders</span>
        </h1>
        <p className="lead" style={{ maxWidth: "600px" }}>
          Track your purchases, check order details, and relive your shopping
          experience!
        </p>
      </section>

      {/* 🔹 Orders List */}
      <div className="container py-5">
        {orders.map((order) => (
          <div
            key={order.order_id}
            className="mb-5 card shadow border-0"
            style={{
              borderRadius: "15px",
              overflow: "hidden",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-6px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            {/* Card Header */}
            <div
              className="card-header d-flex justify-content-between align-items-center text-white"
              style={{
                background:
                  "linear-gradient(90deg, #6f42c1, #007bff)",
                fontWeight: "600",
              }}
            >
              <span>
                <i className="bi bi-calendar-event me-2"></i>
                {new Date(order.created_at).toLocaleString()}
              </span>
              <span
                className={`badge fs-6 px-3 py-2 ${
                  order.status === "placed"
                    ? "bg-success"
                    : order.status === "pending"
                    ? "bg-warning text-dark"
                    : "bg-secondary"
                }`}
                style={{ borderRadius: "30px" }}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Card Body */}
            <div className="card-body">
              {order.products.map((product) => (
                <div
                  key={product.product_id}
                  className="d-flex align-items-center mb-3 p-2 rounded"
                  style={{
                    backgroundColor: "#f9f9f9",
                    border: "1px solid #eee",
                  }}
                >
                  <img
                    src={`http://localhost:3000/uploads/${product.image_url}`}
                    alt={product.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      marginRight: "15px",
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-semibold">{product.name}</h6>
                    <p className="text-muted small mb-0">
                      ₹{product.price} × {product.quantity}
                    </p>
                  </div>
                  <p className="fw-bold mb-0">
                    ₹{product.price * product.quantity}
                  </p>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <p className="fw-bold fs-5 mb-0">
                  Total: ₹
                  {order.products.reduce(
                    (acc, p) => acc + p.price * p.quantity,
                    0
                  )}
                </p>
                <p className="mb-0">
                  <span className="fw-semibold">Payment:</span>{" "}
                  {order.payment_method} ({order.payment_status})
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
