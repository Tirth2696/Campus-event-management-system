import { Link } from "react-router-dom";
import "../App.css";

function About() {
  return (
    <div>
      <nav className="navbar">
        <div className="logo">Campus Events</div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      <section className="about-section">
        <h1>About Campus Event Management System</h1>

        <p>
          Campus Event Management System is a centralized web-based platform
          designed to simplify and organize college event management.
        </p>

        <p>
          Students can explore and register for events, club coordinators can
          create and manage events, and administrators can approve and monitor
          the complete system.
        </p>
      </section>
    </div>
  );
}

export default About;