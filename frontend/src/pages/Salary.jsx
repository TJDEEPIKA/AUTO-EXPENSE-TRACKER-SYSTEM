import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Salary.css";

const Salary = () => {
  const navigate = useNavigate();
  const [salaries, setSalaries] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editMonth, setEditMonth] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalSalary, setTotalSalary] = useState(0);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchSalaries();
  }, []);

  useEffect(() => {
    const total = salaries.reduce((sum, salary) => sum + salary.amount, 0);
    setTotalSalary(total);
  }, [salaries]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://auto-expense-tracker-system.onrender.com/api/salaries", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Normalize response shape (could be { salaries } or an array)
      const data = Array.isArray(res.data) ? res.data : (res.data.salaries || []);
      // Filter out soft-deleted entries just in case
      setSalaries((data || []).filter(item => !item.isDeleted));
    } catch (err) {
      console.error(err);
      alert("Error fetching salaries");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentYear = new Date().getFullYear();
    const salaryMonth = `${month} ${currentYear}`;
    
    const duplicate = salaries.find(s => s.month === salaryMonth);
    if (duplicate) {
      alert("Salary for this month already exists. Please edit the existing entry.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("https://auto-expense-tracker-system.onrender.com/api/salaries/add", {
        month: salaryMonth,
        amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonth("");
      setAmount("");
      fetchSalaries();
      alert("Salary added successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding salary");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (salary) => {
    setEditingId(salary._id);
    const [m, y] = salary.month.split(" ");
    setEditMonth(m);
    setEditYear(parseInt(y));
    setEditAmount(salary.amount.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    const updatedMonth = `${editMonth} ${editYear}`;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`https://auto-expense-tracker-system.onrender.com/api/salaries/${editingId}`, {
        month: updatedMonth,
        amount: parseFloat(editAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Salary updated successfully!");
      setEditingId(null);
      setEditMonth("");
      setEditYear("");
      setEditAmount("");
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error updating salary");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary?")) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`https://auto-expense-tracker-system.onrender.com/api/salaries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Salary deleted successfully!");
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error deleting salary");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditMonth("");
    setEditYear("");
    setEditAmount("");
  };

  return (
    <>
      <Navbar />
      <div className="salary-container">
        <div className="salary-sidebar-left">
          <div className="salary-card">
            <div className="salary-icon">💰</div>
            <h3>Salary Management</h3>
            <p>Track your monthly salaries and manage your income records.</p>
          </div>

          <div className="salary-card total-card">
            <div className="salary-icon">📈</div>
            <h3>Total Income</h3>
            <p className="total-amount">₹{totalSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="total-label">Total salaries recorded</p>
          </div>
        </div>

        <div className="salary-main">
          <div className="salary-form-card">
            <div className="form-header">
              <h2>{editingId ? "Edit Salary" : "Add Salary"}</h2>
              <p className="form-subtitle">Manage your monthly salary entries</p>
            </div>

            <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(); } : handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Month</label>
                  <select
                    value={editingId ? editMonth : month}
                    onChange={(e) => editingId ? setEditMonth(e.target.value) : setMonth(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                
                {editingId && (
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="text"
                      value={editYear}
                      disabled
                      readOnly
                      className="read-only-input"
                    />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter salary amount"
                  value={editingId ? editAmount : amount}
                  onChange={(e) => editingId ? setEditAmount(e.target.value) : setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div className="button-group">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Processing..." : editingId ? "Update Salary" : "Add Salary"}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="salary-list-card">
            <div className="list-header">
              <h3>All Salaries</h3>
              <span className="badge">{salaries.length} {salaries.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading salaries...</p>
              </div>
            ) : salaries.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💼</div>
                <p>No salaries added yet.</p>
                <p className="empty-subtitle">Start by adding your first salary entry above!</p>
              </div>
            ) : (
              <div className="salary-items">
                {salaries
                  .sort((a, b) => {
                    const [aMonth, aYear] = a.month.split(" ");
                    const [bMonth, bYear] = b.month.split(" ");
                    if (aYear !== bYear) return parseInt(bYear) - parseInt(aYear);
                    return months.indexOf(bMonth) - months.indexOf(aMonth);
                  })
                  .map(salary => (
                    <div key={salary._id} className={`salary-item ${editingId === salary._id ? 'editing' : ''}`}>
                      <div className="salary-info">
                        <span className="salary-month">{salary.month}</span>
                        <span className="salary-amount">₹{salary.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="salary-actions">
                        <button 
                          onClick={() => handleEdit(salary)}
                          className="btn-edit"
                          disabled={loading}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(salary._id)}
                          className="btn-delete"
                          disabled={loading}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="salary-sidebar-right">
          <div className="salary-card">
            <div className="salary-icon">📊</div>
            <h3>Income Tracking</h3>
            <p>Keep track of your monthly income to better manage your expenses.</p>
          </div>

          <div className="salary-card tips-card">
            <div className="salary-icon">💡</div>
            <h3>Quick Tips</h3>
            <ul className="tips-list">
              <li>✓ Add salaries as you receive them</li>
              <li>✓ Track bonuses separately</li>
              <li>✓ Review monthly totals</li>
              <li>✓ Compare with expenses</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Salary;
