# 🛡️ Protego

> **Intelligent Public Safety, Digital General Diary & Tactical Police Dispatch Network**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 Why Protego Exists

In many communities, reporting an incident or filing an official **General Diary (GD)** still means traveling to a police precinct, waiting in long queues, and managing fragile paper documentation. In critical emergencies, relying solely on crowded telephone lines can introduce costly delays when seconds matter most.

**Protego** is designed to modernize that entire chain:
1. **For Citizens**: An accessible digital interface to file legally compliant General Diaries, upload geotagged crime reports with multimedia evidence, find nearby police stations, and trigger real-time GPS emergency SOS alerts with a single tap.
2. **For Law Enforcement**: A unified command console providing live tactical map telemetry, automated incident triage, crime hotspot tracking, AI-assisted credibility scoring, and transparent case investigation timelines.

Whether dealing with a misplaced student registration card or coordinating a quick-response patrol unit across city precincts, Protego bridges the communication gap between citizens and authorities.

---

## 🌟 Core Features

### 👤 Citizen Experience
- **🚨 Instant Emergency SOS**: Broadcast live GPS coordinates over WebSockets to nearby stations and dispatch units with live status tracking.
- **📄 Digital General Diary (GD)**: File official complaints for lost documents, missing items, or civil grievances with instant reference IDs and verification QR codes.
- **📸 Evidence-Backed Crime Reporting**: Report incidents with geotagged locations, category tags, timestamping, and secure multimedia upload via Cloudinary.
- **📍 Precinct Finder**: Automatic proximity lookup for the nearest police station with contact numbers and direct calling links.
- **🔔 Live Milestone Notifications**: Real-time push updates whenever an officer is assigned, a case note is logged, or a report is resolved.

### 👮 Police Command Center
- **🗺️ Real-Time Tactical Map**: Interactive Leaflet & Google Maps layer rendering active patrol units, pending incidents, high-risk zones, and active SOS beacons.
- **📋 Incident Triage & Dispatch**: Accept, investigate, reassign, or resolve cases with integrated status tracking and officer dispatch timers.
- **🤖 AI-Assisted Assessment**: Early-stage automated severity scoring and spam/fake report detection to help dispatchers prioritize critical emergencies.
- **🔥 Crime Hotspot Heatmaps**: Spatial clustering of historical incident data to guide proactive patrol allocations and municipal safety planning.
- **🛡️ Audit Trail & Security**: Detailed logging of officer updates, timestamps, and case history to guarantee accountability.

---

## 🏗️ System Architecture

```
                      ┌──────────────────────────────────────┐
                      │        Citizen & Police Web Client   │
                      │    (React 19 + Vite + Tailwind v4)   │
                      └──────────────────┬───────────────────┘
                                         │
                         HTTPS REST API  │  WebSockets (Socket.io)
                                         │
                      ┌──────────────────▼───────────────────┐
                      │          Node.js Express Server      │
                      │     (TypeScript, Rate Limit, Helmet) │
                      └───┬──────────────────────────────┬───┘
                          │                              │
             Prisma Client│                              │ Caching & Events
                          ▼                              ▼
              ┌───────────────────────┐      ┌───────────────────────┐
              │ PostgreSQL (Supabase) │      │      Redis Cache      │
              │  Relational Database  │      │   Session & Pub/Sub   │
              └───────────────────────┘      └───────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────┐            ┌──────────────────┐
│ Cloudinary Media │            │  AI / ML Engine  │
│ Evidence Storage │            │ Severity & Fraud │
└──────────────────┘            └──────────────────┘
```

---

## 🧰 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Zustand](https://zustand-demo.pmnd.rs/), [Lucide React](https://lucide.dev/), [Axios](https://axios-http.com/) |
| **Mapping & Telemetry** | [Leaflet](https://leafletjs.com/), [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api), [Socket.io Client](https://socket.io/) |
| **Backend API** | [Node.js](https://nodejs.org/), [Express 5](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [Socket.io](https://socket.io/), [Winston](https://github.com/winstonjs/winston), [Zod](https://zod.dev/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/)), [Prisma ORM v6](https://www.prisma.io/) |
| **Storage & Security** | [Cloudinary](https://cloudinary.com/) (Evidence attachments), [JWT](https://jwt.io/) (Access & Refresh tokens), [Helmet](https://helmetjs.github.io/), [bcrypt](https://www.npmjs.com/package/bcrypt) |
| **Deployment Ready** | Monorepo layout ready for [Vercel](https://vercel.com/) serverless or self-hosted Docker / VPS setups |

---

## ⚡ Quickstart Guide

### Prerequisites
Make sure you have installed on your local machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: Local instance or a free cloud database like [Supabase](https://supabase.com/) / [Neon](https://neon.tech/)
- **Redis** *(Optional for local dev, recommended for production pub/sub)*

---

### Step 1: Clone & Install Dependencies

Clone the repository and install all root, backend, and frontend dependencies:

```bash
git clone https://github.com/rmr193/Protego.git
cd Protego

# Install dependencies for both frontend and backend in one shot
npm run install-all
```

Alternatively, you can run `npm install` inside both `backend/` and `frontend/` directories manually.

---

### Step 2: Configure Environment Variables

#### 1. Backend Configuration
Create a `.env` file in the `backend/` folder (or copy from `backend/.env.example`):

```bash
cp backend/.env.example backend/.env
```

Ensure the key variables are configured:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/protego?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/protego?schema=public"
JWT_SECRET="your_custom_jwt_secret_at_least_32_characters"
JWT_REFRESH_SECRET="your_custom_jwt_refresh_secret_at_least_32_characters"

# Optional (Cloudinary for media evidence, Redis for socket scaling)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
REDIS_URL="redis://localhost:6379"
```

#### 2. Frontend Configuration
Create a `.env` file in the `frontend/` folder:

```bash
cp frontend/.env.example frontend/.env
```

Verify your endpoints match your local backend:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

---

### Step 3: Database Migration & Sample Data Seeding

Initialize the database schema using Prisma, and seed it with pre-built citizen profiles, police stations, sample General Diaries, and crime incidents:

```bash
# Navigate to backend directory
cd backend

# Generate Prisma Client & sync database schema
npx prisma db push

# Seed realistic demonstration accounts and incident cases
npm run seed

cd ..
```

---

### Step 4: Run Development Servers

Run the backend and frontend in separate terminal windows:

#### Terminal 1 — Backend API & Socket Server:
```bash
cd backend
npm run dev
# Server will launch at: http://localhost:5000
```

#### Terminal 2 — Frontend Application:
```bash
cd frontend
npm run dev
# Web application will launch at: http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser to start exploring!

---

## 🔑 Pre-Seeded Demo Accounts

The database seed provides ready-to-test accounts for both citizen and law enforcement roles. All demo accounts use the standard password: **`password123`**.

| Role | Name / Badge | Email | Password | Preloaded Context |
| :--- | :--- | :--- | :--- | :--- |
| **Police Officer** | Inspector M. Rahman (`BD-NK-101`) | `officer@protego.com` | `password123` | Head of Investigation, Maijdee HQ. Assigned to active motorcycle theft case. |
| **Police Officer** | Sub-Inspector Kabir (`BD-NK-102`) | `officer.kabir@protego.com` | `password123` | Sonapur Thana patrol lead. Handled solved commercial robbery case. |
| **Citizen** | Tanvir Ahmed | `tanvir.ahmed@protego.com` | `password123` | Approved GD (Lost NID) + Active investigating theft case with CCTV log. |
| **Citizen** | Nusrat Jahan | `nusrat.jahan@protego.com` | `password123` | Pending GD (Missing Smartphone) + Burglary attempt report. |
| **Citizen** | Kazi Mofizul Islam | `kazi.mofiz@protego.com` | `password123` | Approved GD (Academic marksheets) + Resolved armed robbery report. |
| **Citizen** | Default Demo User | `citizen@protego.com` | `password123` | Quick test citizen profile with standard permissions. |

---

## 📂 Project Structure

```text
Protego/
├── backend/
│   ├── docs/                      # Dedicated Markdown specifications for every API module
│   │   ├── auth.api.md
│   │   ├── crime.api.md
│   │   ├── gd.api.md
│   │   ├── sos.api.md
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (PostgreSQL)
│   │   └── seed.ts                # Realistic seed data (Citizens, Officers, Cases, Hotspots)
│   ├── src/
│   │   ├── config/                # Environment schema validation (Zod)
│   │   ├── modules/               # Domain-driven backend modules
│   │   │   ├── ai/                # Severity scoring & credibility verification
│   │   │   ├── analytics/         # Police incident metrics & resolution rates
│   │   │   ├── auth/              # Registration, JWT cookies, role checks
│   │   │   ├── case/              # Case lifecycle, officer assignment, tracking notes
│   │   │   ├── crime/             # Incident submission & management
│   │   │   ├── evidence/          # File upload & Cloudinary attachment pipelines
│   │   │   ├── gd/                # General Diary filing & verification
│   │   │   ├── hotspot/           # Risk calculation & geographic bounding
│   │   │   ├── notification/      # Socket & DB alert dispatcher
│   │   │   ├── police/            # Stations, badges, officer directory
│   │   │   ├── sos/               # Real-time emergency beacon & coordinates
│   │   │   └── users/             # User profile data & settings
│   │   ├── shared/                # Middlewares (Auth, Error, Multer), Socket & Redis services
│   │   ├── app.ts                 # Express configuration & global routes
│   │   └── server.ts              # HTTP & Socket.io server bootstrap
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI elements, LiveMap, layouts
│   │   ├── data/                  # Regional police station directory & pilot precinct data
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx    # Editorial landing page with hero slides & quick auth
│   │   │   ├── CitizenDashboard.tsx# Citizen hub: active cases, GDs, station locator, SOS
│   │   │   ├── FileGDPage.tsx     # Step-by-step General Diary submission form
│   │   │   ├── ReportCrimePage.tsx# Geotagged crime report & evidence upload form
│   │   │   ├── PoliceDashboard.tsx# Command console: triage, active map, dispatch feed
│   │   │   ├── PoliceIncidents.tsx# Filterable incident list & status manager
│   │   │   ├── PoliceReports.tsx  # Investigation reports & printable documentation
│   │   │   └── PoliceResources.tsx# Patrol fleet & officer station roster
│   │   ├── services/              # Axios API instances & Socket.io client setup
│   │   ├── store/                 # Zustand state stores (Auth, Citizen, Police)
│   │   ├── App.tsx                # Client-side routing & protected route wrappers
│   │   └── main.tsx               # React entry point
│   └── package.json
│
├── vercel.json                    # Configuration for multi-target serverless deployment
├── package.json                   # Root monorepo scripts
└── README.md                      # Project documentation
```

---

## 📡 API Overview

The backend is built around clean, modular Express routes mounted at `/api/v1`. Comprehensive documentation for request payloads and responses is available inside [`backend/docs/`](file:///d:/Protego/backend/docs/):

| Endpoint Base | Description | Documentation |
| :--- | :--- | :--- |
| `/api/v1/auth` | User registration, login, token refresh, logout | [Auth Docs](file:///d:/Protego/backend/docs/auth.api.md) |
| `/api/v1/users` | User profile retrieval, updates, and role verification | [User Docs](file:///d:/Protego/backend/docs/user.api.md) |
| `/api/v1/gd` | General Diary filing, citizen lists, officer approvals | [GD Docs](file:///d:/Protego/backend/docs/gd.api.md) |
| `/api/v1/crimes` | Incident submission, categorization, and evidence links | [Crime Docs](file:///d:/Protego/backend/docs/crime.api.md) |
| `/api/v1/evidence` | Secure evidence upload pipeline | [Evidence Docs](file:///d:/Protego/backend/docs/evidence.api.md) |
| `/api/v1/sos` | Real-time emergency trigger, coordinate broadcast & cancel | [SOS Docs](file:///d:/Protego/backend/docs/sos.api.md) |
| `/api/v1/cases` | Officer assignment, status update logs, and investigation tracking | [Case Docs](file:///d:/Protego/backend/docs/case.api.md) |
| `/api/v1/police` | Officer roster, badge validation, and police stations | [Police Docs](file:///d:/Protego/backend/docs/police.api.md) |
| `/api/v1/hotspots` | Geographic crime density clusters and risk rankings | [Hotspot Docs](file:///d:/Protego/backend/docs/hotspot.api.md) |
| `/api/v1/notifications`| User alert stream and read/unread status management | [Notification Docs](file:///d:/Protego/backend/docs/notification.api.md) |
| `/api/v1/analytics` | Crime trends, resolution velocity, and station statistics | [Analytics Docs](file:///d:/Protego/backend/docs/analytics.api.md) |
| `/api/v1/ai` | Crime severity score estimation & credibility heuristic | [AI Docs](file:///d:/Protego/backend/docs/ai.api.md) |

---

## 🔒 Security & Best Practices

- **Role-Based Access Control (RBAC)**: Enforced via `authorizeRoles('CITIZEN')` and `authorizeRoles('POLICE_OFFICER')` middleware at both the API and client-side route levels.
- **Double-Token Authentication**: Short-lived JWT access tokens paired with secure HTTP-only refresh tokens.
- **Hardened HTTP Headers**: Helmet enabled with custom cross-origin resource policy rules.
- **DDoS & Brute-Force Protection**: IP-based rate limiting via `express-rate-limit`.
- **Validation-First**: All request inputs are validated against strict Zod schemas before touching service layers.
- **Safe Password Storage**: Strong one-way password hashing using `bcrypt` with work factor 12.

---

## 🗺️ Roadmap & Upcoming Milestones

- [ ] **SMS & USSD Fallback**: Enable emergency SOS triggers and GD status checks via cellular text messaging in low-connectivity areas.
- [ ] **Dedicated Python NLP Microservice**: Expand the AI module with transformer-based categorization and duplicate case detection.
- [ ] **Mobile Native App (React Native)**: Background location streaming for ongoing emergency dispatch tracking.
- [ ] **Automated PDF GD Certification**: Downloadable signed digital PDF receipts with verifiable cryptographic watermarks.

---

## 🤝 Contributing

Contributions, bug reports, and suggestions are always welcome!
If you'd like to improve Protego:

1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes with clear messages: `git commit -m 'feat: add real-time patrol unit speed telemetry'`.
4. Push to your branch: `git push origin feature/your-feature-name`.
5. Open a **Pull Request** detailing what you built and why.

---

## 📄 License

This project is licensed under the [ISC License](file:///d:/Protego/backend/package.json). Feel free to use, modify, and distribute it for community and public safety initiatives.

---

*Built with ❤️ for safer, connected communities.*
