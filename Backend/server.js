const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// VALIDATION HELPERS
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
// GET TODAY'S DATE
// YYYY-MM-DD
// ===============================

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ===============================
// DATABASE CONNECTION
// ===============================

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "campus_event_management",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.log(
      "Database connection failed:",
      err
    );
  } else {
    console.log(
      "MySQL Database Connected Successfully!"
    );
  }
});

// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
  res.send(
    "Campus Event Management Backend is Running"
  );
});

// ===============================
// REGISTER API
// ===============================

app.post("/register", (req, res) => {
  const name = cleanText(req.body.name);

  const email = cleanText(
    req.body.email
  ).toLowerCase();

  const password = cleanText(
    req.body.password
  );

  const role = cleanText(
    req.body.role
  );

  if (
    !name ||
    !email ||
    !password ||
    !role
  ) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message:
        "Please enter a valid email address",
    });
  }

  if (name.length < 2) {
    return res.status(400).json({
      message:
        "Name must contain at least 2 characters",
    });
  }

  if (password.length < 4) {
    return res.status(400).json({
      message:
        "Password must contain at least 4 characters",
    });
  }

  if (
    ![
      "student",
      "coordinator",
      "admin",
    ].includes(role.toLowerCase())
  ) {
    return res.status(400).json({
      message: "Invalid user role",
    });
  }

  const sql =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [
      name,
      email,
      password,
      role,
    ],
    (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message:
            "Registration failed. Email may already exist.",
        });
      }

      res.json({
        message:
          "Registration successful",
      });
    }
  );
});

// ===============================
// LOGIN API
// ===============================

app.post("/login", (req, res) => {
  const email = cleanText(
    req.body.email
  ).toLowerCase();

  const password = cleanText(
    req.body.password
  );

  const role = cleanText(
    req.body.role
  );

  if (
    !email ||
    !password ||
    !role
  ) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message:
        "Please enter a valid email address",
    });
  }

  const sql =
    "SELECT * FROM users WHERE email=? AND password=? AND role=?";

  db.query(
    sql,
    [
      email,
      password,
      role,
    ],
    (err, results) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Login failed",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message:
            "Invalid email, password, or role",
        });
      }

      res.json({
        message:
          "Login successful",
        user: results[0],
      });
    }
  );
});

// ===============================
// EVENT REGISTRATION API
// ===============================

app.post(
  "/event-register",
  (req, res) => {
    const student_email =
      cleanText(
        req.body.student_email
      ).toLowerCase();

    const event_name =
      cleanText(
        req.body.event_name
      );

    const event_date =
      cleanText(
        req.body.event_date
      );

    const event_location =
      cleanText(
        req.body.event_location
      );

    if (
      !student_email ||
      !event_name ||
      !event_date ||
      !event_location
    ) {
      return res.status(400).json({
        message:
          "All event registration fields are required",
      });
    }

    if (
      !isValidEmail(
        student_email
      )
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid student email",
      });
    }

    if (
      isNaN(
        Date.parse(event_date)
      )
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid event date",
      });
    }

    // =========================================
    // FIND EVENT + CAPACITY + DEADLINE
    // =========================================

    const eventSql = `
      SELECT
        event_id,
        title,
        status,
        max_participants,
        registration_deadline
      FROM events
      WHERE LOWER(TRIM(title)) =
            LOWER(TRIM(?))
      LIMIT 1
    `;

    db.query(
      eventSql,
      [event_name],
      (err, eventResults) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to check event details",
          });
        }

        if (
          eventResults.length === 0
        ) {
          return res.status(404).json({
            message:
              "Event not found",
          });
        }

        const event =
          eventResults[0];

        // =========================================
        // APPROVED EVENT CHECK
        // =========================================

        if (
          String(
            event.status
          ).toLowerCase() !==
          "approved"
        ) {
          return res.status(400).json({
            message:
              "Registration is available only for approved events",
          });
        }

        // =========================================
        // REGISTRATION DEADLINE CHECK
        // =========================================

        if (
          event.registration_deadline
        ) {
          const today =
            getTodayDate();

          const deadline =
            String(
              event.registration_deadline
            ).slice(0, 10);

          if (
            today > deadline
          ) {
            return res.status(400).json({
              message:
                "Registration deadline has passed.",
            });
          }
        }

        // =========================================
        // DUPLICATE REGISTRATION CHECK
        // =========================================

        const checkSql = `
          SELECT *
          FROM event_registrations
          WHERE LOWER(TRIM(student_email)) =
                LOWER(TRIM(?))
          AND LOWER(TRIM(event_name)) =
                LOWER(TRIM(?))
        `;

        db.query(
          checkSql,
          [
            student_email,
            event.title,
          ],
          (err, results) => {
            if (err) {
              console.log(err);

              return res.status(500).json({
                message:
                  "Failed to check registration",
              });
            }

            if (
              results.length > 0
            ) {
              return res.status(400).json({
                message:
                  "You are already registered for this event!",
              });
            }

            // =========================================
            // CURRENT PARTICIPANT COUNT
            // =========================================

            const countSql = `
              SELECT COUNT(*) AS participant_count
              FROM event_registrations
              WHERE LOWER(TRIM(event_name)) =
                    LOWER(TRIM(?))
            `;

            db.query(
              countSql,
              [event.title],
              (
                err,
                countResults
              ) => {
                if (err) {
                  console.log(err);

                  return res.status(500).json({
                    message:
                      "Failed to check event capacity",
                  });
                }

                const currentParticipants =
                  Number(
                    countResults[0]
                      .participant_count
                  ) || 0;

                const maxParticipants =
                  Number(
                    event.max_participants
                  ) || 50;

                // =========================================
                // CAPACITY CHECK
                // =========================================

                if (
                  currentParticipants >=
                  maxParticipants
                ) {
                  return res.status(400).json({
                    message:
                      `Registration closed. Maximum capacity of ${maxParticipants} participants has been reached.`,
                  });
                }

                // =========================================
                // INSERT REGISTRATION
                // =========================================

                const insertSql = `
                  INSERT INTO event_registrations
                  (
                    student_email,
                    event_name,
                    event_date,
                    event_location
                  )
                  VALUES (?, ?, ?, ?)
                `;

                db.query(
                  insertSql,
                  [
                    student_email,
                    event.title,
                    event_date,
                    event_location,
                  ],
                  (err) => {
                    if (err) {
                      console.log(err);

                      return res.status(500).json({
                        message:
                          "Event registration failed",
                      });
                    }

                    res.json({
                      message:
                        "Successfully registered for the event!",
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// ===============================
// CREATE EVENT API
// ===============================

app.post(
  "/create-event",
  (req, res) => {
    const coordinator_id =
      req.body.coordinator_id;

    const title =
      cleanText(
        req.body.title
      );

    const description =
      cleanText(
        req.body.description
      );

    const event_date =
      cleanText(
        req.body.event_date
      );

    const venue =
      cleanText(
        req.body.venue
      );

    const category =
      cleanText(
        req.body.category
      ) || "Other";

    const max_participants =
      req.body.max_participants ===
        undefined ||
      req.body.max_participants ===
        ""
        ? 50
        : Number(
            req.body.max_participants
          );

    const registration_deadline =
      cleanText(
        req.body.registration_deadline
      ) || null;

    const allowedCategories = [
      "Technical",
      "Cultural",
      "Sports",
      "Workshop",
      "Seminar",
      "Other",
    ];

    if (
      !coordinator_id ||
      !title ||
      !description ||
      !event_date ||
      !venue
    ) {
      return res.status(400).json({
        message:
          "Please fill all fields",
      });
    }

    if (
      !isValidId(
        coordinator_id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid coordinator ID",
      });
    }

    if (title.length < 3) {
      return res.status(400).json({
        message:
          "Event title must contain at least 3 characters",
      });
    }

    if (
      description.length < 5
    ) {
      return res.status(400).json({
        message:
          "Event description must contain at least 5 characters",
      });
    }

    if (venue.length < 2) {
      return res.status(400).json({
        message:
          "Please enter a valid venue",
      });
    }

    if (
      isNaN(
        Date.parse(event_date)
      )
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid event date",
      });
    }

    if (
      !allowedCategories.includes(
        category
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid event category",
      });
    }

    if (
      !Number.isInteger(
        max_participants
      ) ||
      max_participants < 1
    ) {
      return res.status(400).json({
        message:
          "Maximum participants must be a positive whole number",
      });
    }

    // =========================================
    // REGISTRATION DEADLINE VALIDATION
    // =========================================

    if (
      registration_deadline
    ) {
      const deadlineDate =
        new Date(
          registration_deadline
        );

      if (
        isNaN(
          deadlineDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid registration deadline",
        });
      }

      if (
        new Date(
          registration_deadline
        ) >
        new Date(event_date)
      ) {
        return res.status(400).json({
          message:
            "Registration deadline cannot be after the event date",
        });
      }
    }

    const sql = `
      INSERT INTO events
      (
        coordinator_id,
        title,
        description,
        event_date,
        venue,
        status,
        max_participants,
        category,
        registration_deadline
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        max_participants,
        category,
        registration_deadline,
      ],
      (err) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Event creation failed",
          });
        }

        res.json({
          message:
            "Event created successfully",
        });
      }
    );
  }
);

// ===============================================
// EVENT CAPACITY / SEAT AVAILABILITY
// ===============================================

app.get(
  "/event-capacity",
  (req, res) => {
    const sql = `
      SELECT
        e.event_id,
        e.title AS event_name,
        e.max_participants,
        COUNT(er.student_email) AS participant_count
      FROM events e
      LEFT JOIN event_registrations er
        ON LOWER(TRIM(er.event_name)) =
           LOWER(TRIM(e.title))
      GROUP BY
        e.event_id,
        e.title,
        e.max_participants
      ORDER BY e.event_id ASC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch event capacity data",
          });
        }

        const updatedResults =
          results.map(
            (event) => {
              const maxParticipants =
                Number(
                  event.max_participants
                ) || 50;

              const participantCount =
                Number(
                  event.participant_count
                ) || 0;

              const remainingSeats =
                Math.max(
                  maxParticipants -
                    participantCount,
                  0
                );

              const progressPercentage =
                Math.min(
                  Math.round(
                    (
                      participantCount /
                      maxParticipants
                    ) * 100
                  ),
                  100
                );

              return {
                event_id:
                  event.event_id,

                event_name:
                  event.event_name,

                max_participants:
                  maxParticipants,

                participant_count:
                  participantCount,

                remaining_seats:
                  remainingSeats,

                progress_percentage:
                  progressPercentage,
              };
            }
          );

        res.json(
          updatedResults
        );
      }
    );
  }
);

// ===============================
// GET ALL EVENTS API
// ===============================

app.get(
  "/events",
  (req, res) => {
    const sql = `
      SELECT *
      FROM events
      ORDER BY event_date ASC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch events",
          });
        }

        res.json(results);
      }
    );
  }
);

// ==================================================
// ADMIN: GET PENDING EVENTS
// ==================================================

app.get(
  "/admin/events",
  (req, res) => {
    const sql = `
      SELECT *
      FROM events
      WHERE LOWER(status) = 'pending'
      ORDER BY event_id DESC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch pending events",
          });
        }

        res.json(results);
      }
    );
  }
);

// ==================================================
// ADMIN: APPROVE / REJECT EVENT
// ==================================================

app.put(
  "/admin/events/:id/status",
  (req, res) => {
    const eventId =
      req.params.id;

    const { status } =
      req.body;

    if (
      !isValidId(eventId)
    ) {
      return res.status(400).json({
        message:
          "Invalid event ID",
      });
    }

    console.log(
      "Updating Event ID:",
      eventId
    );

    console.log(
      "New Status:",
      status
    );

    if (!status) {
      return res.status(400).json({
        message:
          "Status is required",
      });
    }

    if (
      status !== "Approved" &&
      status !== "Rejected"
    ) {
      return res.status(400).json({
        message:
          "Invalid status",
      });
    }

    const sql = `
      UPDATE events
      SET status = ?
      WHERE event_id = ?
    `;

    db.query(
      sql,
      [
        status,
        eventId,
      ],
      (err, result) => {
        if (err) {
          console.log(
            "UPDATE ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Failed to update event status",
          });
        }

        console.log(
          "Update Result:",
          result
        );

        if (
          result.affectedRows ===
          0
        ) {
          return res.status(404).json({
            message:
              "Event not found",
          });
        }

        res.json({
          message:
            `Event ${status.toLowerCase()} successfully`,
        });
      }
    );
  }
);

// ===============================
// MANAGE EVENTS - ALL EVENTS
// ===============================

app.get(
  "/manage-events",
  (req, res) => {
    const sql = `
      SELECT *
      FROM events
      ORDER BY event_id DESC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch events",
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================================
// COORDINATOR: GET OWN EVENTS
// ===============================================

app.get(
  "/manage-events/coordinator/:id",
  (req, res) => {
    const coordinatorId =
      req.params.id;

    if (
      !isValidId(
        coordinatorId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid coordinator ID",
      });
    }

    const sql = `
      SELECT *
      FROM events
      WHERE coordinator_id = ?
      ORDER BY event_id DESC
    `;

    db.query(
      sql,
      [coordinatorId],
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch coordinator events",
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================
// DELETE EVENT API
// ===============================

app.delete(
  "/delete-event/:id",
  (req, res) => {
    const id =
      req.params.id;

    const coordinatorId =
      req.body.coordinator_id;

    if (!isValidId(id)) {
      return res.status(400).json({
        message:
          "Invalid event ID",
      });
    }

    if (
      !isValidId(
        coordinatorId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid coordinator ID",
      });
    }

    const sql = `
      DELETE FROM events
      WHERE event_id = ?
      AND coordinator_id = ?
    `;

    db.query(
      sql,
      [
        id,
        coordinatorId,
      ],
      (err, result) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to delete event",
          });
        }

        if (
          result.affectedRows ===
          0
        ) {
          return res.status(404).json({
            message:
              "Event not found or you are not authorized to delete it",
          });
        }

        res.json({
          message:
            "Event deleted successfully",
        });
      }
    );
  }
);

// ===============================
// UPDATE EVENT API
// ===============================

app.put(
  "/update-event/:id",
  (req, res) => {
    const eventId =
      req.params.id;

    const coordinatorId =
      req.body.coordinator_id;

    if (
      !isValidId(eventId)
    ) {
      return res.status(400).json({
        message:
          "Invalid event ID",
      });
    }

    if (
      !isValidId(
        coordinatorId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid coordinator ID",
      });
    }

    const title =
      cleanText(
        req.body.title
      );

    const description =
      cleanText(
        req.body.description
      );

    const event_date =
      cleanText(
        req.body.event_date
      );

    const venue =
      cleanText(
        req.body.venue
      );

    const category =
      cleanText(
        req.body.category
      ) || "Other";

    const max_participants =
      req.body.max_participants ===
        undefined ||
      req.body.max_participants ===
        ""
        ? 50
        : Number(
            req.body.max_participants
          );

    const registration_deadline =
      cleanText(
        req.body.registration_deadline
      ) || null;

    const allowedCategories = [
      "Technical",
      "Cultural",
      "Sports",
      "Workshop",
      "Seminar",
      "Other",
    ];

    if (
      !title ||
      !description ||
      !event_date ||
      !venue
    ) {
      return res.status(400).json({
        message:
          "Please fill all fields",
      });
    }

    if (title.length < 3) {
      return res.status(400).json({
        message:
          "Event title must contain at least 3 characters",
      });
    }

    if (
      description.length < 5
    ) {
      return res.status(400).json({
        message:
          "Event description must contain at least 5 characters",
      });
    }

    if (venue.length < 2) {
      return res.status(400).json({
        message:
          "Please enter a valid venue",
      });
    }

    if (
      isNaN(
        Date.parse(event_date)
      )
    ) {
      return res.status(400).json({
        message:
          "Please provide a valid event date",
      });
    }

    if (
      !allowedCategories.includes(
        category
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid event category",
      });
    }

    if (
      !Number.isInteger(
        max_participants
      ) ||
      max_participants < 1
    ) {
      return res.status(400).json({
        message:
          "Maximum participants must be a positive whole number",
      });
    }

    // =========================================
    // DEADLINE VALIDATION
    // =========================================

    if (
      registration_deadline
    ) {
      const deadlineDate =
        new Date(
          registration_deadline
        );

      if (
        isNaN(
          deadlineDate.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid registration deadline",
        });
      }

      if (
        new Date(
          registration_deadline
        ) >
        new Date(event_date)
      ) {
        return res.status(400).json({
          message:
            "Registration deadline cannot be after the event date",
        });
      }
    }

    // =========================================
    // GET CURRENT EVENT
    // =========================================

    const currentEventSql = `
      SELECT title
      FROM events
      WHERE event_id = ?
      AND coordinator_id = ?
      LIMIT 1
    `;

    db.query(
      currentEventSql,
      [
        eventId,
        coordinatorId,
      ],
      (
        err,
        eventResults
      ) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch event details",
          });
        }

        if (
          eventResults.length ===
          0
        ) {
          return res.status(404).json({
            message:
              "Event not found or you are not authorized to update it",
          });
        }

        // =========================================
        // CHECK PARTICIPANT COUNT
        // =========================================

        const countSql = `
          SELECT COUNT(*) AS participant_count
          FROM event_registrations
          WHERE LOWER(TRIM(event_name)) =
                LOWER(TRIM(?))
        `;

        db.query(
          countSql,
          [eventResults[0].title],
          (
            err,
            countResults
          ) => {
            if (err) {
              console.log(err);

              return res.status(500).json({
                message:
                  "Failed to check participant count",
              });
            }

            const currentParticipants =
              Number(
                countResults[0]
                  .participant_count
              ) || 0;

            // =========================================
            // CAPACITY CANNOT GO BELOW CURRENT COUNT
            // =========================================

            if (
              max_participants <
              currentParticipants
            ) {
              return res.status(400).json({
                message:
                  `Maximum participants cannot be less than the current participant count (${currentParticipants})`,
              });
            }

            // =========================================
            // UPDATE EVENT
            // =========================================

            const sql = `
              UPDATE events
              SET
                title = ?,
                description = ?,
                event_date = ?,
                venue = ?,
                max_participants = ?,
                category = ?,
                registration_deadline = ?
              WHERE
                event_id = ?
                AND coordinator_id = ?
            `;

            db.query(
              sql,
              [
                title,
                description,
                event_date,
                venue,
                max_participants,
                category,
                registration_deadline,
                eventId,
                coordinatorId,
              ],
              (
                err,
                result
              ) => {
                if (err) {
                  console.log(
                    "UPDATE EVENT ERROR:",
                    err
                  );

                  return res.status(500).json({
                    message:
                      "Event update failed",
                  });
                }

                if (
                  result.affectedRows ===
                  0
                ) {
                  return res.status(404).json({
                    message:
                      "Event not found or you are not authorized to update it",
                  });
                }

                res.json({
                  message:
                    "Event updated successfully",
                });
              }
            );
          }
        );
      }
    );
  }
);

// ===============================
// GET ALL PARTICIPANTS
// ===============================

app.get(
  "/participants",
  (req, res) => {
    const sql = `
      SELECT
        student_email,
        event_name,
        event_date,
        event_location
      FROM event_registrations
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch participants",
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================================
// COORDINATOR: GET OWN EVENT PARTICIPANTS
// ===============================================

app.get(
  "/participants/coordinator/:id",
  (req, res) => {
    const coordinatorId =
      req.params.id;

    if (
      !isValidId(
        coordinatorId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid coordinator ID",
      });
    }

    const sql = `
      SELECT
        er.student_email,
        er.event_name,
        er.event_date,
        er.event_location
      FROM event_registrations er
      INNER JOIN events e
        ON LOWER(TRIM(er.event_name)) =
           LOWER(TRIM(e.title))
      WHERE e.coordinator_id = ?
      ORDER BY er.event_date ASC
    `;

    db.query(
      sql,
      [coordinatorId],
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch coordinator participants",
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================================
// ADMIN: EVENT-WISE PARTICIPANT REPORT
// ===============================================

app.get(
  "/admin/event-participants",
  (req, res) => {
    const sql = `
      SELECT
        e.event_id,
        e.title AS event_name,
        e.event_date,
        e.venue,
        e.status,
        e.coordinator_id,
        e.max_participants,
        e.category,
        e.registration_deadline,
        COUNT(er.student_email) AS participant_count
      FROM events e
      LEFT JOIN event_registrations er
        ON LOWER(TRIM(er.event_name)) =
           LOWER(TRIM(e.title))
      GROUP BY
        e.event_id,
        e.title,
        e.event_date,
        e.venue,
        e.status,
        e.coordinator_id,
        e.max_participants,
        e.category,
        e.registration_deadline
      ORDER BY e.event_date ASC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch event participant report",
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================================
// WEEK 15: ADMIN ANALYTICS
// ===============================================

app.get(
  "/admin/analytics",
  (req, res) => {
    const analytics = {};

    // ===============================
    // EVENT STATUS SUMMARY
    // ===============================

    const statusSql = `
      SELECT
        status,
        COUNT(*) AS count
      FROM events
      GROUP BY status
      ORDER BY count DESC
    `;

    // ===============================
    // CATEGORY-WISE EVENTS
    // ===============================

    const categorySql = `
      SELECT
        COALESCE(category, 'Other') AS category,
        COUNT(*) AS count
      FROM events
      GROUP BY category
      ORDER BY count DESC
    `;

    // ===============================
    // TOTAL PARTICIPANTS
    // ===============================

    const participantSql = `
      SELECT
        COUNT(*) AS total
      FROM event_registrations
    `;

    // ===============================
    // EVENT-WISE PARTICIPANTS
    // ===============================

    const eventParticipantSql = `
      SELECT
        e.event_id,
        e.title AS event_name,
        COUNT(er.student_email) AS participant_count,
        e.max_participants
      FROM events e
      LEFT JOIN event_registrations er
        ON LOWER(TRIM(er.event_name)) =
           LOWER(TRIM(e.title))
      GROUP BY
        e.event_id,
        e.title,
        e.max_participants
      ORDER BY participant_count DESC
    `;

    // ===============================
    // STATUS QUERY
    // ===============================

    db.query(
      statusSql,
      (err, statusResults) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch event status analytics",
          });
        }

        analytics.status =
          statusResults;

        // ===============================
        // CATEGORY QUERY
        // ===============================

        db.query(
          categorySql,
          (
            err,
            categoryResults
          ) => {
            if (err) {
              console.log(err);

              return res.status(500).json({
                message:
                  "Failed to fetch category analytics",
              });
            }

            analytics.categories =
              categoryResults;

            // ===============================
            // TOTAL PARTICIPANTS QUERY
            // ===============================

            db.query(
              participantSql,
              (
                err,
                participantResults
              ) => {
                if (err) {
                  console.log(err);

                  return res.status(500).json({
                    message:
                      "Failed to fetch participant analytics",
                  });
                }

                analytics.totalParticipants =
                  Number(
                    participantResults[0]
                      .total
                  ) || 0;

                // ===============================
                // EVENT PARTICIPANTS QUERY
                // ===============================

                db.query(
                  eventParticipantSql,
                  (
                    err,
                    eventParticipantResults
                  ) => {
                    if (err) {
                      console.log(err);

                      return res.status(500).json({
                        message:
                          "Failed to fetch event participant analytics",
                      });
                    }

                    analytics.eventParticipants =
                      eventParticipantResults.map(
                        (event) => ({
                          event_id:
                            event.event_id,

                          event_name:
                            event.event_name,

                          participant_count:
                            Number(
                              event.participant_count
                            ) || 0,

                          max_participants:
                            Number(
                              event.max_participants
                            ) || 50,
                        })
                      );

                    res.json(
                      analytics
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// ===============================
// GET ALL USERS
// ===============================

app.get(
  "/admin/users",
  (req, res) => {
    const sql = `
      SELECT
        user_id,
        name,
        email,
        role
      FROM users
      ORDER BY user_id DESC
    `;

    db.query(
      sql,
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch users",
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================
// TEST HELLO
// ===============================

app.get(
  "/hello",
  (req, res) => {
    res.send("Hello Tirth");
  }
);

// ===============================
// GET MY REGISTRATIONS
// ===============================

app.get(
  "/my-registrations/:email",
  (req, res) => {
    const email =
      cleanText(
        req.params.email
      ).toLowerCase();

    if (
      !isValidEmail(email)
    ) {
      return res.status(400).json({
        message:
          "Invalid email address",
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

    db.query(
      sql,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch registrations",
          });
        }

        res.json(results);
      }
    );
  }
);

// ===============================
// GET MY CERTIFICATES
// ===============================

app.get(
  "/my-certificates/:email",
  (req, res) => {
    const email =
      cleanText(
        req.params.email
      ).toLowerCase();

    if (
      !isValidEmail(email)
    ) {
      return res.status(400).json({
        message:
          "Invalid email address",
      });
    }

    const sql = `
      SELECT
        c.certificate_id,
        e.title AS event_name,
        c.certificate_url
      FROM certificates c
      JOIN users u
        ON c.student_id = u.user_id
      JOIN events e
        ON c.event_id = e.event_id
      WHERE u.email = ?
      ORDER BY c.certificate_id DESC
    `;

    db.query(
      sql,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to fetch certificates",
          });
        }

        res.json(results);
      }
    );
  }
);

// ==================================================
// ADMIN REPORTS
// ==================================================

app.get(
  "/admin/reports",
  (req, res) => {
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

    db.query(
      queries.totalUsers,
      (err, result) => {
        if (err) {
          console.log(err);

          return res.status(500).json({
            message:
              "Failed to generate reports",
          });
        }

        report.totalUsers =
          result[0].total;

        db.query(
          queries.totalEvents,
          (err, result) => {
            if (err) {
              console.log(err);

              return res.status(500).json({
                message:
                  "Failed to generate reports",
              });
            }

            report.totalEvents =
              result[0].total;

            db.query(
              queries.approvedEvents,
              (err, result) => {
                if (err) {
                  console.log(err);

                  return res.status(500).json({
                    message:
                      "Failed to generate reports",
                  });
                }

                report.approvedEvents =
                  result[0].total;

                db.query(
                  queries.rejectedEvents,
                  (err, result) => {
                    if (err) {
                      console.log(err);

                      return res.status(500).json({
                        message:
                          "Failed to generate reports",
                      });
                    }

                    report.rejectedEvents =
                      result[0].total;

                    db.query(
                      queries.pendingEvents,
                      (err, result) => {
                        if (err) {
                          console.log(err);

                          return res.status(500).json({
                            message:
                              "Failed to generate reports",
                          });
                        }

                        report.pendingEvents =
                          result[0].total;

                        db.query(
                          queries.totalParticipants,
                          (
                            err,
                            result
                          ) => {
                            if (err) {
                              console.log(err);

                              return res.status(500).json({
                                message:
                                  "Failed to generate reports",
                              });
                            }

                            report.totalParticipants =
                              result[0].total;

                            res.json(
                              report
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);

// ===============================
// START SERVER
// ===============================

app.listen(5000, () => {
  console.log(
    "Server running on http://localhost:5000"
  );
});