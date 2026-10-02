import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [capacityData, setCapacityData] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");

  const [selectedEvent, setSelectedEvent] = useState(null);

  // ===============================
  // FETCH EVENTS + CAPACITY
  // ===============================

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch("http://localhost:5000/events"),
      fetch("http://localhost:5000/event-capacity"),
    ])
      .then(
        async ([eventsResponse, capacityResponse]) => {
          if (!eventsResponse.ok) {
            throw new Error(
              "Failed to fetch events"
            );
          }

          if (!capacityResponse.ok) {
            throw new Error(
              "Failed to fetch event capacity"
            );
          }

          const eventsData =
            await eventsResponse.json();

          const capacityResult =
            await capacityResponse.json();

          return {
            eventsData,
            capacityResult,
          };
        }
      )
      .then(
        ({
          eventsData,
          capacityResult,
        }) => {
          setEvents(eventsData);

          const capacityMap = {};

          capacityResult.forEach((item) => {
            capacityMap[item.event_id] =
              item;
          });

          setCapacityData(capacityMap);
        }
      )
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
  // REGISTRATION DEADLINE CHECK
  // ===============================

  const isRegistrationClosed = (
    registrationDeadline
  ) => {
    if (!registrationDeadline) {
      return false;
    }

    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");

    const todayString =
      `${year}-${month}-${day}`;

    const deadlineString = String(
      registrationDeadline
    ).substring(0, 10);

    return todayString > deadlineString;
  };

  // ===============================
  // FORMAT DATE
  // ===============================

  const formatDate = (date) => {
    if (!date) {
      return "Not Set";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  // ===============================
  // HANDLE EVENT REGISTRATION
  // ===============================

  const handleRegister = async (event) => {
    // COMPLETED EVENT CHECK
    if (
      isEventCompleted(
        event.event_date
      )
    ) {
      alert(
        "Registration is not available for completed events."
      );
      return;
    }

    // DEADLINE CHECK
    if (
      isRegistrationClosed(
        event.registration_deadline
      )
    ) {
      alert(
        "Registration deadline has passed."
      );
      return;
    }

    // CAPACITY CHECK
    const capacity =
      capacityData[event.event_id];

    if (
      capacity &&
      Number(
        capacity.participant_count
      ) >=
        Number(
          capacity.max_participants
        )
    ) {
      alert(
        `Registration closed. Maximum capacity of ${capacity.max_participants} participants has been reached.`
      );

      return;
    }

    // STUDENT EMAIL
    const student_email =
      localStorage.getItem(
        "student_email"
      ) ||
      localStorage.getItem(
        "email"
      );

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
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            student_email:
              student_email,

            event_name:
              event.title,

            event_date:
              event.event_date,

            event_location:
              event.venue,
          }),
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        alert(
          data.message ||
            "Event registered successfully!"
        );

        // UPDATE CAPACITY
        try {
          const capacityResponse =
            await fetch(
              "http://localhost:5000/event-capacity"
            );

          if (capacityResponse.ok) {
            const updatedCapacity =
              await capacityResponse.json();

            const updatedMap = {};

            updatedCapacity.forEach(
              (item) => {
                updatedMap[
                  item.event_id
                ] = item;
              }
            );

            setCapacityData(
              updatedMap
            );
          }
        } catch (error) {
          console.log(error);
        }
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
  // SEARCH + STATUS + CATEGORY FILTER
  // ===============================

  const filteredEvents =
    events.filter((event) => {
      const searchText =
        search
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
        event.status
          ?.toLowerCase() ===
          filterStatus.toLowerCase();

      const matchesCategory =
        filterCategory === "All" ||
        (
          event.category ||
          "Other"
        )
          .toLowerCase() ===
          filterCategory.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

  // ===============================
  // SORT EVENTS
  // ===============================

  const sortedEvents =
    [...filteredEvents].sort(
      (a, b) => {
        if (
          sortBy === "date-asc"
        ) {
          return (
            new Date(
              a.event_date
            ) -
            new Date(
              b.event_date
            )
          );
        }

        if (
          sortBy === "date-desc"
        ) {
          return (
            new Date(
              b.event_date
            ) -
            new Date(
              a.event_date
            )
          );
        }

        if (
          sortBy === "title-asc"
        ) {
          return (
            (
              a.title || ""
            ).localeCompare(
              b.title || ""
            )
          );
        }

        if (
          sortBy === "title-desc"
        ) {
          return (
            (
              b.title || ""
            ).localeCompare(
              a.title || ""
            )
          );
        }

        return 0;
      }
    );

  // ===============================
  // CLEAR FILTERS
  // ===============================

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("All");
    setFilterCategory("All");
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

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search by title, description or venue..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {/* STATUS */}

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value
              )
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

          {/* CATEGORY */}

          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(
                e.target.value
              )
            }
          >

            <option value="All">
              All Categories
            </option>

            <option value="Technical">
              Technical
            </option>

            <option value="Cultural">
              Cultural
            </option>

            <option value="Sports">
              Sports
            </option>

            <option value="Workshop">
              Workshop
            </option>

            <option value="Seminar">
              Seminar
            </option>

            <option value="Other">
              Other
            </option>

          </select>

          {/* SORT */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
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
                {
                  sortedEvents.length
                }
              </strong>{" "}
              event
              {
                sortedEvents.length !==
                1
                  ? "s"
                  : ""
              }
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

          ) : sortedEvents.length >
            0 ? (

            sortedEvents.map(
              (event) => {

                const completed =
                  isEventCompleted(
                    event.event_date
                  );

                const timing =
                  getEventTiming(
                    event.event_date
                  );

                const deadlineClosed =
                  isRegistrationClosed(
                    event.registration_deadline
                  );

                const capacity =
                  capacityData[
                    event.event_id
                  ];

                const maxParticipants =
                  capacity
                    ? Number(
                        capacity.max_participants
                      )
                    : Number(
                        event.max_participants
                      ) || 50;

                const participantCount =
                  capacity
                    ? Number(
                        capacity.participant_count
                      )
                    : 0;

                const remainingSeats =
                  capacity
                    ? Number(
                        capacity.remaining_seats
                      )
                    : Math.max(
                        maxParticipants -
                          participantCount,
                        0
                      );

                const progressPercentage =
                  capacity
                    ? Number(
                        capacity.progress_percentage
                      )
                    : 0;

                const eventFull =
                  participantCount >=
                  maxParticipants;

                return (
                  <div
                    className="event-card"
                    key={
                      event.event_id
                    }
                  >

                    {/* STATUS + TIMING */}

                    <div className="event-card-top">

                      <span className="event-badge">
                        {
                          event.status
                        }
                      </span>

                      <span
                        className="event-badge"
                        style={{
                          marginLeft:
                            "8px",
                        }}
                      >
                        {timing}
                      </span>

                    </div>

                    {/* TITLE */}

                    <h2>
                      {event.title}
                    </h2>

                    {/* DESCRIPTION */}

                    <p className="event-description">
                      {
                        event.description
                      }
                    </p>

                    {/* CATEGORY */}

                    <div
                      style={{
                        marginTop:
                          "10px",
                        marginBottom:
                          "10px",
                      }}
                    >

                      <span className="event-badge">
                        {
                          event.category ||
                          "Other"
                        }
                      </span>

                    </div>

                    {/* EVENT DETAILS */}

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
                          {
                            event.venue
                          }
                        </span>

                      </p>

                      {/* REGISTRATION DEADLINE */}

                      <p>

                        <strong>
                          Registration Deadline
                        </strong>

                        <span>
                          {
                            event.registration_deadline
                              ? formatDate(
                                  event.registration_deadline
                                )
                              : "Not Set"
                          }
                        </span>

                      </p>

                    </div>

                    {/* =========================
                        SEAT AVAILABILITY
                    ========================= */}

                    <div
                      style={{
                        marginTop:
                          "15px",
                        marginBottom:
                          "18px",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap: "10px",
                          marginBottom:
                            "7px",
                          fontSize:
                            "14px",
                          fontWeight:
                            "600",
                        }}
                      >

                        <span>
                          Participants:{" "}
                          {
                            participantCount
                          }{" "}
                          /{" "}
                          {
                            maxParticipants
                          }
                        </span>

                        <span>
                          {
                            remainingSeats >
                            0
                              ? `${remainingSeats} seats left`
                              : "Full"
                          }
                        </span>

                      </div>

                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "9px",
                          borderRadius:
                            "10px",
                          background:
                            "#e5e7eb",
                          overflow:
                            "hidden",
                        }}
                      >

                        <div
                          style={{
                            width: `${progressPercentage}%`,
                            height:
                              "100%",
                            borderRadius:
                              "10px",
                            background:
                              "currentColor",
                            transition:
                              "width 0.3s ease",
                          }}
                        />

                      </div>

                      <p
                        style={{
                          textAlign:
                            "right",
                          marginTop:
                            "5px",
                          marginBottom:
                            0,
                          fontSize:
                            "12px",
                        }}
                      >
                        {
                          progressPercentage
                        }
                        % capacity filled
                      </p>

                    </div>

                    {/* =========================
                        VIEW DETAILS
                    ========================= */}

                    <button
                      type="button"
                      className="dashboard-btn"
                      style={{
                        width:
                          "100%",
                        marginBottom:
                          "10px",
                      }}
                      onClick={() =>
                        setSelectedEvent(
                          event
                        )
                      }
                    >
                      View Details
                    </button>

                    {/* =========================
                        REGISTRATION
                    ========================= */}

                    {completed ? (

                      <div className="unavailable">
                        Event Completed
                      </div>

                    ) : deadlineClosed ? (

                      <div className="unavailable">
                        Registration Closed
                      </div>

                    ) : (
                      event.status &&
                      event.status.toLowerCase() ===
                        "approved" ? (

                        eventFull ? (

                          <div className="unavailable">
                            Event Full
                          </div>

                        ) : (

                          <button
                            className="event-register-btn"
                            onClick={() =>
                              handleRegister(
                                event
                              )
                            }
                          >
                            Register for Event
                          </button>

                        )

                      ) : (

                        <div className="unavailable">
                          Registration unavailable
                        </div>

                      )
                    )}

                  </div>
                );
              }
            )

          ) : (

            <div className="no-events">

              <h3>
                No matching events found.
              </h3>

              <p>
                Try changing your search, status,
                category filter or sorting option.
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
          onClick={
            closeEventDetails
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.65)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
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

            {/* MODAL HEADER */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: "15px",
                marginBottom:
                  "20px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                  fontSize:
                    "28px",
                }}
              >
                {
                  selectedEvent.title
                }
              </h2>

              <button
                type="button"
                onClick={
                  closeEventDetails
                }
                style={{
                  border:
                    "none",
                  background:
                    "#eeeeee",
                  width:
                    "40px",
                  height:
                    "40px",
                  borderRadius:
                    "50%",
                  cursor:
                    "pointer",
                  fontSize:
                    "20px",
                  fontWeight:
                    "700",
                }}
              >
                ×
              </button>

            </div>

            {/* BADGES */}

            <div
              style={{
                marginBottom:
                  "20px",
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap: "8px",
              }}
            >

              <span className="event-badge">
                {
                  selectedEvent.status
                }
              </span>

              <span className="event-badge">
                {
                  getEventTiming(
                    selectedEvent.event_date
                  )
                }
              </span>

              <span className="event-badge">
                {
                  selectedEvent.category ||
                  "Other"
                }
              </span>

            </div>

            {/* DETAILS */}

            <div
              style={{
                display:
                  "grid",
                gap: "16px",
              }}
            >

              {/* DESCRIPTION */}

              <div>

                <strong>
                  Description
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >
                  {
                    selectedEvent.description ||
                    "No description available"
                  }
                </p>

              </div>

              {/* DATE */}

              <div>

                <strong>
                  Date & Time
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >
                  {new Date(
                    selectedEvent.event_date
                  ).toLocaleString()}
                </p>

              </div>

              {/* VENUE */}

              <div>

                <strong>
                  Venue
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >
                  {
                    selectedEvent.venue ||
                    "Venue not available"
                  }
                </p>

              </div>

              {/* CATEGORY */}

              <div>

                <strong>
                  Category
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >
                  {
                    selectedEvent.category ||
                    "Other"
                  }
                </p>

              </div>

              {/* REGISTRATION DEADLINE */}

              <div>

                <strong>
                  Registration Deadline
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >
                  {
                    selectedEvent.registration_deadline
                      ? formatDate(
                          selectedEvent.registration_deadline
                        )
                      : "Not Set"
                  }
                </p>

              </div>

              {/* CAPACITY */}

              <div>

                <strong>
                  Participant Capacity
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >

                  {
                    capacityData[
                      selectedEvent.event_id
                    ]?.participant_count ||
                    0
                  }

                  {" / "}

                  {
                    capacityData[
                      selectedEvent.event_id
                    ]?.max_participants ||
                    selectedEvent.max_participants ||
                    50
                  }

                  {" participants"}

                </p>

              </div>

              {/* REMAINING SEATS */}

              <div>

                <strong>
                  Remaining Seats
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >

                  {
                    capacityData[
                      selectedEvent.event_id
                    ]?.remaining_seats ??
                    Math.max(
                      Number(
                        selectedEvent.max_participants
                      ) || 50,
                      0
                    )
                  }

                </p>

              </div>

              {/* EVENT ID */}

              <div>

                <strong>
                  Event ID
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >
                  {
                    selectedEvent.event_id
                  }
                </p>

              </div>

              {/* COORDINATOR ID */}

              <div>

                <strong>
                  Coordinator ID
                </strong>

                <p
                  style={{
                    marginTop:
                      "6px",
                  }}
                >
                  {
                    selectedEvent.coordinator_id
                  }
                </p>

              </div>

            </div>

            {/* =========================
                MODAL REGISTRATION
            ========================= */}

            {isEventCompleted(
              selectedEvent.event_date
            ) ? (

              <div
                className="unavailable"
                style={{
                  marginTop:
                    "20px",
                }}
              >
                Event Completed
              </div>

            ) : isRegistrationClosed(
                selectedEvent.registration_deadline
              ) ? (

              <div
                className="unavailable"
                style={{
                  marginTop:
                    "20px",
                }}
              >
                Registration Closed
              </div>

            ) : selectedEvent.status &&
              selectedEvent.status.toLowerCase() ===
                "approved" ? (

              capacityData[
                selectedEvent.event_id
              ] &&
              Number(
                capacityData[
                  selectedEvent.event_id
                ].participant_count
              ) >=
                Number(
                  capacityData[
                    selectedEvent.event_id
                  ].max_participants
                ) ? (

                <div
                  className="unavailable"
                  style={{
                    marginTop:
                      "20px",
                  }}
                >
                  Event Full
                </div>

              ) : (

                <button
                  type="button"
                  className="event-register-btn"
                  style={{
                    width:
                      "100%",
                    marginTop:
                      "20px",
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

              )

            ) : (

              <div
                className="unavailable"
                style={{
                  marginTop:
                    "20px",
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