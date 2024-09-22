# My Server Project

This project is a simple server built using **Node.js** and **Express**. It handles user registration, login, token-based authentication, and provides routes for managing categories, products, and orders.

## Features
- **JWT Authentication**: Secures routes with JSON Web Tokens.
- **Bcrypt**: Password hashing for user security.
- **CORS**: Handles cross-origin requests.
- **File-based database**: Reads and writes data to `db.json`.
- **RESTful API**: Provides endpoints to manage users, products, and orders.

## Routes

### Public Routes:
- `GET /categories`: Get a list of categories.
- `GET /products`: Get all products, or filter by category, query, or new items.
- `GET /products/:id`: Get a single product by its ID.
- `POST /users`: Register a new user.

### Authenticated Routes:
- `POST /orders`: Create a new order (requires authentication).

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/my-server-project.git
   cd my-server-project

2. Install dependencies:
   npm install

3. Start the server:
   npm start


## Example Requests

POST /users
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "userpassword"
}

### Login User

POST /login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "userpassword"
}

License
This project is licensed under the MIT License.
