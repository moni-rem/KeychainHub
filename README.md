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




