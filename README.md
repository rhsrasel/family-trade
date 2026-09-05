# Family Trade

A full-stack ledger and business management application designed to help manage customers, markets, companies, products, orders, and financial records in one place.

Built with **Next.js, React, MongoDB, and Tailwind CSS**, the application provides separate user and admin workflows with secure authentication and role-based access.

## 🔗 Preview

🚀 **Live Demo:** [Family Trade Demo](https://family-trade.vercel.app/)


## ✨ Features

* 👤 User registration and authentication
* 🔐 Admin authentication and protected routes
* 👥 User management and approval workflow
* 🏢 Company management
* 📦 Product management
* 📊 Inventory and stock management
* 🧾 Ledger and transaction management
* 🔑 Role-based access control
* 🛡️ Protected admin routes
* 📱 Responsive UI
* ⚡ Fast and modern Next.js application
* 🗄️ MongoDB database integration
* ⚡ Modern and responsive Next.js application

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* Tailwind CSS
* JavaScript

### Backend

* Next.js API Routes
* Node.js
* MongoDB
* Mongoose
* JWT Authentication

### Other Tools

* Git
* GitHub
* pnpm
* ESLint

## 📁 Project Structure

```text
family-trade/
├── app/
│   ├── admin/
│   ├── user/
│   ├── scorer/
│   └── api/
├── components/
├── models/
├── lib/
├── stores/
├── public/
└── package.json
```

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* pnpm
* MongoDB

### Installation

Clone the repository:

```bash
git clone https://github.com/rhsrasel/family-trade.git
```

Navigate to the project:

```bash
cd family-trade
```

Install dependencies:

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add any other environment variables required by the application.

### Run Development Server

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## 🧑‍💻 Author

### RHS Rasel

Senior Shopify Developer & E-commerce Engineer

* GitHub: [@rhsrasel](https://github.com/rhsrasel)
* LinkedIn: [linkedin.com/in/rhsrasel](https://www.linkedin.com/in/rhsrasel)

## 📄 License

This project is developed as a custom ledger application.
