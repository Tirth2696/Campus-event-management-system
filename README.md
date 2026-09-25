# Campus Event Management System

A full-stack web application developed to manage campus events through a centralized platform for students, coordinators, and administrators.

The system replaces manual event registration and management processes with a structured digital platform for event creation, approval, registration, participant management, and certificate access.

---

## 📌 Project Overview

The Campus Event Management System provides different features based on user roles:

- **Student** – Browse events, search/filter events, register for events, view registrations and certificates.
- **Coordinator** – Create, edit, delete and manage events, and view registered participants.
- **Admin** – Manage users, approve/reject events, and view system reports.

The project is developed as a full-stack application using React.js, Node.js, Express.js and MySQL.

---

## ✨ Features

### 👨‍🎓 Student

- Student registration and login
- View upcoming events
- Search events
- Filter events by status
- View event details
- Register for events
- Duplicate registration checking
- View My Registrations
- View My Certificates
- Open participation certificates in PDF format

### 👨‍💼 Coordinator

- Coordinator login
- Create new events
- Edit existing events
- Delete events
- View managed events
- View event participants
- Manage event information

### 🛡️ Admin

- Admin login
- View pending events
- Approve events
- Reject events
- View registered users
- View system reports
- Monitor overall event statistics

---

## 🔄 System Workflow

```text
Student
   │
   ├── Register / Login
   ├── Browse Events
   ├── Search / Filter
   ├── Register for Event
   ├── View My Registrations
   └── View Certificates

Coordinator
   │
   ├── Login
   ├── Create Event
   ├── Edit Event
   ├── Delete Event
   └── View Participants

Admin
   │
   ├── Login
   ├── Review Events
   ├── Approve / Reject Events
   ├── Manage Users
   └── View Reports
```

---

## 🛠️ Technology Stack

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MySQL
- MySQL2

### Development Tools

- Visual Studio Code
- XAMPP
- phpMyAdmin
- Git
- GitHub

---

## 🏗️ Project Structure

```text
campus-event-management-system/
│
├── Backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── public/
│   └── certificates/
│       ├── certificate_AI_Workshop.pdf
│       └── certificate_Week8_Testing_Event.pdf
│
├── src/
│   ├── assets/
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── CoordinatorDashboard.jsx
│   │   ├── Events.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── StudentDashboard.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

---

## 🔌 Main REST API Endpoints

### Authentication

```text
POST /register
POST /login
```

### Events

```text
GET    /events
POST   /create-event
GET    /manage-events
PUT    /update-event/:id
DELETE /delete-event/:id
```

### Event Registration

```text
POST /event-register
GET  /my-registrations/:email
GET  /participants
```

### Certificates

```text
GET /my-certificates/:email
```

### Admin

```text
GET /admin/events
PUT /admin/events/:id/status
GET /admin/users
GET /admin/reports
```

---

## 🗄️ Database

The application uses **MySQL** as the database.

The database is used to manage:

- User information
- User roles
- Events
- Event registrations
- Participants
- Certificates
- Event approval status

Database management and testing are performed using **XAMPP** and **phpMyAdmin**.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Tirth2696/Campus-event-management-system.git
```

### 2. Open the Project

```bash
cd Campus-event-management-system
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

Open another terminal and run:

```bash
cd Backend
npm install
```

### 5. Start MySQL

Start the following services from XAMPP:

```text
Apache
MySQL
```

Create the required MySQL database and tables using phpMyAdmin.

### 6. Start Backend

Inside the `Backend` folder:

```bash
node server.js
```

Backend runs on:

```text
http://localhost:5000
```

### 7. Start Frontend

Open another terminal in the project root:

```bash
npm run dev
```

The Vite development server will provide the frontend URL in the terminal.

---

## 🧪 Testing

The system has been tested for:

- User registration
- User login
- Role-based functionality
- Event creation
- Event editing
- Event deletion
- Event search
- Event filtering
- Event approval/rejection
- Event registration
- Duplicate registration prevention
- Participant management
- My Registrations
- Certificate access
- PDF certificate viewing
- REST API operations
- MySQL database operations
- Frontend-backend integration
- Complete event workflow

### End-to-End Workflow Tested

```text
Create Event
     ↓
Admin Approval
     ↓
Student Views Event
     ↓
Student Registration
     ↓
Registration Stored in MySQL
     ↓
Certificate Added
     ↓
Student Views Certificate
```

---

## 📊 Current Project Status

**Completed through Week 8**

The core Student, Coordinator and Admin workflows have been implemented and tested.

Further development, improvements, testing and documentation will continue in upcoming project weeks.

---

## 🚀 Future Enhancements

Possible future improvements include:

- Event notifications
- Email notifications
- Improved certificate generation
- Advanced reporting and analytics
- Event image/banner management
- Improved UI/UX
- Additional security improvements
- Deployment to a production environment
- Additional automated testing

---

## 👨‍💻 Developer

**Tirth Panchal**

Computer Engineering Student

CHARUSAT

---

## 📚 References

- React.js Documentation
- Node.js Documentation
- Express.js Documentation
- MySQL Documentation
- MySQL2 Documentation
- Project Testing Results
- Mentor Discussion and Project Requirements

---

## 📌 Project Development

The project is being developed incrementally with regular feature implementation, testing, bug fixing and documentation updates.

Development progress will continue to be maintained through Git and GitHub with meaningful commits for future project weeks.