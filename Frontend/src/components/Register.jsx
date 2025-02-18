import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility state
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // Confirm Password visibility state
  const [role, setRole] = useState("admin"); // Default role is "admin"
  const [email, setEmail] = useState(""); // email state
  const [password, setPassword] = useState(""); // password state
  const [error, setError] = useState(""); // error message state
  const [confirmPassword, setConfirmPassword] = useState(""); // confirm password state
  const [successMessage, setSuccessMessage] = useState(""); // success message state

  const navigate = useNavigate(); // Initialize navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setTimeout(() => setError(""), 5000);
      return;
    }

    // Set the appropriate API URL based on the selected role
    const url =
      role === "admin"
        ? "http://localhost:5000/api/admin/register"
        : "http://localhost:5000/api/user/register";

    try {
      // Send POST request to register API
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }), // Include role in request body
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful registration
        setSuccessMessage("Registration successful. You can now login.");

        // Set timeout for 5 seconds before redirect
        setTimeout(() => {
          setSuccessMessage(""); // Clear success message
          navigate("/login"); // Redirect to login page
        }, 2000);
      } else {
        // Handle error if registration fails
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
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Role</label>
          <select
            className="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value)} // Handle role change
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

        <div className="form-group">
          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div
              className="password-icon"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        {/* Display error message */}
        {error && <div className="error-message">{error}</div>}

        {/* Display success message */}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <button className="register-btn" type="submit">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
