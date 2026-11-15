# 🚀 SmartHire — Complete Source Code Architecture

Welcome to the **SmartHire** codebase repository. This project is structured into tool-specific modules for clean inspection and learning in **Visual Studio Code**, alongside a complete production-ready runnable package.

---

## 📂 Project Organization (By Technology & Tool)

| Folder | Technology / Tool | Description |
|---|---|---|
| **`01_HTML`** | HTML5 / Single Page Shell | Base HTML document, responsive viewport settings, Google Fonts integration (Outfit & Inter), and root DOM mount point. |
| **`02_CSS_and_Styling`** | CSS3 & Tailwind CSS | Design tokens, custom scrollbars, luxury dark glassmorphism effects, gradient utilities, and Tailwind / PostCSS configurations. |
| **`03_NodeJS_Backend`** | Node.js & Express.js | REST API, JWT authentication middleware, intelligent two-way weighted matching engine, mutual acceptance chat system, JSON database models, and seeder. |
| **`04_React_Frontend`** | React 18, Three.js, Lucide | Full frontend application: 3D interactive hero canvas, multi-step role-based registration, dynamic greeting, smart matches, candidate portfolios, and live hiring chat channels. |
| **`05_Full_Runnable_Project`** | Full-Stack Bundle | The complete, standalone, runnable project with all build tools, Vite dev server, Express backend, and live database ready to execute. |

---

## 💻 How to Open and Explore in Visual Studio Code

### Option 1: Double-Click the Workspace File (Recommended)
Double-click **`smarthire.code-workspace`** inside this folder.
- Visual Studio Code will launch with all 5 folders neatly organized in the side explorer, clearly labeled with emojis and category names.

### Option 2: Open Folder via Terminal / VS Code Menu
1. Open Visual Studio Code.
2. Click **File** ➜ **Open Folder...**
3. Select the folder where you cloned this repository.

---

## ⚡ How to Run the Website

### Method 1: Instant One-Click Desktop Launcher
Simply double-click **`SmartHire-App.bat`** in this folder.
- Automatically finds Node.js.
- Cleans and frees ports `3001` (Backend) and `5173` (Frontend).
- Launches the continuous auto-recovery supervisor.
- Opens the app in a standalone window (Chrome / Edge `--app` mode).

### Method 2: From Terminal (inside `05_Full_Runnable_Project`)
```bash
cd 05_Full_Runnable_Project
npm ci
```

In PowerShell, create a random signing secret for the current terminal session and start the app:
```powershell
$env:JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node server/runner.js
```
Then visit in your browser:
- **Frontend Web UI**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🔑 Demo Accounts (Pre-configured)

| Role | Email | Password | Details |
|---|---|---|---|
| **Candidate** | `candidate@smarthire.ai` | `password123` | Vansh Kumar Jha — React / Node.js Developer |
| **Employer** | `company@abc.com` | `password123` | ABC Pvt. Ltd. — Web-Developer Opening |

---

## 🌟 Key Architectural Features

1. **Intelligent Two-Way Weighted Matching Algorithm (`03_NodeJS_Backend/matching.js`)**:
   - Skills Compatibility (40% weight)
   - Education Qualifications (15% weight)
   - Experience Level (15% weight)
   - Location & Remote Preference (15% weight)
   - Salary Expectation & Budget (15% weight)
   - Job title keyword relevance penalty & budget overshoot protection

2. **Mutual Acceptance & Direct Hiring Chat (`03_NodeJS_Backend/routes/chat.js` & `04_React_Frontend/pages/Chat.jsx`)**:
   - Both parties review match scores and requirements.
   - Private end-to-end communication channels unlock **only when both parties accept**.
   - Real-time polling, message history, read receipts, and quick proposal prompts.

3. **3D Interactive Hero Canvas (`04_React_Frontend/components/Hero3D.jsx`)**:
   - React Three Fiber & Three.js 3D scene with floating wireframe icosahedron, orbiting distort spheres, and interactive star particle field.

4. **Self-Healing Supervisor (`03_NodeJS_Backend/runner.js`)**:
   - Continuous runtime monitor that oversees both Vite and Express, automatically recovering and restarting any service within 2 seconds if interrupted.
