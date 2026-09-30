import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const DEMO_ACCOUNTS = {
    student: {
      email: "student@gmail.com",
      password: "student123",
      role: "student",
    },

    coordinator: {
      email: "coordinator@gmail.com",
      password: "123456",
      role: "coordinator",
    },

    admin: {
      email: "admin@gmail.com",
      password: "admin123",
      role: "admin",
    },
  };

  // =========================
  // QUICK LOGIN
  // =========================

  const quickLogin = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setRole(account.role);
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {

        // =========================
        // SAVE LOGIN INFORMATION
        // =========================

        localStorage.setItem("email", email);
        localStorage.setItem("student_email", email);
        localStorage.setItem("role", role);

        // Save actual user ID from database
        if (data.user && data.user.user_id) {
          localStorage.setItem(
            "user_id",
            String(data.user.user_id)
          );
        }

        alert(
          data.message || "Login successful!"
        );

        // =========================
        // ROLE BASED NAVIGATION
        // =========================

        if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "coordinator") {
          navigate("/coordinator-dashboard");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        }

      } else {

        alert(
          data.message ||
            "Invalid email, password, or role"
        );

      }

    } catch (error) {
      console.error(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* =========================
            BRAND
        ========================= */}

        <div className="auth-brand">

          <div className="auth-logo">
            C
          </div>

          <div>
            <h3>
              CHARUSAT
            </h3>

            <span>
              Campus Event Management
            </span>
          </div>

        </div>

        {/* =========================
            HEADING
        ========================= */}

        <h1>
          Welcome Back
        </h1>

        <p className="auth-subtitle">
          Login to Campus Event Management System
        </p>

        {/* =========================
            QUICK LOGIN
        ========================= */}

        <div className="quick-login-section">

          <h3>
            Quick Login
          </h3>

          <p>
            Select a role to automatically fill login details.
          </p>

          <div className="quick-login-buttons">

            {/* STUDENT */}

            <button
              type="button"
              className="quick-login-btn"
              onClick={() =>
                quickLogin(DEMO_ACCOUNTS.student)
              }
            >
              🎓 Student
            </button>

            {/* COORDINATOR */}

            <button
              type="button"
              className="quick-login-btn"
              onClick={() =>
                quickLogin(DEMO_ACCOUNTS.coordinator)
              }
            >
              👨‍💼 Coordinator
            </button>

            {/* ADMIN */}

            <button
              type="button"
              className="quick-login-btn"
              onClick={() =>
                quickLogin(DEMO_ACCOUNTS.admin)
              }
            >
              🛡️ Admin
            </button>

          </div>

        </div>

        {/* =========================
            LOGIN FORM
        ========================= */}

        <form
          onSubmit={handleLogin}
          className="auth-form"
          autoComplete="off"
        >

          {/* EMAIL */}

          <div className="input-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="off"
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="new-password"
            />

          </div>

          {/* ROLE */}

          <div className="input-group">

            <label>
              Select Role
            </label>

            <select
              name="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              autoComplete="off"
            >

              <option
                value=""
                disabled
              >
                Select your role
              </option>

              <option value="student">
                Student
              </option>

              <option value="coordinator">
                Club Coordinator
              </option>

              <option value="admin">
                Admin
              </option>

            </select>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-btn"
          >
            Login
          </button>

        </form>

        {/* =========================
            REGISTER LINK
        ========================= */}

        <p className="auth-link">

          Don't have an account?{" "}

          <Link to="/register">
            Register
          </Link>

        </p>

        {/* =========================
            BACK HOME
        ========================= */}

        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}

export default Login;