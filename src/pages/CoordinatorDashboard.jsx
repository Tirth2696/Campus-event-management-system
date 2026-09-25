import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";

function CoordinatorDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);

  // EDIT EVENT
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // ===============================
  // FETCH EVENTS
  // ===============================
  const fetchEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/manage-events"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch events");
        return;
      }

      setEvents(data);
    } catch (error) {
      console.log(error);
      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // ===============================
  // FETCH PARTICIPANTS
  // ===============================
  const fetchParticipants = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/participants"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch participants");
        return;
      }

      setParticipants(data);
    } catch (error) {
      console.log(error);
      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // ===============================
  // LOAD EVENTS
  // ===============================
  useEffect(() => {
    fetchEvents();
  }, []);

  // ===============================
  // CREATE EVENT
  // ===============================
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const description = e.target.description.value;
    const eventDate = e.target.eventDate.value;
    const venue = e.target.venue.value;

    if (!title || !description || !eventDate || !venue) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/create-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinator_id: 1,
            title: title,
            description: description,
            event_date: eventDate,
            venue: venue,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        e.target.reset();
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.log(error);
      alert(
        "Cannot connect to server. Make sure backend is running."
      );
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

    if (
      !editingEvent.title ||
      !editingEvent.description ||
      !editingEvent.event_date ||
      !editingEvent.venue
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/update-event/${editingEvent.event_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editingEvent.title,
            description: editingEvent.description,
            event_date: editingEvent.event_date,
            venue: editingEvent.venue,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        setEditingEvent(null);
        setShowEditForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.log(error);
      alert(
        "Cannot connect to server. Make sure backend is running."
      );
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

    try {
      const response = await fetch(
        `http://localhost:5000/delete-event/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        fetchEvents();

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
      alert("Delete failed");
    }
  };

  // ===============================
  // FORMAT DATE
  // ===============================
  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString();
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
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/login">Logout</Link>
        </div>
      </nav>

      {/* ===============================
          DASHBOARD
      =============================== */}
      <div className="dashboard-container">

        <h1>Club Coordinator Dashboard</h1>

        <p>
          Manage your college events from one place.
        </p>

        <div className="dashboard-grid">

          {/* CREATE EVENT */}
          <div className="dashboard-card">
            <h2>Create Event</h2>

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
              }}
            >
              Create Event
            </button>
          </div>

          {/* MANAGE EVENTS */}
          <div className="dashboard-card">
            <h2>Manage Events</h2>

            <p>
              Edit or delete your created events.
            </p>

            <button
              className="dashboard-btn"
              onClick={() => {
                fetchEvents();
                setShowManage(!showManage);
                setShowForm(false);
                setShowParticipants(false);
                setShowEditForm(false);
              }}
            >
              Manage Events
            </button>
          </div>

          {/* PARTICIPANTS */}
          <div className="dashboard-card">
            <h2>Participants</h2>

            <p>
              View students registered for your events.
            </p>

            <button
              className="dashboard-btn"
              onClick={() => {
                fetchParticipants();
                setShowParticipants(!showParticipants);
                setShowForm(false);
                setShowManage(false);
                setShowEditForm(false);
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
            <h2>Create New Event</h2>

            <form onSubmit={handleCreateEvent}>

              <input
                type="text"
                name="title"
                placeholder="Event Title"
              />

              <textarea
                name="description"
                placeholder="Event Description"
              />

              <input
                type="date"
                name="eventDate"
              />

              <input
                type="text"
                name="venue"
                placeholder="Venue"
              />

              <button
                type="submit"
                className="dashboard-btn"
              >
                Create Event
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
              width: "1000px",
              maxWidth: "95%",
            }}
          >
            <h2>Manage Events</h2>

            {events.length > 0 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.event_id}>

                      <td>
                        {event.title}
                      </td>

                      <td>
                        {formatDate(event.event_date)}
                      </td>

                      <td>
                        {event.venue}
                      </td>

                      <td>
                        {event.status}
                      </td>

                      <td>

                        {/* EDIT */}
                        <button
                          className="dashboard-btn"
                          onClick={() =>
                            handleEdit(event)
                          }
                        >
                          Edit
                        </button>

                        {/* DELETE */}
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
            ) : (
              <p style={{ textAlign: "center" }}>
                No Events Found
              </p>
            )}
          </div>
        )}

        {/* ===============================
            EDIT EVENT FORM
        =============================== */}
        {showEditForm && editingEvent && (
          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "600px",
              maxWidth: "90%",
            }}
          >
            <h2>Edit Event</h2>

            <form onSubmit={handleUpdateEvent}>

              <input
                type="text"
                placeholder="Event Title"
                value={editingEvent.title}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Event Description"
                value={editingEvent.description}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    description: e.target.value,
                  })
                }
              />

              <input
                type="date"
                value={editingEvent.event_date}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    event_date: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Venue"
                value={editingEvent.venue}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    venue: e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="dashboard-btn"
              >
                Update Event
              </button>

              <button
                type="button"
                className="dashboard-btn"
                style={{
                  marginLeft: "10px",
                }}
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
            <h2>Participants</h2>

            {participants.length > 0 ? (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "center",
                }}
              >
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Location</th>
                  </tr>
                </thead>

                <tbody>
                  {participants.map(
                    (p, index) => (
                      <tr key={index}>

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
            ) : (
              <p style={{ textAlign: "center" }}>
                No Participants Found
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default CoordinatorDashboard;