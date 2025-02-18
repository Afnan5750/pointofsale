import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaTrash, FaDownload, FaPrint } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../assets/Logo/logo.png";
import "../styles/Invoice.css";

const Invoice = () => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const fetchInvoices = async (filter) => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/total-invoices";

      if (filter === "daily") {
        url = "http://localhost:5000/api/invoices/today-invoices";
      } else if (filter === "monthly") {
        url = "http://localhost:5000/api/invoices/monthly-invoices";
      }

      const response = await fetch(url);
      const data = await response.json();
      setInvoiceData((data.invoices || data.invoicesDetails || []).reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(selectedFilter);
  }, [selectedFilter]);

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/invoices?_id=${invoiceId}`
      );
      const data = await response.json();
      if (data.length > 0) {
        setSelectedInvoice(data[0]);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  useEffect(() => {
    if (selectedFilter === "report") {
      fetchInvoices(selectedFilter); // Fetch invoices based on the selected filter (e.g., report)
    }
  }, [startDate, endDate, selectedFilter]);

  const handleDelete = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/invoices/${invoiceId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setInvoiceData((prevData) =>
            prevData.filter((invoice) => invoice._id !== invoiceId)
          );
        } else {
          alert("Failed to delete invoice");
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("An error occurred while deleting the invoice");
      }
    }
  };

  const handlePrint = async (invoiceId) => {
    try {
      // Fetch the invoice details using the provided API
      const response = await fetch(
        `http://localhost:5000/api/invoices?_id=${invoiceId}`
      );
      const data = await response.json();

      if (data.length === 0) {
        console.error("Invoice not found for ID:", invoiceId);
        return;
      }

      const invoice = data[0];

      const items = Array.isArray(invoice.items) ? invoice.items : [];

      const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const formatTime = () => {
        const d = new Date();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'
        return `${hours}:${minutes}:${seconds} ${ampm}`;
      };

      // Generate a URL for the imported logo
      const logoUrl = URL.createObjectURL(new Blob([logo]));

      const printContent = `
  <div style="width: 300px; font-family: 'Courier New', Courier, monospace; font-size: 12px; margin: auto; padding: 10px; border: 1px solid #000;">
    <div style="text-align: center; margin-bottom: 10px;">
      <img src="${logo}" alt="Company Logo" style="width: 80px; height: auto;" />
    </div>

    <h3 style="text-align: center; margin: 0; font-size: 16px; text-transform: uppercase;">Testing</h3>
    <p style="text-align: center; margin: 5px 0; font-size: 12px;">Testing Work</p>
    <p style="text-align: center; margin: 0; font-size: 10px;">Phone: +92 333 3395115</p>
    <p style="text-align: center; margin: 5px 0; font-size: 12px;">Email: mafnankhadim74@gmail.com</p>

    <hr style="border: 1px dashed #000; margin: 10px 0;">
    <p style="margin: 0; font-size: 12px;"><strong>ID:</strong> ${
      invoice._id || "N/A"
    }</p>
    <p style="margin: 0; font-size: 12px;"><strong>Customer Name:</strong> ${
      invoice.customerName || "N/A"
    }</p>  
    <p style="margin: 0; font-size: 12px;"><strong>Customer Contact:</strong> ${
      invoice.customerContactNo
    }</p>
    <p style="margin: 0; font-size: 12px;"><strong>Date:</strong> ${formatDate(
      invoice.createdAt
    )}</p>
    <p style="margin: 0; font-size: 12px;"><strong>Time:</strong> ${formatTime()}</p>  
    <p style="margin: 0; font-size: 12px;"><strong>Invoice No:</strong> ${
      invoice.invoiceNo
    }</p>
    <hr style="border: 1px dashed #000; margin: 10px 0;">

    <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left;">Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${
          items.length > 0
            ? items
                .map(
                  (item) => `
          <tr>
            <td style="text-align: left;">${item.productName}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${item.price}</td>
            <td style="text-align: right;">${(
              item.price * item.quantity
            ).toFixed(2)}</td>
          </tr>`
                )
                .join("")
            : `<tr><td colspan="4" style="text-align: center;">No items</td></tr>`
        }
      </tbody>
    </table>

    <hr style="border: 1px dashed #000; margin: 10px 0;">
    <p style="margin: 0; font-size: 12px; text-align: right;"><strong>Total:</strong> Rs. ${
      invoice.totalAmount
    }</p>
    <p style="margin: 0; font-size: 12px; text-align: right;"><strong>Service Charges:</strong> Rs. ${
      invoice.serviceCharges || "0.00"
    }</p>
    <p style="margin: 0; font-size: 12px; text-align: right;"><strong>Grand Total:</strong> Rs. ${
      invoice.netTotal || invoice.totalAmount
    }</p>

    <hr style="border: 1px dashed #000; margin: 10px 0;">
    <p style="margin: 0; font-size: 12px; text-align: right;"><strong>Customer Paid:</strong> Rs. ${
      invoice.paidAmount || "0.00"
    }</p>
    <p style="margin: 0; font-size: 12px; text-align: right;"><strong>Change Amount:</strong> Rs. ${
      invoice.changeAmount || "0.00"
    }</p>

    <hr style="border: 1px dashed #000; margin: 10px 0;">
    <p style="text-align: center; margin: 0; font-size: 12px;">Thank you for your visit!</p>
    <p style="text-align: center; margin: 0; font-size: 10px;">This is a computer-generated invoice.</p>
  </div>
`;

      const printWindow = window.open("", "", "height=600,width=400");
      printWindow.document.write(
        "<html><head><title>Invoice Print</title></head><body>"
      );
      printWindow.document.write(printContent);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Error fetching or printing the invoice:", error);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title of the report
    doc.setFontSize(22); // Set font size for the heading
    doc.setTextColor(73, 80, 87); // Set text color for the heading (#495057)
    doc.text("Invoice Report", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    }); // Centered text

    // Table headers
    const headers = [
      "Sr. No.",
      "ID",
      "Date",
      "Customer Name",
      "Customer Contact",
      "Total Amount",
    ];

    // Map the filteredInvoices data to rows
    const rows = filteredInvoices.map((invoice, index) => [
      index + 1, // Serial number (1, 2, 3, ...)
      invoice._id,
      new Date(invoice.createdAt).toLocaleDateString(),
      invoice.customerName,
      invoice.customerContactNo || "Not provided",
      `Rs. ${invoice.totalAmount}`,
    ]);

    // Calculate total amount
    const totalAmount = filteredInvoices.reduce(
      (acc, invoice) => acc + invoice.totalAmount,
      0
    );

    // Set up the autoTable in jsPDF
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 30, // Position where the table will start (after the title)
      styles: {
        halign: "center", // Center-align all table data
      },
    });

    // Add the total amount at the end of the table
    const lastY = doc.lastAutoTable.finalY; // Get the last Y position of the table

    // Set text color for the total amount
    doc.setFontSize(16); // Set font size for the total amount
    doc.setTextColor(73, 80, 87); // Set text color for the total amount (#495057)
    doc.text(
      `Total Amount: Rs. ${totalAmount}`,
      doc.internal.pageSize.getWidth() / 2,
      lastY + 10,
      { align: "center" }
    );

    // Add "Developed by M Afnan KHadim" under the total amount
    doc.setFontSize(8); // Set font size for the "Developed by" text
    doc.text(
      "Developed by M Afnan Khadim",
      doc.internal.pageSize.getWidth() / 2,
      lastY + 20,
      { align: "center" }
    );

    // Save the PDF
    doc.save("invoices.pdf");
  };

  const handleEdit = (invoiceId) => {
    navigate(`/create-invoice/${invoiceId}`);
  };

  const highlightText = (text, query) => {
    if (typeof text !== "string") return text;

    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts
      .map((part, index) =>
        part.toLowerCase() === query.toLowerCase()
          ? `<span class="highlighted">${part}</span>`
          : part
      )
      .join("");
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => row._id,
      sortable: true,
      cell: (row) => (
        <div
          className="invoice-table-cell"
          dangerouslySetInnerHTML={{
            __html: highlightText(row._id, searchQuery),
          }}
        />
      ),
    },
    {
      name: "Date",
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => {
        const formattedDate = (() => {
          const date = new Date(row.createdAt);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        })();
        return (
          <div
            className="invoice-table-cell"
            dangerouslySetInnerHTML={{
              __html: highlightText(formattedDate, searchQuery),
            }}
          />
        );
      },
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      cell: (row) => (
        <div
          className="invoice-table-cell"
          dangerouslySetInnerHTML={{
            __html: highlightText(row.customerName, searchQuery),
          }}
        />
      ),
    },
    {
      name: "Customer Contact",
      selector: (row) => row.customerContactNo,
      sortable: true,
      cell: (row) => (
        <div
          className="invoice-table-cell"
          dangerouslySetInnerHTML={{
            __html: highlightText(
              row.customerContactNo ? row.customerContactNo : "Not provided",
              searchQuery
            ),
          }}
        />
      ),
    },
    {
      name: "Total Amount",
      selector: (row) => row.totalAmount,
      sortable: true,
      cell: (row) => (
        <div className="invoice-table-cell">Rs. {row.totalAmount}</div>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="invoice-action-buttons">
          <button
            className="invoice-action-btn"
            onClick={() => fetchInvoiceDetails(row._id)}
          >
            <FaEye className="invoice-action-icon" />
          </button>
          <button
            className="invoice-action-btn"
            onClick={() => handleEdit(row._id)}
          >
            <FaEdit className="invoice-action-icon" />
          </button>
          <button
            className="invoice-action-btn"
            onClick={() => handlePrint(row._id)}
          >
            <FaPrint className="invoice-action-icon" />
          </button>
          <button
            className="invoice-action-btn"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrash className="invoice-action-icon" />
          </button>
        </div>
      ),
    },
  ];

  const filteredInvoices = invoiceData
    .filter((invoice) => {
      // Filter by the date range
      const invoiceDate = new Date(invoice.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Ensure endDate is inclusive by adjusting the end date to the end of the day (23:59:59.999)
      if (endDate) {
        end.setHours(23, 59, 59, 999);
      }

      const isInDateRange =
        (!startDate && !endDate) || // If no date range is set, show all invoices
        (startDate && !endDate && invoiceDate >= start) || // Only start date filter
        (!startDate && endDate && invoiceDate <= end) || // Only end date filter
        (startDate && endDate && invoiceDate >= start && invoiceDate <= end); // Full range filter

      // Filter by the search query
      const isMatchingSearch =
        invoice.customerName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        invoice._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.createdAt.toLowerCase().includes(searchQuery.toLowerCase());

      // Return only the invoices that match both the search query and the date range
      return isInDateRange && isMatchingSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const modalStyles = {
    display: modalVisible ? "block" : "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1000,
  };

  const modalContentStyles = {
    backgroundColor: "white",
    padding: "20px",
    margin: "50px auto",
    maxWidth: "600px",
    maxHeight: "95vh",
    overflowY: "scroll",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    borderRadius: "8px",
    position: "relative",
  };

  modalContentStyles["::-webkit-scrollbar"] = {
    display: "none",
  };

  return (
    <div className="invoice-table-container">
      <h2 className="invoice-table-title">Invoice List</h2>

      <div className="invoice-filter">
        <div className="radio-buttons">
          <label>
            <input
              type="radio"
              name="filter"
              value="all"
              checked={selectedFilter === "all"}
              onChange={() => {
                setSelectedFilter("all");
                setShowDateRange(false);
                setStartDate(""); // Reset startDate
                setEndDate(""); // Reset endDate
              }}
            />
            All Invoices
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              value="daily"
              checked={selectedFilter === "daily"}
              onChange={() => {
                setSelectedFilter("daily");
                setShowDateRange(false);
                setStartDate(""); // Reset startDate
                setEndDate(""); // Reset endDate
              }}
            />
            Daily
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              value="monthly"
              checked={selectedFilter === "monthly"}
              onChange={() => {
                setSelectedFilter("monthly");
                setShowDateRange(false);
                setStartDate(""); // Reset startDate
                setEndDate(""); // Reset endDate
              }}
            />
            Monthly
          </label>
          <label>
            <input
              type="radio"
              name="filter"
              value="report"
              checked={selectedFilter === "report"}
              onChange={() => {
                setSelectedFilter("report");
                setShowDateRange(true);
              }}
            />
            Report
          </label>
        </div>

        {showDateRange && (
          <div className="date-range-filter">
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="invoice-download-btn">
          <button onClick={downloadPDF} title="Download Invoice">
            <FaDownload /> {/* PDF icon here */}
          </button>
        </div>
      </div>

      <div className="invoice-search-box">
        <input
          type="text"
          className="invoice-search-input"
          placeholder="Search by Customer Name or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredInvoices}
          pagination
          highlightOnHover
        />
      )}

      {selectedInvoice && (
        <div style={modalStyles} onClick={() => setModalVisible(false)}>
          <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
            <button
              className="invoice-action-btn"
              onClick={() => handlePrint(selectedInvoice._id)}
            >
              <FaPrint className="invoice-action-icon" />
            </button>
            <button
              className="close-modal-button"
              onClick={() => setModalVisible(false)}
            >
              &times;
            </button>

            <h3 className="invoice-details-title">Invoice</h3>

            <div className="invoice-details-info">
              <p className="invoice-details-text">
                <span className="invoice-details-strong">ID:</span>{" "}
                {selectedInvoice._id}
              </p>
              <p className="invoice-details-text">
                <span className="invoice-details-strong">Customer Name:</span>{" "}
                {selectedInvoice.customerName}
              </p>
              <p className="invoice-details-text">
                <span className="invoice-details-strong">
                  Customer Contact:
                </span>{" "}
                {selectedInvoice.customerContactNo || "Not provided"}
              </p>
              <p className="invoice-details-text">
                <span className="invoice-details-strong">Date:</span>{" "}
                {(() => {
                  const date = new Date(selectedInvoice.createdAt);
                  const day = String(date.getDate()).padStart(2, "0");
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const year = date.getFullYear();
                  return `${day}-${month}-${year}`;
                })()}
              </p>
              <p className="invoice-details-text">
                <span className="invoice-details-strong">Invoice No:</span>{" "}
                {selectedInvoice.invoiceNo}
              </p>
              {/* <p className="invoice-details-text">
                <span className="invoice-details-strong">Total Amount:</span>{" "}
                Rs. {selectedInvoice.totalAmount}
              </p> */}
            </div>

            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td> {item.price}</td>
                    <td>
                      {item.price && item.quantity
                        ? `Rs. ${item.price * item.quantity}`
                        : "Not calculated"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="invoice-total-container">
              <p className="invoice-total-text">
                Grand Total: Rs. {selectedInvoice.totalAmount}
              </p>
            </div>

            <div className="invoice-footer">
              <p>Thank you for your business!</p>
              <p>
                Invoice generated on{" "}
                {(() => {
                  const date = new Date();
                  const day = String(date.getDate()).padStart(2, "0");
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const year = date.getFullYear();
                  return `${day}-${month}-${year}`;
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
