# Troubleshooting Log: Registration Failure & Networking Issues

## The Issue
When attempting to register a new user in the frontend, the UI displayed **"Registration failed. Please try again."** after two clicks.

### Symptoms
- **Browser Console**: Showed `net::ERR_FAILED` and `CORS policy` blocks.
- **Backend Terminal**: Showed no activity or logs whatsoever, even though the server was running.
- **Intermittency**: The error only appeared on the second click of the "Sign Up" button.

---

## Investigation Steps
1.  **Database Check**: Verified that PostgreSQL was running and the `users` table was correctly created and empty.
2.  **Code Check**: Verified that the backend logic was correct and password hashing was functional.
3.  **Port Scan**: Discovered that while the browser could "see" the backend at `http://localhost:8000`, complex POST requests (like Registration) were being silently dropped before reaching the application.

---

## Root Causes

### 1. Windows Port 8000 Conflict
Port `8000` is a very common port used by many background services (Windows system services, other dev tools, etc.). On Windows, another service was "listening" on port 8000, which intercepted the complex data requests from Angular but allowed simple page views to pass through.

### 2. `localhost` vs `127.0.0.1` Confusion
On Windows 10/11, `localhost` can resolve to two different addresses:
- `127.0.0.1` (IPv4)
- `::1` (IPv6)

FastAPI was listening on the IPv4 address, but the browser was sometimes trying to send the security "preflight" (handshake) through the IPv6 route. This led to the "Silent" terminal where no logs appeared because the request never actually reached the FastAPI server.

---

## The Solution

To provide a "clean lane" for communication, we made two changes:

1.  **Switched to Port 8080**: This avoids conflicts with common Windows services on port 8000.
2.  **Explicit IP Mapping**: Changed the Frontend `apiUrl` from `localhost` to `127.0.0.1`. This forces the browser to use a direct, reliable pathway to the backend.

### Verification
- **Logs**: Terminal now correctly prints `INFO: 127.0.0.1:XXXX - "POST /register HTTP/1.1" 200 OK`.
- **UI**: Registration succeeds on the first click and correctly navigates to the Login page.
