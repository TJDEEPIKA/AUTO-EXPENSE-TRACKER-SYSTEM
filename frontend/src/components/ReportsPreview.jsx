import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./ReportsPreview.css";

const COLORS = {
  Food: "#ff6b6b",
  Transport: "#4ecdc4",
  Entertainment: "#a29bfe",
  Utilities: "#feca57",
  Shopping: "#ff9ff3",
  Health: "#48dbfb",
  Education: "#1dd1a1",
  Other: "#95afc0"
};

const CATEGORY_ICONS = {
  Food: "🍔",
  Transport: "🚗",
  Entertainment: "🎬",
  Utilities: "⚡",
  Shopping: "🛍️",
  Health: "⚕️",
  Education: "📚",
  Other: "📌"
};

const ReportsPreview = ({ expenses, loading }) => {
  const data = expenses.reduce((acc, exp) => {
    const found = acc.find((item) => item.name === exp.category);
    if (found) {
      found.value += exp.amount;
    } else {
      acc.push({ 
        name: exp.category, 
        value: exp.amount,
        icon: CATEGORY_ICONS[exp.category] || "💰"
      });
    }
    return acc;
  }, []);

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percent = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-category">
            {payload[0].payload.icon} {payload[0].name}
          </p>
          <p className="tooltip-amount">₹{payload[0].value.toLocaleString()}</p>
          <p className="tooltip-percent">{percent}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Custom label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if less than 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="pie-label"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="reports-preview-container">
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-report-state">
          <div className="empty-report-icon">📊</div>
          <p className="empty-report-text">No spending data yet</p>
          <p className="empty-report-subtext">Add expenses to see your spending breakdown</p>
        </div>
      ) : (
        <div className="reports-content">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name] || COLORS.Other}
                      className="pie-cell"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="breakdown-list">
            <h3 className="breakdown-title">Spending Breakdown</h3>
            {data
              .sort((a, b) => b.value - a.value)
              .map((item, index) => {
                const percent = ((item.value / total) * 100).toFixed(1);
                return (
                  <div 
                    key={index} 
                    className="breakdown-item"
                    style={{ '--item-color': COLORS[item.name] || COLORS.Other }}
                  >
                    <div className="breakdown-header">
                      <div className="breakdown-category">
                        <span className="breakdown-icon">{item.icon}</span>
                        <span className="breakdown-name">{item.name}</span>
                      </div>
                      <div className="breakdown-percent">{percent}%</div>
                    </div>
                    <div className="breakdown-details">
                      <div className="breakdown-amount">₹{item.value.toLocaleString()}</div>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-bar-fill"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
           
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPreview;