import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import Navbar from "../components/Navbar";
import "./Report.css";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Report = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = expenses;
    if (filters.startDate) {
      filtered = filtered.filter(exp => new Date(exp.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(exp => new Date(exp.date) <= new Date(filters.endDate));
    }
    if (filters.category) {
      filtered = filtered.filter(exp => exp.category === filters.category);
    }
    setFilteredExpenses(filtered);
  }, [expenses, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : (res.data.expenses || res.data);
      setExpenses((data || []).filter(item => !item.isDeleted));
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Prepare data for pie chart (category distribution)
  const pieData = filteredExpenses.reduce((acc, exp) => {
    const found = acc.find(item => item.name === exp.category);
    if (found) {
      found.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, []);

  // Prepare data for line chart (spending trend by date)
  const lineDataMap = {};
  filteredExpenses.forEach(exp => {
    if (!lineDataMap[exp.date]) {
      lineDataMap[exp.date] = 0;
    }
    lineDataMap[exp.date] += exp.amount;
  });
  const lineData = Object.keys(lineDataMap).sort().map(date => ({ date, amount: lineDataMap[date] }));

  // Tax summary example: total expenses and count
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expenseCount = filteredExpenses.length;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Expense Report", 10, 10);
    doc.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 10, 20);
    doc.text(`Number of Expenses: ${expenseCount}`, 10, 30);
    doc.save("expense-report.pdf");
  };

  const exportCSV = () => {
    const headers = ["date", "category", "description", "amount"];
    const csvRows = [headers.join(",")];
    filteredExpenses.forEach(exp => {
      const row = [exp.date, exp.category, exp.description || "", exp.amount];
      csvRows.push(row.join(","));
    });
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expense-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="report-page">
      <Navbar />
      <div className="report-container">
        <div className="report-content">

          <div className="filter-section">
            <div className="filter-controls">
              <div className="filter-group">
                <label>Start Date</label>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              </div>
              <div className="filter-group">
                <label>Category</label>
                <input type="text" name="category" placeholder="Category" value={filters.category} onChange={handleFilterChange} />
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h2>Tax-Ready Summary</h2>
            <div className="summary-stats">
              <div className="summary-stat">
                <p>Total Expenses</p>
                <p>${totalAmount.toFixed(2)}</p>
              </div>
              <div className="summary-stat">
                <p>Number of Expenses</p>
                <p>{expenseCount}</p>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <div className="chart-card">
              <h2>Spending by Category</h2>
              <div className="chart-wrapper">
                {pieData.length === 0 ? (
                  <p>No data to display.</p>
                ) : (
                  <PieChart width={400} height={300}>
                    <Pie data={pieData} cx={200} cy={150} outerRadius={120} label dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </div>
            </div>

            <div className="chart-card">
              <h2>Spending Trend</h2>
              <div className="chart-wrapper">
                {lineData.length === 0 ? (
                  <p>No data to display.</p>
                ) : (
                  <ResponsiveContainer width={400} height={300}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="export-section">
            <button className="export-btn" onClick={exportPDF}>Export PDF</button>
            <button className="export-btn" onClick={exportCSV}>Export CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
