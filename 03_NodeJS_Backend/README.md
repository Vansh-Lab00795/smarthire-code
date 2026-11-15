# ⚙️ 03 - Node.js Backend (Express REST API)

This folder contains the complete Node.js / Express backend service powering SmartHire.

## Configuration
Set a private `JWT_SECRET` environment variable before starting the backend. The server exits with an explicit error if it is missing. Do not commit the secret or place it in source control.

## Core Engine Architecture
- **`index.js`**: Server bootstrap, CORS configuration, JSON body parsing, route mounting, database initialization, and automatic match score recalculation on startup.
- **`db.js`**: Persistent file-based JSON storage engine (`readData` and `writeData`) ensuring zero external database setup requirements.
- **`matching.js`**: Intelligent two-way matching engine implementing weighted scoring:
  - Skills Match: 40%
  - Education Qualifications: 15%
  - Experience Match: 15%
  - Location & Remote Preference: 15%
  - Salary Compatibility: 15%
  - Title keyword similarity bonus/penalty
- **`runner.js`**: Continuous supervisor that runs and monitors both Express and Vite child processes with automatic crash recovery.
- **`seed.js`**: Pre-populates demo candidates, verified employers, job listings, and sample matches.

## Subdirectories
- **`middleware/auth.js`**: JWT authentication middleware verifying bearer tokens and user roles.
- **`routes/`**:
  - `auth.js`: User registration, login, JWT issuance, profile updates, and first-visit welcome tracking.
  - `candidates.js`: Candidate profile CRUD, project portfolios, and candidate alerts.
  - `companies.js`: Employer company profiles and postings.
  - `jobs.js`: Job requirement posting and automatic candidate matching trigger.
  - `matches.js`: Match score retrieval, candidate/company status updates, and mutual acceptance detection.
  - `chat.js`: Mutual match conversation retrieval, messaging, and real-time message notification triggers.
- **`data/`**:
  - `users.json`, `candidates.json`, `companies.json`, `jobs.json`, `matches.json`, `notifications.json`, `messages.json`.
