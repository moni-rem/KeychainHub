KeychainHub

A full-stack e-commerce web application for selling custom keychains online.
KeychainHub provides a seamless shopping experience for users and a powerful admin dashboard for store management.

KeychainHub is built to simulate a real-world online store.
It includes authentication, product management, cart functionality, order processing, and an analytics dashboard.

This project demonstrates:
Full-stack development
RESTful API design
Authentication & authorization
Admin management system
Modern UI/UX design

Features

👤 User Features
Register & Login (JWT Authentication)
Browse products
Search & filter products
View product details
Add to cart
Place orders

🛠️ Admin Features
Admin dashboard with statistics
Add / Update / Delete products
Manage users
View and manage orders
Sales analytics & charts

Tech Stack

Frontend
React.js
Tailwind CSS
Axios
React Router
Framer Motion

Backend
Node.js
Express.js
Prisma ORM
PostgreSQL
JWT Authentication
REST API Architecture

Installation & Setup

Clone Repository
git clone https://github.com/YOUR_USERNAME/KeychainHub.git
cd KeychainHub

backend setup
cd backend
npm install

frontend setup
cd frontend
npm install

admin setup
cd frontend-admin
npm install

create .env file
DATABASE_URL="your_database_url"
JWT_SECRET="your_secret_key"
PORT=5000

run prisma migration
npx prisma migrate dev

start server
npm start

This project is licensed under the MIT License.

Base URL: http://localhost:5001

Public

GET /
GET /api/test
GET /api/health
GET /api/debug
GET /api/check-auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
User Protected (Bearer token)

GET /api/auth/profile
GET /api/products
GET /api/products/featured
GET /api/products/category/:category
GET /api/products/:id
PUT /api/products/:id
DELETE /api/products/:id
GET /api/cart
GET /api/cart/count
POST /api/cart
POST /api/cart/merge
PUT /api/cart/:itemId
DELETE /api/cart/:itemId
DELETE /api/cart
POST /api/khqr/orders/generate_qrcode
POST /api/khqr/orders/:id/generate_qrcode
POST /api/khqr/orders/check_payment
POST /api/khqr/orders/:id/check_payment
Admin Protected (Bearer token + admin)

POST /api/auth/make-admin (now secured)
GET /api/auth/users
POST /api/admin/login (public login)
GET /api/admin/profile
POST /api/admin/logout
GET /api/admin/events
GET /api/admin/dashboard
GET /api/admin/users
GET /api/admin/users/:id
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
GET /api/admin/products
GET /api/admin/products/:id
POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id
GET /api/admin/orders
GET /api/admin/orders/stats
PUT /api/admin/orders/:id/status
GET /api/admin/system-stats
GET /api/admin/analytics
POST /api/admin/products/bulk-update
POST /api/admin/users/bulk-email
GET /api/admin/export
GET /api/admin/health
GET /api/users
GET /api/users/stats
GET /api/users/customers
GET /api/users/search
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
PUT /api/users/:id/role
POST /api/users/:id/reset-password
GET /api/users/:id/activity
