# ⚛️ 04 - React Frontend (Components, 3D Hero & Pages)

This folder contains the complete modern React 18 single-page application built with Vite, Tailwind CSS, Three.js, and Framer Motion.

## Core Application Files
- **`main.jsx`**: React root bootstrap wrapping the tree in `BrowserRouter` and `AuthProvider`.
- **`App.jsx`**: Application router configuring public and protected routes with page transitions.

## Subdirectories
- **`pages/`**:
  - `Landing.jsx`: Full marketing landing page with interactive 3D hero canvas, feature highlights, and interactive CTAs.
  - `Login.jsx`: Role-toggle login modal (Candidate vs. Company) with glassmorphism card styling.
  - `Register.jsx`: 3-step interactive onboarding with role selection, profile fields, and comma-separated tag inputs.
  - `Dashboard.jsx`: Dynamic user dashboard with smart greetings ("Welcome" for new profiles, "Welcome back" for returning users), profile completeness metrics, top match highlights, and quick actions.
  - `Profile.jsx`: Profile editor with skills tag management, location preferences, and project portfolio builder.
  - `Jobs.jsx`: Job discovery board with search filters and employer job posting modal.
  - `JobDetail.jsx`: In-depth position specifications with real-time match indicator.
  - `Matches.jsx`: Two-way match reviewer with candidate/employer accept and decline controls, mutual match badges, and chat triggers.
  - `Notifications.jsx`: System alerts with direct navigation to match cards and hiring channels.
  - `Chat.jsx`: Dedicated hiring chat workspace with conversation list, message history, live polling, and quick reply chips.

- **`components/`**:
  - `Navbar.jsx`: Fixed luxury navigation bar with dynamic active pills, user menu, unread badges, and chat links.
  - `Hero3D.jsx`: React Three Fiber & Three.js 3D scene (wireframe icosahedron, orbiting distort spheres, star particles).
  - `Footer.jsx`: Luxury dark footer with site links and copyright.
  - `ProtectedRoute.jsx`: Authentication guard redirecting unauthenticated users to `/login`.
  - `AnimatedCard.jsx`: Glassmorphism card wrapper with Framer Motion hover and entrance animations.
  - `MatchCircle.jsx`: Animated circular SVG gauge rendering compatibility percentages.
  - `StatsCard.jsx`: Metric widget displaying key platform stats.

- **`context/`**:
  - `AuthContext.jsx`: Global authentication context handling token storage, persistent sessions, login, and registration.

- **`utils/`**:
  - `api.js`: Axios instance pre-configured with JWT request interceptors and automatic 401 redirect handling.
