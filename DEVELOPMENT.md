# Development Log - Personal Life Tracker

## [2026-03-09] Project Initialization

### 1. Planning and Approval
- Created `implementation_plan.md` and `task.md`.
- User approved the plan with the following additional requirements:
    - Documentation for every step in an MD file.
    - Strict separation of `frontend` and `backend` folders.

### 2. Project Structure Setup
- Root directory structure:
  ```
  /backend
  /frontend
  DEVELOPMENT.md
  ```

## PostgreSQL Installation Guide (Windows)

Since you don't have PostgreSQL yet, follow these steps:

1. **Download the Installer**:
   - Go to the [PostgreSQL Downloads page](https://www.postgresql.org/download/windows/).
   - Click "Download the Installer" (provided by EDB).
   - Choose the latest version (e.g., 16 or 17) for Windows x86-64.

2. **Run the Installer**:
   - Follow the wizard. Keep the default install directory.
   - **Select Components**: Keep all selected (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools).
   - **Password**: Set a password for the database superuser (`postgres`). **Memorize this password**, you will need it for the `.env` file.
   - **Port**: Keep the default `5432`.
   - **Locale**: Keep "Default locale".

3. **Create the Database**:
   - Open **pgAdmin 4** (installed with PostgreSQL).
   - Expand `Servers` > `PostgreSQL [version]` (it will ask for the password you set).
   - Right-click `Databases` > `Create` > `Database...`.
   - Name it `life_tracker` and click Save.

4. **Update Project Configuration**:
   - Open `backend/.env`.
   - Update the `DATABASE_URL` with your password:
     `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/life_tracker`

### 3. Backend Initialization (FastAPI)
- [x] Created `backend` directory.
- [x] Setting up Python Virtual Environment (`venv`).
- [x] Initializing dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, etc.
- [x] Created `backend/main.py` with CORS and database initialization.
- [x] Setting up `backend/database.py` and SQLAlchemy models.
- [x] Created `backend/schemas.py` for validation.
- [x] Implemented JWT authentication and Task CRUD routes in `backend/main.py` and `backend/auth.py`.

### 4. Frontend Initialization (Angular)
- [x] Initializing Angular project in `frontend` folder.
- [x] Integrating Tailwind CSS into Angular.
- [x] Creating Angular services for Auth and Tasks (`AuthService`, `TaskService`).
- [x] Configuring Angular routes.
- [x] Building UI components (Login, Register).
- [x] Building Dashboard and Task management UI with Chart.js.

### 5. Final Setup and Verification
- [x] Implemented environment variables configuration in `backend/.env` and `backend/config.py`.
- [x] Configured PostgreSQL connection to use external settings.
- [x] Fixed backend `ImportError` by switching to absolute imports.
- [x] Installed `email-validator` explicitly in backend venv.
- [x] Fixed Angular root component naming mismatch in `main.ts`.
- [x] Downgraded Frontend Tailwind to v3 for better stability with the Angular builder.
- [x] Verified both Backend and Frontend are running correctly.

## Troubleshooting and Bug Fixes (Technical Retrospective)

During the setup and initialization, we encountered several technical hurdles. Here is a detailed breakdown of what happened and how we fixed it:

### 1. Backend: Relative Import Errors
- **Issue**: Python raised `ImportError: attempted relative import with no known parent package`.
- **Cause**: The backend code was using relative imports (e.g., `from . import models`). When running `uvicorn main:app`, Python treats `main.py` as a top-level script, which doesn't allow relative imports starting from the current directory.
- **Fix**: Switched all imports to **Absolute Imports** (e.g., `import models` instead of `from . import models`). This allows the script to be executed as a standalone module by the Uvicorn server.

### 2. Backend: Missing `email-validator`
- **Issue**: `ModuleNotFoundError: No module named 'email_validator'` during Pydantic schema initialization.
- **Cause**: The `EmailStr` type in Pydantic requires the `email-validator` package to be explicitly installed. While it's an optional dependency of Pydantic, it's mandatory if you use `EmailStr`.
- **Fix**: Installed it via `pip install "pydantic[email]"`.

### 3. Frontend: Angular Root Component Mismatch
- **Issue**: `X [ERROR] TS2305: Module '"./app/app"' has no exported member 'App'`.
- **Cause**: The `main.ts` file was trying to import a component named `App` from `app.ts`, but the actual class exported in `app.ts` was `AppComponent`.
- **Fix**: Renamed the import and bootstrap call in `main.ts` (and the test in `app.spec.ts`) to correctly reference `AppComponent`.

### 4. Frontend: Tailwind CSS Version conflict
- **Issue**: Build errors related to CSS processing and directive errors.
- **Cause**: Tailwind CSS v4 introduces significant changes (like moving config into CSS via `@import "tailwindcss"`) that are still in early stages for some Angular build pipelines. This was causing "Unknown at-rule" warnings and build failures.
- **Fix**: **Downgraded to Tailwind v3.4.15**. This version is the industry standard for stability with Angular 18/19/20+, and uses the proven `tailwind.config.js` and `@tailwind` directive system.

### 5. Backend: Bcrypt 72-byte Limit
- **Issue**: `ValueError: password cannot be longer than 72 bytes`.
- **Cause**: Bcrypt hashing algorithm has a strict 72-character limit. If a password exceeds this, some implementations crash.
- **Fix**: Added `max_length=71` validation to schemas and automatic truncation in `auth.py`.

### 7. Backend: Passlib and Bcrypt Version Conflict
- **Issue**: `AttributeError: module 'bcrypt' has no attribute '__about__'` and `ValueError: password cannot be longer than 72 bytes`.
- **Cause**: The `passlib` library (v1.7.4) is not fully compatible with the internal changes in newer `bcrypt` versions (4.0+). The `__about__` attribute was removed, and some byte-length checks became stricter.
- **Fix**: Forced the installation of `bcrypt==4.0.1` (or a compatible stable version) to restore functionality for the `passlib` hashing context.

# 2. Activate the virtual environment
.\venv\Scripts\activate
# 3. Start the FastAPI server on port 8080
uvicorn main:app --reload --port 8080