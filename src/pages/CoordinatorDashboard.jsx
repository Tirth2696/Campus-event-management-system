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
  // CREATE EVENT
  // ===============================

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (creatingEvent) {
      return;
    }

    const title = e.target.title.value.trim();

    const description =
      e.target.description.value.trim();

    const eventDate = e.target.eventDate.value;

    const venue = e.target.venue.value.trim();

    const maxParticipantsValue =
      e.target.maxParticipants.value;

    const maxParticipants =
      Number(maxParticipantsValue);

    const coordinatorId = getCoordinatorId();

    if (!coordinatorId) {
      alert(
        "Coordinator information not found. Please login again."
      );
      return;
    }

    if (
      !title ||
      !description ||
      !eventDate ||
      !venue ||
      !maxParticipantsValue
    ) {
      alert("Please fill all fields");
      return;
    }

    if (title.length < 3) {
      alert(
        "Event title must contain at least 3 characters"
      );
      return;
    }

    if (description.length < 5) {
      alert(
        "Event description must contain at least 5 characters"
      );
      return;
    }

    if (venue.length < 2) {
      alert("Please enter a valid venue");
      return;
    }

    if (isNaN(Date.parse(eventDate))) {
      alert("Please provide a valid event date");
      return;
    }

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinator_id:
              Number(coordinatorId),
            title: title,
            description: description,
            event_date: eventDate,
            venue: venue,
            max_participants:
              maxParticipants,
          }),
        }
      );

      const data = await response.json();

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
      event_id: event.event_id,
      title: event.title,
      description: event.description,

      event_date: event.event_date
        ? event.event_date.substring(0, 10)
        : "",

      venue: event.venue,

      max_participants:
        event.max_participants || 50,
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

    const coordinatorId = getCoordinatorId();

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
      !editingEvent.max_participants
    ) {
      alert("Please fill all fields");
      return;
    }

    const maxParticipants = Number(
      editingEvent.max_participants
    );

    if (editingEvent.title.trim().length < 3) {
      alert(
        "Event title must contain at least 3 characters"
      );
      return;
    }

    if (
      editingEvent.description.trim().length < 5
    ) {
      alert(
        "Event description must contain at least 5 characters"
      );
      return;
    }

    if (
      editingEvent.venue.trim().length < 2
    ) {
      alert("Please enter a valid venue");
      return;
    }

    if (
      isNaN(
        Date.parse(editingEvent.event_date)
      )
    ) {
      alert(
        "Please provide a valid event date"
      );
      return;
    }

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
            "Content-Type": "application/json",
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

            max_participants:
              maxParticipants,
          }),
        }
      );

      const data = await response.json();

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

    const coordinatorId = getCoordinatorId();

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinator_id:
              Number(coordinatorId),
          }),
        }
      );

      const data = await response.json();

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
        participant.student_email || "",
        participant.event_name || "",
        formatDate(participant.event_date),
        participant.event_location || "",
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
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
        type: "text/csv;charset=utf-8;",
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

  // ===============================
  // FORMAT DATE
  // ===============================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString();
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
                setShowForm(!showForm);

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

                setShowManage(!showManage);

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
              width: "600px",
              maxWidth: "90%",
            }}
          >

            <h2>
              Create New Event
            </h2>

            <form
              onSubmit={handleCreateEvent}
            >

              <input
                type="text"
                name="title"
                placeholder="Event Title"
                disabled={creatingEvent}
              />

              <textarea
                name="description"
                placeholder="Event Description"
                disabled={creatingEvent}
              />

              <input
                type="date"
                name="eventDate"
                disabled={creatingEvent}
              />

              <input
                type="text"
                name="venue"
                placeholder="Venue"
                disabled={creatingEvent}
              />

              <input
                type="number"
                name="maxParticipants"
                placeholder="Maximum Participants"
                min="1"
                defaultValue="50"
                disabled={creatingEvent}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "-8px",
                  marginBottom: "15px",
                  opacity: 0.8,
                }}
              >
                Set the maximum number of students who can register.
              </small>

              <button
                type="submit"
                className="dashboard-btn"
                disabled={creatingEvent}
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
              width: "1100px",
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
                        Date
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

                    {events.map((event) => (

                      <tr
                        key={event.event_id}
                      >

                        <td>
                          {event.title}
                        </td>

                        <td>
                          {formatDate(
                            event.event_date
                          )}
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
                            disabled={updatingEvent}
                            onClick={() =>
                              handleEdit(event)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="dashboard-btn"
                            style={{
                              marginLeft: "8px",
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

                    ))}

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
                width: "600px",
                maxWidth: "90%",
              }}
            >

              <h2>
                Edit Event
              </h2>

              <form
                onSubmit={
                  handleUpdateEvent
                }
              >

                <input
                  type="text"
                  placeholder="Event Title"
                  value={
                    editingEvent.title
                  }
                  disabled={updatingEvent}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      title:
                        e.target.value,
                    })
                  }
                />

                <textarea
                  placeholder="Event Description"
                  value={
                    editingEvent.description
                  }
                  disabled={updatingEvent}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      description:
                        e.target.value,
                    })
                  }
                />

                <input
                  type="date"
                  value={
                    editingEvent.event_date
                  }
                  disabled={updatingEvent}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      event_date:
                        e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Venue"
                  value={
                    editingEvent.venue
                  }
                  disabled={updatingEvent}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      venue:
                        e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Maximum Participants"
                  min="1"
                  value={
                    editingEvent.max_participants
                  }
                  disabled={updatingEvent}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      max_participants:
                        e.target.value,
                    })
                  }
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "-8px",
                    marginBottom: "15px",
                    opacity: 0.8,
                  }}
                >
                  Capacity cannot be lower than the current participant count.
                </small>

                <button
                  type="submit"
                  className="dashboard-btn"
                  disabled={updatingEvent}
                >
                  {updatingEvent
                    ? "Updating Event..."
                    : "Update Event"}
                </button>

                <button
                  type="button"
                  className="dashboard-btn"
                  style={{
                    marginLeft: "10px",
                  }}
                  disabled={updatingEvent}
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingEvent(null);
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
                {/* ===============================
                    EXPORT BUTTON
                =============================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
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
                      borderCollapse: "collapse",
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
                              {p.student_email}
                            </td>

                            <td>
                              {p.event_name}
                            </td>

                            <td>
                              {formatDate(
                                p.event_date
                              )}
                            </td>

                            <td>
                              {p.event_location}
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