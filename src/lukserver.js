"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Initialize express app
const app = (0, express_1.default)();
const PORT = 5000; // Server port
// Secret key for signing JWT tokens
const SECRET_KEY = 'your-secret-key';
// Middleware to handle CORS requests
app.use((0, cors_1.default)());
// Middleware to parse incoming JSON requests
app.use(express_1.default.json());
// Path to the file where data is stored (db.json)
const dbFilePath = path_1.default.join(__dirname, 'db.json');
// Function to read data from db.json
function readData() {
    const data = fs_1.default.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data);
}
// Function to write data to db.json
function writeData(data) {
    fs_1.default.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}
// Function to generate JWT tokens for authentication
function generateToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
}
// Middleware to authenticate users with JWT tokens
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token)
        return res.status(401).json({ message: 'No token provided' });
    // Verify JWT token and proceed if valid
    jsonwebtoken_1.default.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
        if (err)
            return res.status(403).json({ message: 'Invalid token' });
        req.user = user; // Cast to User
        next();
    });
}
// Route to get all categories from db.json
app.get('/categories', (req, res) => {
    try {
        const data = readData();
        res.status(200).json(data.categories);
    }
    catch (error) {
        console.error('Error reading categories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to get all products
app.get('/products', (req, res) => {
    try {
        const { category_id, q, isNew } = req.query;
        const data = readData();
        let products = data.products;
        if (isNew) {
            products = products.filter(product => product.isNew === true);
        }
        if (category_id) {
            products = products.filter(product => product.category_id === parseInt(category_id));
        }
        if (q) {
            const query = q.toLowerCase();
            products = products.filter(product => (product.name && product.name.toLowerCase().includes(query)) ||
                (product.longDescription && product.longDescription.toLowerCase().includes(query)));
        }
        res.status(200).json(products);
    }
    catch (error) {
        console.error('Error reading products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to get a single product by its ID
app.get('/products/:id', (req, res) => {
    try {
        const data = readData();
        const product = data.products.find((p) => p.id === req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    }
    catch (error) {
        console.error('Error reading product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to get all users from db.json
app.get('/users', (req, res) => {
    try {
        const data = readData();
        res.status(200).json(data.users);
    }
    catch (error) {
        console.error('Error reading users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to register a new user
app.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = readData();
        const { email, password } = req.body;
        const existingUser = data.users.find((user) => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            email,
            password: hashedPassword
        };
        data.users.push(newUser);
        writeData(data);
        const token = generateToken(newUser);
        res.status(201).json({ user: newUser, token });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Route to create a new order (requires user to be authenticated)
app.post('/orders', authenticateToken, (req, res) => {
    var _a;
    try {
        const data = readData();
        const newOrder = Object.assign(Object.assign({ id: Date.now().toString() }, req.body), { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id // Используем optional chaining
         });
        data.orders.push(newOrder);
        writeData(data);
        res.status(201).json(newOrder);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to login an existing user
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = readData();
        const { email, password } = req.body;
        const user = data.users.find((user) => user.email === email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = generateToken(user);
        res.status(200).json({ user, token });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Start the server on the defined port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
