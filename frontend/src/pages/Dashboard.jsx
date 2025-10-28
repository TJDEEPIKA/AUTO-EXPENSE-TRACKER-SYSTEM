import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import ReportsPreview from "../components/ReportsPreview";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add dashboard-page class to body when component mounts
  useEffect(() => {
    document.body.classList.add("dashboard-page");

    // Check for token in URL params (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Cleanup: remove the class when component unmounts
    return () => {
      document.body.classList.remove("dashboard-page");
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/expenses/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data.stats);
      setExpenses(res.data.recentExpenses);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);



  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-grid">
          {/* Summary stats row */}
          <div className="stats-cards">
            <div className={`card ${loading ? 'loading' : ''}`}>
              <h3>Total Expenses</h3>
              <p>
                {loading ? "..." : (stats.totalExpenses === 0 ? "No expense added yet. Add expense through clicking Expenses" : `₹${stats.totalExpenses}`)}
              </p>
            </div>
            <div className={`card ${loading ? 'loading' : ''}`}>
              <h3>This Month</h3>
              <p>
                ₹{loading ? "..." : (stats.thisMonth || 0)}
              </p>
            </div>
            <div className={`card ${loading ? 'loading' : ''}`}>
              <h3>Remaining Budget</h3>
              <p>
                ₹{loading ? "..." : (stats.remainingBudget || 0)}
              </p>
            </div>
          </div>



         
          {/* Reports preview full width */}
          <div className="reports-preview">
            <h2>Reports Preview</h2>
            <ReportsPreview expenses={expenses} loading={loading} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;