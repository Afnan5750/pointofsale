import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileInvoice,
  FaBox,
  FaList,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  // Handle Logout with Confirmation
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      // Perform logout actions (e.g., clearing user session)
      navigate("/login"); // Redirect to login page
    }
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo">
          <img
            src="src/assets/Logo/logo2.png"
            alt="Logo"
            className="logo-img"
          />
        </div>
        <div className="sidebar-title">
          <h2>Point of Sale</h2>
          <p>Sell smarter, manage easier</p>
        </div>
      </div>

      {/* Sidebar Menu */}
      <ul className="sidebar-list">
        <li className="sidebar-item">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active sidebar-link" : "sidebar-link"
            }
          >
            <FaTachometerAlt className="icon" /> Dashboard
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink
            to="/create-invoice"
            className={({ isActive }) =>
              isActive ? "active sidebar-link" : "sidebar-link"
            }
          >
            <FaFileInvoice className="icon" /> Create Invoice
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink
            to="/invoice"
            className={({ isActive }) =>
              isActive ? "active sidebar-link" : "sidebar-link"
            }
          >
            <FaFileInvoice className="icon" /> Invoice
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink
            to="/product"
            className={({ isActive }) =>
              isActive ? "active sidebar-link" : "sidebar-link"
            }
          >
            <FaBox className="icon" /> Products
          </NavLink>
        </li>

        <li className="sidebar-item">
          <NavLink
            to="/category"
            className={({ isActive }) =>
              isActive ? "active sidebar-link" : "sidebar-link"
            }
          >
            <FaList className="icon" /> Category
          </NavLink>
        </li>
      </ul>

      {/* Logout */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link logout-btn">
          <FaSignOutAlt className="icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
