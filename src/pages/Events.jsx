import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");

  // ===============================
  // FETCH EVENTS
  // ===============================

  useEffect(() => {
    setLoading(true);

    fetch("http://localhost:5000/events")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        return response.json();
      })
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => {
        console.log(error);

        alert(
          "Cannot connect to server. Make sure backend is running."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ===============================
  // HANDLE EVENT REGISTRATION
  // ===============================

  const handleRegister = async (event) => {
    const student_email =
      localStorage.getItem("student_email") ||
      localStorage.getItem("email");

    if (!student_email) {
      alert(
        "Student login information not found. Please login again."
      );
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
        alert(
          data.message ||
            "Event registered successfully!"
        );
      } else {
        alert(
          data.message ||
            "Registration failed."
        );
      }
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // ===============================
  // SEARCH + STATUS FILTER
  // ===============================

  const filteredEvents = events.filter((event) => {
    const searchText = search
      .trim()
      .toLowerCase();

    const matchesSearch =
      !searchText ||
      event.title
        ?.toLowerCase()
        .includes(searchText) ||
      event.description
        ?.toLowerCase()
        .includes(searchText) ||
      event.venue
        ?.toLowerCase()
        .includes(searchText);

    const matchesStatus =
      filterStatus === "All" ||
      event.status?.toLowerCase() ===
        filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // ===============================
  // SORT EVENTS
  // ===============================

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => {
      if (sortBy === "date-asc") {
        return (
          new Date(a.event_date) -
          new Date(b.event_date)
        );
      }

      if (sortBy === "date-desc") {
        return (
          new Date(b.event_date) -
          new Date(a.event_date)
        );
      }

      if (sortBy === "title-asc") {
        return (
          (a.title || "").localeCompare(
            b.title || ""
          )
        );
      }

      if (sortBy === "title-desc") {
        return (
          (b.title || "").localeCompare(
            a.title || ""
          )
        );
      }

      return 0;
    }
  );

  // ===============================
  // CLEAR SEARCH / FILTER / SORT
  // ===============================

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("All");
    setSortBy("date-asc");
  };

  return (
    <div className="events-page">

      {/* =========================
          NAVIGATION
      ========================= */}

      <nav className="navbar events-navbar">

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

          <Link to="/student-dashboard">
            Dashboard
          </Link>

          <Link to="/logout">
            Logout
          </Link>

        </div>

      </nav>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <div className="events-container">

        {/* HEADER */}

        <div className="events-header">

          <div className="hero-top-label">

            <span></span>

            <p>
              Campus Events
            </p>

            <span></span>

          </div>

          <h1>
            Upcoming Events
          </h1>

          <p>
            Explore and register for upcoming college events.
          </p>

        </div>

        {/* =========================
            SEARCH / FILTER / SORT
        ========================= */}

        <div className="events-controls">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search by title, description or venue..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {/* STATUS FILTER */}

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
          >

            <option value="All">
              All Events
            </option>

            <option value="Approved">
              Approved
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Rejected">
              Rejected
            </option>

          </select>

          {/* SORT */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >

            <option value="date-asc">
              Date: Earliest First
            </option>

            <option value="date-desc">
              Date: Latest First
            </option>

            <option value="title-asc">
              Title: A - Z
            </option>

            <option value="title-desc">
              Title: Z - A
            </option>

          </select>

          {/* CLEAR */}

          <button
            type="button"
            className="dashboard-btn"
            onClick={clearFilters}
          >
            Clear
          </button>

        </div>

        {/* =========================
            RESULTS INFO
        ========================= */}

        {!loading && (

          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >

            <p>
              Showing{" "}
              <strong>
                {sortedEvents.length}
              </strong>{" "}
              event
              {sortedEvents.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

        )}

        {/* =========================
            EVENT CARDS
        ========================= */}

        <div className="events-grid">

          {loading ? (

            <div className="no-events">

              <h3>
                ⏳ Loading events...
              </h3>

              <p>
                Please wait while events are being loaded.
              </p>

            </div>

          ) : sortedEvents.length > 0 ? (

            sortedEvents.map((event) => (

              <div
                className="event-card"
                key={event.event_id}
              >

                <div className="event-card-top">

                  <span className="event-badge">
                    {event.status}
                  </span>

                </div>

                <h2>
                  {event.title}
                </h2>

                <p className="event-description">
                  {event.description}
                </p>

                <div className="event-details">

                  <p>

                    <strong>
                      Date
                    </strong>

                    <span>
                      {new Date(
                        event.event_date
                      ).toLocaleString()}
                    </span>

                  </p>

                  <p>

                    <strong>
                      Venue
                    </strong>

                    <span>
                      {event.venue}
                    </span>

                  </p>

                </div>

                {event.status &&
                event.status.toLowerCase() ===
                  "approved" ? (

                  <button
                    className="event-register-btn"
                    onClick={() =>
                      handleRegister(event)
                    }
                  >
                    Register for Event
                  </button>

                ) : (

                  <div className="unavailable">
                    Registration unavailable
                  </div>

                )}

              </div>

            ))

          ) : (

            <div className="no-events">

              <h3>
                No matching events found.
              </h3>

              <p>
                Try changing your search, status filter
                or sorting option.
              </p>

              <button
                type="button"
                className="dashboard-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          )}

        </div>

      </div>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="home-footer">

        <p>
          CHARUSAT • Campus Event Management System
        </p>

      </footer>

    </div>
  );
}

export default Events;