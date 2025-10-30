import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Add auth-page class to body when component mounts
  useEffect(() => {
    document.body.classList.add("auth-page");

    // Check for error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      if (error === 'google_auth_failed') {
        alert('Google authentication failed. Please try again.');
      } else if (error === 'token_generation_failed') {
        alert('Authentication token generation failed. Please try again.');
      }
      // Remove error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Cleanup: remove the class when component unmounts
    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://auto-expense-tracker-system.onrender.com/api/auth/login", {
        email,
        password
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container-wrapper">
      <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <span>or</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = 'https://auto-expense-tracker-system.onrender.com/api/auth/google';
          }}
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
            marginBottom: '20px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Login with Google
        </button>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
