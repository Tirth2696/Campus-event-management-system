import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);

  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  const [reports, setReports] = useState(null);
  const [showReports, setShowReports] = useState(false);

  // EVENT-WISE PARTICIPANT REPORT
  const [eventParticipantReport, setEventParticipantReport] =
    useState([]);
  const [showEventParticipantReport, setShowEventParticipantReport] =
    useState(false);

  // SEARCH & FILTER STATES
  const [eventSearch, setEventSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");

  // LOADING STATES
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingEventParticipantReport, setLoadingEventParticipantReport] =
    useState(false);

  // ===============================
  // FETCH PENDING EVENTS
  // ===============================

  const fetchEvents = async () => {
    setLoadingEvents(true);

    try {
      const response = await fetch(
        "http://localhost:5000/admin/events"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to fetch events"
        );
        return;
      }

      setEvents(data);
      setShowEvents(true);
      setShowUsers(false);
      setShowReports(false);
      setShowEventParticipantReport(false);
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
  // APPROVE / REJECT EVENT
  // ===============================

  const updateEventStatus = async (
    eventId,
    status
  ) => {
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
        alert(
          data.message ||
            "Failed to update event"
        );
        return;
      }

      alert(data.message);

      // Refresh pending events
      fetchEvents();

      // Refresh summary stats
      fetchReports(false);

      // Refresh event participant report
      fetchEventParticipantReport(false);
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
    setLoadingUsers(true);

    try {
      const response = await fetch(
        "http://localhost:5000/admin/users"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to fetch users"
        );
        return;
      }

      setUsers(data);
      setShowUsers(true);
      setShowEvents(false);
      setShowReports(false);
      setShowEventParticipantReport(false);
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // ===============================
  // FETCH REPORTS
  // ===============================

  const fetchReports = async (
    showSection = true
  ) => {
    setLoadingReports(true);

    try {
      const response = await fetch(
        "http://localhost:5000/admin/reports"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Failed to fetch reports"
        );
        return;
      }

      setReports(data);

      if (showSection) {
        setShowReports(true);
        setShowEvents(false);
        setShowUsers(false);
        setShowEventParticipantReport(false);
      }
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoadingReports(false);
    }
  };

  // ===============================
  // FETCH EVENT-WISE PARTICIPANT REPORT
  // ===============================

  const fetchEventParticipantReport = async (
    showSection = true
  ) => {
    setLoadingEventParticipantReport(true);

    try {
      const response = await fetch(
        "http://localhost:5000/admin/event-participants"
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to fetch event participant report"
        );
        return;
      }

      setEventParticipantReport(data);

      if (showSection) {
        setShowEventParticipantReport(true);
        setShowEvents(false);
        setShowUsers(false);
        setShowReports(false);
      }
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    } finally {
      setLoadingEventParticipantReport(false);
    }
  };

  // ===============================
  // LOAD REPORT DATA
  // ===============================

  useEffect(() => {
    fetchReports(false);
    fetchEventParticipantReport(false);
  }, []);

  // ===============================
  // FILTER EVENTS
  // ===============================

  const filteredEvents = events.filter((event) => {
    const search = eventSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return true;
    }

    return (
      event.title?.toLowerCase().includes(search) ||
      event.description
        ?.toLowerCase()
        .includes(search) ||
      event.venue
        ?.toLowerCase()
        .includes(search)
    );
  });

  // ===============================
  // FILTER USERS
  // ===============================

  const filteredUsers = users.filter((user) => {
    const search = userSearch
      .trim()
      .toLowerCase();

    const matchesSearch =
      !search ||
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search);

    const matchesRole =
      userRoleFilter === "All" ||
      user.role?.toLowerCase() ===
        userRoleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div>

      {/* =========================
          NAVBAR
      ========================= */}

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

      {/* =========================
          DASHBOARD
      ========================= */}

      <div className="dashboard-container">

        <h1>
          Admin Dashboard
        </h1>

        <p>
          Monitor and manage the complete campus event system.
        </p>

        {/* =========================
            SUMMARY STATS
        ========================= */}

        {loadingReports && !reports ? (

          <p
            style={{
              textAlign: "center",
              padding: "20px",
            }}
          >
            ⏳ Loading dashboard statistics...
          </p>

        ) : reports ? (

          <div
            className="dashboard-grid"
            style={{
              marginBottom: "35px",
            }}
          >

            {/* TOTAL USERS */}

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
                {reports.totalEvents}
              </h1>

              <p>
                Events created
              </p>

            </div>

            {/* APPROVED EVENTS */}

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
                {reports.approvedEvents}
              </h1>

              <p>
                Events approved by admin
              </p>

            </div>

            {/* PENDING EVENTS */}

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
                {reports.pendingEvents}
              </h1>

              <p>
                Events waiting for approval
              </p>

            </div>

          </div>

        ) : null}

        {/* =========================
            ACTION CARDS
        ========================= */}

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
              onClick={() => {
                setEventSearch("");
                fetchEvents();
              }}
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
              onClick={() => {
                setUserSearch("");
                setUserRoleFilter("All");
                fetchUsers();
              }}
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
              onClick={() => fetchReports(true)}
            >
              View Reports
            </button>

          </div>

          {/* EVENT PARTICIPANT REPORT */}

          <div className="dashboard-card">

            <h2>
              Event Participant Report
            </h2>

            <p>
              View participant count for every campus event.
            </p>

            <button
              className="dashboard-btn"
              onClick={() =>
                fetchEventParticipantReport(true)
              }
            >
              View Event Report
            </button>

          </div>

        </div>

        {/* =========================
            PENDING EVENTS
        ========================= */}

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

            {/* EVENT SEARCH */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >

              <input
                type="text"
                placeholder="Search by title, description or venue"
                value={eventSearch}
                onChange={(e) =>
                  setEventSearch(e.target.value)
                }
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />

              <button
                className="dashboard-btn"
                onClick={() =>
                  setEventSearch("")
                }
              >
                Clear
              </button>

            </div>

            {loadingEvents ? (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                ⏳ Loading events...
              </p>

            ) : filteredEvents.length > 0 ? (

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

                    {filteredEvents.map(
                      (event) => (

                        <tr
                          key={event.event_id}
                        >

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
                  {events.length > 0
                    ? "No Events Match Your Search"
                    : "No Pending Events Found"}
                </h3>

                <p>
                  {events.length > 0
                    ? "Try a different title, description or venue."
                    : "There are currently no events waiting for admin approval."}
                </p>

              </div>

            )}

          </div>

        )}

        {/* =========================
            MANAGE USERS
        ========================= */}

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

            {/* USER SEARCH AND ROLE FILTER */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >

              <input
                type="text"
                placeholder="Search by name or email"
                value={userSearch}
                onChange={(e) =>
                  setUserSearch(e.target.value)
                }
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />

              <select
                value={userRoleFilter}
                onChange={(e) =>
                  setUserRoleFilter(e.target.value)
                }
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              >

                <option value="All">
                  All Roles
                </option>

                <option value="Student">
                  Student
                </option>

                <option value="Coordinator">
                  Coordinator
                </option>

                <option value="Admin">
                  Admin
                </option>

              </select>

              <button
                className="dashboard-btn"
                onClick={() => {
                  setUserSearch("");
                  setUserRoleFilter("All");
                }}
              >
                Clear
              </button>

            </div>

            {loadingUsers ? (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                ⏳ Loading users...
              </p>

            ) : filteredUsers.length > 0 ? (

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

                    {filteredUsers.map(
                      (user) => (

                        <tr
                          key={user.user_id}
                        >

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
                  {users.length > 0
                    ? "No Users Match Your Search or Filter"
                    : "No Users Found"}
                </h3>

                <p>
                  {users.length > 0
                    ? "Try another name, email or role."
                    : "No users are available in the system."}
                </p>

              </div>

            )}

          </div>

        )}

        {/* =========================
            REPORTS
        ========================= */}

        {showReports && (

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

            {loadingReports ? (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                ⏳ Loading reports...
              </p>

            ) : reports ? (

              <div className="dashboard-grid">

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

            ) : (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No report data available.
              </p>

            )}

          </div>

        )}

        {/* =========================
            EVENT-WISE PARTICIPANT REPORT
        ========================= */}

        {showEventParticipantReport && (

          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "1100px",
              maxWidth: "95%",
            }}
          >

            <h2>
              Event-wise Participant Report
            </h2>

            {loadingEventParticipantReport ? (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                ⏳ Loading event participant report...
              </p>

            ) : eventParticipantReport.length > 0 ? (

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
                        Event
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
                        Coordinator ID
                      </th>

                      <th>
                        Participants
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {eventParticipantReport.map(
                      (event) => (

                        <tr
                          key={event.event_id}
                        >

                          <td>
                            {event.event_name}
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
                            {event.coordinator_id}
                          </td>

                          <td>

                            <strong>
                              {event.participant_count}
                            </strong>

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
                  No Event Report Data Found
                </h3>

                <p>
                  No events are currently available for the participant report.
                </p>

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;