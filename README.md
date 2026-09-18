# MINDORA — MICROBIOLOGY EXHIBITION REGISTRATION SYSTEM

**MINDORA** is a real-time, online-hosted university exhibition visitor registration and management web application. Designed for multi-device concurrent operations during high-traffic exhibition events, MINDORA connects operators using Android phones, iPhones, tablets, and laptops to a single centralized online database with live Socket.IO synchronization.

![MINDORA Branding](client/public/assets/mindora-logo.svg)

---

## KEY HIGHLIGHTS

- **Online-First & Zero Local Server Dependency**: No admin laptop server, no local LAN requirements, no router port forwarding, no mobile hotspot setup required. Opens directly via HTTPS URL.
- **Unified Fast Registration**: Dual `[ STUDENT ]` `[ TEACHER ]` interface optimized for 5–10 second visitor registrations with touch-friendly controls, big inputs, and auto-focus reset.
- **Backend-Enforced Grade Mapping**: Grade 6–11 = **O/L**, Grade 12–13 = **A/L**. Backend calculates education level automatically every time.
- **Shared School Database**: Shared school repository between student and teacher registrations. On-the-fly school creation by operators with real-time Socket.IO broadcasts (`school:created`) to all connected devices.
- **Normalized Duplicate Protection**: Normalizes school names (`normalizedName` unique index) and catches concurrent creation race conditions gracefully.
- **Concurrency-Safe Atomic IDs**: `MIN-XXXXXX` for students, `TCH-XXXXXX` for teachers using MongoDB atomic counter increments.
- **Real-Time TV Display (`/display`)**: High-contrast, large-typography public live display mode for TVs/Projectors. Updates instantly without page refresh while strictly protecting PII (zero student/teacher names or phone numbers exposed).
- **Free-Tier Online Deployment**: Designed to run entirely on free hosting tiers (Render / Railway / Fly.io + Vercel / Netlify + MongoDB Atlas M0).

---

## SYSTEM ARCHITECTURE

```
  Browser (Android / iPhone / Laptop)
                 ↓ (HTTPS)
      Vercel / Netlify / Render (Frontend)
                 ↓ (REST API & WebSockets)
      Render / Railway Node.js + Express + Socket.IO Server
                 ↓
      MongoDB Atlas Cloud Database (Free Tier M0)
```

---

## USER ROLES & RBAC

| Role | Permissions |
| :--- | :--- |
| **ADMIN** | Full control: Register visitors, Manage Users, Manage Schools, Edit/Soft-delete registrations, View Analytics, Export Excel/CSV/PDF reports, Audit Logs, Backup download, Event Settings, System Status. |
| **REGISTRATION_OPERATOR** | Fast registration of Students & Teachers, Search/Select/Add schools on the fly, View recent registrations, View basic counts. |
| **VIEWER** | Read-only access to real-time dashboard statistics and analytics. |

---

## DIRECTORY STRUCTURE

```
mondora_online/
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── public/                 # Static assets, SVG logo, PWA manifest.json
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, ConnectionStatus, SchoolSearchDropdown, AddSchoolModal, DuplicateModal, StatCard
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # Setup, Login, Register, Dashboard, Registrations, Teachers, Schools, Users, Analytics, Reports, AuditLogs, Backups, Settings, SystemStatus, Display, Connect
│   │   ├── App.jsx             # React Router & RBAC guards
│   │   └── main.jsx
├── server/                     # Express + Socket.IO API Backend
│   ├── config/                 # DB connection (MongoDB Atlas + Memory Server fallback)
│   ├── controllers/            # Auth, Registrations, Schools, Dashboard, Users, Reports, Audit, Settings
│   ├── middleware/             # Auth JWT, RBAC guards, Centralized Error Handler
│   ├── models/                 # Mongoose schemas (User, School, StudentRegistration, TeacherRegistration, Counter, AuditLog, Settings)
│   ├── routes/                 # REST endpoints
│   ├── services/               # Atomic ID generator, Report exporter (Excel/CSV/PDF), Audit logger
│   ├── sockets/                # Socket.IO connection manager & broadcasts
│   └── server.js               # Express & Socket server entry point
├── tests/                      # Jest & Supertest Critical Acceptance Test Suite
├── .env.example
├── package.json
└── README.md
```

---

## ENVIRONMENT VARIABLES SETUP

Create `.env` in the root directory (refer to `.env.example`):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<db_user>:<db_pass>@cluster0.xxx.mongodb.net/mindora_db?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_secure_secret_key_2026
CLIENT_URL=https://your-mindora-frontend.vercel.app
TZ=Asia/Colombo
```

---

## LOCAL DEVELOPMENT & EXECUTING

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:5173`
   - Backend API runs on `http://localhost:5000`

---

## FREE-TIER ONLINE DEPLOYMENT GUIDE

### Step 1: Create Free MongoDB Database (MongoDB Atlas M0)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a **Shared Cluster (M0 Free Tier)** in AWS or GCP region.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Copy your connection string: `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/mindora_db`.

### Step 2: Deploy Backend Server (Render / Railway / Fly.io Free Tier)
1. Push project code to GitHub.
2. Sign up at [Render.com](https://render.com/).
3. Create a **New Web Service** connected to your GitHub repository.
4. Set Root Directory to `server`.
5. Set Build Command: `npm install`
6. Set Start Command: `npm start`
7. Add Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://<your-frontend-subdomain>.vercel.app`
8. Deploy! Note down backend URL: `https://mindora-backend.onrender.com`.

### Step 3: Deploy Frontend (Vercel / Netlify / Render Static Site)
1. Sign up at [Vercel](https://vercel.com).
2. Import project repository from GitHub.
3. Framework Preset: **Vite**.
4. Root Directory: `client`.
5. Deploy! Vercel automatically routes `/api` and WebSockets to your configured backend or environment proxy.

---

## EVENT-DAY PROCEDURES

### BEFORE EVENT (CHECKLIST)
1. Verify online server health check at `https://your-domain.com/api/health`.
2. Login as Initial Admin via `/setup` if fresh deployment.
3. Create Operator accounts (`Desk 01`, `Desk 02`, `Desk 03`).
4. Bulk import initial school list via Admin Schools page.
5. Print / Display QR Connect page (`/connect`) at registration desks.
6. Open `/display` on exhibition hall main TV or Projector screen.

### DURING EVENT
1. Operators scan QR code on mobile devices to open `/register`.
2. Select `[ STUDENT ]` or `[ TEACHER ]`, search school, select grade, tap **REGISTER**.
3. Verify connection indicator badge (`● Connected`) on bottom bar.
4. Monitor live dashboard counts.

### AFTER EVENT
1. Go to Admin **Reports & Export** page (`/reports`).
2. Download **Full Excel Workbook (`.xlsx`)** for official university archives.
3. Export UTF-8 CSV or PDF summary reports.
4. Download full database backup from `/backups`.

---

## LICENSE & CREDIT

Developed for University Microbiology Exhibition System.
Copyright © 2026 MINDORA Team. MIT License.
