import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");

  const [selectedEvent, setSelectedEvent] = useState(null);

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
  // EVENT TIMING
  // ===============================

  const isEventCompleted = (eventDate) => {
    if (!eventDate) {
      return false;
    }

    return new Date(eventDate) < new Date();
  };

  const getEventTiming = (eventDate) => {
    return isEventCompleted(eventDate)
      ? "Completed"
      : "Upcoming";
  };

  // ===============================
  // HANDLE EVENT REGISTRATION
  // ===============================

  const handleRegister = async (event) => {
    if (isEventCompleted(event.event_date)) {
      alert(
        "Registration is not available for completed events."
      );
      return;
    }

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

  // ===============================
  // CLOSE EVENT DETAILS
  // ===============================

  const closeEventDetails = () => {
    setSelectedEvent(null);
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

          <input
            type="text"
            placeholder="Search by title, description or venue..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

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

            sortedEvents.map((event) => {

              const completed =
                isEventCompleted(
                  event.event_date
                );

              const timing =
                getEventTiming(
                  event.event_date
                );

              return (

                <div
                  className="event-card"
                  key={event.event_id}
                >

                  <div className="event-card-top">

                    <span className="event-badge">
                      {event.status}
                    </span>

                    <span
                      className="event-badge"
                      style={{
                        marginLeft: "8px",
                      }}
                    >
                      {timing}
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

                    <p>

                      <strong>
                        Capacity
                      </strong>

                      <span>
                        {event.max_participants ||
                          50}{" "}
                        participants
                      </span>

                    </p>

                  </div>

                  {/* VIEW DETAILS */}

                  <button
                    type="button"
                    className="dashboard-btn"
                    style={{
                      width: "100%",
                      marginBottom: "10px",
                    }}
                    onClick={() =>
                      setSelectedEvent(event)
                    }
                  >
                    View Details
                  </button>

                  {/* REGISTRATION */}

                  {completed ? (

                    <div className="unavailable">
                      Event Completed
                    </div>

                  ) : event.status &&
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

              );

            })

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
          EVENT DETAILS MODAL
      ========================= */}

      {selectedEvent && (

        <div
          onClick={closeEventDetails}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "28px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.3)",
              color: "#222",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                }}
              >
                {selectedEvent.title}
              </h2>

              <button
                type="button"
                onClick={closeEventDetails}
                style={{
                  border: "none",
                  background: "#eeeeee",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                ×
              </button>

            </div>

            <div
              style={{
                marginBottom: "20px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >

              <span
                className="event-badge"
                style={{
                  display: "inline-block",
                }}
              >
                {selectedEvent.status}
              </span>

              <span
                className="event-badge"
                style={{
                  display: "inline-block",
                }}
              >
                {getEventTiming(
                  selectedEvent.event_date
                )}
              </span>

            </div>

            <div
              style={{
                display: "grid",
                gap: "16px",
              }}
            >

              <div>

                <strong>
                  Description
                </strong>

                <p
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {selectedEvent.description ||
                    "No description available"}
                </p>

              </div>

              <div>

                <strong>
                  Date & Time
                </strong>

                <p
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {new Date(
                    selectedEvent.event_date
                  ).toLocaleString()}
                </p>

              </div>

              <div>

                <strong>
                  Venue
                </strong>

                <p
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {selectedEvent.venue ||
                    "Venue not available"}
                </p>

              </div>

              <div>

                <strong>
                  Maximum Participants
                </strong>

                <p
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {selectedEvent.max_participants ||
                    50}
                </p>

              </div>

              <div>

                <strong>
                  Event ID
                </strong>

                <p
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {selectedEvent.event_id}
                </p>

              </div>

              <div>

                <strong>
                  Coordinator ID
                </strong>

                <p
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {selectedEvent.coordinator_id}
                </p>

              </div>

            </div>

            {isEventCompleted(
              selectedEvent.event_date
            ) ? (

              <div
                className="unavailable"
                style={{
                  marginTop: "20px",
                }}
              >
                Event Completed
              </div>

            ) : selectedEvent.status &&
              selectedEvent.status.toLowerCase() ===
                "approved" ? (

              <button
                type="button"
                className="event-register-btn"
                style={{
                  width: "100%",
                  marginTop: "20px",
                }}
                onClick={() => {
                  closeEventDetails();
                  handleRegister(
                    selectedEvent
                  );
                }}
              >
                Register for Event
              </button>

            ) : (

              <div
                className="unavailable"
                style={{
                  marginTop: "20px",
                }}
              >
                Registration unavailable
              </div>

            )}

          </div>

        </div>

      )}

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