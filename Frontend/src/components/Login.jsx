import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Login.css";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [role, setRole] = useState("admin"); // Default role is "admin"
  const [email, setEmail] = useState(""); // email state
  const [password, setPassword] = useState(""); // password state
  const [error, setError] = useState(""); // error message state

  const navigate = useNavigate(); // Initialize navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set the appropriate API URL based on the selected role
    const url =
      role === "admin"
        ? "http://localhost:5000/api/admin/login"
        : "http://localhost:5000/api/user/login";

    try {
      // Send POST request to login API
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful login
        console.log("User data:", data); // Log or store user data as needed
        setError(""); // Clear any previous errors on successful login

        // Redirect to dashboard after successful login
        navigate("/dashboard"); // You can replace "/dashboard" with your actual dashboard route
      } else {
        // Handle error if login fails
        setError(data.message || "An error occurred");

        // Remove error message after 5 seconds
        setTimeout(() => {
          setError(""); // Clear error after 5 seconds
        }, 5000);
      }
    } catch (error) {
      setError("Server Error: " + error.message);

      // Remove error message after 5 seconds
      setTimeout(() => {
        setError(""); // Clear error after 5 seconds
      }, 5000);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Role</label>
          <select
            className="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              className="password-icon"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button className="login-btn" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
