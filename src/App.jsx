import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import About from "./pages/About";
import StudentDashboard from "./pages/StudentDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Home() {
  return (
    <div>
      <nav className="navbar">
        <div className="logo">Campus Events</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/about">About</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Campus Event Management System</h1>

        <p>
          A centralized platform for managing college events.
        </p>

        <Link to="/login">
          <button className="btn login-btn">Login</button>
        </Link>

        <Link to="/register">
          <button className="btn register-btn">Register</button>
        </Link>
      </section>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/about" element={<About />} />

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/coordinator-dashboard"
          element={<CoordinatorDashboard />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
