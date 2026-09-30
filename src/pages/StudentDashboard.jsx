import { Link } from "react-router-dom";
import { useState } from "react";
import "../App.css";

function StudentDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrations, setShowRegistrations] = useState(false);

  const [certificates, setCertificates] = useState([]);
  const [showCertificates, setShowCertificates] = useState(false);

  // GET LOGGED-IN STUDENT EMAIL
  const getStudentEmail = () => {
    return (
      localStorage.getItem("student_email") ||
      localStorage.getItem("email")
    );
  };

  // FETCH MY REGISTRATIONS
  const fetchRegistrations = async () => {
    const email = getStudentEmail();

    if (!email) {
      alert(
        "Student login information not found. Please login again."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/my-registrations/${encodeURIComponent(
          email
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch registrations");
        return;
      }

      setRegistrations(data);
      setShowRegistrations(true);
      setShowCertificates(false);
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // FETCH MY CERTIFICATES
  const fetchCertificates = async () => {
    const email = getStudentEmail();

    if (!email) {
      alert(
        "Student login information not found. Please login again."
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/my-certificates/${encodeURIComponent(
          email
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch certificates");
        return;
      }

      setCertificates(data);
      setShowCertificates(true);
      setShowRegistrations(false);
    } catch (error) {
      console.log(error);

      alert(
        "Cannot connect to server. Make sure backend is running."
      );
    }
  };

  // OPEN CERTIFICATE
  const openCertificate = (fileName) => {
    if (!fileName) {
      alert("Certificate file not found.");
      return;
    }

    window.open(
      "/certificates/" + fileName,
      "_blank"
    );
  };

  return (
    <div>
      {/* ================= NAVBAR ================= */}

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

      {/* ================= DASHBOARD ================= */}

      <div className="dashboard-container">

        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >

          <h1
            style={{
              marginBottom: "10px",
            }}
          >
            Student Dashboard
          </h1>

          <p
            style={{
              fontSize: "16px",
              opacity: "0.8",
            }}
          >
            Manage your events, registrations and certificates.
          </p>

        </div>

        {/* ================= DASHBOARD CARDS ================= */}

        <div className="dashboard-grid">

          {/* UPCOMING EVENTS */}

          <div className="dashboard-card">

            <div
              style={{
                fontSize: "38px",
                marginBottom: "10px",
              }}
            >
              📅
            </div>

            <h2>
              Upcoming Events
            </h2>

            <p>
              Explore upcoming college events and register
              for approved events.
            </p>

            <Link to="/events">
              <button className="dashboard-btn">
                View Events
              </button>
            </Link>

          </div>

          {/* MY REGISTRATIONS */}

          <div className="dashboard-card">

            <div
              style={{
                fontSize: "38px",
                marginBottom: "10px",
              }}
            >
              📝
            </div>

            <h2>
              My Registrations
            </h2>

            <p>
              View all events you have successfully
              registered for.
            </p>

            <button
              className="dashboard-btn"
              onClick={fetchRegistrations}
            >
              View Registrations
            </button>

          </div>

          {/* MY CERTIFICATES */}

          <div className="dashboard-card">

            <div
              style={{
                fontSize: "38px",
                marginBottom: "10px",
              }}
            >
              🏆
            </div>

            <h2>
              My Certificates
            </h2>

            <p>
              View and access your event participation
              certificates.
            </p>

            <button
              className="dashboard-btn"
              onClick={fetchCertificates}
            >
              View Certificates
            </button>

          </div>

        </div>

        {/* ================= MY REGISTRATIONS ================= */}

        {showRegistrations && (
          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "900px",
              maxWidth: "90%",
              marginLeft: "auto",
              marginRight: "auto",
              padding: "25px",
            }}
          >

            <h2
              style={{
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              My Registrations
            </h2>

            {registrations.length > 0 ? (

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

                      <th
                        style={{
                          padding: "12px",
                        }}
                      >
                        Event
                      </th>

                      <th
                        style={{
                          padding: "12px",
                        }}
                      >
                        Date
                      </th>

                      <th
                        style={{
                          padding: "12px",
                        }}
                      >
                        Location
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {registrations.map(
                      (registration, index) => (

                        <tr key={index}>

                          <td
                            style={{
                              padding: "12px",
                            }}
                          >
                            {registration.event_name}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                            }}
                          >
                            {new Date(
                              registration.event_date
                            ).toLocaleDateString()}
                          </td>

                          <td
                            style={{
                              padding: "12px",
                            }}
                          >
                            {registration.event_location}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                You have not registered for any events yet.
              </p>

            )}

          </div>
        )}

        {/* ================= MY CERTIFICATES ================= */}

        {showCertificates && (
          <div
            className="auth-card"
            style={{
              marginTop: "40px",
              width: "900px",
              maxWidth: "90%",
              marginLeft: "auto",
              marginRight: "auto",
              padding: "25px",
            }}
          >

            <h2
              style={{
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              My Certificates
            </h2>

            {certificates.length > 0 ? (

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

                      <th
                        style={{
                          padding: "12px",
                        }}
                      >
                        Event
                      </th>

                      <th
                        style={{
                          padding: "12px",
                        }}
                      >
                        Certificate
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {certificates.map((certificate) => (

                      <tr
                        key={certificate.certificate_id}
                      >

                        <td
                          style={{
                            padding: "12px",
                          }}
                        >
                          {certificate.event_name}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                          }}
                        >

                          <button
                            className="dashboard-btn"
                            onClick={() =>
                              openCertificate(
                                certificate.certificate_url
                              )
                            }
                          >
                            View Certificate
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            ) : (

              <p
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No Certificates Found
              </p>

            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default StudentDashboard;