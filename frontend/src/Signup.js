import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dob: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required!");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Show success toast
        toast.success("Account created successfully! 🎉 Please login.", {
          position: "top-center",
          autoClose: 2000,
        });

        setError("");
        setFormData({
          username: "",
          email: "",
          password: "",
          phone: "",
          gender: "",
          dob: "",
        });

        // Navigate to login after delay so toast is visible
        setTimeout(() => {
          navigate("/login");
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
      {/* Floating background elements */}
      <div style={styles.floatingCircle1}></div>
      <div style={styles.floatingCircle2}></div>

      <div style={styles.container}>
        <h2 style={styles.title}>Create Your Account</h2>
        <p style={styles.subtitle}>
          Join us and start shopping your favorite products!
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
          />
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
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            style={styles.input}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>
            Sign Up
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.loginLink}>
            Login
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

  // Floating design elements
  floatingCircle1: {
    position: "absolute",
    width: "200px",
    height: "200px",
    backgroundColor: "#6f42c1",
    borderRadius: "50%",
    top: "-50px",
    left: "-50px",
    opacity: 0.2,
  },
  floatingCircle2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    backgroundColor: "#007bff",
    borderRadius: "50%",
    bottom: "-100px",
    right: "-100px",
    opacity: 0.15,
  },

  // Signup form container
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

  // Feedback messages
  error: {
    color: "red",
    fontSize: "14px",
  },

  // Login link
  loginText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#555",
  },
  loginLink: {
    color: "#6f42c1",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
