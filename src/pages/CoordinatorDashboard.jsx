import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";

function CoordinatorDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingParticipants, setLoadingParticipants] =
    useState(false);

  const [creatingEvent, setCreatingEvent] = useState(false);
  const [updatingEvent, setUpdatingEvent] = useState(false);

  // EDIT EVENT
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // ===============================
  // GET LOGGED-IN COORDINATOR ID
  // ===============================

  const getCoordinatorId = () => {
    return localStorage.getItem("user_id");
  };

  // ===============================
  // FETCH EVENTS
  // ===============================

  const fetchEvents = async () => {
    const coordinatorId = getCoordinatorId();

    if (!coordinatorId) {
      alert(
        "Coordinator information not found. Please login again."
      );
      return;
    }

    setLoadingEvents(true);

    try {
      const response = await fetch(
        `http://localhost:5000/manage-events/coordinator/${coordinatorId}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to fetch events"
        );
        return;
      }

      setEvents(data);
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoadingEvents(false);
    }
  };

  // ===============================
  // FETCH PARTICIPANTS
  // ===============================

  const fetchParticipants = async () => {
    const coordinatorId = getCoordinatorId();

    if (!coordinatorId) {
      alert(
        "Coordinator information not found. Please login again."
      );
      return;
    }

    setLoadingParticipants(true);

    try {
      const response = await fetch(
        `http://localhost:5000/participants/coordinator/${coordinatorId}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to fetch participants"
        );
        return;
      }

      setParticipants(data);
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoadingParticipants(false);
    }
  };

  // ===============================
  // LOAD EVENTS + PARTICIPANTS
  // ===============================

  useEffect(() => {
    fetchEvents();
    fetchParticipants();
  }, []);

  // ===============================
  // STATS
  // ===============================

  const totalEvents = events.length;

  const approvedEvents = events.filter(
    (event) =>
      event.status &&
      event.status.toLowerCase() === "approved"
  ).length;

  const pendingEvents = events.filter(
    (event) =>
      event.status &&
      event.status.toLowerCase() === "pending"
  ).length;

  const totalParticipants = participants.length;

  // ===============================
  // EVENT-WISE PARTICIPANT COUNT
  // ===============================

  const getParticipantCount = (eventTitle) => {
    return participants.filter(
      (participant) =>
        participant.event_name &&
        participant.event_name.toLowerCase() ===
          eventTitle.toLowerCase()
    ).length;
  };

  // ===============================
  // FORMAT DATE
  // ===============================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString();
  };

  // ===============================
  // CREATE EVENT
  // ===============================

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (creatingEvent) {
      return;
    }

    const title =
      e.target.title.value.trim();

    const description =
      e.target.description.value.trim();

    const eventDate =
      e.target.eventDate.value;

    const venue =
      e.target.venue.value.trim();

    const category =
      e.target.category.value;

    const maxParticipantsValue =
      e.target.maxParticipants.value;

    const maxParticipants =
      Number(maxParticipantsValue);

    const registrationDeadline =
      e.target.registrationDeadline.value;

    const coordinatorId =
      getCoordinatorId();

    // ===============================
    // COORDINATOR VALIDATION
    // ===============================

    if (!coordinatorId) {
      alert(
        "Coordinator information not found. Please login again."
      );
      return;
    }

    // ===============================
    // REQUIRED FIELD VALIDATION
    // ===============================

    if (
      !title ||
      !description ||
      !eventDate ||
      !venue ||
      !category ||
      !maxParticipantsValue ||
      !registrationDeadline
    ) {
      alert("Please fill all fields");
      return;
    }

    // ===============================
    // TITLE VALIDATION
    // ===============================

    if (title.length < 3) {
      alert(
        "Event title must contain at least 3 characters"
      );
      return;
    }

    // ===============================
    // DESCRIPTION VALIDATION
    // ===============================

    if (description.length < 5) {
      alert(
        "Event description must contain at least 5 characters"
      );
      return;
    }

    // ===============================
    // VENUE VALIDATION
    // ===============================

    if (venue.length < 2) {
      alert("Please enter a valid venue");
      return;
    }

    // ===============================
    // EVENT DATE VALIDATION
    // ===============================

    if (isNaN(Date.parse(eventDate))) {
      alert(
        "Please provide a valid event date"
      );
      return;
    }

    // ===============================
    // REGISTRATION DEADLINE VALIDATION
    // ===============================

    if (
      isNaN(
        Date.parse(
          registrationDeadline
        )
      )
    ) {
      alert(
        "Please provide a valid registration deadline"
      );
      return;
    }

    // ===============================
    // DEADLINE CANNOT BE AFTER EVENT DATE
    // ===============================

    if (
      new Date(registrationDeadline) >
      new Date(eventDate)
    ) {
      alert(
        "Registration deadline cannot be after the event date"
      );
      return;
    }

    // ===============================
    // CAPACITY VALIDATION
    // ===============================

    if (
      !Number.isInteger(maxParticipants) ||
      maxParticipants < 1
    ) {
      alert(
        "Maximum participants must be a positive whole number"
      );
      return;
    }

    setCreatingEvent(true);

    try {
      const response = await fetch(
        "http://localhost:5000/create-event",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            coordinator_id:
              Number(coordinatorId),

            title:
              title,

            description:
              description,

            event_date:
              eventDate,

            venue:
              venue,

            category:
              category,

            max_participants:
              maxParticipants,

            registration_deadline:
              registrationDeadline,
          }),
        }
      );

      const data =
        await response.json();

      alert(
        data.message ||
          "Event creation completed."
      );

      if (response.ok) {
        e.target.reset();

        setShowForm(false);

        fetchEvents();
        fetchParticipants();
      }
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setCreatingEvent(false);
    }
  };

  // ===============================
  // OPEN EDIT FORM
  // ===============================

  const handleEdit = (event) => {
    setEditingEvent({
      event_id:
        event.event_id,

      title:
        event.title || "",

      description:
        event.description || "",

      event_date:
        event.event_date
          ? event.event_date.substring(
              0,
              10
            )
          : "",

      venue:
        event.venue || "",

      category:
        event.category ||
        "Other",

      max_participants:
        event.max_participants ||
        50,

      registration_deadline:
        event.registration_deadline
          ? event.registration_deadline.substring(
              0,
              10
            )
          : "",
    });

    setShowEditForm(true);
    setShowManage(true);
    setShowForm(false);
    setShowParticipants(false);
  };

  // ===============================
  // UPDATE EVENT
  // ===============================

  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    if (updatingEvent) {
      return;
    }

    const coordinatorId =
      getCoordinatorId();

    if (!coordinatorId) {
      alert(
        "Coordinator information not found. Please login again."
      );
      return;
    }

    if (
      !editingEvent.title ||
      !editingEvent.description ||
      !editingEvent.event_date ||
      !editingEvent.venue ||
      !editingEvent.category ||
      !editingEvent.max_participants ||
      !editingEvent.registration_deadline
    ) {
      alert("Please fill all fields");
      return;
    }

    const maxParticipants =
      Number(
        editingEvent.max_participants
      );

    // ===============================
    // TITLE VALIDATION
    // ===============================

    if (
      editingEvent.title
        .trim()
        .length < 3
    ) {
      alert(
        "Event title must contain at least 3 characters"
      );
      return;
    }

    // ===============================
    // DESCRIPTION VALIDATION
    // ===============================

    if (
      editingEvent.description
        .trim()
        .length < 5
    ) {
      alert(
        "Event description must contain at least 5 characters"
      );
      return;
    }

    // ===============================
    // VENUE VALIDATION
    // ===============================

    if (
      editingEvent.venue
        .trim()
        .length < 2
    ) {
      alert(
        "Please enter a valid venue"
      );
      return;
    }

    // ===============================
    // CATEGORY VALIDATION
    // ===============================

    if (!editingEvent.category) {
      alert(
        "Please select an event category"
      );
      return;
    }

    // ===============================
    // EVENT DATE VALIDATION
    // ===============================

    if (
      isNaN(
        Date.parse(
          editingEvent.event_date
        )
      )
    ) {
      alert(
        "Please provide a valid event date"
      );
      return;
    }

    // ===============================
    // DEADLINE VALIDATION
    // ===============================

    if (
      !editingEvent.registration_deadline ||
      isNaN(
        Date.parse(
          editingEvent.registration_deadline
        )
      )
    ) {
      alert(
        "Please provide a valid registration deadline"
      );
      return;
    }

    // ===============================
    // DEADLINE CANNOT BE AFTER EVENT DATE
    // ===============================

    if (
      new Date(
        editingEvent.registration_deadline
      ) >
      new Date(
        editingEvent.event_date
      )
    ) {
      alert(
        "Registration deadline cannot be after the event date"
      );
      return;
    }

    // ===============================
    // CAPACITY VALIDATION
    // ===============================

    if (
      !Number.isInteger(maxParticipants) ||
      maxParticipants < 1
    ) {
      alert(
        "Maximum participants must be a positive whole number"
      );
      return;
    }

    setUpdatingEvent(true);

    try {
      const response = await fetch(
        `http://localhost:5000/update-event/${editingEvent.event_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            coordinator_id:
              Number(coordinatorId),

            title:
              editingEvent.title.trim(),

            description:
              editingEvent.description.trim(),

            event_date:
              editingEvent.event_date,

            venue:
              editingEvent.venue.trim(),

            category:
              editingEvent.category,

            max_participants:
              maxParticipants,

            registration_deadline:
              editingEvent.registration_deadline,
          }),
        }
      );

      const data =
        await response.json();

      alert(
        data.message ||
          "Event update completed."
      );

      if (response.ok) {
        setEditingEvent(null);
        setShowEditForm(false);

        fetchEvents();
        fetchParticipants();
      }
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setUpdatingEvent(false);
    }
  };

  // ===============================
  // DELETE EVENT
  // ===============================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event?"
      )
    ) {
      return;
    }

    const coordinatorId =
      getCoordinatorId();

    if (!coordinatorId) {
      alert(
        "Coordinator information not found. Please login again."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/delete-event/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            coordinator_id:
              Number(coordinatorId),
          }),
        }
      );

      const data =
        await response.json();

      alert(
        data.message ||
          "Delete operation completed."
      );

      if (response.ok) {
        fetchEvents();
        fetchParticipants();

        if (
          editingEvent &&
          editingEvent.event_id === id
        ) {
          setEditingEvent(null);
          setShowEditForm(false);
        }
      }
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // ===============================
  // EXPORT PARTICIPANTS TO CSV
  // ===============================

  const exportParticipantsCSV = () => {
    if (participants.length === 0) {
      alert(
        "No participants available to export."
      );
      return;
    }

    const headers = [
      "Student Email",
      "Event",
      "Date",
      "Location",
    ];

    const rows = participants.map(
      (participant) => [
        participant.student_email ||
          "",

        participant.event_name ||
          "",

        formatDate(
          participant.event_date
        ),

        participant.event_location ||
          "",
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "coordinator_participants.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    alert(
      "Participant data exported successfully!"
    );
  };

  return (
    <div>

      {/* ===============================
          NAVBAR
      =============================== */}

      <nav className="navbar">

        <div className="logo">
          Campus Events
        </div>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/events">
            Events
          </Link>

          <Link to="/logout">
            Logout
          </Link>

        </div>

      </nav>

      {/* ===============================
          DASHBOARD
      =============================== */}

      <div className="dashboard-container">

        <h1>
          Club Coordinator Dashboard
        </h1>

        <p>
          Manage your college events from one place.
        </p>

        {/* ===============================
            SUMMARY STATS
        =============================== */}

        <div
          className="dashboard-grid"
          style={{
            marginBottom: "35px",
          }}
        >

          <div className="dashboard-card">

            <div
              style={{
                fontSize: "34px",
                marginBottom: "8px",
              }}
            >
              📅
            </div>

            <h2>
              Total Events
            </h2>

            <h1>
              {loadingEvents
                ? "..."
                : totalEvents}
            </h1>

            <p>
              Events created by you
            </p>

          </div>


          <div className="dashboard-card">

            <div
              style={{
                fontSize: "34px",
                marginBottom: "8px",
              }}
            >
              ✅
            </div>

            <h2>
              Approved Events
            </h2>

            <h1>
              {loadingEvents
                ? "..."
                : approvedEvents}
            </h1>

            <p>
              Events approved by admin
            </p>

          </div>


          <div className="dashboard-card">

            <div
              style={{
                fontSize: "34px",
                marginBottom: "8px",
              }}
            >
              ⏳
            </div>

            <h2>
              Pending Events
            </h2>

            <h1>
              {loadingEvents
                ? "..."
                : pendingEvents}
            </h1>

            <p>
              Events waiting for approval
            </p>

          </div>


          <div className="dashboard-card">

            <div
              style={{
                fontSize: "34px",
                marginBottom: "8px",
              }}
            >
              👥
            </div>

            <h2>
              Total Participants
            </h2>

            <h1>
              {loadingParticipants
                ? "..."
                : totalParticipants}
            </h1>

            <p>
              Students registered for your events
            </p>

          </div>

        </div>

        {/* ===============================
            DASHBOARD ACTION CARDS
        =============================== */}

        <div className="dashboard-grid">

          <div className="dashboard-card">

            <h2>
              Create Event
            </h2>

            <p>
              Create and publish a new college event.
            </p>

            <button
              className="dashboard-btn"
              onClick={() => {
                setShowForm(
                  !showForm
                );

                setShowManage(false);
                setShowParticipants(false);
                setShowEditForm(false);
                setEditingEvent(null);
              }}
            >
              Create Event
            </button>

          </div>


          <div className="dashboard-card">

            <h2>
              Manage Events
            </h2>

            <p>
              Edit or delete your created events.
            </p>

            <button
              className="dashboard-btn"
              onClick={() => {
                fetchEvents();
                fetchParticipants();

                setShowManage(
                  !showManage
                );

                setShowForm(false);
                setShowParticipants(false);
                setShowEditForm(false);
                setEditingEvent(null);
              }}
            >
              Manage Events
            </button>

          </div>


          <div className="dashboard-card">

            <h2>
              Participants
            </h2>

            <p>
              View students registered for your events.
            </p>

            <button
              className="dashboard-btn"
              onClick={() => {
                fetchParticipants();

                setShowParticipants(
                  !showParticipants
                );

                setShowForm(false);
                setShowManage(false);
                setShowEditForm(false);
                setEditingEvent(null);
              }}
            >
              View Participants
            </button>

          </div>

        </div>

        {/* ===============================
            CREATE EVENT FORM
        =============================== */}

        {showForm && (

          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "650px",
              maxWidth: "92%",
              padding: "32px",
            }}
          >

            <h2
              style={{
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              Create New Event
            </h2>

            <p
              style={{
                textAlign: "center",
                marginBottom: "30px",
                opacity: 0.75,
              }}
            >
              Fill in all event details carefully
            </p>

            <form
              onSubmit={
                handleCreateEvent
              }
            >

              {/* ===============================
                  EVENT TITLE
              =============================== */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Event Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter event title"
                  disabled={creatingEvent}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />

              </div>


              {/* ===============================
                  EVENT DESCRIPTION
              =============================== */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Event Description
                </label>

                <textarea
                  name="description"
                  placeholder="Enter event description"
                  rows="4"
                  disabled={creatingEvent}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />

              </div>


              {/* ===============================
                  EVENT DATE
              =============================== */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Event Date
                </label>

                <input
                  type="date"
                  name="eventDate"
                  disabled={creatingEvent}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />

              </div>


              {/* ===============================
                  VENUE
              =============================== */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Venue
                </label>

                <input
                  type="text"
                  name="venue"
                  placeholder="Enter event venue"
                  disabled={creatingEvent}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />

              </div>


              {/* ===============================
                  EVENT CATEGORY
              =============================== */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Event Category
                </label>

                <select
                  name="category"
                  defaultValue=""
                  disabled={creatingEvent}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >

                  <option
                    value=""
                    disabled
                  >
                    Select Event Category
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

              </div>


              {/* ===============================
                  MAX PARTICIPANTS
              =============================== */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Maximum Participants
                </label>

                <input
                  type="number"
                  name="maxParticipants"
                  placeholder="Enter maximum participants"
                  min="1"
                  defaultValue="50"
                  disabled={creatingEvent}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    opacity: 0.7,
                  }}
                >
                  Maximum number of students who can register for this event.
                </small>

              </div>


              {/* ===============================
                  REGISTRATION DEADLINE
              =============================== */}

              <div
                style={{
                  marginBottom: "28px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Registration Deadline
                </label>

                <input
                  type="date"
                  name="registrationDeadline"
                  disabled={creatingEvent}
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    opacity: 0.7,
                  }}
                >
                  Students can register only until this date.
                </small>

              </div>


              {/* ===============================
                  CREATE BUTTON
              =============================== */}

              <button
                type="submit"
                className="dashboard-btn"
                disabled={creatingEvent}
                style={{
                  width: "100%",
                  minHeight: "45px",
                }}
              >

                {creatingEvent
                  ? "Creating Event..."
                  : "Create Event"}

              </button>

            </form>

          </div>

        )}


        {/* ===============================
            MANAGE EVENTS
        =============================== */}

        {showManage && (

          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "1400px",
              maxWidth: "95%",
            }}
          >

            <h2>
              Manage Events
            </h2>

            {loadingEvents ? (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                ⏳ Loading events...
              </p>

            ) : events.length > 0 ? (

              <div
                style={{
                  overflowX: "auto",
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "center",
                  }}
                >

                  <thead>

                    <tr>

                      <th>
                        Title
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Event Date
                      </th>

                      <th>
                        Registration Deadline
                      </th>

                      <th>
                        Venue
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Participants
                      </th>

                      <th>
                        Capacity
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {events.map(
                      (event) => (

                        <tr
                          key={
                            event.event_id
                          }
                        >

                          <td>
                            {event.title}
                          </td>

                          <td>
                            {event.category ||
                              "Other"}
                          </td>

                          <td>
                            {formatDate(
                              event.event_date
                            )}
                          </td>

                          <td>
                            {event.registration_deadline
                              ? formatDate(
                                  event.registration_deadline
                                )
                              : "Not Set"}
                          </td>

                          <td>
                            {event.venue}
                          </td>

                          <td>
                            {event.status}
                          </td>

                          <td>
                            <strong>
                              {getParticipantCount(
                                event.title
                              )}
                            </strong>
                          </td>

                          <td>
                            <strong>
                              {event.max_participants ||
                                50}
                            </strong>
                          </td>

                          <td>

                            <button
                              className="dashboard-btn"
                              disabled={
                                updatingEvent
                              }
                              onClick={() =>
                                handleEdit(
                                  event
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="dashboard-btn"
                              style={{
                                marginLeft:
                                  "8px",
                              }}
                              onClick={() =>
                                handleDelete(
                                  event.event_id
                                )
                              }
                            >
                              Delete
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div
                style={{
                  textAlign: "center",
                  padding: "25px",
                }}
              >

                <h3>
                  No Events Found
                </h3>

                <p>
                  You have not created any events yet.
                  Create an event to see it here.
                </p>

              </div>

            )}

          </div>

        )}


        {/* ===============================
            EDIT EVENT FORM
        =============================== */}

        {showEditForm &&
          editingEvent && (

            <div
              className="auth-card"
              style={{
                marginTop: "40px",
                width: "650px",
                maxWidth: "92%",
                padding: "32px",
              }}
            >

              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "8px",
                }}
              >
                Edit Event
              </h2>

              <p
                style={{
                  textAlign: "center",
                  marginBottom: "30px",
                  opacity: 0.75,
                }}
              >
                Update your event details
              </p>

              <form
                onSubmit={
                  handleUpdateEvent
                }
              >

                {/* EVENT TITLE */}

                <div
                  style={{
                    marginBottom: "22px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Event Title
                  </label>

                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={
                      editingEvent.title
                    }
                    disabled={
                      updatingEvent
                    }
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        title:
                          e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                    }}
                  />

                </div>


                {/* EVENT DESCRIPTION */}

                <div
                  style={{
                    marginBottom: "22px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Event Description
                  </label>

                  <textarea
                    placeholder="Enter event description"
                    rows="4"
                    value={
                      editingEvent.description
                    }
                    disabled={
                      updatingEvent
                    }
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        description:
                          e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      resize: "vertical",
                    }}
                  />

                </div>


                {/* EVENT DATE */}

                <div
                  style={{
                    marginBottom: "22px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Event Date
                  </label>

                  <input
                    type="date"
                    value={
                      editingEvent.event_date
                    }
                    disabled={
                      updatingEvent
                    }
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        event_date:
                          e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                    }}
                  />

                </div>


                {/* VENUE */}

                <div
                  style={{
                    marginBottom: "22px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Venue
                  </label>

                  <input
                    type="text"
                    placeholder="Enter event venue"
                    value={
                      editingEvent.venue
                    }
                    disabled={
                      updatingEvent
                    }
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        venue:
                          e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                    }}
                  />

                </div>


                {/* CATEGORY */}

                <div
                  style={{
                    marginBottom: "22px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Event Category
                  </label>

                  <select
                    value={
                      editingEvent.category ||
                      "Other"
                    }
                    disabled={
                      updatingEvent
                    }
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        category:
                          e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                    }}
                  >

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

                </div>


                {/* MAX PARTICIPANTS */}

                <div
                  style={{
                    marginBottom: "22px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Maximum Participants
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Enter maximum participants"
                    value={
                      editingEvent.max_participants
                    }
                    disabled={
                      updatingEvent
                    }
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        max_participants:
                          e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <small
                    style={{
                      display: "block",
                      marginTop: "7px",
                      opacity: 0.7,
                    }}
                  >
                    Capacity cannot be lower than the current participant count.
                  </small>

                </div>


                {/* REGISTRATION DEADLINE */}

                <div
                  style={{
                    marginBottom: "28px",
                  }}
                >

                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    Registration Deadline
                  </label>

                  <input
                    type="date"
                    value={
                      editingEvent.registration_deadline ||
                      ""
                    }
                    disabled={
                      updatingEvent
                    }
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        registration_deadline:
                          e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <small
                    style={{
                      display: "block",
                      marginTop: "7px",
                      opacity: 0.7,
                    }}
                  >
                    Students can register only until this date.
                  </small>

                </div>


                {/* UPDATE BUTTON */}

                <button
                  type="submit"
                  className="dashboard-btn"
                  disabled={
                    updatingEvent
                  }
                  style={{
                    minHeight: "45px",
                  }}
                >

                  {updatingEvent
                    ? "Updating Event..."
                    : "Update Event"}

                </button>


                {/* CANCEL BUTTON */}

                <button
                  type="button"
                  className="dashboard-btn"
                  style={{
                    marginLeft: "10px",
                    minHeight: "45px",
                  }}
                  disabled={
                    updatingEvent
                  }
                  onClick={() => {
                    setShowEditForm(
                      false
                    );

                    setEditingEvent(
                      null
                    );
                  }}
                >
                  Cancel
                </button>

              </form>

            </div>

          )}


        {/* ===============================
            PARTICIPANTS
        =============================== */}

        {showParticipants && (

          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "1000px",
              maxWidth: "95%",
            }}
          >

            <h2>
              Participants
            </h2>

            {loadingParticipants ? (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                ⏳ Loading participants...
              </p>

            ) : participants.length > 0 ? (

              <>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    marginBottom: "20px",
                  }}
                >

                  <button
                    type="button"
                    className="dashboard-btn"
                    onClick={
                      exportParticipantsCSV
                    }
                  >
                    Export Participants CSV
                  </button>

                </div>


                <div
                  style={{
                    overflowX: "auto",
                  }}
                >

                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                      textAlign: "center",
                    }}
                  >

                    <thead>

                      <tr>

                        <th>
                          Email
                        </th>

                        <th>
                          Event
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Location
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {participants.map(
                        (p, index) => (

                          <tr
                            key={index}
                          >

                            <td>
                              {
                                p.student_email
                              }
                            </td>

                            <td>
                              {
                                p.event_name
                              }
                            </td>

                            <td>
                              {formatDate(
                                p.event_date
                              )}
                            </td>

                            <td>
                              {
                                p.event_location
                              }
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </>

            ) : (

              <div
                style={{
                  textAlign: "center",
                  padding: "25px",
                }}
              >

                <h3>
                  No Participants Found
                </h3>

                <p>
                  No students are currently registered
                  for your events.
                </p>

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default CoordinatorDashboard;