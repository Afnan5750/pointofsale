import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Register from "./components/Register";
import CreateInvoice from "./Pages/CreateInvoice";
import Invoice from "./Pages/Invoice";
import Dashboard from "./Pages/Dashboard";
import Navbar from "./components/Navbar";
import Product from "./Pages/Product";
import Category from "./Pages/Category";
import "./App.css";

const App = () => {
  const location = useLocation();

  return (
    <div className="app">
      {/* <Navbar /> */}

      <div className="main-container">
        {location.pathname !== "/login" &&
          location.pathname !== "/" &&
          location.pathname !== "/register" && <Sidebar />}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>

        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-invoice" element={<CreateInvoice />} />
            <Route
              path="/create-invoice/:invoiceId"
              element={<CreateInvoice />}
            />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/product" element={<Product />} />
            <Route path="/category" element={<Category />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
