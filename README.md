# Vactrip (Traveloop)

Full-stack personalized travel planning: **React + Vite** client and a **Node.js + Express + MySQL** API. This README focuses on the backend; the `client/` folder is the production UI.

A travel planning **REST API** built for a hackathon. It powers personalized trips with **Node.js**, **Express**, **MySQL**, **Sequelize ORM**, and **JWT**-based authentication.

Traveloop is meant to grow into a full platform: flexible itineraries, budgets, and community sharing. This repository currently focuses on a solid **backend foundation** and catalogue data for cities and activities.

---

## Project description

The Traveloop backend provides:

- **Authentication** — register (with optional profile photo via **Multer**), login, password hashing with **bcrypt**, and **JWT** tokens  
- **Cities & activities APIs** — browse destinations and things to do, with filters for search, region, cost, type, and more  
- **Trip planning data layer** — Sequelize models and associations for trips, stops, expenses, notes, checklists, and saved destinations (ready for additional route modules)  
- **Expense tracking** — schema support via the `expenses` model (API routes can be extended on top)  
- **JWT security** — stateless auth; protected routes verify `Authorization: Bearer <token>`  
- **Sequelize ORM** — schema as code, relationships, and optional seed scripts for cities/activities  

---

## Tech stack

| Layer        | Technology        |
|-------------|-------------------|
| Runtime     | **Node.js**       |
| Framework   | **Express.js**    |
| Database    | **MySQL**         |
| ORM         | **Sequelize**     |
| Auth tokens | **jsonwebtoken**  |
| Passwords   | **bcrypt**        |
| File uploads| **multer**        |

---

## Folder structure (backend)

```
server/
├── config/
│   └── db.js              # Sequelize + MySQL connection
├── controllers/
│   ├── authController.js
│   ├── cityController.js
│   └── activityController.js
├── middleware/
│   ├── auth.js            # JWT verification
│   └── adminGuard.js      # Admin-only routes
├── models/
│   ├── index.js           # Models + associations
│   ├── User.js
│   ├── City.js
│   ├── Activity.js
│   ├── Trip.js
│   ├── Stop.js
│   ├── StopActivity.js
│   ├── Expense.js
│   ├── ChecklistItem.js
│   ├── TripNote.js
│   └── SavedDestination.js
├── routes/
│   ├── authRoutes.js
│   ├── cityRoutes.js
│   └── activityRoutes.js
├── seeders/
│   ├── citiesData.js
│   ├── activitiesData.js
│   └── seed.js
├── uploads/
│   └── .gitkeep           # Keeps uploads directory in Git (actual files ignored)
├── index.js               # Express app entrypoint
├── package.json
├── package-lock.json      # Commit this — do not gitignore
└── .env                   # Local only — create from samples below (not committed)

client/                    # Frontend scaffold / future React app (if present at repo root)
```

---

## Prerequisites

- **Node.js** (LTS recommended)  
- **MySQL** server running locally or remotely  

---

## Installation

From the **`server`** directory:

```bash
cd server
npm install
```

Start the API in development (with reload if you use `nodemon`):

```bash
npm run dev
```

Default port is **`5000`** unless you override `PORT` in `.env`.

---

## Environment variables

Create **`server/.env`** (never commit it). Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=traveloop
JWT_SECRET=your_secret
```

- **`JWT_SECRET`** — long random string in production  
- **`DB_*`** — must match your MySQL credentials and database name  

Optional (if you seed from the CLI):

Ensure `.env` is present before running **`npm run seed`** (defined in `server/package.json`), so Sequelize can connect.

---

## Seed data

From **`server`**:

```bash
npm run seed
```

Loads catalogue **cities** and **activities** (development convenience; backup shared databases first).

---

## API endpoints

Base URL for local development: **`http://localhost:5000`**

### Authentication

| Method | Path               | Description |
|--------|--------------------|-------------|
| `POST` | `/api/auth/register` | Multipart signup (`name`, `email`, `password`, optional `photo`, `phone`, `city`, `country`) |
| `POST` | `/api/auth/login`    | JSON `{ "email", "password" }` → returns JWT + user summary |

Protected routes expect:

```http
Authorization: Bearer <your_jwt_token>
```

---

### Cities

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/cities` | List cities (`?search=`, `?region=`, `?cost=budget|mid|premium`) |
| `GET`  | `/api/cities/:id` | Single city (full detail) |
| `GET`  | `/api/cities/:id/activities` | Activities in that city (`?type=` optional) |

---

### Activities

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/activities` | All activities (`?type=`, `?city=`, `?maxCost=`) |

---

## Database tables (major)

Logical tables modeled with Sequelize:

- **`users`** — accounts, roles, optional profile metadata  
- **`cities`** — destination catalogue  
- **`activities`** — things to do, linked to cities  
- **`trips`** — user trips  
- **`stops`** — ordered legs of a trip (per city/date range)  
- **`stop_activities`** — planned activities attached to stops  
- **`expenses`** — trip budgets / line items  
- **`checklist_items`** — packing list rows per user  
- **`trip_notes`** — notes scoped to trips (optional stop link)  
- **`saved_destinations`** — bookmarked cities per user  

---

## Features implemented

- ✅ Authentication (register / login, bcrypt, optional photo upload)  
- ✅ JWT security (signing, Bearer middleware, admin guard scaffold)  
- ✅ Sequelize ORM (models + associations + MySQL dialect)  
- ✅ Seed data (cities & activities catalogue)  
- ✅ Cities APIs (list, detail, city-scoped activities)  
- ✅ Activities APIs (globally query with filters & city join)  
- ✅ Data models for trips, stops, expenses, notes, checklist, saved destinations  

---

## Future scope

- Community trips feed and discovery  
- PDF export of itineraries  
- AI-assisted recommendations  
- Richer **public itinerary** sharing & permissions  

---

## Team collaboration notes

- **Frontend developers** should point `fetch` / Axios / Vite proxies at **`http://localhost:5000/api`** (or your deployed host).  
- **JWT** — any protected resource must send `Authorization: Bearer <token>` after login.  
- Shared **environment** — coordinate `DB_*` and `JWT_SECRET` via secure channels, not Slack screenshots.  

---

## Author

**Jaydev Prajapati**

---

## GitHub push guide (terminal)

Run these from your **project root** (adjust `REPO_URL` to your GitHub HTTPS or SSH URL). Lines starting with `#` are comments.

```bash
# Create an empty Git repository in the current folder (skip if `.git` already exists)
git init

# Stage every tracked file respecting .gitignore
git add .

# Save a snapshot with a descriptive message
git commit -m "Initial commit: Traveloop backend scaffold and APIs"

# Ensure your default branch matches GitHub (main)
git branch -M main

# Link this folder to GitHub once (replace with your repo URL)
git remote add origin REPO_URL

# Upload main to GitHub and remember the upstream for future pushes
git push -u origin main
```

If `origin` already exists, use **`git remote set-url origin REPO_URL`** instead of **`git remote add`**.

---

Happy hacking ✈️
