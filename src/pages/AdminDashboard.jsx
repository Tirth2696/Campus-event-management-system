import { Link } from "react-router-dom";
import { useState } from "react";
import "../App.css";

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);

  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const [reports, setReports] = useState(null);
  const [showReports, setShowReports] = useState(false);

  // ===============================
  // FETCH PENDING EVENTS
  // ===============================

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/admin/events"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch events");
        return;
      }

      setEvents(data);
      setShowEvents(true);
      setShowUsers(false);
      setShowReports(false);
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // ===============================
  // APPROVE / REJECT EVENT
  // ===============================

  const updateEventStatus = async (eventId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/events/${eventId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update event");
        return;
      }

      alert(data.message);
      fetchEvents();
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // ===============================
  // FETCH USERS
  // ===============================

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/admin/users"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch users");
        return;
      }

      setUsers(data);
      setShowUsers(true);
      setShowEvents(false);
      setShowReports(false);
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // ===============================
  // FETCH REPORTS
  // ===============================

  const fetchReports = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/admin/reports"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch reports");
        return;
      }

      setReports(data);
      setShowReports(true);
      setShowEvents(false);
      setShowUsers(false);
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  return (
    <div>

      {/* NAVBAR */}

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

          {/* Proper Logout */}
          <Link to="/logout">
            Logout
          </Link>

        </div>

      </nav>

      {/* DASHBOARD */}

      <div className="dashboard-container">

        <h1>
          Admin Dashboard
        </h1>

        <p>
          Monitor and manage the complete campus event system.
        </p>

        <div className="dashboard-grid">

          {/* APPROVE EVENTS */}

          <div className="dashboard-card">

            <h2>
              Approve Events
            </h2>

            <p>
              Review and approve events created by coordinators.
            </p>

            <button
              className="dashboard-btn"
              onClick={fetchEvents}
            >
              Review Events
            </button>

          </div>

          {/* MANAGE USERS */}

          <div className="dashboard-card">

            <h2>
              Manage Users
            </h2>

            <p>
              Manage students and club coordinators.
            </p>

            <button
              className="dashboard-btn"
              onClick={fetchUsers}
            >
              Manage Users
            </button>

          </div>

          {/* REPORTS */}

          <div className="dashboard-card">

            <h2>
              Reports
            </h2>

            <p>
              View event and participant reports.
            </p>

            <button
              className="dashboard-btn"
              onClick={fetchReports}
            >
              View Reports
            </button>

          </div>

        </div>

        {/* ===============================
            PENDING EVENTS
        =============================== */}

        {showEvents && (

          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "1000px",
              maxWidth: "95%",
            }}
          >

            <h2>
              Pending Events
            </h2>

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

                    <th>
                      Title
                    </th>

                    <th>
                      Description
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
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {events.map((event) => (

                    <tr key={event.event_id}>

                      <td>
                        {event.title}
                      </td>

                      <td>
                        {event.description}
                      </td>

                      <td>
                        {new Date(
                          event.event_date
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        {event.venue}
                      </td>

                      <td>
                        {event.status}
                      </td>

                      <td>

                        <button
                          className="dashboard-btn"
                          onClick={() =>
                            updateEventStatus(
                              event.event_id,
                              "Approved"
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="dashboard-btn"
                          style={{
                            marginLeft: "8px",
                          }}
                          onClick={() =>
                            updateEventStatus(
                              event.event_id,
                              "Rejected"
                            )
                          }
                        >
                          Reject
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            ) : (

              <p
                style={{
                  textAlign: "center",
                }}
              >
                No Pending Events Found
              </p>

            )}

          </div>

        )}

        {/* ===============================
            MANAGE USERS
        =============================== */}

        {showUsers && (

          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "900px",
              maxWidth: "95%",
            }}
          >

            <h2>
              Manage Users
            </h2>

            {users.length > 0 ? (

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
                      ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr key={user.user_id}>

                      <td>
                        {user.user_id}
                      </td>

                      <td>
                        {user.name}
                      </td>

                      <td>
                        {user.email}
                      </td>

                      <td>
                        {user.role}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            ) : (

              <p
                style={{
                  textAlign: "center",
                }}
              >
                No Users Found
              </p>

            )}

          </div>

        )}

        {/* ===============================
            REPORTS
        =============================== */}

        {showReports && reports && (

          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "1000px",
              maxWidth: "95%",
            }}
          >

            <h2>
              System Reports
            </h2>

            <div className="dashboard-grid">

              {/* TOTAL USERS */}

              <div className="dashboard-card">

                <h2>
                  Total Users
                </h2>

                <h1>
                  {reports.totalUsers}
                </h1>

                <p>
                  Registered users
                </p>

              </div>

              {/* TOTAL EVENTS */}

              <div className="dashboard-card">

                <h2>
                  Total Events
                </h2>

                <h1>
                  {reports.totalEvents}
                </h1>

                <p>
                  Events created
                </p>

              </div>

              {/* APPROVED */}

              <div className="dashboard-card">

                <h2>
                  Approved Events
                </h2>

                <h1>
                  {reports.approvedEvents}
                </h1>

                <p>
                  Approved by admin
                </p>

              </div>

              {/* REJECTED */}

              <div className="dashboard-card">

                <h2>
                  Rejected Events
                </h2>

                <h1>
                  {reports.rejectedEvents}
                </h1>

                <p>
                  Rejected by admin
                </p>

              </div>

              {/* PENDING */}

              <div className="dashboard-card">

                <h2>
                  Pending Events
                </h2>

                <h1>
                  {reports.pendingEvents}
                </h1>

                <p>
                  Waiting for approval
                </p>

              </div>

              {/* PARTICIPANTS */}

              <div className="dashboard-card">

                <h2>
                  Total Participants
                </h2>

                <h1>
                  {reports.totalParticipants}
                </h1>

                <p>
                  Event registrations
                </p>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;