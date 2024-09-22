import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Initialize express app
const app = express();
const PORT = 5000;  // Server port

// Secret key for signing JWT tokens
const SECRET_KEY = 'your-secret-key';  

// Middleware to handle CORS requests
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Path to the file where data is stored (db.json)
const dbFilePath = path.join(__dirname, 'db.json');

// Interfaces for user, product, and data structures
interface User {
  id: string;
  email: string;
  password: string;
}

interface Product {
  id: string;
  name: string;
  longDescription: string;
  isNew: boolean;
  category_id: number;
}

interface Data {
  users: User[];
  products: Product[];
  categories: any[];
  orders: any[]; // Добавлено для заказов
}

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: User; // Optional user property
}

// Function to read data from db.json
function readData(): Data {
  const data = fs.readFileSync(dbFilePath, 'utf-8');
  return JSON.parse(data);
}

// Function to write data to db.json
function writeData(data: Data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Function to generate JWT tokens for authentication
function generateToken(user: User) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
}

// Middleware to authenticate users with JWT tokens
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  // Verify JWT token and proceed if valid
  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user as User; // Cast to User
    next();
  });
}

// Route to get all categories from db.json
app.get('/categories', (req, res) => {
  try {
    const data = readData();
    res.json(data.categories);
  } catch (err) {
    console.error('Error reading database:', err);
    res.status(500).send('Error reading database');
  }
});

// Route to get all products
app.get('/products', (req: Request, res: Response) => {
  try {
    const { category_id, q, isNew } = req.query;
    const data = readData();
    let products = data.products;

    if (isNew) {
      products = products.filter(product => product.isNew === true);
    }

    if (category_id) {
      products = products.filter(product => product.category_id === parseInt(category_id as string));
    }

    if (q) {
      const query = (q as string).toLowerCase();
      products = products.filter(product => 
        (product.name && product.name.toLowerCase().includes(query)) || 
        (product.longDescription && product.longDescription.toLowerCase().includes(query))
      );
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get a single product by its ID
app.get('/products/:id', (req: Request, res: Response) => {
  try {
    const data = readData();
    const product = data.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error reading product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get all users from db.json
app.get('/users', (req: Request, res: Response) => {
  try {
    const data = readData();
    res.status(200).json(data.users);
  } catch (error) {
    console.error('Error reading users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to register a new user
app.post('/users', async (req: Request, res: Response) => {
  try {
    const data = readData();
    const { email, password } = req.body;

    const existingUser = data.users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword
    };
    data.users.push(newUser);
    writeData(data);

    const token = generateToken(newUser);
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to create a new order (requires user to be authenticated)
app.post('/orders', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = readData();
    const newOrder = {
      id: Date.now().toString(),
      ...req.body,
      userId: req.user?.id // Используем optional chaining
    };
    data.orders.push(newOrder);
    writeData(data);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to login an existing user
app.post('/login', async (req: Request, res: Response) => {
  try {
    const data = readData();
    const { email, password } = req.body;

    const user = data.users.find((user) => user.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = generateToken(user);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server on the defined port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
