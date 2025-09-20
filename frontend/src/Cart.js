import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem("user_id");

  // ✅ Load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ Fetch cart
  const fetchCart = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/cart/${userId}`);
      setCartItems(res.data || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ✅ Remove item
  const removeFromCart = async (cartId) => {
    try {
      await axios.delete(`http://localhost:3000/api/cart/${cartId}`);
      setMessage("Item removed from cart");
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
      setMessage("Failed to remove item");
    }
  };

  // ✅ Update quantity
  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`http://localhost:3000/api/cart/${cartId}`, {
        quantity: newQuantity,
      });
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
      setMessage("Failed to update quantity");
    }
  };

  // ✅ Total price
  const getTotal = () =>
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // ✅ Handle Payment
  const handlePayment = async () => {
    const userRes = await axios.get(`http://localhost:3000/api/users/${userId}`);
    if (!userRes.data.address) {
      alert("⚠️ Please add your address before placing an order.");
      window.location.href = "/EditProfile"; // redirect to profile page
      return;
    }
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      // ✅ Create Razorpay order from backend
      const orderRes = await axios.post(
        "http://localhost:3000/api/payment/orders",
        { amount: getTotal() }
      );

      const options = {
        key: "rzp_test_djeFhOqR1vS9bu", // Replace with your Razorpay Key ID
        amount: orderRes.data.amount,
        currency: "INR",
        name: "My E-Commerce Store",
        description: "Order Payment",
        order_id: orderRes.data.id,
        handler: async function (response) {
          const verifyRes = await axios.post(
            "http://localhost:3000/api/payment/verify",
            { ...response, user_id: userId }
          );

          if (verifyRes.data.success) {
            alert("✅ Order placed successfully!");
            setCartItems([]); // clear cart
          } else {
            alert("❌ Payment failed!");
          }
        },
        prefill: {
          name: "Shramika Patane",
          email: "user@example.com",
          contact: "9876543210",
        },
        theme: {
          color: "#6f42c1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Something went wrong during payment.");
    }
  };

  return (
    <div
      className="container py-5"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      <h2
        className="mb-4 fw-bold text-center"
        style={{ color: "#6f42c1" }}
      >
        🛒 Your Shopping Cart
      </h2>

      {!userId ? (
        <p className="text-danger text-center">
          Please log in to view your cart
        </p>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">Your cart is empty.</h5>
          <a href="/Home" className="btn btn-warning mt-3 fw-semibold px-4">
            Browse Products
          </a>
        </div>
      ) : (
        <>
          <div className="table-responsive shadow rounded">
            <table className="table align-middle mb-0">
              <thead
                style={{
                  background: "linear-gradient(90deg, #6f42c1, #007bff)",
                  color: "white",
                }}
              >
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.cart_id}>
                    <td>
                      <img
                        src={`http://localhost:3000/uploads/${item.image_url}`}
                        alt={item.name}
                        width="70"
                        className="rounded shadow-sm"
                        style={{ background: "#f8f9fa", padding: "5px" }}
                      />
                    </td>
                    <td className="fw-semibold">{item.name}</td>
                    <td className="fw-bold text-success">₹{item.price}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-warning me-2 rounded-circle"
                          onClick={() =>
                            updateQuantity(item.cart_id, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="px-2 fw-bold">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-warning ms-2 rounded-circle"
                          onClick={() =>
                            updateQuantity(item.cart_id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="fw-bold">₹{item.price * item.quantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger rounded-pill px-3"
                        onClick={() => removeFromCart(item.cart_id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="text-end fw-bold fs-5">
                    Grand Total:
                  </td>
                  <td colSpan="2" className="fw-bold fs-5 text-success">
                    ₹{getTotal()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ✅ Payment Button */}
          <div className="text-end mt-4">
            <button
              className="btn btn-lg text-white fw-semibold px-5 py-3 shadow"
              style={{
                background: "linear-gradient(90deg, #6f42c1, #007bff)",
                borderRadius: "50px",
              }}
              onClick={handlePayment}
            >
              Place Order & Pay ₹{getTotal()}
            </button>
          </div>
        </>
      )}

      {message && (
        <p className="mt-3 text-success text-center fw-semibold">{message}</p>
      )}
    </div>
  );
}
