import React, { useState, useEffect } from "react";
import axios from "axios";

export default function EditProfile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
  });

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    axios.get(`http://localhost:3000/api/users/${userId}`).then((res) => {
      setProfile(res.data);
    });
  }, [userId]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:3000/api/users/${userId}`, profile);
    alert("Profile updated successfully!");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* 🔹 Navbar */}
      <nav
        className="navbar navbar-expand-lg shadow-sm sticky-top px-4"
        style={{
          background: "linear-gradient(90deg, #6f42c1, #007bff)",
        }}
      >
        <a
          className="navbar-brand fw-bold text-white"
          href="/"
          style={{ letterSpacing: "1px" }}
        >
          <i className="bi bi-cart4 me-2"></i> SHOP EASE
        </a>
      </nav>

      {/* 🔹 Profile Edit Section */}
      <section
        className="d-flex flex-column justify-content-center align-items-center"
        style={{
          minHeight: "90vh",
          background:
            "linear-gradient(135deg, rgba(111,66,193,0.1), rgba(0,123,255,0.1))",
          padding: "40px 20px",
        }}
      >
        <div
          className="card shadow-lg p-5"
          style={{
            maxWidth: "600px",
            width: "100%",
            borderRadius: "20px",
            border: "none",
          }}
        >
          <h3 className="text-center mb-4 fw-bold" style={{ color: "#6f42c1" }}>
            ✏️ Edit Profile
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                className="form-control shadow-sm"
                placeholder="Enter your name"
                required
                style={{ borderRadius: "12px", padding: "12px" }}
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="form-control shadow-sm"
                placeholder="Enter your email"
                required
                style={{ borderRadius: "12px", padding: "12px" }}
              />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="form-control shadow-sm"
                placeholder="Enter your phone number"
                style={{ borderRadius: "12px", padding: "12px" }}
              />
            </div>

            {/* Gender */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="form-select shadow-sm"
                style={{ borderRadius: "12px", padding: "12px" }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* DOB */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={profile.dob ? profile.dob.split("T")[0] : ""}
                onChange={handleChange}
                className="form-control shadow-sm"
                style={{ borderRadius: "12px", padding: "12px" }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Address</label>
              <textarea
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
                className="form-control shadow-sm"
                placeholder="Enter your full address"
                style={{ borderRadius: "12px", padding: "12px" }}
                required
              />
            </div>


            {/* Save Button */}
            <button
              type="submit"
              className="btn w-100 fw-semibold shadow"
              style={{
                backgroundColor: "#ffb400",
                border: "none",
                borderRadius: "50px",
                padding: "12px",
                fontSize: "1.1rem",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0a800")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ffb400")
              }
            >
              💾 Save Changes
            </button>
          </form>
        </div>
      </section>

      {/* 🔹 Footer */}
      <footer className="bg-dark text-light pt-4 pb-3">
        <div className="container text-center">
          <p className="mb-0">
            © {new Date().getFullYear()}{" "}
            <strong className="text-warning">Shop Ease</strong> | All Rights
            Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
