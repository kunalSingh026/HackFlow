# 🌌 HackFlow
<div align="center">
![HackFlow Banner](https://img.shields.io/badge/HackFlow-Production--Ready-6366F1?style=for-the-badge&logo=codeforces&logoColor=white)
[![Frontend Deploy](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://hackflow-client.vercel.app)
[![Backend Status](https://img.shields.io/badge/API_Gateway-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://hackflow-api.onrender.com)
[![Docker Support](https://img.shields.io/badge/Docker-Compatible-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#-docker-deployment)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](https://opensource.org/licenses/MIT)
**HackFlow** is a premium, feature-rich, full-stack hackathon management and evaluation platform. Engineered with a secure Role-Based Access Control (RBAC) architecture, it streamlines every phase of a hackathon: from dynamic team matchmaking and automated QR-ticket check-ins via mobile cameras, to multi-criteria judging and mathematically compiled live leaderboards.
[Key Features](#-key-features) • [System Flow](#-system-flow) • [Tech Stack](#-tech-stack) • [Live Demo & Testing](#-live-demo--testing) • [API Directory](#-api-directory) • [Getting Started](#-getting-started) • [Security & Production](#-security--production)
</div>
---
## ⚡ Live Demo & Testing
You can access the production-ready build of HackFlow using the following links:
*   **🖥️ Live Client Web App:** [https://hack-flow-rust.vercel.app/](https://hack-flow-rust.vercel.app/) *(Hosted on Vercel)*
*   **⚙️ Live API Gateway:** [https://hackflow-api.onrender.com](https://hackflow-api.onrender.com) *(Hosted on Render)*
> [!TIP]
> If you are deploying the project on your own custom Vercel/Render accounts, replace the URLs above with your unique domains.
### 👥 Quick-Start Test Accounts
To explore the dashboard interfaces and experience the RBAC permissions system without registering new accounts, use these pre-configured credentials:
|
 Role 
|
 Email Address 
|
 Password 
|
 Privileges / Features 
|
|
:---
|
:---
|
:---
|
:---
|
|
**
Administrator
**
|
`admin@hackflow.com`
|
`AdminPass123!`
|
 Create events, scanner check-in, assign judges, lock/publish leaderboards 
|
|
**
Judge
**
|
`judge@hackflow.com`
|
`JudgePass123!`
|
 Evaluation portal, rate submissions on custom weighted criteria 
|
|
**
Participant
**
|
`captain@hackflow.com`
|
`TeamPass123!`
|
 Matchmaking, join/create teams, submit projects and repositories 
|
---
## ✨ Key Features
### 👤 Role-Based Access Control (RBAC)
Strict API shields enforce specific boundaries around three roles:
*   **Participants / Teams:** Build profiles, showcase portfolios, invite team members, register for hackathons, and submit final projects.
*   **Judges:** Evaluate project submissions using dedicated visual dashboards with event-specific criteria.
*   **Administrators:** Manage events, broadcast announcements, scan check-in tickets, and lock/publish leaderboards.
### 🎫 Automated QR Ticketing & Mobile Check-in
*   **Secure Ticket Dispatch:** Upon registering for an event, the backend compiles a unique ID into a base64 QR Code.
*   **Resend API Mailer:** Instantly sends high-fidelity confirmation emails containing the inline QR ticket using the Resend HTTP API.
*   **In-Browser Camera Scanner:** Administrators can use a built-in mobile camera scanner on-site to verify tickets via `/api/events/:eventId/checkin/:registrationId`, recording attendance in real-time.
### 👥 Matchmaking & Team Dynamics
*   **Available Talents Search:** Search and filter active participants by skills, interests, and availability.
*   **Invite Pipeline:** Send invitations or review incoming requests. Captains have sole authority to invite members, remove members, or submit links.
### ⚖️ Multi-Criteria Judging & Live Standings
*   **Weighted Scoring:** Evaluates projects using customized parameters (e.g., *Innovation, Technicality, Design, Pitch*).
*   **Locked Grades:** Prevent scores from being modified after administrators publish the final results.
*   **Mathematical Sorting:** Leaderboards auto-calculate overall weighted score totals in real-time.
---
## 🔄 System Flow
```mermaid
graph TD
    User([Participant]) -->|Register / Login| Auth[Auth Service]
    User -->|Create / Join Team| Team[Team Matchmaking]
    User -->|Register to Event| Register[Event Registration]
    Register -->|Generate QR Code| QR[QR Ticket Service]
    QR -->|Email Ticket| Resend[Resend API Gateway]
    
    Admin([Admin]) -->|Create Event| EventAdmin[Event Admin Control]
    Admin -->|Scan QR Ticket| CheckIn[Gate Check-In Portal]
    CheckIn -->|Verify Ticket| Register
    
    Team -->|Submit Project Links| Submissions[Submissions Repository]
    
    Judge([Judge]) -->|View Submissions| Judging[Evaluation Portal]
    Judging -->|Submit Scores| Scores[(MongoDB Store)]
    
    Admin -->|Lock & Publish| Leaderboard[Dynamic Leaderboard]
    Scores -->|Rank Teams| Leaderboard
🛠️ Tech Stack
Layer	Technologies	Key Capabilities
Frontend	React 19, Vite, Tailwind CSS v4, Framer Motion	Fluid layouts, modern visual components, rapid HMR bundling.
Routing	React Router v7	Dynamic, component-driven client-side routing.
QR Scan	HTML5-QRCode	Native device camera bindings with high-performance framing.
Backend	Node.js, Express.js v5	Asynchronous REST API, modular router layers.
Database	MongoDB & Mongoose ORM	Document schemas, validation models, and aggregation indices.
Emails	Resend API SDK	Fast email delivery over Port 443, bypassing SMTP blockades.
Storage	Multer & Cloudinary SDK	Secure cloud media uploads for user avatars and event banners.
Monitoring	Sentry Node SDK	Performance profiling and real-time backend error capturing.
📂 Project Architecture


HackFlow/
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions continuous integration testing
├── Backend/                 # Express REST Server
│   ├── src/
│   │   ├── config/          # Database connection, Resend, & Cloudinary configurations
│   │   ├── controllers/     # Controller handlers (Auth, Event, Team, Evaluation, User)
│   │   ├── middleware/      # Authentication, file upload, & validation middleware
│   │   ├── models/          # Mongoose DB schemas (Event, Team, User, Registration, Evaluation)
│   │   ├── routes/          # Express Router mounts (Auth, User, Admin, Event, Team)
│   │   └── utils/           # HTML email templates and delivery helpers
│   ├── server.js            # Node App starting script
│   └── Dockerfile           # Production container compilation settings
├── frontend/                # React SPA Client
│   ├── src/
│   │   ├── api/             # Axios configuration with response interceptors
│   │   ├── components/      # Modular UI widgets, navigation bars, & camera scanners
│   │   ├── context/         # AuthContext state provider (token renewal & sessions)
│   │   ├── pages/           # Pages (Admin, Leaderboard, Profiles, Event Dashboards)
│   │   └── index.css        # Tailwind directives and customized CSS variables
│   ├── vercel.json          # SPA routing redirect file for Vercel deployment
│   └── vite.config.js       # Vite build configurations
🔌 API Directory
Authentication
POST /api/auth/register - Create user credentials (initial verification status: unverified)
POST /api/auth/verify-email - Verify email address using temporary token
POST /api/auth/login - Authenticate, set JWT cookies (Access & Refresh tokens)
POST /api/auth/refresh - Rotate expired Access tokens using a valid Refresh token
POST /api/auth/logout - Clear cookies and terminate session
User Profiles
GET /api/users/profile/:username - Public page profile details
PUT /api/users/profile - Update fields (skills, bio, github) and upload profile avatars
Hackathon Events
GET /api/events - List upcoming and active hackathons
GET /api/events/:eventId - Event information details
POST /api/events - [Admin Only] Create a new hackathon event
PUT /api/events/:eventId - [Host/Admin] Edit description, timeline parameters
POST /api/events/:eventId/register - Participant register for a hackathon
POST /api/events/:eventId/checkin/:registrationId - [Admin Only] Scan/Verify ticket registration
GET /api/events/public-stats - Dashboard statistics summary endpoint
Team Management
GET /api/teams/my-team - Fetch current user's team details
POST /api/teams/event/:eventId - Register a new team
POST /api/teams/:teamId/invite/:userId - [Captain Only] Send invitation to join
POST /api/teams/:teamId/accept-invite - Accept invitation and join team
POST /api/teams/:teamId/reject-invite - Reject invitation
POST /api/teams/:teamId/leave - Leave current team (disallowed 24h prior to start)
POST /api/teams/:teamId/remove/:userId - [Captain Only] Remove member from team
DELETE /api/teams/:teamId - [Captain Only] Disband team
PUT /api/teams/:teamId/submit - [Captain Only] Submit repository URLs, deck, and video demo
GET /api/teams/event/:eventId/participants - Find available participants for matchmaking
Evaluation & Leaderboards
GET /api/events/:eventId/submissions - [Judge Only] List submitted projects
POST /api/teams/:teamId/evaluate - [Judge Only] Rate submission based on criteria
GET /api/events/:eventId/leaderboard - Fetch ranked standings
PUT /api/events/:eventId/publish-leaderboard - [Admin Only] Lock grading and publish rankings
Administration (Global Panel)
GET /api/admin/users - [Admin Only] List all users
PUT /api/admin/users/:userId/role - [Admin Only] Modify user role permissions
PUT /api/admin/users/:userId/ban - [Admin Only] Ban/Unban user profile
POST /api/admin/events/:eventId/itinerary - [Admin Only] Add agenda schedules to timeline
PUT /api/admin/events/:eventId/judges - [Admin Only] Assign judges array to event
GET /api/admin/events - [Admin Only] View all events admin panel
🔑 Environment Settings
Create a .env configuration file in the /Backend directory:

env


# Server configs
PORT=5000
NODE_ENV=development
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hackflow
# Double JWT Secret Keys (Recommended at least 32 bytes)
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
# Resend API Service Key
RESEND_API_KEY=re_your_resend_api_key
# Cloudinary Media Storage (Optional, required for avatar uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
# Sentry Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn_url
🚀 Getting Started
1. Prerequisites
Install Node.js LTS (version 20 or 22) and MongoDB locally.

2. Backend Server Setup
Navigate to the Backend directory, install package dependencies, and run in dev mode:

bash


cd Backend
npm install
npm run dev
The server will bind to http://localhost:5000 (or the configured PORT).

3. Frontend Client Setup
Navigate to the frontend directory, install packages, and initialize:

bash


cd ../frontend
npm install
npm run dev
The client app will open on http://localhost:5173.

🐳 Docker Deployment
To spin up a containerized environment for the backend:

Build the Docker Image:
bash


cd Backend
docker build -t hackflow-backend .
Run the Container:
bash


docker run -d -p 3000:3000 --env-file .env hackflow-backend
🔒 Security & Production
HTTP-Only Cookies: Auth cookies are set with httpOnly: true, secure: true, and sameSite: 'strict' to safeguard tokens from Cross-Site Scripting (XSS) extraction.
Double-Token Auth: Utilizes short-lived Access tokens paired with database-tracked Refresh tokens.
Secure Headers: Protects endpoints against exploitation by serving standard security headers via Helmet.
API Rate Limiting: Rate limiting limits bulk automated scans. Auth routes are further limited to prevent brute-force attacks.
Proxy Configuration: In production environments behind reverse proxies (like Render or Cloudflare), the Express server trusts the X-Forwarded-For headers (app.set('trust proxy', 1)) to ensure rate limiting calculates origin IPs correctly.
Made with ❤️ by Kunal Kumar Singh.
```
