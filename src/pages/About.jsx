import { Link } from "react-router-dom";
import "../App.css";

function About() {
  return (
    <div className="about-page">

      <nav className="navbar">
        <div className="brand-area">
          <div className="brand-logo">C</div>

          <div className="brand-text">
            <h2>CHARUSAT</h2>
            <span>Campus Event Management</span>
          </div>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      <main className="about-container">

        <div className="hero-top-label">
          <span></span>
          <p>About the System</p>
          <span></span>
        </div>

        <h1>About Campus Event Management System</h1>

        <div className="about-card">
          <p>
            Campus Event Management System is a centralized web-based
            platform designed to simplify and organize college event
            management.
          </p>

          <p>
            Students can explore and register for events, club
            coordinators can create and manage events, and administrators
            can approve and monitor the complete system.
          </p>
        </div>

        <div className="about-features">

          <div className="about-feature">
            <div className="about-icon">🎓</div>
            <h3>Students</h3>
            <p>
              Explore upcoming college events and register easily.
            </p>
          </div>

          <div className="about-feature">
            <div className="about-icon">📅</div>
            <h3>Coordinators</h3>
            <p>
              Create, update and manage college events.
            </p>
          </div>

          <div className="about-feature">
            <div className="about-icon">🛡️</div>
            <h3>Administrators</h3>
            <p>
              Approve events and monitor the complete system.
            </p>
          </div>

        </div>

      </main>

      <footer className="home-footer">
        <p>CHARUSAT • Campus Event Management System</p>
      </footer>

    </div>
  );
}

export default About;