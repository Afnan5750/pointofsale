import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import {
  FaDollarSign,
  FaBox,
  FaFileInvoice,
  FaList,
  FaChartLine,
} from "react-icons/fa";
import axios from "axios";

const Dashboard = () => {
  const [totalInvoices, setTotalInvoices] = useState({
    totalInvoicesCount: 0,
    invoices: [],
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [monthlyInvoices, setMonthlyInvoices] = useState(0);
  const [todayInvoices, setTodayInvoices] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  useEffect(() => {
    const fetchTotalInvoices = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/total-invoices"
        );
        setTotalInvoices({
          totalInvoicesCount: response.data.totalInvoices,
          invoices: response.data.invoices,
        });
      } catch (error) {
        console.error("Error fetching total invoices:", error);
      }
    };

    fetchTotalInvoices();
  }, []);

  useEffect(() => {
    const fetchTotalProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/total-products"
        );
        setTotalProducts(response.data.totalProducts);
      } catch (error) {
        console.error("Error fetching total products:", error);
      }
    };

    fetchTotalProducts();
  }, []);

  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/total-sales"
        );
        setTotalSales(response.data);
      } catch (error) {
        console.error("Error fetching total sales:", error);
      }
    };

    fetchTotalSales();
  }, []);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/current-month-sales"
        );
        setMonthlySales(response.data.totalSales);
      } catch (error) {
        console.error("Error fetching monthly sales:", error);
      }
    };

    fetchMonthlySales();
  }, []);

  useEffect(() => {
    const fetchTodaySales = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/current-day-sales"
        );
        setTodaySales(response.data.totalSales);
      } catch (error) {
        console.error("Error fetching today's sales:", error);
      }
    };

    fetchTodaySales();
  }, []);

  useEffect(() => {
    const fetchMonthlyInvoices = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/invoices/monthly-invoices"
        );
        setMonthlyInvoices(response.data.invoicesCount);
      } catch (error) {
        console.error("Error fetching monthly invoices:", error);
      }
    };

    fetchMonthlyInvoices();
  }, []);

  useEffect(() => {
    const fetchTodayInvoices = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/invoices/today-invoices"
        );
        setTodayInvoices(response.data.invoicesCount);
      } catch (error) {
        console.error("Error fetching today's invoices:", error);
      }
    };

    fetchTodayInvoices();
  }, []);

  useEffect(() => {
    const fetchTotalCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories"
        );
        setTotalCategories(response.data.total || 0);
      } catch (error) {
        console.error("Error fetching total categories:", error);
      }
    };

    fetchTotalCategories();
  }, []);

  // if amount in K format
  // const formatAmount = (amount) => {
  //   if (amount >= 1000000) {
  //     return (amount / 1000000).toFixed(1) + "M";
  //   } else if (amount >= 1000) {
  //     return (amount / 1000).toFixed(1) + "k";
  //   }
  //   return amount;
  // };

  return (
    <div className="main-content">
      <div className="cards">
        {/* Profit Card */}
        <div className="card card-profit">
          <div className="card-icon">
            <FaChartLine />
          </div>
          <h3 className="card-title">Total Profit</h3>
          <p className="card-value">Rs. 7654345</p>
        </div>

        {/* Sales Cards */}
        <div className="card card-sales">
          <div className="card-icon">
            <FaDollarSign />
          </div>
          <h3 className="card-title">Total Sales</h3>
          <p className="card-value">Rs. {totalSales}</p>
        </div>

        <div className="card card-monthly-sales">
          <div className="card-icon">
            <FaDollarSign />
          </div>
          <h3 className="card-title">Monthly Sales</h3>
          <p className="card-value">Rs. {monthlySales}</p>
        </div>

        <div className="card card-today-sales">
          <div className="card-icon">
            <FaDollarSign />
          </div>
          <h3 className="card-title">Today's Sales</h3>
          <p className="card-value">Rs. {todaySales}</p>
        </div>

        {/* Invoice Cards */}
        <div className="card card-invoices">
          <div className="card-icon">
            <FaFileInvoice />
          </div>
          <h3 className="card-title">Total Invoices</h3>
          <p className="card-value">
            {totalInvoices.totalInvoicesCount} Invoices
          </p>
        </div>

        <div className="card card-monthly-invoices">
          <div className="card-icon">
            <FaFileInvoice />
          </div>
          <h3 className="card-title">Monthly Invoices</h3>
          <p className="card-value">{monthlyInvoices} Invoices</p>
        </div>

        <div className="card card-today-invoices">
          <div className="card-icon">
            <FaFileInvoice />
          </div>
          <h3 className="card-title">Today's Invoices</h3>
          <p className="card-value">{todayInvoices} Invoices</p>
        </div>

        {/* Additional Cards */}
        <div className="card total-categories">
          <div className="card-icon">
            <FaList />
          </div>
          <h3 className="card-title">Total Categories</h3>
          <p className="card-value">{totalCategories} Categories</p>
        </div>

        <div className="card card-products">
          <div className="card-icon">
            <FaBox />
          </div>
          <h3 className="card-title">Total Products</h3>
          <p className="card-value">{totalProducts} Products</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
