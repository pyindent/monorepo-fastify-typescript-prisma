
# Node.js Monorepo Demo

## Overview
This project demonstrates a Node.js application built with Fastify, Prisma, and TypeScript, structured as a monorepo using Yarn Workspaces. It offers:

- JWT authentication
- User and post management
- File uploads
- Real-time notifications using WebSockets

---

## Why Monorepo?
A monorepo approach allows for a centralized repository where all packages and modules of the project are maintained. This structure provides several key benefits:

1. **Improved Code Sharing**: Shared modules and utilities can be easily reused across multiple services, reducing code duplication and improving consistency.
2. **Simplified Dependency Management**: Using tools like Yarn Workspaces, dependencies can be managed centrally, reducing version mismatches and maintenance overhead.
3. **Enhanced Collaboration**: Developers can work on interdependent packages without needing to navigate between multiple repositories.
4. **Streamlined Testing**: Running tests across packages in a monorepo ensures compatibility and simplifies debugging.
5. **Coordinated Releases**: Changes across interrelated modules can be tracked and released together, ensuring stability and synchronization.

---

## Architecture Overview

### Monorepo Structure
The application is organized into a well-structured monorepo, facilitating scalability and maintainability through separate packages:

- **api**:
  - Contains the Fastify application.
  - Implements HTTP routes for user and post management.
  - Manages WebSocket connections.
- **services**:
  - Encapsulates business logic.
  - Handles database integration with Prisma.
  - Manages entities like User and Post.
- **utilities**:
  - Provides shared utility functions like password hashing and email validation.
  - Ensures reusability across `api` and `services`.

### How Packages Interact
- **API → Services**:
  - Example: The `/signup` route in `api` calls `UserService.signup` in `services` for user creation.
- **Services → Utilities**:
  - Example: Passwords are hashed in `utilities` (`hashPassword`) and consumed by `services`.
- **Shared Configurations**:
  - Environment variables like `JWT_SECRET` ensure consistent behavior across packages.

### Database
- **PostgreSQL**: A managed database accessed through Prisma.
- **Schema**:
  - Includes `UserFastify` and `PostFastify` models.
  - Enforces constraints for data integrity (e.g., password length, email format).

### Deployment Architecture
The application is deployed on AWS, ensuring high availability, scalability, and performance:

- **ECR (Elastic Container Registry)**:
  - Stores Docker images for the application.
- **ECS (Elastic Container Service)**:
  - Orchestrates containerized deployments with automatic scaling and health checks.
- **ALB (Application Load Balancer)**:
  - Balances incoming traffic between ECS tasks.
- **CloudFront**:
  - Serves static assets and API responses globally.
  - Ensures low latency and high availability.

**Live Deployment**:

- API: [https://d3mzz2lkm6w1h4.cloudfront.net](https://d3mzz2lkm6w1h4.cloudfront.net)
- Swagger Documentation: [https://d3mzz2lkm6w1h4.cloudfront.net/documentation](https://d3mzz2lkm6w1h4.cloudfront.net/documentation)

---

## Execution Instructions

### Local Setup

1. **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2. **Install Dependencies**:
    ```bash
    yarn install
    ```

3. **Configure Environment Variables**:
    ```bash
    cp .env.example .env
    ```

### Run the Application

#### Development:
```bash
yarn dev
```

#### Production:
```bash
yarn build
yarn start
```

#### Production with Docker

- **Build the Docker Image**:
    ```bash
    yarn docker:build:prod
    ```
- **Run the Docker Container**:
    ```bash
    yarn docker:run:prod
    ```

---

## Testing

- **Run All Tests**:
    ```bash
    yarn test
    ```

- **Package-Specific Tests**:
  - **Utilities**:
      ```bash
      yarn test:utilities
      ```
  - **Services**:
      ```bash
      yarn test:services
      ```
  - **API**:
      ```bash
      yarn test:api
      ```

---

## Real-Time Notifications

### Overview
The `/notifications` endpoint enables real-time notifications using WebSocket technology.

### Connect to the WebSocket
- **WebSocket URL**: `wss://d3mzz2lkm6w1h4.cloudfront.net/ws/notifications`

#### Example to Listen for Events in the Terminal

1. **Install `wscat`**:
    ```bash
    npm install -g wscat
    ```

2. **Connect to the WebSocket**:
    ```bash
    wscat -c wss://d3mzz2lkm6w1h4.cloudfront.net/ws/notifications
    ```

---

## Postman Collection
A Postman collection is available in the project root: `Node Monorepo Demo.postman_collection.json`. Import this collection into Postman for seamless API interaction.

---

## Demonstrating Package Interdependencies

### Examples of Interdependencies

1. **Shared Utilities**:
   - Updating `hashPassword` in `utilities` automatically reflects in `services` (e.g., `UserService`) and `api` (e.g., `/signup`).

2. **Schema Updates**:
   - Changes to Prisma schemas in `services` affect the `api`, requiring route and documentation updates.

---

## Final Considerations

### Achievements

1. **Infrastructure**:
   - Deployed on AWS with robust container orchestration using ECS and content delivery via CloudFront.
2. **Validation**:
   - Advanced schema validation with detailed error handling.
3. **Scalability**:
   - Modular architecture designed for extensibility.

For questions or suggestions, feel free to reach out!
