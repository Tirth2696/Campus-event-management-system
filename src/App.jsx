import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import About from "./pages/About";

import StudentDashboard from "./pages/StudentDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

/* =========================
   HOME PAGE
========================= */

function Home() {
  return (
    <div className="home-page">

      {/* Navigation */}
      <nav className="navbar">

        <div className="brand-area">

          <div className="brand-logo">
            C
          </div>

          <div className="brand-text">

            <h2>
              CHARUSAT
            </h2>

            <span>
              Campus Event Management
            </span>

          </div>

        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/events">
            Events
          </Link>

          <Link to="/about">
            About
          </Link>

        </div>

      </nav>

      {/* Hero Section */}

      <section className="hero">

        <div className="hero-top-label">

          <span></span>

          <p>
            Campus Events
          </p>

          <span></span>

        </div>

        <h1>

          Campus Event{" "}

          <span>
            Management System
          </span>

        </h1>

        <p className="hero-description">

          A centralized platform for managing college events,
          registrations, participants and certificates.

        </p>

        <div className="hero-buttons">

          <Link
            to="/login"
            className="hero-btn login-btn"
          >

            <span className="btn-icon">
              ↪
            </span>

            Login

          </Link>

          <Link
            to="/register"
            className="hero-btn register-btn"
          >

            <span className="btn-icon">
              +
            </span>

            Register

          </Link>

        </div>

        {/* Features */}

        <div className="feature-section">

          <div className="feature-card">

            <div className="feature-icon">
              📅
            </div>

            <h3>
              Event Management
            </h3>

            <p>
              Create, manage and track campus events with ease.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              👥
            </div>

            <h3>
              Student Participation
            </h3>

            <p>
              Discover events, register and participate in activities.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              📜
            </div>

            <h3>
              Certificates
            </h3>

            <p>
              View and access your participation certificates easily.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              🛡️
            </div>

            <h3>
              Secure & Reliable
            </h3>

            <p>
              Role-based access for students, coordinators and admins.
            </p>

          </div>

        </div>

      </section>

      {/* Footer */}

      <footer className="home-footer">

        <p>
          CHARUSAT • Campus Event Management System
        </p>

      </footer>

    </div>
  );
}


/* =========================
   GET CURRENT ROLE
========================= */

function getCurrentRole() {
  return localStorage.getItem("role");
}


/* =========================
   ROLE REDIRECT
========================= */

function redirectToCorrectDashboard() {

  const role = getCurrentRole();

  if (role === "student") {
    return (
      <Navigate
        to="/student-dashboard"
        replace
      />
    );
  }

  if (role === "coordinator") {
    return (
      <Navigate
        to="/coordinator-dashboard"
        replace
      />
    );
  }

  if (role === "admin") {
    return (
      <Navigate
        to="/admin-dashboard"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/login"
      replace
    />
  );
}


/* =========================
   STUDENT ROUTE
========================= */

function StudentRoute() {

  const role = getCurrentRole();

  if (role !== "student") {
    return redirectToCorrectDashboard();
  }

  return (
    <StudentDashboard />
  );
}


/* =========================
   COORDINATOR ROUTE
========================= */

function CoordinatorRoute() {

  const role = getCurrentRole();

  if (role !== "coordinator") {
    return redirectToCorrectDashboard();
  }

  return (
    <CoordinatorDashboard />
  );
}


/* =========================
   ADMIN ROUTE
========================= */

function AdminRoute() {

  const role = getCurrentRole();

  if (role !== "admin") {
    return redirectToCorrectDashboard();
  }

  return (
    <AdminDashboard />
  );
}


/* =========================
   LOGOUT
========================= */

function Logout() {

  localStorage.removeItem("email");
  localStorage.removeItem("student_email");
  localStorage.removeItem("role");
  localStorage.removeItem("user_id");

  return (
    <Navigate
      to="/login"
      replace
    />
  );
}


/* =========================
   APP
========================= */

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/about"
          element={<About />}
        />


        {/* =========================
            STUDENT
        ========================= */}

        <Route
          path="/student-dashboard"
          element={<StudentRoute />}
        />


        {/* =========================
            COORDINATOR
        ========================= */}

        <Route
          path="/coordinator-dashboard"
          element={<CoordinatorRoute />}
        />


        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin-dashboard"
          element={<AdminRoute />}
        />


        {/* =========================
            LOGOUT
        ========================= */}

        <Route
          path="/logout"
          element={<Logout />}
        />


        {/* =========================
            UNKNOWN URL
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;