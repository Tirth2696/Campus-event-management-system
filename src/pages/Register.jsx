import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const role = form.role.value;

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Registration successful!");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
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

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">C</div>

          <div>
            <h3>CHARUSAT</h3>
            <span>Campus Event Management</span>
          </div>
        </div>

        {/* Heading */}
        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Register for Campus Event Management System
        </p>

        {/* Registration Form */}
        <form
          onSubmit={handleRegister}
          className="auth-form"
        >

          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="input-group">
            <label>Select Role</label>

            <select
              name="role"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select your role
              </option>

              <option value="student">
                Student
              </option>

              <option value="coordinator">
                Club Coordinator
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="auth-btn"
          >
            Register
          </button>

        </form>

        {/* Login Link */}
        <p className="auth-link">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

        {/* Back */}
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

export default Register;