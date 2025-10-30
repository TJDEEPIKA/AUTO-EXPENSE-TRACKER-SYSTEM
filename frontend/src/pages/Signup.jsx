import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Add auth-page class to body when component mounts
  useEffect(() => {
    document.body.classList.add("auth-page");

    // Cleanup: remove the class when component unmounts
    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  const validate = () => {
    let tempErrors = {};

    // Name validation
    if (!/^[A-Za-z ]{3,}$/.test(name)) {
      tempErrors.name = "Name must be at least 3 letters and contain only alphabets.";
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
    ) {
      tempErrors.password =
        "Password must be 8+ chars, include upper, lower, number & special char.";
    }

    // Confirm password
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return; // Stop if validation fails

    try {
      await axios.post("https://auto-expense-tracker-system.onrender.com/api/auth/signup", {
        name,
        email,
        password,
      });
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-container-wrapper">
      <div className="auth-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit">Sign Up</button>
        </form>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <span>or</span>
        </div>
        <a
          href="https://auto-expense-tracker-system.onrender.com/api/auth/google"
          className="google-btn"
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '12px',
            backgroundColor: '#db4437',
            color: 'white',
            textAlign: 'center',
            textDecoration: 'none',
            borderRadius: '4px',
            marginBottom: '20px'
          }}
        >
          Sign Up with Google
        </a>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
