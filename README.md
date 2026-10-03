# 🛒 E-Commerce Management System

A full-stack e-commerce management application built with **React.js, Java Spring Boot, MongoDB, and Clerk**. The application provides secure authentication, product and category management, and RESTful API integration.

---

## 🚀 Features

- 🔐 Secure authentication with Clerk
- 📦 Product management
- 🗂️ Category management
- 🔄 RESTful APIs
- 🛡️ Spring Security & OAuth2
- 🍃 MongoDB database
- ⚛️ React.js frontend
- 📱 Responsive user interface
- ✅ Input validation and exception handling

---

<details>
<summary>📋 Application Functionality</summary>

### 👤 Authentication
- User registration and login using Clerk
- Secure session management
- Protected application features
- Authentication integrated with Spring Security

### 📦 Product Management
- Add new products
- View product details
- Update product information
- Delete products
- Manage pricing and inventory
- Organize products by category

### 🗂️ Category Management
- Create categories
- View categories
- Update category information
- Delete categories
- Associate products with categories

### 🔗 REST API
The backend provides RESTful APIs for communication between the React frontend and Spring Boot backend.

Example endpoints:

```text
GET     /api/products
GET     /api/products/{id}
POST    /api/products
PUT     /api/products/{id}
DELETE  /api/products/{id}

GET     /api/categories
POST    /api/categories
PUT     /api/categories/{id}
DELETE  /api/categories/{id}
