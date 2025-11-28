# 🚀 Project Plan - Content Scheduler

A full-stack web application designed for social media content scheduling and collaboration, inspired by tools like Planable.io. This project features a Next.js frontend, a Spring Boot backend, a standalone authentication service, and two PostgreSQL databases, all containerized with Docker.

---

## ✨ Features

*   **Workspace & Team Collaboration:**
    *   Create, rename, and switch between multiple workspaces.
    *   Invite team members to workspaces via email.
    *   Role-based access control with three permission levels: Administrator, Publisher, and User.
    *   Securely manage workspace members and their roles.

*   **Content Creation & Scheduling:**
    *   Craft social media posts with a simple and intuitive interface.
    *   Target multiple social media channels with a single post.
    *   Schedule posts for a specific date and time, or publish them instantly.
    *   Leave comments on posts for internal team feedback and discussion.

*   **Approval Workflow:**
    *   A clear status system for posts (e.g., Draft, Pending Approval, Approved, Scheduled, Published).
    *   Publishers and Administrators can approve or reject posts, ensuring content quality.

*   **Channel Management:**
    *   Connect social media accounts like LinkedIn via a secure OAuth2 flow.
    *   View and manage all connected channels from a central settings page.

*   **Multiple Content Views:**
    *   **Feed View:** A chronological list of all your active posts.
    *   **Calendar View:** A visual overview of your scheduled content.
    *   **Archive:** Keep your feed clean by archiving published posts.

*   **Secure & Modern Stack:**
    *   Secure user authentication and session management using a standalone Spring Boot authentication service.
    *   Decoupled architecture with a Next.js frontend, a Spring Boot backend API, and a standalone authentication service.
    *   Fully containerized with Docker for easy setup and deployment.

---

## 🛠️ Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (React) & [Tailwind CSS](https://tailwindcss.com/)
* **Backend:** [Spring Boot](https://spring.io/projects/spring-boot) (Java) & [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
* **Authentication:** Standalone Spring Boot service with JWT
* **Database:** [PostgreSQL](https://www.postgresql.org/) (x2)
* **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* **ORM:** [Hibernate](https://hibernate.org/) (for Spring Boot)

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

2.  **Create the environment files:**

    *   **Root `.env` file:**
        Create a new file named `.env` in the root of the project and paste the following content:

        ```.env
        # Database Credentials
        POSTGRES_USER=your_db_user
        POSTGRES_PASSWORD=your_db_password
        POSTGRES_DB=project_plan
        DATABASE_URL="postgresql://your_db_user:your_db_password@db:5432/project_plan"
        ```

    *   **Standalone Auth System `.env` file:**
        Create a new file named `.env` in the `Standalone-auth-system-main` directory and paste the following content:

        ```.env
        # Database Credentials
        SPRING_DATASOURCE_URL=jdbc:postgresql://auth-db:5432/idp_db
        SPRING_DATASOURCE_USERNAME=postgres
        SPRING_DATASOURCE_PASSWORD=password

        # Email Credentials
        MAIL_USERNAME=your-email@gmail.com
        MAIL_PASSWORD=your-email-password

        # Google Provider for User Login
        GOOGLE_CLIENT_ID="your-google-client-id"
        GOOGLE_CLIENT_SECRET="your-google-client-secret"

        # LinkedIn Provider for Backend (Content Publishing)
        LINKEDIN_CLIENT_ID="your-linkedin-client-id"
        LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
        LINKEDIN_REDIRECT_URI="http://localhost:8081/linkedin/callback"
        LINKEDIN_TOKEN_URI="https://www.linkedin.com/oauth/v2/accessToken"
        LINKEDIN_USER_INFO_URI="https://api.linkedin.com/v2/userinfo"

        # Frontend URLs
        FRONTEND_REDIRECT_URL=http://localhost:3000/dashboard
        FRONTEND_LOGIN_WIDGET=http://localhost:3000/login
        ```

3.  **Set up OAuth Providers:**

    #### Google (for User Login)
    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project and go to "APIs & Services" > "Credentials".
    - Create an "OAuth client ID" for a "Web application".
    - Add `http://localhost:8081` to "Authorized JavaScript origins".
    - Add `http://localhost:8081/login/oauth2/code/google` to "Authorized redirect URIs".
    - Copy the Client ID and Client Secret into your `.env` file in the `Standalone-auth-system-main` directory.

    #### LinkedIn (for Content Publishing)
    - Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
    - Create a new app and under the "Auth" tab, add the redirect URI: `http://localhost:8081/linkedin/callback`.
    - Under "Products", request access to "Sign In with LinkedIn using OpenID Connect" and "Share on LinkedIn".
    - Once approved, get your credentials from the "Auth" tab and add them to your `.env` file in the `Standalone-auth-system-main` directory.

4.  **Build and Run the Application:**
    Run the following command in your terminal. This will build the Docker images for the frontend, backend, and auth service, and start all containers.

    ```bash
    docker-compose up --build
    ```

5.  **Open the Application:**
    Once the build is complete and the containers are running, open your web browser and go to:
    **`http://localhost:3000`**

---

## 📂 Project Structure

```
project-plan/
├── backend/                  # Spring Boot Backend Service
├── Standalone-auth-system-main/ # Standalone Spring Boot Authentication Service
├── components/               # React Components for the Frontend
├── pages/                    # Next.js pages and API routes
├── styles/                   # Global CSS and Tailwind styles
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Dockerfile for the Next.js Frontend
└── ...
```