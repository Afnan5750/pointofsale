import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCalculator } from "react-icons/fa";
import "../styles/CreateInvoice.css";

const CreateInvoice = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerContactNo, setCustomerContactNo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [change, setChange] = useState(0);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState("");
  const paidAmountRef = useRef(null);

  const { invoiceId } = useParams();
  const navigate = useNavigate(); // Initialize the navigate function

  const fetchProducts = async (query) => {
    if (query.trim()) {
      const response = await fetch(
        `http://localhost:5000/api/products?name=${query}`
      );
      const data = await response.json();
      setProducts(data);
      setIsDropdownVisible(data.length > 0);
    } else {
      setProducts([]);
      setIsDropdownVisible(false);
    }
  };

  const fetchInvoiceData = async (id) => {
    const response = await fetch(
      `http://localhost:5000/api/invoices?_id=${id}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const invoice = data[0];
      setInvoiceData(invoice);
      if (invoice.items) {
        setSelectedProducts(
          invoice.items.map((item) => ({
            name: item.productName,
            company: item.company,
            price: item.price,
            quantity: item.quantity,
          }))
        );
        setCustomerName(invoice.customerName || "");
        setCustomerContactNo(invoice.customerContactNo || "");
        setPaidAmount(invoice.paidAmount || 0);
        setChange(invoice.changeAmount || 0);
      }
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceData(invoiceId);
    }
  }, [invoiceId]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchProducts(query);
  };

  const handleSelectProduct = (product) => {
    setSelectedProducts((prevProducts) => [
      ...prevProducts,
      { ...product, quantity: 1 },
    ]);
    setSearchQuery("");
    setIsDropdownVisible(false);
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((_, i) => i !== index)
    );
  };

  const handleQuantityChange = (index, newQuantity) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product, i) =>
        i === index ? { ...product, quantity: newQuantity } : product
      )
    );
  };

  const handleSubmitInvoice = async () => {
    const finalCustomerName = customerName || "Afnan";
    const finalCustomerContactNo = customerContactNo || "03333395115";

    const invoice = {
      customerName: finalCustomerName,
      customerContactNo: finalCustomerContactNo,
      items: selectedProducts.map((product) => ({
        productName: product.name,
        price: product.price,
        quantity: product.quantity,
        company: product.company,
      })),
      paidAmount: paidAmount, // Make sure this value is set properly
      changeAmount: change, // Make sure this value is set properly
    };

    let response;

    if (invoiceId) {
      // If there's an invoiceId, we are updating an existing invoice (PUT request)
      response = await fetch(
        `http://localhost:5000/api/invoices/${invoiceId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoice),
        }
      );
    } else {
      // If there's no invoiceId, we are creating a new invoice (POST request)
      response = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([invoice]),
      });
    }

    // Handle the response after the request is made
    if (response.ok) {
      alert(
        invoiceId
          ? "Invoice updated successfully!" // If it's a PUT request
          : "Invoice submitted successfully!" // If it's a POST request
      );

      // Close the modal after successful submission
      setIsModalOpen(false);

      // Reset the form
      setSelectedProducts([]);
      setCustomerName("");
      setCustomerContactNo("");
      setSearchQuery("");
      setProducts([]);
      setIsDropdownVisible(false);

      // Redirect to the invoice details page after successful update
      if (invoiceId) {
        navigate(`/invoice`);
      }
    } else {
      alert("Error submitting invoice.");
    }
  };

  useEffect(() => {
    if (isModalOpen && paidAmountRef.current) {
      paidAmountRef.current.focus();
    }
  }, [isModalOpen]);

  const calculateTotalPrice = () => {
    return selectedProducts.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  const calculateTotalItems = () => {
    return selectedProducts.reduce(
      (total, product) => total + product.quantity,
      0
    );
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPaidAmount("");
    setChange("");
  };

  const handlePaidAmountChange = (e) => {
    const paid = parseFloat(e.target.value) || 0; // Parse and ensure it's a number
    setPaidAmount(paid);

    const payableAmount = calculateTotalPrice(); // Get payable amount
    if (paid > payableAmount) {
      setChange(paid - payableAmount); // Calculate the change if paid > payable
    } else {
      setChange(0); // If paid is less than or equal to payable, set change to 0
    }
  };

  // Open the calculator modal
  const handleOpenCalculatorModal = () => {
    setIsCalculatorModalOpen(true);
  };

  // Close the calculator modal
  const handleCloseCalculatorModal = () => {
    setIsCalculatorModalOpen(false);
    setCalculatorValue("");
  };

  // Handle button click for calculator input
  const handleCalculatorInput = (input) => {
    const operators = ["+", "-", "*", "/"];

    // If the input is an operator
    if (operators.includes(input)) {
      if (calculatorValue === "") {
        // Prevent starting with an operator
        return;
      }

      const lastChar = calculatorValue.slice(-1);

      // If the last character is also an operator, replace it
      if (operators.includes(lastChar)) {
        setCalculatorValue(calculatorValue.slice(0, -1) + input);
        return;
      }
    }

    // Handle decimal point logic
    if (input === ".") {
      const lastNumber = calculatorValue.split(/[\+\-\*\/]/).pop();
      if (lastNumber.includes(".")) {
        return;
      }
    }

    // Update the calculator value for other inputs
    setCalculatorValue((prevValue) => prevValue + input);
  };

  // Clear the calculator screen
  const handleCalculatorClear = () => {
    setCalculatorValue("");
  };

  const handleRemoveLastDigit = () => {
    setCalculatorValue(calculatorValue.slice(0, -1));
  };

  // Evaluate the calculator expression
  const handleCalculatorEvaluate = () => {
    try {
      // Only evaluate if the value is not already a number
      if (!isNaN(calculatorValue)) {
        return; // Prevent clearing input when pressing Enter multiple times
      }

      const result = eval(calculatorValue); // Evaluate the expression
      setCalculatorValue(result.toString()); // Display the result
    } catch (e) {
      setCalculatorValue("Error"); // Handle invalid expression
    }
  };

  // Handle keyboard input
  const handleKeyDown = (event) => {
    const key = event.key;

    if (!isCalculatorModalOpen) return; // Only handle input when modal is open

    if (key >= "0" && key <= "9") {
      handleCalculatorInput(key);
    } else if (key === ".") {
      handleCalculatorInput(".");
    } else if (key === "+") {
      handleCalculatorInput("+");
    } else if (key === "-") {
      handleCalculatorInput("-");
    } else if (key === "*") {
      handleCalculatorInput("*");
    } else if (key === "/") {
      handleCalculatorInput("/");
    } else if (key === "%") {
      handleCalculatorInput("%");
    } else if (key === "Enter") {
      handleCalculatorEvaluate();
    } else if (key === "Backspace") {
      handleRemoveLastDigit();
    } else if (key === "Escape") {
      handleCloseCalculatorModal();
    } else if (key === "c" || key === "C") {
      handleCalculatorClear();
    }
  };

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [calculatorValue, isCalculatorModalOpen]);

  return (
    <div className="invoice-app-container">
      <h2 className="invoice-header">
        {invoiceId ? "Update Invoice" : "Create Invoice"}
      </h2>

      <div className="input-container">
        <div className="customer-name-input">
          <label htmlFor="customerName" className="customer-name-label">
            Customer Name
          </label>
          <input
            type="text"
            id="customerName"
            placeholder="Customer Name"
            className="customer-name-field"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="customer-contact-input">
          <label htmlFor="customerContactNo" className="customer-contact-label">
            Customer Contact No
          </label>
          <input
            type="text"
            placeholder="Customer Contact No"
            id="customerContactNo"
            className="customer-contact-field"
            value={customerContactNo}
            onChange={(e) => setCustomerContactNo(e.target.value)}
          />
        </div>
      </div>

      <div className="search-container">
        <div className="search-label-with-icon">
          <label htmlFor="SearchProducts" className="search-product-label">
            Search Products
          </label>
          <button
            onClick={handleOpenCalculatorModal}
            className="calculator-icon-btn"
          >
            <FaCalculator />
          </button>
        </div>
        <input
          type="text"
          id="SearchProducts"
          className="product-search-input"
          placeholder="Search Products"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {isDropdownVisible && products.length > 0 && (
          <ul className="product-list">
            {products.map((product) => (
              <li key={product.id} className="product-list-item">
                <div className="productRow">
                  <span className="productCell">{product.name}</span>
                  <span className="productCell">{product.company}</span>
                  <span className="productCell">Rs.{product.price}</span>
                  <span
                    className={`productCell ${
                      product.quantity === 0 ? "outOfStock" : ""
                    }`}
                  >
                    {product.quantity === 0 ? "Out of Stock" : product.quantity}
                  </span>
                </div>

                <button
                  className="product-add-btn"
                  onClick={() => handleSelectProduct(product)}
                >
                  Add to Invoice
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3 className="invoice-products-title">Selected Products</h3>
      {selectedProducts.length > 0 ? (
        <div>
          <table className="selected-products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Company</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td>{product.company}</td>
                  <td>Rs.{product.price}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          index,
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="quantity-input"
                    />
                  </td>
                  <td>Rs.{(product.price * product.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-total">
            <h5>Total Items: {calculateTotalItems()}</h5>
            <h4>Grand Total: Rs.{calculateTotalPrice().toFixed(2)}</h4>
          </div>
        </div>
      ) : (
        <p className="no-products-text">No products added yet.</p>
      )}

      <button
        className="submit-invoice-btn"
        onClick={handleOpenModal} // Open modal before submitting invoice
        disabled={selectedProducts.length === 0}
      >
        {invoiceId ? "Pay" : "Pay"}
      </button>

      {/* Modal for Payment proccess */}
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="custom-close-button" onClick={handleCloseModal}>
              &times;
            </button>
            <h3 className="modal-title">
              Process Payment
              <button
                onClick={handleOpenCalculatorModal}
                className="calculator-icon-btn"
              >
                <FaCalculator />
              </button>
            </h3>

            <div className="modal-body">
              <div className="floating-label-container">
                <input
                  type="number"
                  id="payable-amount"
                  name="payableAmount"
                  className="form-input"
                  placeholder=" "
                  value={calculateTotalPrice().toFixed(2)}
                  readOnly
                />
                <label htmlFor="payable-amount" className="floating-label">
                  Payable Amount
                </label>
              </div>

              <div className="floating-label-container">
                <input
                  type="number"
                  id="paid-amount"
                  name="paidAmount"
                  className="form-input"
                  placeholder="0"
                  value={paidAmount || ""}
                  onChange={handlePaidAmountChange}
                  ref={paidAmountRef}
                />
                <label htmlFor="paid-amount" className="floating-label">
                  Paid Amount
                </label>
              </div>

              <div className="floating-label-container">
                <input
                  type="number"
                  id="change"
                  name="change"
                  className="form-input"
                  placeholder=" "
                  value={change !== "" ? change.toFixed(2) : "0.00"}
                  readOnly
                />
                <label htmlFor="change" className="floating-label">
                  Change
                </label>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={handleCloseModal}
                className="custom-btn back-btn"
              >
                Close
              </button>
              <button
                onClick={handleSubmitInvoice}
                className={`custom-btn submit-btn ${
                  paidAmount >= calculateTotalPrice() ? "" : "disabled-btn"
                }`}
                disabled={paidAmount < calculateTotalPrice()}
              >
                {invoiceId ? "Update Invoice" : "Submit Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Calculator Modal */}
      {isCalculatorModalOpen && (
        <div className="custom-modal-overlay">
          <div
            className="custom-modal-content calculator-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="custom-close-button"
              onClick={handleCloseCalculatorModal}
            >
              &times;
            </button>
            <h3 className="modal-title">Calculator</h3>

            <div className="calculator-container">
              <div className="calculator-screen">
                <input
                  type="text"
                  value={calculatorValue}
                  readOnly
                  className="calculator-display"
                />
              </div>

              <div className="calculator-buttons">
                <button onClick={handleCalculatorClear}>C</button>
                <button onClick={handleRemoveLastDigit}>⌫</button>
                <button onClick={() => handleCalculatorInput("/")}>/</button>
                <button onClick={() => handleCalculatorInput("*")}>*</button>

                <button onClick={() => handleCalculatorInput("7")}>7</button>
                <button onClick={() => handleCalculatorInput("8")}>8</button>
                <button onClick={() => handleCalculatorInput("9")}>9</button>
                <button onClick={() => handleCalculatorInput("-")}>-</button>

                <button onClick={() => handleCalculatorInput("4")}>4</button>
                <button onClick={() => handleCalculatorInput("5")}>5</button>
                <button onClick={() => handleCalculatorInput("6")}>6</button>
                <button onClick={() => handleCalculatorInput("+")}>+</button>

                <button onClick={() => handleCalculatorInput("1")}>1</button>
                <button onClick={() => handleCalculatorInput("2")}>2</button>
                <button onClick={() => handleCalculatorInput("3")}>3</button>
                <button onClick={() => handleCalculatorInput("%")}>%</button>

                <button onClick={() => handleCalculatorInput(".")}>.</button>
                <button onClick={() => handleCalculatorInput("0")}>0</button>
                <button
                  className="full-width-button"
                  onClick={handleCalculatorEvaluate}
                >
                  =
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoice;
