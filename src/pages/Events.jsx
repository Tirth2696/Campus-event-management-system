import { useEffect, useState } from "react";
import "../App.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/events")
      .then((response) => response.json())
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => {
        console.log(error);
        alert("Cannot connect to server. Make sure backend is running.");
      });
  }, []);

  const handleRegister = async (event) => {
    const student_email =
      localStorage.getItem("student_email") ||
      localStorage.getItem("email");

    if (!student_email) {
      alert("Student login information not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/event-register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_email: student_email,
            event_name: event.title,
            event_date: event.event_date,
            event_location: event.venue,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Event registered successfully!");
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.log(error);
      alert("Cannot connect to server. Make sure backend is running.");
    }
  };

  // SEARCH + STATUS FILTER
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      event.venue.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" ||
      event.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <nav className="navbar">
        <div className="logo">Campus Events</div>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/student-dashboard">Dashboard</a>
          <a href="/login">Logout</a>
        </div>
      </nav>

      <div className="dashboard-container">
        <h1>Upcoming Events</h1>

        <p>Explore and register for upcoming college events.</p>

        {/* SEARCH AND FILTER */}
        <div
          style={{
            margin: "20px 0",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              width: "300px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="All">All Events</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="dashboard-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                className="dashboard-card"
                key={event.event_id}
              >
                <h2>{event.title}</h2>

                <p>
                  <b>Description:</b> {event.description}
                </p>

                <p>
                  <b>Date:</b>{" "}
                  {new Date(event.event_date).toLocaleString()}
                </p>

                <p>
                  <b>Venue:</b> {event.venue}
                </p>

                <p>
                  <b>Status:</b> {event.status}
                </p>

                {event.status.toLowerCase() === "approved" ? (
                  <button
                    className="dashboard-btn"
                    onClick={() => handleRegister(event)}
                  >
                    Register for Event
                  </button>
                ) : (
                  <p>
                    <b>Registration unavailable</b>
                  </p>
                )}
              </div>
            ))
          ) : (
            <p>No matching events found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Events;