# 🚀 Project Plan - Content Scheduler

A full-stack web application designed for social media content scheduling and collaboration, inspired by tools like Planable.io. This project features a Next.js frontend, a Spring Boot backend, and a PostgreSQL database, all containerized with Docker.

---

## ✨ Features

* **User Authentication:** Secure sign-in and session management using Next-Auth.
* **Content Feed:** A central dashboard to view and manage content posts.
* **Approval Workflow:** A status system for posts (e.g., Draft, Approved, Rejected).
* **Decoupled Architecture:** A modern, scalable setup with a React-based frontend and a Java-based backend API.
* **Containerized Environment:** Easily run the entire stack with a single Docker Compose command.

---

## 🛠️ Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (React) & [Tailwind CSS](https://tailwindcss.com/)
* **Backend:** [Spring Boot](https://spring.io/projects/spring-boot) (Java) & [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **Authentication:** [Next-Auth](https://next-auth.js.org/)
* **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* **ORM:** [Prisma](https://www.prisma.io/) (for Next-Auth) & [Hibernate](https://hibernate.org/) (for Spring Boot)

---

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

* [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
* [Node.js](https://nodejs.org/en/) v18 or newer (for local development, if needed).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/RyanVincent99/project-plan.git](https://github.com/RyanVincent99/project-plan.git)
    cd project-plan
    ```

2.  **Create the environment file:**
    Create a new file named `.env` in the root of the project and paste the following content. You will need to fill in the credentials.

    ```.env
    # Database Credentials
    POSTGRES_USER=your_db_user
    POSTGRES_PASSWORD=your_db_password
    POSTGRES_DB=project_plan
    DATABASE_URL="postgresql://your_db_user:your_db_password@db:5432/project_plan"

    # NextAuth Secret (generate a random string)
    # You can generate one here: [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
    NEXTAUTH_SECRET="your_secret_key_here"

    # Google Provider for NextAuth
    # Get these from your Google Cloud Console
    GOOGLE_CLIENT_ID="your-google-client-id-goes-here"
    GOOGLE_CLIENT_SECRET="your-google-client-secret-goes-here"
    ```

3.  **Build and Run the Application:**
    Run the following command in your terminal. This will build the Docker images for the frontend and backend, and start all three containers.

    ```bash
    docker-compose up --build
    ```

4.  **Open the Application:**
    Once the build is complete and the containers are running, open your web browser and go to:
    **`http://localhost:3000`**

---

## 📂 Project Structure

```
project-plan/
├── backend/            # Spring Boot Backend Service
├── components/         # React Components for the Frontend
├── lib/                # Shared utility files (Prisma Client)
├── pages/              # Next.js pages and API routes
├── prisma/             # Prisma schema and migrations for auth
├── styles/             # Global CSS and Tailwind styles
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Dockerfile for the Next.js Frontend
└── ...
```