import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./User.css"; // Import the CSS file

const User = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [deletedItems, setDeletedItems] = useState([]);
  const [deletedLoading, setDeletedLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    const fetchDeletedItems = async () => {
      try {
        setDeletedLoading(true);
        const token = localStorage.getItem("token");
        const [expensesRes, salariesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/expenses/deleted", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/salaries/deleted", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const expensesData = Array.isArray(expensesRes.data) ? expensesRes.data : (expensesRes.data.expenses || expensesRes.data || []);
        const salariesData = Array.isArray(salariesRes.data) ? salariesRes.data : (salariesRes.data.salaries || salariesRes.data || []);

        const combinedDeleted = [
          ...expensesData.map(item => ({ ...item, type: 'expense' })),
          ...salariesData.map(item => ({ ...item, type: 'salary' })),
        ].filter(item => item && item.deletedAt).sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)).slice(0, 10);
        setDeletedItems(combinedDeleted);
      } catch (err) {
        console.error("Failed to fetch deleted items", err);
      } finally {
        setDeletedLoading(false);
      }
    };

    fetchUser();
    fetchDeletedItems();
  }, []);



  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setEditForm({ name: user.name, email: user.email });
      setIsEditing(true);
    }
  };

  const handleFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/user/updateProfile", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ ...user, ...editForm });
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          Loading user details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  // Get first letter of name for avatar
  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      <Navbar />
      <div className="user-container">
        <div className="profile-wrapper">
          {/* Header Section with Avatar */}
          <div className="profile-header-section">
            <div className="profile-avatar-large">{avatarLetter}</div>
            <div className="profile-header-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="profile-grid">
            {/* Personal Information Card */}
            <div className="info-card">
              <h2 className="card-title">Personal Information</h2>
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleFormChange}
                      className="info-input"
                    />
                  ) : (
                    <span className="info-value">{user.name}</span>
                  )}
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleFormChange}
                      className="info-input"
                    />
                  ) : (
                    <span className="info-value">{user.email}</span>
                  )}
                </div>
                

                <div className="info-row">
                  <span className="info-label">Joined</span>
                  <span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span>

                </div>
              </div>
              <div className="edit-actions">
                {isEditing ? (
                  <>
                    <button className="action-button" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button className="action-button cancel" onClick={handleEditToggle}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="action-button" onClick={handleEditToggle}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Recently Deleted Card */}
            <div className="info-card">
              <h2 className="card-title">Recently Deleted</h2>
              {deletedLoading ? (
                <div className="loading-spinner">Loading deleted items...</div>
              ) : deletedItems.length === 0 ? (
                <p className="no-data">No recently deleted items.</p>
              ) : (
                <div className="deleted-items-list">
                  {deletedItems.map((item) => (
                    <div key={`${item.type}-${item._id}`} className="deleted-item">
                      <div className="deleted-item-info">
                        <span className="deleted-item-type">{item.type === 'expense' ? 'Expense' : 'Salary'}</span>
                        <span className="deleted-item-details">
                          {item.type === 'expense'
                            ? `${item.category}: $${item.amount} - ${item.description || 'No description'}`
                            : `${item.month}: $${item.amount}`
                          }
                        </span>
                        <span className="deleted-item-date">
                          Deleted: {new Date(item.deletedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
         
        </div>
      </div>
    </>
  );
};

export default User;
