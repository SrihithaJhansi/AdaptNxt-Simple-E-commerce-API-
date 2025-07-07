# 🛒 AdaptNxt Simple E-commerce App

This is a full-stack e-commerce application built for the AdaptNxt Internship assignment. It includes user registration, login, role-based access (admin/customer), product management, shopping cart functionality, and order placement.

## 🎥 Screen Recording

▶️ https://drive.google.com/file/d/1MJMPNHfBMRPAN_s8uXkmz06amOt8UfAb/view?usp=sharing
---

## ✨ Features

### 👥 Authentication
- JWT-based login & registration
- Role-based system: **Admin** and **Customer**

### 🛍️ Product Management
- Admins can add/view all products
- Customers can browse and search products

### 🛒 Cart
- Customers can add products to cart
- View and clear cart

### 📦 Orders
- Customers can place orders with shipping info
- Admins can view and update order statuses

---

## 💻 Tech Stack

| Layer        | Technology                                |
|--------------|--------------------------------------------|
| Frontend     | HTML, CSS, JavaScript                      |
| Backend      | Node.js, Express.js                        |
| Database     | MongoDB, Mongoose                          |
| Auth         | JWT, bcrypt                                |
| Validation   | express-validator                          |
| Tools        | Postman, VS Code, dotenv, nodemon          |

---

## 🗂️ Project Structure

AdaptNxt-Simple-E-commerce-API/
├── controllers/
├── models/
├── middleware/
├── routes/
├── public/
├── .env.example
├── server.js
└── README.md

yaml
Copy
Edit

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SrihithaJhansi/AdaptNxt-Simple-E-commerce-API-.git
cd AdaptNxt-Simple-E-commerce-API-
2️⃣ Install Dependencies
bash
Copy
Edit
npm install
3️⃣ Configure Environment Variables
Create a .env file in the root and add:

env
Copy
Edit
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
NODE_ENV=development
You can also copy the sample:

bash
Copy
Edit
cp .env.example .env
4️⃣ Run the Server
bash
Copy
Edit
npm start
Now open:
📎 http://localhost:5000
