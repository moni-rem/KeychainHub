1.Backend Overall Architecture (Mermaid)

flowchart TD
Client[Frontend Apps] -->|HTTP Request| API[ExpressJS API]
API --> Middleware[Auth & Role Middleware]
Middleware --> Controller[Controllers]
Controller --> Service[Services]
Service --> Prisma[Prisma ORM]
Prisma --> DB[(PostgreSQL - Neon)]

2️⃣ Authentication Workflow (User & Admin – JWT)

sequenceDiagram
participant FE as Frontend
participant API as ExpressJS
participant DB as PostgreSQL

    FE->>API: POST /auth/login
    API->>DB: Find user by email
    DB-->>API: User data
    API->>API: Compare password (bcrypt)
    API->>API: Generate JWT
    API-->>FE: JWT Token

3️⃣ JWT Authorization Middleware Flow

flowchart TD
Request((Incoming Request))
Request --> CheckToken{JWT Exists?}
CheckToken -- No --> Reject[401 Unauthorized]
CheckToken -- Yes --> VerifyToken{Valid JWT?}
VerifyToken -- No --> Reject
VerifyToken -- Yes --> RoleCheck{Role Allowed?}
RoleCheck -- No --> Forbidden[403 Forbidden]
RoleCheck -- Yes --> Controller[Access Controller]

4️⃣ User Backend Workflow (Browse & Order)

flowchart TD
UserReq((User Request))
UserReq --> Auth[Verify JWT]

    Auth -->|Browse Products| ProductCtrl[Product Controller]
    ProductCtrl --> Prisma
    Prisma --> DB[(Database)]

    Auth -->|Create Order| OrderCtrl[Order Controller]
    OrderCtrl --> Prisma
    Prisma --> DB

5️⃣ Admin Backend Workflow (Dashboard)

flowchart TD
AdminReq((Admin Request))
AdminReq --> Auth[Verify JWT]
Auth --> Valid{Token Valid?}
Valid -- No --> Deny[401 Unauthorized]
Valid -- Yes --> Role{Admin Role?}
Role -- No --> Deny[403 Forbidden]
Role -- Yes --> AdminCtrl[Admin Controller]
AdminCtrl --> Prisma
Prisma --> DB[(Database)]

6️⃣ Product Management Flow (Admin Only)
sequenceDiagram
participant Admin
participant API
participant DB

    Admin->>API: POST /products
    API->>API: Verify JWT + Role
    API->>DB: Insert product
    DB-->>API: Success
    API-->>Admin: Product created

7️⃣ Order Creation Flow (User)

sequenceDiagram
participant User
participant API
participant DB

    User->>API: POST /orders
    API->>API: Verify JWT
    API->>DB: Check product stock
    DB-->>API: Stock available?
    API->>DB: Create order
    API->>DB: Reduce stock
    DB-->>API: Order saved
    API-->>User: Order confirmation

8️⃣ Prisma ORM Data Flow
flowchart LR
Controller --> PrismaClient
PrismaClient --> Query[SQL Query]
Query --> NeonDB[(Neon PostgreSQL)]
NeonDB --> PrismaClient
PrismaClient --> Controller

9️⃣ Backend Folder Structure Diagram
flowchart TB
src --> routes
src --> controllers
src --> services
src --> middlewares
src --> utils
src --> prisma

    routes --> controllers
    controllers --> services
    services --> prisma

///

# Keychain Shop Backend

E-commerce backend API for selling keychains, built with Express.js, Prisma ORM, and PostgreSQL.

## Features

- 🔐 User authentication (JWT)
- 👥 User & Admin roles
- 🛍️ Product management with categories
- 🛒 Shopping cart functionality
- 📦 Order processing system
- 💳 Payment integration (simulated)
- 📧 Email notifications
- 📊 Admin dashboard with analytics
- 📁 File upload for product images
- ⚡ Rate limiting and security

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: Zod & express-validator
- **File Upload**: Multer
- **Logging**: Winston & Morgan
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

backend/
├── src/
│ ├── config/ # Configuration files
│ ├── prisma/ # Database schema and migrations
│ ├── middleware/ # Express middleware
│ ├── controllers/ # Route controllers
│ ├── routes/ # API routes
│ ├── services/ # Business logic
│ ├── utils/ # Utility functions
│ ├── validators/ # Validation schemas
│ ├── app.js # Express app setup
│ └── server.js # Server entry point
├── uploads/ # Uploaded files
├── logs/ # Application logs
├── .env # Environment variables
├── package.json # Dependencies
└── README.md # Documentation
