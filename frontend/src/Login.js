import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("All fields are required!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", data.username);

        // ✅ Success toast
        toast.success("Login Successful!", {
          position: "top-center",
          autoClose: 2000,
        });

        setError("");

        // Delay navigation so toast is visible
        setTimeout(() => {
          if (data.role === "admin") {
            navigate("/Admin");
          } else {
            navigate("/Home");
          }
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div style={styles.containerWrapper}>
      {/* Floating background circles */}
      <div style={styles.floatingCircle1}></div>
      <div style={styles.floatingCircle2}></div>

      <div style={styles.container}>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Login to continue shopping</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={styles.linkText}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Register
          </Link>
        </p>
        <p style={styles.linkText}>
          <Link to="/forgot-password" style={styles.link}>
            Forgot Password?
          </Link>
        </p>
      </div>

      {/* ✅ Toast container added here */}
      <ToastContainer />
    </div>
  );
}

const styles = {
  // Background wrapper
  containerWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  // Floating background elements
  floatingCircle1: {
    position: "absolute",
    width: "220px",
    height: "220px",
    backgroundColor: "#6f42c1",
    borderRadius: "50%",
    top: "-60px",
    left: "-60px",
    opacity: 0.2,
  },
  floatingCircle2: {
    position: "absolute",
    width: "320px",
    height: "320px",
    backgroundColor: "#007bff",
    borderRadius: "50%",
    bottom: "-120px",
    right: "-120px",
    opacity: 0.15,
  },

  // Login form container
  container: {
    width: "400px",
    padding: "35px",
    borderRadius: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    background: "white",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },

  // Typography
  title: {
    marginBottom: "10px",
    color: "#333",
    fontSize: "28px",
    fontWeight: "600",
  },
  subtitle: {
    marginBottom: "20px",
    fontSize: "14px",
    color: "#666",
  },

  // Form styles
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
    transition: "0.3s",
  },
  button: {
    padding: "12px",
    backgroundColor: "#6f42c1",
    color: "white",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
  },

  // Error
  error: {
    color: "red",
    fontSize: "14px",
  },

  // Links
  linkText: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#555",
  },
  link: {
    color: "#6f42c1",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
