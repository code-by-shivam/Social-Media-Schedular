# Social Media Scheduler & Campaign Management Platform

A full-stack platform for managing social-media accounts, creating and scheduling posts, tracking campaigns, and viewing publishing and engagement analytics.

## Features

- User registration and JWT-based authentication
- Role-aware access for administrators, business users, marketing teams, and content creators
- Social-account connection and management
- Post creation, drafts, scheduling, recurring posts, and image uploads
- Publishing queue with retry, cancellation, and priority controls
- Background publishing scheduler, evaluated every minute
- Campaign creation, tracking, performance, ROI, and reporting
- Analytics for posts, campaigns, accounts, and cross-platform performance
- Profile and account-preference management

## Technology

| Area | Tools |
|---|---|
| Frontend | React 19, Vite, React Router, Recharts, CSS |
| Backend | FastAPI, SQLAlchemy, Beanie |
| Databases | PostgreSQL, MongoDB |
| Background processing | APScheduler, Redis |
| Authentication | JWT, Passlib/Bcrypt |
| API documentation | Swagger UI / OpenAPI |
| Deployment support | Docker |

## Repository Structure

```text
.
├── src/                    # React application
│   ├── pages/              # Application screens
│   ├── services/           # API client modules
│   ├── components/         # Shared UI and layout components
│   ├── context/            # Authentication context
│   └── routes/             # Public and protected routes
├── backend/
│   ├── app/api/            # FastAPI route modules
│   ├── app/models/         # PostgreSQL and MongoDB models
│   ├── app/services/       # Publishing and platform services
│   ├── app/background/     # Scheduled publishing worker
│   ├── alembic/            # Database migrations
│   ├── main.py             # FastAPI application entry point
│   └── Dockerfile
├── public/                 # Static frontend assets
└── .env.example            # Frontend environment template
```

## Prerequisites

- Node.js 20 or later
- Python 3.13 or later
- PostgreSQL
- MongoDB
- Redis
- Docker Desktop (optional)

## Frontend Setup

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The frontend runs on `http://localhost:5173`.

Frontend environment variables:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Backend Setup

Create `backend/.env` with local service settings:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=socialpilot

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=socialpilot_db

REDIS_URL=redis://localhost:6379/0

SECRET_KEY=replace-with-a-long-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Install and run the API:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs on `http://localhost:8000`.

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

## Docker Backend

With PostgreSQL, MongoDB, and Redis available on the host machine:

```powershell
cd backend
docker build -t social-media-scheduler-backend .
docker run --rm -p 8000:8000 `
  --env-file .env `
  -e POSTGRES_HOST=host.docker.internal `
  -e MONGODB_URI=mongodb://host.docker.internal:27017 `
  -e REDIS_URL=redis://host.docker.internal:6379/0 `
  social-media-scheduler-backend
```

## Main API Areas

| Route prefix | Purpose |
|---|---|
| `/auth` | Registration and login |
| `/users` | Profile, preferences, password, permissions |
| `/admin` | Administrative dashboard data |
| `/social-accounts` | Connected social accounts |
| `/posts` | Posts, drafts, recurring posts, scheduling |
| `/publishing-queue` | Queue status, priority, cancellation, retry |
| `/publishing-logs` | Publishing history |
| `/campaigns` | Campaign management and tracking |
| `/analytics` | Post, campaign, account, and overall analytics |
| `/reports` | Campaign reports |
| `/roi` | Campaign ROI data |

## Frontend Commands

```powershell
npm run dev      # Start Vite development server
npm run build    # Create production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Notes for Contributors

- Do not commit `.env` files or credentials.
- The backend initializes PostgreSQL tables during startup; Alembic migrations are also included for controlled schema changes.
- The publishing scheduler starts with the API and checks due queue entries once per minute.
- A development-only administrator login shortcut exists in the frontend. Do not rely on it in production.
- Run `npm run lint` before submitting frontend changes.

## Current Implementation Notes

- The backend route module for social publishing exists but is not registered in `backend/main.py`, so its endpoint is currently unavailable.
- Some campaign-service calls in the frontend target endpoints not currently exposed by the backend (`/campaigns/compare` and `/campaigns/{id}/roi`).
- No automated test suite is currently configured.

## License

See [LICENSE](LICENSE).

