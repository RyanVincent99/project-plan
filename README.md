# 🗓️ Project Plan

A full-stack repo for building a **content planner**, featuring a **Next.js frontend**, **Spring Boot backend**, and **PostgreSQL** database — all running seamlessly with **Docker Compose**.

---

## 🚀 Tech Stack

| Layer | Technology | Description |
|--------|-------------|--------------|
| **Frontend** | [Next.js 14](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/) | Modern React framework with hot reload, TailwindCSS, and API integration |
| **Backend** | [Spring Boot 3](https://spring.io/projects/spring-boot) | REST API with CORS enabled, using JPA for database interaction |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Stores posts and related content |
| **Containerization** | [Docker Compose](https://docs.docker.com/compose/) | One command to build and run everything |

---

## ⚙️ Features

- 🧩 Modular setup (frontend, backend, database)
- 🔁 Hot reload for frontend and backend during development
- 📡 REST API for posts (`/api/posts`)
- 🧠 Simple “Add New Post” form in the web UI
- 💾 Persistent PostgreSQL volume storage

---

## 🧱 Project Structure

```
projectplan-clone/
├── backend/                 # Spring Boot API server
│   ├── src/main/java/com/example/projectplanclone/
│   │   ├── controller/      # REST controllers
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Spring Data Repos
│   │   └── config/          # Config classes (e.g. CORS)
│   └── src/main/resources/
│       └── application.yml
│
├── frontend/                # Next.js client app
│   ├── src/app/             # Main pages and components
│   └── public/
│
├── docker-compose.yml       # Container orchestration
└── README.md
```

---

## 🧰 Prerequisites

Before running locally, ensure you have:

- 🐋 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 🧑‍💻 [Git](https://git-scm.com/)
- (Optional) [Node.js 20+](https://nodejs.org/) and [Java 21+](https://adoptium.net/) for manual builds

---

## ▶️ How to Run

### 🔹 Option 1: Run with Docker (recommended)

```bash
docker-compose up --build
```

Then open:

- **Frontend:** http://localhost:3000  
- **Backend:** http://localhost:8080  
- **Database:** localhost:5432 (`user=postgres`, `password=postgres`)

---

### 🔹 Option 2: Run manually (without Docker)

1. **Backend:**

```bash
cd backend
./mvnw spring-boot:run
```

2. **Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/api/posts` | Get all posts |
| `POST` | `/api/posts` | Create a new post |

Example request:

```bash
curl -X POST http://localhost:8080/api/posts      -H "Content-Type: application/json"      -d '{"platform": "twitter", "content": "Hello world!", "status": "draft"}'
```

---

## 🧩 Environment Variables

| Service | File | Key | Example |
|----------|------|-----|----------|
| **Frontend** | `.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` |
| **Backend** | `application.yml` | `spring.datasource.url` | `jdbc:postgresql://db:5432/projectplan` |

---

## 💾 Persistent Data

PostgreSQL data is stored in a Docker volume:  
```
projectplan_pgdata
```

To view your database content:
```bash
docker exec -it projectplan-db psql -U postgres -d projectplan
```

---

## 🧑‍💻 Development Notes

- Backend code changes trigger auto-rebuild (Spring DevTools or volume mapping)
- Frontend changes hot-reload automatically in the browser
- CORS is configured in `WebConfig.java` to allow frontend access

---

## 🧹 Common Issues

| Problem | Cause | Solution |
|----------|--------|-----------|
| `Failed to fetch` | CORS issue | Check `WebConfig.java` for allowed origins |
| `ERR_NAME_NOT_RESOLVED` | Using wrong API URL | Ensure `NEXT_PUBLIC_API_URL` matches backend container name or localhost |
| DB not persisting | Missing volume | Check Docker volume `projectplan_pgdata` |

---
