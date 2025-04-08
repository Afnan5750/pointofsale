import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/Product.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [categoryNotFoundMessage, setCategoryNotFoundMessage] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    company: "",
    category: "",
    price: "",
    actualPrice: "",
    image: null,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();

        if (data.total === 0) {
          console.log("No categories found.");
          return;
        }

        setCategories(data.categories); // Update categories state with the fetched data
        setFilteredCategories(data.categories); // Initially show all categories
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/total-products"
        );
        setProducts(response.data.productList);
      } catch (error) {
        console.error("Error fetching product list:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    // Set the category value in the product state
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      category: value,
    }));

    // Filter categories based on the input value
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredCategories(filtered);
    setShowSuggestions(filtered.length > 0);

    // If no matching category is found, show the message
    if (filtered.length === 0 && value.trim() !== "") {
      setCategoryNotFoundMessage("Category not found");
    } else {
      setCategoryNotFoundMessage(""); // Clear message if a match is found
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="highlighted">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => (
        <span className="wrap-text">{highlightText(row._id, searchQuery)}</span>
      ),
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => (
        <span className="wrap-text">
          {highlightText(row.name, searchQuery)}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Company",
      selector: (row) => (
        <span className="wrap-text">
          {highlightText(row.company, searchQuery)}
        </span>
      ),
      sortable: true,
    },

    {
      name: "Category",
      selector: (row) => (
        <span className="wrap-text">
          {highlightText(row.category, searchQuery)}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Quantity",
      selector: (row) => (
        <span className="wrap-text">{row.quantity || "Out Of Stock"}</span>
      ),
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => <span className="wrap-text">{row.price}</span>,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="action-buttons">
          <button
            onClick={() => handleUpdateProduct(row)}
            className="action-button update-button"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteProduct(row._id)}
            className="action-button delete-button"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const filteredProducts = products.filter(
    (product) =>
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (categoryFilter ? product.category === categoryFilter : true) &&
      (showOutOfStock ? product.quantity === 0 || !product.quantity : true)
  );

  const handleOutOfStockToggle = () => {
    setShowOutOfStock(!showOutOfStock);
  };

  const modalStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyles = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files.length > 0) {
      const selectedFile = files[0];

      setNewProduct((prevProduct) => ({
        ...prevProduct,
        image: selectedFile, // Store file object
      }));
    } else {
      setNewProduct((prevProduct) => ({
        ...prevProduct,
        [name]: value,
      }));
    }
  };

  // ✅ Log when `newProduct.image` changes
  useEffect(() => {
    if (newProduct.image) {
      if (newProduct.image instanceof File) {
        console.log("✅ Image is added:", newProduct.image.name);
      } else {
        console.log("✅ Existing image from DB:", newProduct.image);
      }
    }
  }, [newProduct.image]); // Runs every time `image` changes

  const handleAddOrUpdateProduct = async () => {
    // Check if the product name already exists, excluding the current product in edit mode
    const existingProduct = products.find(
      (product) =>
        product.name.toLowerCase() === newProduct.name.toLowerCase() &&
        product._id !== editingProductId // Exclude the current product from the duplicate check
    );

    if (existingProduct) {
      setErrorMessage("This product name already exists.");
      return; // Exit early if a duplicate name is found
    }

    try {
      // Create FormData to handle text fields & image upload
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("company", newProduct.company);
      formData.append("category", newProduct.category);
      formData.append("quantity", newProduct.quantity);
      formData.append("price", newProduct.price);
      formData.append("actualPrice", newProduct.actualPrice);

      if (newProduct.image) {
        formData.append("image", newProduct.image); // Append image file
      }

      let response;
      if (isEditMode) {
        response = await axios.put(
          `http://localhost:5000/api/update-product/${editingProductId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === editingProductId ? response.data : product
          )
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/add-product",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setProducts((prevProducts) => [...prevProducts, response.data]);
      }

      setModalVisible(false);
      resetForm(); // Reset form after adding or updating product
      setErrorMessage(""); // Clear error message on success
    } catch (error) {
      console.error(
        isEditMode ? "Error updating product:" : "Error adding product:",
        error.response?.data || error
      );
      setErrorMessage("An error occurred while processing your request.");
    }
  };

  const handleUpdateProduct = (product) => {
    setIsEditMode(true);
    setEditingProductId(product._id);
    setNewProduct({
      name: product.name,
      company: product.company,
      quantity: product.quantity,
      category: product.category,
      price: product.price,
      actualPrice: product.actualPrice,
      image: product.image || null, // Ensure it’s not undefined
    });
    setModalVisible(true);
  };

  // Function to reset the modal form
  const resetForm = () => {
    setNewProduct({
      name: "",
      company: "",
      quantity: "",
      category: "",
      price: "",
      actualPrice: "",
      image: null,
    });
    setIsEditMode(false);
    setEditingProductId(null);
  };

  const handleDeleteProduct = async (productId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (isConfirmed) {
      try {
        await axios.delete(
          `http://localhost:5000/api/delete-product/${productId}`
        );

        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="product-page-container">
      <h1 className="product-page-title">Products</h1>

      <div className="products-search-box">
        <button
          className="add-product-button"
          onClick={() => {
            setModalVisible(true);
            resetForm(); // Reset form when opening "Add Product" modal
          }}
        >
          Add Product
        </button>
        <input
          type="text"
          className="products-search-input"
          placeholder="Search by Name, Company or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="products-filter-box">
        <div className="dropdown-container">
          <label htmlFor="categoryFilter">Filter by Category</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="checkbox-container">
          <input
            type="checkbox"
            id="outOfStockCheckbox"
            checked={showOutOfStock}
            onChange={handleOutOfStockToggle}
          />
          <label htmlFor="outOfStockCheckbox">Show Out of Stock</label>
        </div>
      </div>

      <div className="product-table-container">
        <DataTable
          columns={columns}
          data={filteredProducts}
          pagination
          highlightOnHover
          responsive
          striped
          noDataComponent="No products available"
        />
      </div>

      {isModalVisible && (
        <div
          className="custom-modal-overlay"
          style={modalStyles}
          onClick={() => setModalVisible(false)}
        >
          <div
            className="custom-modal-content"
            style={modalContentStyles}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="custom-close-button"
              onClick={() => setModalVisible(false)}
            >
              &times;
            </button>
            <h3 className="modal-title">
              {isEditMode ? "Update Product" : "Add New Product"}
            </h3>

            <div>
              <div className="floating-label-container">
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder=" "
                  value={newProduct.name}
                  onChange={handleInputChange}
                  className="form-input"
                />

                {errorMessage && (
                  <div className="error-message">{errorMessage}</div>
                )}

                <label htmlFor="name" className="floating-label">
                  Product Name
                </label>
              </div>
              <div className="floating-label-container">
                <input
                  type="text"
                  name="company"
                  id="company"
                  placeholder=" "
                  value={newProduct.company}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <label htmlFor="company" className="floating-label">
                  Company
                </label>
              </div>
              <div className="floating-label-container">
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  placeholder=" "
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <label htmlFor="quantity" className="floating-label">
                  Quantity
                </label>
              </div>
              <div className="floating-label-container">
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={newProduct.category}
                  onChange={handleCategoryChange}
                  className="form-input"
                  placeholder=" "
                  onFocus={() => setShowSuggestions(true)} // Show suggestions on focus
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 100)
                  } // Hide suggestions after blur
                />
                <label htmlFor="category" className="floating-label">
                  Category
                </label>
                {categoryNotFoundMessage && (
                  <div className="error-message">{categoryNotFoundMessage}</div>
                )}
                {newProduct.category && filteredCategories.length > 0 && (
                  <ul
                    className={`suggestion-list ${
                      showSuggestions ? "visible" : ""
                    }`}
                  >
                    {filteredCategories.map((category, index) => (
                      <li
                        className="category-list"
                        key={index}
                        onClick={() => {
                          setNewProduct((prevProduct) => ({
                            ...prevProduct,
                            category: category.name,
                          }));
                          setFilteredCategories([]); // Hide suggestions after selection
                          setShowSuggestions(false);
                        }}
                      >
                        {category.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="floating-label-container">
                <input
                  type="number"
                  name="price"
                  id="price"
                  placeholder=" "
                  value={newProduct.price}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <label htmlFor="price" className="floating-label">
                  Price
                </label>
              </div>
              <div className="floating-label-container">
                <input
                  type="number"
                  name="actualPrice"
                  id="actualPrice"
                  placeholder=" "
                  value={newProduct.actualPrice}
                  onChange={handleInputChange}
                  className="form-input"
                />
                <label htmlFor="actualPrice" className="floating-label">
                  Actual Price
                </label>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setNewProduct({ ...newProduct, image: e.target.files[0] });
                  }
                }}
              />

              {newProduct.image && (
                <div className="image-preview">
                  <img
                    src={
                      newProduct.image instanceof File
                        ? URL.createObjectURL(newProduct.image) // Use URL for File object
                        : newProduct.image // Use existing image URL from database
                    }
                    alt="Product Preview"
                    className="preview-image"
                    style={{
                      width: "100px",
                      height: "100px",
                      marginTop: "10px",
                      objectFit: "cover",
                      borderRadius: "5px",
                      border: "2px solid #495057",
                      padding: "3px",
                    }}
                  />
                </div>
              )}

              <div className="modal-buttons">
                <button
                  className="add-product"
                  onClick={handleAddOrUpdateProduct}
                >
                  {isEditMode ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
