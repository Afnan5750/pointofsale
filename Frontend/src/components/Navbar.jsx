import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/Logo/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("userToken"); // Clear user session
    setDropdownVisible(false); // Hide dropdown
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="navbar">
      {/* Left Side: Logo */}
      <div className="navbar-left">
        <a href="/dashboard">
          <img src={logo} alt="POS Logo" className="logo-image" />
        </a>
      </div>

      {/* Right Side: Profile Icon */}
      <div className="navbar-right">
        <div className="profile-icon" onClick={toggleDropdown}>
          <FaUserCircle size={30} color="white" />
        </div>

        {/* Dropdown Menu */}
        {dropdownVisible && (
          <div className="dropdown-menu" ref={dropdownRef}>
            <div className="dropdown-item" onClick={handleLogout}>
              <FaSignOutAlt size={16} color="#495057" /> Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
