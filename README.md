# 📁 Project Management Tool

A collaborative, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** based project management application. It features secure team authentication, interactive project creation, task assignment, a visual Kanban board, and real-time chat room capabilities powered by **Socket.io**.

---

# 🚀 Features

### 👤 Authentication
* User Registration
* User Login
* Secure JWT Authentication
* Password Hashing using bcryptjs
* HttpOnly Cookie-based Authentication
* Session Persistence with `/api/auth/me`

### 👥 Project Collaboration
* Create Projects (Personal or Group)
* Add Team Members via registered email addresses (Admin only)
* View Project Team members list with roles (Admin / Member)
* Restrict project views only to authorized members

### 📋 Task Management
* Create Tasks (Admin only)
* Assign specific tasks to project members
* Set Task Priority (Low, Medium, High)
* Add descriptions and track statuses

### 📊 Kanban Board Tracking
* Visual status columns: **Todo**, **In Progress**, and **Done**
* Interactive status updates via dropdown selectors
* Persisted changes instantly saved to MongoDB

### 💬 Real-Time Live Chat
* Project-wide real-time group chat powered by WebSockets (**Socket.io**)
* Instant message broadcasting to room members
* Persistent chat history linked directly to the project

---

# 🛠️ Tech Stack

## Frontend
* React.js
* React Router DOM
* Axios
* Socket.io Client
* Lucide React (Icons)
* Vanilla CSS (Premium Glassmorphic Dark-Mode UI)

## Backend
* Node.js
* Express.js
* Socket.io
* cookie-parser

## Database
* MongoDB
* Mongoose

## Authentication
* JWT (jsonwebtoken)
* bcryptjs

---

# 📂 Project Structure

```
CodeAlpha_Project_Mangament_Tool/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authmiddleware.js
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Project.js
│   │   ├── ProjectMember.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoute.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── generatetoken.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   └── Register.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── README.md
```

---

# 📦 Installation

## 1. Clone Repository

```bash
git clone https://github.com/DB1132/Project-Management-Tool.git
```

```bash
cd Project-Management-Tool
```

---

# 📥 Backend Setup

Navigate to backend folder
```bash
cd backend
```

Install dependencies
```bash
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend
```bash
npm start
```
Server runs on:
```
http://localhost:5000
```

---

# 💻 Frontend Setup

Open another terminal and navigate to the frontend folder:
```bash
cd frontend
```

Install packages
```bash
npm install
```

Run React application
```bash
npm run dev
```
Frontend runs on:
```
http://localhost:5173
```

---

# 🐳 Running with Docker (Production Mode)

You can build and spin up the entire stack (MongoDB + App Server) using a single command:

```bash
docker compose up -d --build
```
Once initialized, the app will be live at:
```
http://localhost:5000
```

---

# 🗄️ Database Models

## User
* Name
* Email
* Password

## Project
* Name
* Description
* Created By (Ref: User)

## ProjectMember
* Project ID (Ref: Project)
* User ID (Ref: User)
* Role (enum: 'admin', 'member')

## Task
* Project ID (Ref: Project)
* Title
* Description
* Status (enum: 'todo', 'in-progress', 'done')
* Priority (enum: 'low', 'medium', 'high')
* Assigned To (Ref: User)
* Created By (Ref: User)

## Comment (Chat Messages)
* Project ID (Ref: Project)
* User ID (Ref: User)
* Message

---

# 🔗 API Overview

## Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Projects & Members
```
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects/:id/members
GET    /api/projects/:id/members
GET    /api/projects/:id/comments
```

## Tasks
```
POST   /api/tasks
GET    /api/tasks?projectId=:id
PUT    /api/tasks/:id/status
```

## Users
```
GET    /api/users?query=:query
```

---

# 🔄 Application Flow

```
Register / Login
       │
       ▼
JWT Session Created (Cookie)
       │
       ▼
Dashboard (Create or View Projects)
       │
       ▼
Project Details View
       │
       ├─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
 Kanban Board           Manage Team          Socket.io Chat
(Track Tasks)        (Add Team Members)      (Real-time Chat)
       │                     │
       ▼                     ▼
Change Task Status    Assign Task to Member
```

---

# 🔒 Security

* **JWT Cookies**: HttpOnly and SameSite cookie policies prevent client-side XSS tokens leakage and mitigate CSRF requests.
* **Role Verification**: Middlewares ensure only project Admins (project creators) can create tasks or add team members.
* **Workspace Isolation**: Middleware checks that a user is an authorized member of a project before returning tasks, members, or letting them join Socket.io rooms.

---

# 🎯 Future Improvements

* Drag-and-Drop Kanban tracking
* Due Date notifications and email alerts
* File upload attachments to specific tasks
* Advanced Analytics (Sprint Burndown charts)
* Task comment sub-threads

---

# 📸 Screenshots

Add screenshots here after completing the UI.

Example:
```
Dashboard View

Kanban Task Board

Manage Team Modal

Real-time Group Chat Drawer
```

---

# 👨‍💻 Author

**Deep Baldha**

GitHub: [https://github.com/DB1132](https://github.com/DB1132)

LinkedIn: [https://www.linkedin.com/in/dip-baldha-492596288/](https://www.linkedin.com/in/dip-baldha-492596288/)

---

# ⭐ If you like this project

Give this repository a ⭐ on GitHub if you found it useful.