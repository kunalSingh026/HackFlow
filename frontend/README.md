# 💻 HackFlow Frontend Client

This directory contains the single-page application (SPA) frontend for **HackFlow**, built using React, Vite, and Tailwind CSS.

For full project documentation, architecture details, and backend API setup, please refer to the main [Root README.md](../README.md).

---

## 🛠️ Tech Stack & Highlights
*   **React 19 & Vite:** Next-gen bundling and fast Hot Module Replacement (HMR).
*   **Tailwind CSS v4:** Modern styling system utilizing utility classes and native CSS variables.
*   **Framer Motion:** High-fidelity, fluid component animations.
*   **HTML5-QRCode:** Device-native camera access for scanning check-in QR codes.
*   **Lucide React:** Icon library for consistent visual language.
*   **React Router v7:** Dynamic, component-driven client-side routing.

---

## 🚀 Commands & Development

Ensure you have installed node dependencies first:
```bash
npm install
```

### Script Directory

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Start the development server on `http://localhost:5173` |
| `npm run build` | `vite build` | Compile optimized production build to `/dist` |
| `npm run preview` | `vite preview` | Locally preview production build |
| `npm run lint` | `eslint .` | Lint source files for styling & syntax errors |
| `npm run format` | `prettier --write ...` | Reformat code using prettier configuration |

---

## 📂 Key Folders

*   [`/src/api`](./src/api): Axios interceptor configuration for authorization headers and API requests.
*   [`/src/components`](./src/components): Shared visual components, including dashboards and widgets.
*   [`/src/context`](./src/context): AuthContext module handling login sessions and token sync.
*   [`/src/pages`](./src/pages): Application views mapped directly to React Router paths.
*   [`/src/index.css`](./src/index.css): Main entry point for Tailwind CSS stylesheets and CSS variables.
