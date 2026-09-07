# Virtual Arcade

Virtual Arcade is a full-stack virtual credit gaming platform built as a portfolio project. It combines authentication, user and admin roles, a virtual credit balance, interactive mini-games, game statistics, user reports, and an admin dashboard in one web application.
This project uses virtual credits only. It does not process real money and is intended for local development, demonstration, and resume presentation.

## Features
### User role

- Register and log in with a protected user session
- View and manage a virtual credit balance
- Play Wheel of Luck and Rock-Paper-Scissors
- View game history and personal game statistics
- Submit feedback or issue reports
- Access protected user pages through the shared navigation
### Admin role

- Access the admin dashboard through role-based route protection
- View platform and gameplay statistics
- Review report categories and recent activity
- View submitted user reports
- Monitor game usage and user activity summaries
## Project Structure

```text
backend/
  app/
    main.py          FastAPI application and API routes
    models.py        SQLAlchemy models and database setup
  requirements.txt   Python dependencies
  Dockerfile
frontend/
  app/               Next.js App Router pages
  components/        Shared navigation and route protection
  styles/            Page and component styles
  public/             Static images and assets
  package.json
  Dockerfile
docs/                  Architecture documentation
docker-compose.yml     Local PostgreSQL, FastAPI, and Next.js stack
.env.example           Safe environment variable template
README.md
```

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 19, JavaScript, Material UI |
| Backend | FastAPI, Python 3.11, SQLAlchemy, Pydantic |
| Database | PostgreSQL 16 |
| Development | Docker Compose, Uvicorn, Turbopack |

## Architecture

```text
Browser
  |
  v
Next.js frontend :3000  ---- REST/JSON ---->  FastAPI backend :8000
                                                   |
                                                   v
                                         PostgreSQL virtual_arcade_db :5432
```

See [docs/system-architecture.md](docs/system-architecture.md) for the component and request-flow diagrams.

## Run With Docker

### Prerequisites

- Docker Desktop
- Docker Compose v2

Copy the environment template for local use:

```powershell
Copy-Item .env.example .env
```

Update the values in `.env` for your local environment. Never commit `.env` to GitHub.

Start the complete stack from the repository root:

```powershell
docker compose up --build
```

Or run it in the background:

```powershell
docker compose up -d --build
```

Open the application at:

- Frontend: <http://localhost:3000>
- Backend health endpoint: <http://localhost:8000/>
- Interactive API documentation: <http://localhost:8000/docs>

Stop the stack without deleting the PostgreSQL volume:

```powershell
docker compose down
```

## Local Development

Backend:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

The frontend development server runs at <http://localhost:3000> and the API runs at <http://localhost:8000>.

## Verification

Run frontend checks from `frontend/`:

```powershell
npm run lint
npm run build
```

Run backend syntax verification from `backend/`:

```powershell
python -m compileall -q app
```

For a full-stack smoke test, start Docker Compose and verify the frontend, backend health endpoint, login flow, credits workflow, both game routes, and the admin pages.

## Environment Variables

The root `.env.example` documents the local configuration:

- PostgreSQL connection settings
- Backend port and application name
- Local admin email and password
- Session secret placeholder
- Frontend API URL

Use placeholder values in `.env.example`. Put real local credentials only in `.env`, which is excluded by `.gitignore`.

## Portfolio Notes

This project demonstrates full-stack development across:

- Next.js App Router UI development
- FastAPI REST API design
- PostgreSQL persistence and relational data modeling
- User and admin role-based access control
- Virtual credit workflows and game state handling
- Admin analytics and report management
- Dockerized local development
- Technical architecture documentation

## Security and Scope

- This is an educational portfolio project using virtual credits only.
- Do not use real payment information or production credentials.
- Do not commit `.env`, database passwords, or secret keys.
- Replace all development credentials before any deployment.
- Production deployment would require hardened authentication, secure cookies, HTTPS, CSRF protection, server-side game validation, database migrations, and a managed secret store.
