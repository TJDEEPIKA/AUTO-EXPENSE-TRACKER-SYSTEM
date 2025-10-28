

import React from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Store token in memory instead of localStorage
    sessionStorage.removeItem("token"); // Using sessionStorage as alternative
    navigate("/login");
  };

  const handleUserClick = () => {
    navigate("/user");
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.left}>
          <div style={styles.links}>
            <Link to="/dashboard" style={styles.link}>
              Dashboard
            </Link>
            <Link to="/expenses" style={styles.link}>
              Expenses
            </Link>
            <Link to="/salary" style={styles.link}>
              Salary
            </Link>
            <Link to="/reports" style={styles.link}>
              Reports
            </Link>
          </div>
        </div>

        <div style={styles.right}>
          <NotificationDropdown />
          <FaUserCircle style={styles.icon} onClick={handleUserClick} />
          <FaSignOutAlt style={styles.icon} onClick={handleLogout} />
        </div>
      </nav>
      {/* Spacer div to push content below the fixed navbar */}
      <div style={styles.navbarSpacer}></div>
    </>
  );
};

const styles = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "darkblue",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    height: "60px", // Fixed height for consistency
  },
  navbarSpacer: {
    height: "76px", // Height of navbar + padding (60px + 16px padding)
    width: "100%",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  },
  logo: {
    color: "white",
    margin: 0,
    fontSize: "1.5rem",
  },
  links: {
    display: "flex",
    gap: "1.5rem",
  },
  link: {
    textDecoration: "none",
    color: "white",
    fontWeight: 500,
    fontSize: "1rem",
    transition: "opacity 0.2s",
  },
  right: {
    display: "flex",
    gap: "1.2rem",
    fontSize: "1.2rem",
    color: "white",
    alignItems: "center",
  },
  icon: {
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
};

export default Navbar;