# Auto Expense Management System - Backend

## Overview
The Auto Expense Management System is a full-stack application built using the MERN stack (MongoDB, Express, React, Node.js). This backend serves as the API for managing expenses, allowing users to create, retrieve, update, and delete expense records.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Auto-Expense-Management-System/backend
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `backend` directory and add the following:
   ```
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/authentication
   ```

4. **Run the Server**
   Start the server using:
   ```bash
   npm start
   ```

## API Endpoints

- **GET /api/expenses**: Retrieve all expenses.
- **POST /api/expenses**: Create a new expense.
- **PUT /api/expenses/:id**: Update an existing expense.
- **DELETE /api/expenses/:id**: Delete an expense.

## Folder Structure
```
backend
├── src
│   ├── controllers
│   │   └── expenseController.js
│   ├── models
│   │   └── expense.js
│   ├── routes
│   │   └── expenseRoutes.js
│   └── index.js
├── package.json
└── README.md
```

## Required Packages
- express
- mongoose
- dotenv
- cors

## License
This project is licensed under the MIT License.