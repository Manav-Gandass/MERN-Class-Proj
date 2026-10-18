# ShopKart — Full-Stack E-Commerce Application

A complete MERN stack e-commerce web application featuring secure JWT authentication, dynamic product catalog, persistent wishlist, synchronized cart state, and Razorpay payment integration.

---

## 🚀 Key Features

* **Authentication (Labs 1 & 2):** Secure user registration & login with `bcrypt` password hashing and stateless JWT tokens stored in `HttpOnly` cookies.
* **Product Catalog (Lab 3):** Dynamic MongoDB-backed product listing, case-insensitive keyword search, category filtering, price sorting (`?sort=price_asc`), and detailed product view.
* **Wishlist (Lab 4):** Persistent wishlist using MongoDB `ObjectId` references and Mongoose `populate()`, with duplicate prevention (`409 Conflict`) and one-click toggle.
* **Shopping Cart (Lab 5):** Global cart state managed via React Context API (`CartContext`) with derived totals, live navbar counter, and server-side stock boundary validation.
* **Checkout & Orders (Lab 6):** Complete order lifecycle with server-side price recalculation, Razorpay Test Mode checkout, HMAC-SHA256 signature verification (`crypto.timingSafeEqual`), purchase snapshots, atomic inventory decrement, and protected order history.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, React Router DOM v7, Axios (`withCredentials: true`), Custom CSS.
* **Backend:** Node.js, Express.js (MVC architecture), Mongoose, MongoDB Atlas.
* **Security & Payments:** `jsonwebtoken`, `cookie-parser`, `bcrypt`, `razorpay`, `crypto`.

---

## 📁 Project Structure

```text
LAB-Project/
├── Client/           # React 19 + Vite frontend
│   ├── src/          # Components, pages (Auth, Products, Cart, Checkout, Orders), Context
│   └── package.json
└── Server/           # Express + MongoDB backend (MVC)
    ├── Controllers/  # Route handlers (Auth, Product, Wishlist, Cart, Order)
    ├── models/       # Mongoose schemas (Customer, Product, Order)
    ├── routes/       # API endpoints
    ├── middlewares/  # JWT auth middleware
    ├── .env.example  # Template for environment variables
    └── package.json
```

---

## ⚙️ Setup & Installation

### 1. Backend (`Server/`)
```bash
cd LAB-Project/Server
npm install
cp .env.example .env
```

Configure your `.env`:
```env
PORT=4002
MONGO_URI=mongodb_connection_string
JWT_SECRET=jwt_secret
RAZORPAY_KEY_ID=rzp_test_key_id
RAZORPAY_KEY_SECRET=razorpay_secret
```

Start the backend:
```bash
npm run dev
# Server running at http://localhost:4002
```

### 2. Frontend (`Client/`)
```bash
cd LAB-Project/Client
npm install
npm run dev
# Frontend running at http://localhost:5173
```

---

## 🔒 Security Highlights

* **HttpOnly Cookies:** Session tokens are immune to client-side XSS attacks.
* **Server-Side Pricing Authority:** Checkout totals are calculated exclusively on the server.
* **HMAC Verification:** Webhook/payment verification prevents signature tampering before orders are marked `PAID`.
