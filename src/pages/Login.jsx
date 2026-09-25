import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    if (!email || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save logged-in user's information
        localStorage.setItem("email", email);
        localStorage.setItem("student_email", email);
        localStorage.setItem("role", role);

        alert(data.message || "Login successful!");

        if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "coordinator") {
          navigate("/coordinator-dashboard");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        }
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to server. Make sure backend is running.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>

        <p>Login to Campus Event Management System</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
          />

          <select name="role">
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="coordinator">
              Club Coordinator
            </option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;