# ⚙️ HackFlow Backend API Service

This directory houses the backend server for **HackFlow**, built with Node.js, Express.js (v5), and MongoDB.

For full project documentation, frontend setup guides, and system workflows, please refer to the main [Root README.md](../README.md).

---

## 🛠️ Tech Stack & Middleware
*   **Runtime & Framework:** Node.js & Express.js (v5.x).
*   **Database:** MongoDB via Mongoose ORM.
*   **Authentication & Session:** JWT (JSON Web Tokens) with access/refresh token rotation and cookie parsing.
*   **File Uploads:** Multer with Cloudinary cloud storage integration.
*   **Error Monitoring:** Sentry SDK node instrumentation.
*   **Security Middlewares:** 
    *   `helmet`: Content Security Policy and HTTP protection headers.
    *   `cors`: Safe cross-origin access configuration.
    *   `express-rate-limit`: Rate limiters protecting overall API endpoints and auth pathways.
*   **Emailing:** Nodemailer SMTP templates for QR tickets and matchmaking notifications.

---

## 🚀 Commands & Development

Ensure you have created a backend `.env` file first (refer to [Root README.md](../README.md#key-environment-settings) for format).

Install dependencies:
```bash
npm install
```

### Script Directory

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `nodemon server.js` | Start development server with file hot-reloading |
| `npm run lint` | `eslint "src/**/*.js"` | Lint backend files using ESLint configuration |
| `npm run format`| `prettier --write "src/**/*.js"` | Format codebase using Prettier rules |
| `npm test` | `node test-auth-flow.js` | Execute integration and authentication tests |

---

## 📂 Core Folder Structure

*   [`/src/config`](./src/config): Contains database connectivity setups (`db.js`).
*   [`/src/controllers`](./src/controllers): Houses logic controller handlers (user profiles, teams, evaluations, registration check-ins, event creation).
*   [`/src/middleware`](./src/middleware): Houses JWT verification, RBAC checks (`authMiddleware.js`), and image upload setups (`uploadMiddleware.js`).
*   [`/src/models`](./src/models): Schema models mapping directly to MongoDB collections (Event, Team, Evaluation, Registration, User).
*   [`/src/routes`](./src/routes): Maps API paths to middleware chains and controller functions.
*   [`/src/utils`](./src/utils): Email dispatch templates including styled HTML frameworks.
*   [`/src/instrument.js`](./src/instrument.js): Bootstraps Sentry error-reporting integration.
