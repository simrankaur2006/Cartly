# EcommerceManagementSystem (Cartly)

A full-stack e-commerce management application. Customers browse products, manage a cart, place orders and track them. Admins manage products, categories, inventory and orders from a dashboard.

Authentication is handled by **Clerk**. The React app signs users in with Clerk and sends the Clerk session token to the Spring Boot API, which verifies it. No passwords are ever stored in MongoDB.

## Features

**Customer**: browse, search, filter and sort products, product details, cart (add / update / remove), checkout with demo payment, order history and details, cancel an order, profile.

**Admin**: dashboard (revenue, orders, products, customers, pending orders, low stock, 7 day sales chart), product CRUD, category CRUD, inventory updates, all orders with status updates, customer list.

## Technology stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, Axios, plain CSS |
| Backend | Java 17, Spring Boot 3.3, Spring Web, Spring Security (OAuth2 resource server), Spring Data MongoDB, Bean Validation, Lombok |
| Database | MongoDB (local or Atlas) |
| Auth | Clerk |

## Architecture

```
React (Clerk) -> Axios (Bearer token) -> Controller -> Service -> Repository -> MongoDB
```

- Spring Security validates the Clerk JWT using Clerk's public JWKS (`CLERK_ISSUER/.well-known/jwks.json`).
- The JWT `sub` claim is the Clerk user ID. Controllers always read the user from the security context, never from the request body, so a user can only touch their own cart, orders and profile.
- A user whose ID is in `ADMIN_CLERK_USER_IDS` receives `ROLE_ADMIN`.
- Order creation reads prices from the database and decrements stock atomically, so the client can not change prices or oversell.

## Folder structure

```
EcommerceManagementSystem/
  backend/
    pom.xml
    src/main/java/com/ecommerce/
      controller/  service/  repository/  model/  dto/  exception/  config/  security/
    src/main/resources/application.properties
  frontend/
    src/
      components/  pages/ (+ admin/)  layouts/  services/  context/  hooks/  utils/
      App.jsx  main.jsx  index.css
  README.md  .env.example  .gitignore
```

## Prerequisites

- Java 17+ and Maven 3.9+
- Node.js 18+ and npm
- MongoDB (local) or a MongoDB Atlas cluster
- A free Clerk account

## MongoDB setup

**Local**: install MongoDB Community Edition and start it (`mongod`). The default `mongodb://localhost:27017` works with no changes.

**Atlas**: create a free cluster, add a database user, allow your IP, and copy the connection string into `MONGODB_URI`.

Sample data (5 categories, 12 products) is inserted automatically on first start, only when the collections are empty.

## Clerk setup

1. Create an application at https://dashboard.clerk.com and enable Email sign-in.
2. Open **API Keys** and copy the **Publishable key** into `frontend/.env` as `VITE_CLERK_PUBLISHABLE_KEY`.
3. Copy your **Frontend API URL** (looks like `https://your-app-12.clerk.accounts.dev`) into `backend/.env` as `CLERK_ISSUER`.
4. Sign up once in the running app, then open **Users** in the Clerk dashboard and copy your user ID (`user_...`) into `ADMIN_CLERK_USER_IDS`. Restart the backend.

## Environment variables

Frontend (`frontend/.env`):

| Variable | Purpose |
|----------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_API_BASE_URL` | Backend URL, default `http://localhost:8080` |

Backend (`backend/.env`, loaded automatically, or set as real environment variables):

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Mongo connection string (default `mongodb://localhost:27017`) |
| `MONGODB_DATABASE` | Database name (default `ecommerce_db`) |
| `CLERK_ISSUER` | Clerk Frontend API URL |
| `ADMIN_CLERK_USER_IDS` | Comma separated admin Clerk user IDs |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins (default `http://localhost:5173`) |
| `LOW_STOCK_THRESHOLD` | Low stock limit (default 10) |

## How to run

Backend:

```bash
cd backend
cp .env.example .env      # then edit the values
mvn spring-boot:run
```

Frontend (new terminal):

```bash
cd frontend
cp .env.example .env      # then edit the values
npm install
npm run dev
```

Open http://localhost:5173. The API runs on http://localhost:8080.

## API overview

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/products?search=&category=&sort=&page=&size=` | Public |
| GET | `/api/products/{id}` | Public |
| POST / PUT / DELETE | `/api/products`, `/api/products/{id}` | Admin |
| GET | `/api/categories` | Public |
| POST / PUT / DELETE | `/api/categories`, `/api/categories/{id}` | Admin |
| GET / DELETE | `/api/cart` | User |
| POST | `/api/cart/items` | User |
| PUT / DELETE | `/api/cart/items/{productId}` | User |
| POST | `/api/orders` | User |
| GET | `/api/orders/my`, `/api/orders/{id}` | User (own orders; admin can view any) |
| PUT | `/api/orders/{id}/cancel` | User (own orders) |
| GET / PUT | `/api/profile` | User |
| GET | `/api/me` | User |
| GET | `/api/admin/dashboard`, `/api/admin/orders`, `/api/admin/customers`, `/api/admin/inventory` | Admin |
| PUT | `/api/admin/orders/{id}/status`, `/api/admin/inventory/{productId}` | Admin |

Errors are returned as JSON: `{ timestamp, status, error, message, fieldErrors }`.

## Admin configuration

Set `ADMIN_CLERK_USER_IDS=user_abc,user_def` in `backend/.env`. Those users see an **Admin** link in the navbar and can open `/admin`. Admin rights are enforced on the server, not just hidden in the UI.

## Screenshots

_Add screenshots here (home, product page, cart, admin dashboard)._

## Future improvements

- Real payment gateway (Stripe / Razorpay) instead of the demo payment
- Product image upload
- Email notifications on order status changes
- Reviews and ratings by customers
- Automated tests and Docker Compose setup
