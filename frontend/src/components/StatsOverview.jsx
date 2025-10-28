import React from "react";

const StatsOverview = ({ stats }) => {
  return (
    <div style={{
      display: "flex",
      gap: "2rem",
      margin: "1rem 0",
      flexWrap: "wrap"
    }}>
      {["Total Expenses", "This Month", "Remaining Budget"].map((label, index) => (
        <div key={index} style={{
          flex: "1 1 30%",
          background: "white",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3>{label}</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            ₹{index === 0 ? stats.total || 0 : index === 1 ? stats.monthly || 0 : stats.remaining || 0}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
