import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../styles/Category.css";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [editCategoryModalVisible, setEditCategoryModalVisible] =
    useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/categories"
        );
        setCategories(response.data.categories || []); // Set categories
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/add-category",
        {
          name: newCategory,
        }
      );
      console.log(response.data.message);
      setCategories([...categories, response.data.category]);
      setNewCategory("");
      setAddCategoryModalVisible(false);
    } catch (error) {
      console.error(
        "Error adding category:",
        error.response?.data?.message || error.message
      );
      alert(error.response?.data?.message || "Failed to add category.");
    }
  };

  // Handle updating a category
  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/update-category/${categoryToEdit._id}`,
        { name: editCategoryName }
      );
      setCategories(
        categories.map((category) =>
          category._id === categoryToEdit._id
            ? response.data.category
            : category
        )
      );
      setEditCategoryName("");
      setCategoryToEdit(null);
      setEditCategoryModalVisible(false);
    } catch (error) {
      console.error(
        "Error updating category:",
        error.response?.data?.message || error.message
      );
      alert(error.response?.data?.message || "Failed to update category.");
    }
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Define columns for the DataTable
  const columns = [
    {
      name: "ID",
      selector: (row) => highlightText(row._id, searchQuery),
      sortable: true,
    },
    {
      name: "Category Name",
      selector: (row) => highlightText(row.name, searchQuery),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="category-action-buttons">
          <button
            className="action-button edit-button"
            title="Edit"
            onClick={() => handleEdit(row)}
          >
            <FaEdit className="action-icon edit-icon" />
          </button>
          <button
            className="action-button delete-button"
            title="Delete"
            onClick={() => handleDelete(row._id)}
          >
            <FaTrash className="action-icon delete-icon" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Handlers for actions
  const handleEdit = (category) => {
    setCategoryToEdit(category);
    setEditCategoryName(category.name);
    setEditCategoryModalVisible(true);
  };

  const handleDelete = async (id) => {
    // Show confirmation prompt
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (confirmDelete) {
      try {
        // Proceed with the delete request if confirmed
        await axios.delete(`http://localhost:5000/api/delete-category/${id}`);
        setCategories(categories.filter((category) => category._id !== id)); // Update state to remove deleted category
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    } else {
      console.log("Category delete operation was cancelled");
    }
  };

  return (
    <div className="category-page">
      <h1>Category</h1>

      {/* Search Box */}
      <div className="products-search-box">
        <button
          className="add-product-button"
          onClick={() => setAddCategoryModalVisible(true)}
        >
          Add Category
        </button>
        <input
          type="text"
          className="products-search-input"
          placeholder="Search by Name or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCategories} // Use filtered categories
          pagination
          highlightOnHover
        />
      )}

      {/* Modal for adding a new category */}
      {addCategoryModalVisible && (
        <div
          className="custom-modal-overlay"
          onClick={() => setAddCategoryModalVisible(false)}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="custom-close-button"
              onClick={() => setAddCategoryModalVisible(false)}
            >
              &times;
            </button>
            <h3 className="modal-title category-title">Add New Category</h3>
            <div className="floating-label-container">
              <input
                type="text"
                id="category-name"
                placeholder=" "
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="form-input"
              />
              <label htmlFor="category-name" className="floating-label">
                Category Name
              </label>
            </div>
            <button onClick={handleAddCategory} className="add-product">
              Add Category
            </button>
          </div>
        </div>
      )}

      {/* Modal for editing a category */}
      {editCategoryModalVisible && (
        <div
          className="custom-modal-overlay"
          onClick={() => setEditCategoryModalVisible(false)}
        >
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="custom-close-button"
              onClick={() => setEditCategoryModalVisible(false)}
            >
              &times;
            </button>
            <h3 className="modal-title category-title">Edit Category</h3>
            <div className="floating-label-container">
              <input
                type="text"
                id="edit-category-name"
                placeholder=" "
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="form-input"
              />
              <label htmlFor="edit-category-name" className="floating-label">
                Category Name
              </label>
            </div>

            <button onClick={handleUpdateCategory} className="add-product">
              Update Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
