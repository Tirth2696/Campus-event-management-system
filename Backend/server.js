const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// WEEK 8 - VALIDATION HELPERS
// ===============================
function isValidEmail(email) {
  return (
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

function isValidId(id) {
  return /^\d+$/.test(String(id));
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

// ===============================
// DATABASE CONNECTION
// ===============================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "campus_event_management",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Database Connected Successfully!");
  }
});

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("Campus Event Management Backend is Running");
});

// ===============================
// REGISTER API
// ===============================
app.post("/register", (req, res) => {
  const name = cleanText(req.body.name);
  const email = cleanText(req.body.email).toLowerCase();
  const password = cleanText(req.body.password);
  const role = cleanText(req.body.role);

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  if (name.length < 2) {
    return res.status(400).json({
      message: "Name must contain at least 2 characters",
    });
  }

  if (password.length < 4) {
    return res.status(400).json({
      message: "Password must contain at least 4 characters",
    });
  }

  if (!["student", "coordinator", "admin"].includes(role.toLowerCase())) {
    return res.status(400).json({
      message: "Invalid user role",
    });
  }

  const sql =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, password, role], (err) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Registration failed. Email may already exist.",
      });
    }

    res.json({
      message: "Registration successful",
    });
  });
});

// ===============================
// LOGIN API
// ===============================
app.post("/login", (req, res) => {
  const email = cleanText(req.body.email).toLowerCase();
  const password = cleanText(req.body.password);
  const role = cleanText(req.body.role);

  if (!email || !password || !role) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  const sql =
    "SELECT * FROM users WHERE email=? AND password=? AND role=?";

  db.query(sql, [email, password, role], (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Login failed",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email, password, or role",
      });
    }

    res.json({
      message: "Login successful",
      user: results[0],
    });
  });
});

// ===============================
// EVENT REGISTRATION API
// ===============================
app.post("/event-register", (req, res) => {
  const student_email = cleanText(req.body.student_email).toLowerCase();
  const event_name = cleanText(req.body.event_name);
  const event_date = cleanText(req.body.event_date);
  const event_location = cleanText(req.body.event_location);

  if (
    !student_email ||
    !event_name ||
    !event_date ||
    !event_location
  ) {
    return res.status(400).json({
      message: "All event registration fields are required",
    });
  }

  if (!isValidEmail(student_email)) {
    return res.status(400).json({
      message: "Please enter a valid student email",
    });
  }

  if (isNaN(Date.parse(event_date))) {
    return res.status(400).json({
      message: "Please provide a valid event date",
    });
  }

  const checkSql = `
    SELECT *
    FROM event_registrations
    WHERE student_email = ?
    AND event_name = ?
  `;

  db.query(
    checkSql,
    [student_email, event_name],
    (err, results) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Failed to check registration",
        });
      }

      if (results.length > 0) {
        return res.status(400).json({
          message: "You are already registered for this event!",
        });
      }

      const insertSql = `
        INSERT INTO event_registrations
        (student_email, event_name, event_date, event_location)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          student_email,
          event_name,
          event_date,
          event_location,
        ],
        (err) => {
          if (err) {
            console.log(err);

            return res.status(500).json({
              message: "Event registration failed",
            });
          }

          res.json({
            message: "Successfully registered for the event!",
          });
        }
      );
    }
  );
});

// ===============================
// CREATE EVENT API
// ===============================
app.post("/create-event", (req, res) => {
  const coordinator_id = req.body.coordinator_id;
  const title = cleanText(req.body.title);
  const description = cleanText(req.body.description);
  const event_date = cleanText(req.body.event_date);
  const venue = cleanText(req.body.venue);

  if (
    !coordinator_id ||
    !title ||
    !description ||
    !event_date ||
    !venue
  ) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  if (!isValidId(coordinator_id)) {
    return res.status(400).json({
      message: "Invalid coordinator ID",
    });
  }

  if (title.length < 3) {
    return res.status(400).json({
      message: "Event title must contain at least 3 characters",
    });
  }

  if (description.length < 5) {
    return res.status(400).json({
      message: "Event description must contain at least 5 characters",
    });
  }

  if (venue.length < 2) {
    return res.status(400).json({
      message: "Please enter a valid venue",
    });
  }

  if (isNaN(Date.parse(event_date))) {
    return res.status(400).json({
      message: "Please provide a valid event date",
    });
  }

  const sql = `
    INSERT INTO events
    (coordinator_id, title, description, event_date, venue, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      coordinator_id,
      title,
      description,
      event_date,
      venue,
      "Pending",
    ],
    (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Event creation failed",
        });
      }

      res.json({
        message: "Event created successfully",
      });
    }
  );
});

// ===============================
// GET ALL EVENTS API
// ===============================
app.get("/events", (req, res) => {
  const sql = `
    SELECT *
    FROM events
    ORDER BY event_date ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch events",
      });
    }

    res.json(results);
  });
});

// ==================================================
// ADMIN: GET PENDING EVENTS
// ==================================================
app.get("/admin/events", (req, res) => {
  const sql = `
    SELECT *
    FROM events
    WHERE LOWER(status) = 'pending'
    ORDER BY event_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch pending events",
      });
    }

    res.json(results);
  });
});

// ==================================================
// ADMIN: APPROVE / REJECT EVENT
// ==================================================
app.put("/admin/events/:id/status", (req, res) => {
  const eventId = req.params.id;
  const { status } = req.body;

  if (!isValidId(eventId)) {
    return res.status(400).json({
      message: "Invalid event ID",
    });
  }

  console.log("Updating Event ID:", eventId);
  console.log("New Status:", status);

  if (!status) {
    return res.status(400).json({
      message: "Status is required",
    });
  }

  if (status !== "Approved" && status !== "Rejected") {
    return res.status(400).json({
      message: "Invalid status",
    });
  }

  const sql = `
    UPDATE events
    SET status = ?
    WHERE event_id = ?
  `;

  db.query(sql, [status, eventId], (err, result) => {
    if (err) {
      console.log("UPDATE ERROR:", err);

      return res.status(500).json({
        message: "Failed to update event status",
      });
    }

    console.log("Update Result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: `Event ${status.toLowerCase()} successfully`,
    });
  });
});

// ===============================
// MANAGE EVENTS
// ===============================
app.get("/manage-events", (req, res) => {
  const sql = `
    SELECT *
    FROM events
    ORDER BY event_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch events",
      });
    }

    res.json(results);
  });
});

// ===============================
// DELETE EVENT API
// ===============================
app.delete("/delete-event/:id", (req, res) => {
  const id = req.params.id;

  if (!isValidId(id)) {
    return res.status(400).json({
      message: "Invalid event ID",
    });
  }

  const sql = "DELETE FROM events WHERE event_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to delete event",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: "Event deleted successfully",
    });
  });
});

// ===============================
// WEEK 7 - UPDATE EVENT API
// ===============================
app.put("/update-event/:id", (req, res) => {
  const eventId = req.params.id;

  if (!isValidId(eventId)) {
    return res.status(400).json({
      message: "Invalid event ID",
    });
  }

  const title = cleanText(req.body.title);
  const description = cleanText(req.body.description);
  const event_date = cleanText(req.body.event_date);
  const venue = cleanText(req.body.venue);

  if (!title || !description || !event_date || !venue) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  if (title.length < 3) {
    return res.status(400).json({
      message: "Event title must contain at least 3 characters",
    });
  }

  if (description.length < 5) {
    return res.status(400).json({
      message: "Event description must contain at least 5 characters",
    });
  }

  if (venue.length < 2) {
    return res.status(400).json({
      message: "Please enter a valid venue",
    });
  }

  if (isNaN(Date.parse(event_date))) {
    return res.status(400).json({
      message: "Please provide a valid event date",
    });
  }

  const sql = `
    UPDATE events
    SET title = ?, description = ?, event_date = ?, venue = ?
    WHERE event_id = ?
  `;

  db.query(
    sql,
    [
      title,
      description,
      event_date,
      venue,
      eventId,
    ],
    (err, result) => {
      if (err) {
        console.log("UPDATE EVENT ERROR:", err);

        return res.status(500).json({
          message: "Event update failed",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      res.json({
        message: "Event updated successfully",
      });
    }
  );
});

// ===============================
// GET ALL PARTICIPANTS
// ===============================
app.get("/participants", (req, res) => {
  const sql = `
    SELECT
      student_email,
      event_name,
      event_date,
      event_location
    FROM event_registrations
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch participants",
      });
    }

    res.json(results);
  });
});

// ===============================
// GET ALL USERS
// ===============================
app.get("/admin/users", (req, res) => {
  const sql = `
    SELECT
      user_id,
      name,
      email,
      role
    FROM users
    ORDER BY user_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch users",
      });
    }

    res.json(results);
  });
});

// ===============================
// TEST HELLO
// ===============================
app.get("/hello", (req, res) => {
  res.send("Hello Tirth");
});

// ===============================
// GET MY REGISTRATIONS
// ===============================
app.get("/my-registrations/:email", (req, res) => {
  const email = cleanText(req.params.email).toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Invalid email address",
    });
  }

  const sql = `
    SELECT
      event_name,
      event_date,
      event_location
    FROM event_registrations
    WHERE student_email = ?
    ORDER BY event_date ASC
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch registrations",
      });
    }

    res.json(results);
  });
});

// ===============================
// GET MY CERTIFICATES
// ===============================
app.get("/my-certificates/:email", (req, res) => {
  const email = cleanText(req.params.email).toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Invalid email address",
    });
  }

  const sql = `
    SELECT
      c.certificate_id,
      e.title AS event_name,
      c.certificate_url
    FROM certificates c
    JOIN users u ON c.student_id = u.user_id
    JOIN events e ON c.event_id = e.event_id
    WHERE u.email = ?
    ORDER BY c.certificate_id DESC
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to fetch certificates",
      });
    }

    res.json(results);
  });
});

// ==================================================
// WEEK 5 - ADMIN REPORTS
// ==================================================
app.get("/admin/reports", (req, res) => {
  const queries = {
    totalUsers: `
      SELECT COUNT(*) AS total
      FROM users
    `,

    totalEvents: `
      SELECT COUNT(*) AS total
      FROM events
    `,

    approvedEvents: `
      SELECT COUNT(*) AS total
      FROM events
      WHERE LOWER(status) = 'approved'
    `,

    rejectedEvents: `
      SELECT COUNT(*) AS total
      FROM events
      WHERE LOWER(status) = 'rejected'
    `,

    pendingEvents: `
      SELECT COUNT(*) AS total
      FROM events
      WHERE LOWER(status) = 'pending'
    `,

    totalParticipants: `
      SELECT COUNT(*) AS total
      FROM event_registrations
    `,
  };

  const report = {};

  db.query(queries.totalUsers, (err, result) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: "Failed to generate reports",
      });
    }

    report.totalUsers = result[0].total;

    db.query(queries.totalEvents, (err, result) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Failed to generate reports",
        });
      }

      report.totalEvents = result[0].total;

      db.query(queries.approvedEvents, (err, result) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message: "Failed to generate reports",
          });
        }

        report.approvedEvents = result[0].total;

        db.query(queries.rejectedEvents, (err, result) => {
          if (err) {
            console.log(err);

            return res.status(500).json({
              message: "Failed to generate reports",
            });
          }

          report.rejectedEvents = result[0].total;

          db.query(queries.pendingEvents, (err, result) => {
            if (err) {
              console.log(err);

              return res.status(500).json({
                message: "Failed to generate reports",
              });
            }

            report.pendingEvents = result[0].total;

            db.query(
              queries.totalParticipants,
              (err, result) => {
                if (err) {
                  console.log(err);

                  return res.status(500).json({
                    message: "Failed to generate reports",
                  });
                }

                report.totalParticipants = result[0].total;

                res.json(report);
              }
            );
          });
        });
      });
    });
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});