# 🏛️ SmartHostel ERP
### Enterprise Hostel Management System — v2.0

> A full-stack, cloud-connected Hostel Management System built for university-level administration. Designed with a premium glassmorphism UI, real-time database operations, role-based access control, and multi-theme support.

---

## 👨‍💻 Team Members

| Name | Role |
|------|------|
| **Aftab** | Full Stack Developer & UI/UX Designer |
| **Meraj** | Full Stack Developer & Database Architect |

**Course:** CS4 — Database Systems  
**Project:** Smart Hostel Management System

---

## 📌 Project Overview

SmartHostel ERP is a complete hostel management platform that digitizes all hostel operations — from student registration and room allocation to complaint tracking, fee management, visitor logging, and analytics. It replaces traditional paper-based hostel administration with a modern, cloud-based web application.

---

## 🚀 Live Demo

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@hostel.edu | Admin@123 |
| **Warden** | warden@hostel.edu | Warden@123 |
| **Student** | arjun@edu.in | Student@123 |

> Self-registration is available for both Students and Wardens from the login page.

---

## 🏗️ System Architecture

```
SmartHostel ERP
│
├── Frontend (Pure HTML + CSS + Vanilla JS)
│   ├── index.html              → Role-based login + Registration
│   ├── pages/
│   │   ├── admin.html          → Admin Dashboard (9 sections)
│   │   ├── warden.html         → Warden Dashboard (7 sections)
│   │   └── student.html        → Student Dashboard (6 sections)
│   ├── css/
│   │   └── style.css           → Premium design system (5 themes)
│   └── js/
│       └── app.js              → Shared utilities, API layer, theme system
│
├── Backend (Node.js + Express)
│   ├── server.js               → Main Express server + all routes
│   ├── config/
│   │   └── db.js               → MongoDB Atlas connection
│   ├── middleware/
│   │   └── auth.js             → JWT protect + role authorization
│   ├── models/
│   │   ├── User.js             → Student / Warden / Admin schema
│   │   ├── Room.js             → Room management schema
│   │   ├── Complaint.js        → Complaint tracking schema
│   │   ├── RoomChangeRequest.js → Room change request schema
│   │   └── Other.js            → Announcements / Visitors schemas
│   └── routes/
│       ├── auth.js             → Login / Register / Me
│       └── main.js             → Users / Rooms / Complaints / Stats
│
└── Database (MongoDB Atlas — Cloud)
    └── hostel_management       → Main database
        ├── users               → All users (students, wardens, admins)
        ├── rooms               → Room inventory
        ├── complaints          → Student complaints
        ├── roomchangerequests  → Room change requests
        └── announcements       → Hostel notices
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| HTML5 | Page structure & semantic markup |
| CSS3 | Premium glassmorphism design system |
| Vanilla JavaScript (ES6+) | DOM manipulation, API calls, state management |
| Chart.js v4.4.0 | Interactive dashboard charts |
| SheetJS (xlsx@0.18.5) | Excel export functionality |
| jsPDF v2.5.1 + AutoTable | PDF report generation |
| Google Fonts — Outfit | Premium typography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| Express.js | RESTful API framework |
| MongoDB Atlas | Cloud NoSQL database |
| Mongoose | MongoDB ODM (Object Document Mapper) |
| JWT (jsonwebtoken) | Stateless authentication |
| bcryptjs | Password hashing |
| dotenv | Environment variable management |
| nodemon | Development auto-restart |
| cors | Cross-origin resource sharing |

---

## 📂 Folder Structure

```
Hostel_Management/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Complaint.js
│   │   ├── RoomChangeRequest.js
│   │   └── Other.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── main.js
│   ├── .env
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    ├── pages/
    │   ├── admin.html
    │   ├── student.html
    │   └── warden.html
    └── index.html
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm
- MongoDB Atlas account (or local MongoDB)
- VS Code with Live Server extension

### Step 1 — Clone / Download Project
```bash
# Download and extract to:
D:\CS 4 Course\Database Project\Hostel_Management\
```

### Step 2 — Install Backend Dependencies
```bash
# Open CMD
D:
cd "CS 4 Course\Database Project\Hostel_Management\backend"
npm install
```

### Step 3 — Configure Environment Variables
Create `.env` file in `/backend/`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://hosteladmin:Hostel123@cluster0.aod21y8.mongodb.net/hostel_management?appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### Step 4 — Seed the Database (First Time Only)
```bash
node seed.js
```

### Step 5 — Start the Backend Server
```bash
npm run dev
# Server starts at http://localhost:5000
# Type 'rs' to restart if needed
```

### Step 6 — Start the Frontend
- Open `frontend/index.html` in VS Code
- Right-click → **Open with Live Server**
- Runs at `http://127.0.0.1:5500/frontend/index.html`

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name:        String (required),
  email:       String (required, unique, lowercase),
  password:    String (required, min 6, hashed with bcrypt),
  role:        Enum ['admin', 'warden', 'student'] (default: 'student'),
  rollNo:      String,
  room:        String,
  block:       String,
  branch:      String,
  year:        Number,
  phone:       String,
  feeStatus:   Enum ['paid', 'due', 'partial'] (default: 'due'),
  attendance:  Number (default: 0),
  isActive:    Boolean (default: true),
  timestamps:  createdAt, updatedAt
}
```

### Complaint Model
```javascript
{
  student:     ObjectId → ref User (required),
  room:        String (default: 'Not Assigned'),
  title:       String (required),
  description: String (required),
  category:    Enum ['Plumbing','Electrical','IT','Maintenance','Food','Appliances','Other'],
  priority:    Enum ['Low','Medium','High','Critical'] (default: 'Medium'),
  status:      Enum ['Pending','In Progress','Resolved','Escalated'] (default: 'Pending'),
  resolvedAt:  Date,
  remarks:     String,
  timestamps:  createdAt, updatedAt
}
```

### RoomChangeRequest Model
```javascript
{
  student:       ObjectId → ref User (required),
  currentRoom:   String (required),
  currentBlock:  String,
  preferredBlock:String (required),
  reason:        String (required),
  details:       String,
  status:        Enum ['pending','approved','rejected'] (default: 'pending'),
  reviewedBy:    ObjectId → ref User,
  reviewNote:    String,
  reviewedAt:    Date,
  timestamps:    createdAt, updatedAt
}
```

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login with email & password | Public |
| POST | `/api/auth/register` | Create new account | Public |
| GET | `/api/auth/me` | Get current logged-in user | Protected |

### Users (`/api/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users (filter by role, block, feeStatus) | Admin, Warden |
| GET | `/api/users/:id` | Get specific user | Admin, Warden |
| PUT | `/api/users/:id` | Update user | Admin, Warden |
| DELETE | `/api/users/:id` | Delete user | Admin only |

### Complaints (`/api/complaints`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/complaints` | Get complaints (students see own only) | Protected |
| POST | `/api/complaints` | Submit new complaint | Student |
| PUT | `/api/complaints/:id` | Update complaint status | Admin, Warden |
| DELETE | `/api/complaints/:id` | Delete complaint | Admin, Warden |

### Room Change Requests (`/api/room-change-requests`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/room-change-requests/my` | Get own requests | Student |
| GET | `/api/room-change-requests` | Get all requests | Admin, Warden |
| POST | `/api/room-change-requests` | Submit request | Student |
| PUT | `/api/room-change-requests/:id` | Approve / Reject | Admin, Warden |

### Other
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/stats` | Dashboard statistics | Protected |
| GET | `/api/health` | Server health check | Public |
| GET/POST/DELETE | `/api/announcements` | Manage notices | Protected |
| GET/PUT | `/api/visitors` | Visitor management | Protected |

---

## 🎨 UI Design System

### Color Themes (5 Themes)
| Theme | Background | Accent | Description |
|-------|-----------|--------|-------------|
| 🌙 **Dark** (default) | Deep space #020617 | Indigo #6366f1 | Premium dark glassmorphism |
| ☀️ **Light** | Soft #f0f4ff | Indigo #4f46e5 | Clean professional light |
| 🌊 **Ocean** | Deep navy #020f1f | Cyan #06b6d4 | Cool oceanic depth |
| 🌅 **Sunset** | Deep crimson #1a0608 | Coral #f43f5e | Warm dramatic sunset |
| 🌲 **Forest** | Deep green #011006 | Emerald #10b981 | Natural forest calm |

### Role Colors
| Role | Color | Hex |
|------|-------|-----|
| Admin | Indigo | `#7f9cf5` |
| Warden | Cyan | `#4fd1c5` |
| Student | Pink | `#f687b3` |

### Design Features
- **Glassmorphism** — `backdrop-filter: blur(20px)` on all cards
- **Multi-layer shadows** — Contact shadow + ambient glow
- **Animated background** — 20s breathing gradient animation
- **Gradient top bars** — Each card has a two-tone gradient bar
- **Ambient card glow** — Color-matched glow on card hover
- **Premium scrollbar** — Gradient accent→purple scrollbar
- **Smooth transitions** — `cubic-bezier(.4,0,.2,1)` on all interactions

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication (7-day expiry)
- Role-based access control (Admin > Warden > Student)
- Secure password hashing with bcrypt
- Auto-login after registration
- Protected routes with middleware

### 👤 User Management
- **Student self-registration** from login page
- **Warden self-registration** from login page
- Admin can add/delete students and wardens
- Warden can add new student accounts
- Student profile cards with fee & attendance status

### 🏠 Room Management
- 48-room grid visualization (4 blocks × 12 rooms)
- Status tracking: Occupied / Available / Maintenance
- Color-coded room status display
- Block-wise occupancy progress bars (Warden)

### 📋 Complaint System
- Students submit complaints with category & priority
- Warden / Admin can mark In Progress / Resolved / Escalated
- Real-time status badges
- Complaint statistics dashboard

### 🔄 Room Change Requests
- Students submit room change requests with reason
- Warden & Admin approve / reject with review notes
- Full request history with status tracking
- Sidebar notification badge for pending requests

### 💰 Fee Management
- Fee status tracking per student (Paid / Due / Partial)
- Fee summary dashboard (Admin)
- Fee history table (Student)
- Excel export of fee records

### 📢 Announcements
- Admin & Warden post announcements
- Priority levels: Normal / High / Urgent
- Pin important announcements
- Category tagging (Event / Finance / Mess / Rules / General)

### 👁️ Visitor Management
- Visitor check-in / check-out tracking
- Warden approval workflow
- Visitor queue on dashboard
- Full visitor log table

### 📊 Analytics & Reports
- **Admin Reports section** with:
  - Fee Recovery Rate (%)
  - Complaint Resolution Rate (%)
  - Complaints by Category (bar chart)
  - Fee Status Breakdown (doughnut chart)
  - Auto-generated Smart Insights
  - Full PDF report download
- **Dashboard Charts:**
  - Room Occupancy Trend (line chart)
  - Fee Collection by Month (bar chart)
  - Complaint Status Distribution (doughnut)
  - Weekly Attendance (bar chart)

### 📥 Export Features
- **Excel export** (SheetJS) — Students, Complaints, Fees
- **PDF export** (jsPDF + AutoTable) — Students, Complaints, Analytics

### 🎓 Attendance
- Student: Visual calendar grid (4 weeks, Present ✓ / Absent ✗)
- Warden: Mark attendance per student (Present / Absent / Leave)
- Attendance percentage tracking
- Weekly attendance chart

---

## 🔒 Security Features

- All passwords hashed with **bcrypt** (salt rounds: 10)
- **JWT tokens** expire in 7 days
- All sensitive routes protected with `auth.protect` middleware
- Role-based `authorize()` middleware on admin-only routes
- Email uniqueness enforced at database level
- Input validation on both frontend and backend
- CORS configured for cross-origin requests

---

## 🧪 How to Test

### Test Student Registration
1. Open `http://127.0.0.1:5500/frontend/index.html`
2. Click **Student** card
3. Click **"Create an account"**
4. Fill form → Submit → Auto-redirect to Student Dashboard

### Test Warden Registration
1. Click **Warden / Staff** card
2. Click **"New warden? Create an account"**
3. Fill form → Submit → Auto-redirect to Warden Dashboard
4. Open Admin Dashboard → Wardens/Staff → new warden visible

### Test Complaint Flow
1. Login as **Student** → Complaints → Submit new complaint
2. Login as **Warden** → Complaints → Mark as In Progress
3. Login as **Admin** → Complaints → Mark as Resolved

### Test Room Change Request
1. Login as **Student** → My Room → Submit room change request
2. Login as **Warden** → Room Requests → Approve / Reject with note
3. Student dashboard updates request status

---

## 📡 Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `5000` | Backend server port |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `your_secret_key` | JWT signing key |
| `JWT_EXPIRE` | `7d` | Token expiration duration |
| `NODE_ENV` | `development` | Environment mode |

---

## 🌩️ Cloud Database

- **Provider:** MongoDB Atlas (Free Tier — M0)
- **Cluster:** Cluster0 at `cluster0.aod21y8.mongodb.net`
- **Database:** `hostel_management`
- **Network Access:** `0.0.0.0/0` (open for development)
- **DB User:** `hosteladmin` with `readWriteAnyDatabase` role

> Data is persisted in the cloud — all changes are saved permanently without any local MongoDB requirement.

---

## 📱 Responsive Design

| Breakpoint | Behavior |
|-----------|---------|
| Desktop (>900px) | Full sidebar + all grid columns |
| Tablet/Mobile (<900px) | Collapsed sidebar (icons only), single-column grids |

---

## 🏆 Project Highlights

- ✅ **Cloud-connected** — MongoDB Atlas, no local DB needed
- ✅ **5 premium themes** — Dark, Light, Ocean, Sunset, Forest
- ✅ **Animated glassmorphism UI** — Premium enterprise look
- ✅ **Role-based registration** — Students AND Wardens can self-register
- ✅ **Complete CRUD** — Create, Read, Update, Delete for all entities
- ✅ **Real-time data** — All stats and charts from live database
- ✅ **Export suite** — Excel & PDF for Students, Complaints, Fees, Analytics
- ✅ **Smart Insights** — AI-style auto-generated analytics text
- ✅ **Room Change Workflow** — Full request → review → approval flow
- ✅ **Animated counters** — Smooth number animations on dashboard
- ✅ **Loading skeletons** — Premium shimmer loading states
- ✅ **Multi-theme picker** — Persistent theme stored in localStorage

---

## 📖 Known Limitations

- Room grid uses dummy data (not connected to live room API)
- Visitor management uses fallback data if API unavailable
- Charts use static/seeded data for trend visualization
- No email notification system (planned for future)

---

## 🔮 Future Enhancements

- [ ] Email notifications for complaints & approvals
- [ ] Real-time updates via WebSockets
- [ ] Mobile app (React Native)
- [ ] Biometric attendance integration
- [ ] Payment gateway for fee collection
- [ ] QR code-based visitor check-in
- [ ] Bulk student import via Excel upload

---

## 📄 License

This project was developed as a university course project for **CS4 — Database Systems**.  
All rights reserved © 2025 — **Aftab & Meraj**

---

<div align="center">
  <strong>SmartHostel ERP v2.0</strong><br/>
  Built with ❤️ by Aftab & Meraj<br/>
  <em>CS4 Database Systems Project</em>
</div>
