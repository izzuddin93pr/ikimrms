const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { verifyToken, isHostOrCoHost } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.findBy('users', 'email', email);

    if (user && bcrypt.compareSync(password, user.password)) {
        if (!user.approved) {
            return res.status(403).json({ message: 'Your account is pending approval.' });
        }
        
        const { password, ...userWithoutPassword } = user;
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ user: userWithoutPassword, token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// --- API ROUTES ---

// Generic GET all
const createGetAllRoute = (collectionName) => {
    app.get(`/api/${collectionName}`, verifyToken, (req, res) => {
        const data = db.findAll(collectionName);
        res.json(data);
    });
};

// Generic POST
const createPostRoute = (collectionName) => {
    app.post(`/api/${collectionName}`, [verifyToken, isHostOrCoHost], (req, res) => {
        const newItem = db.insert(collectionName, req.body);
        res.status(201).json(newItem);
    });
};

// Generic PUT
const createPutRoute = (collectionName) => {
    app.put(`/api/${collectionName}/:id`, [verifyToken, isHostOrCoHost], (req, res) => {
        const updatedItem = db.update(collectionName, req.params.id, req.body);
        if (updatedItem) {
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    });
};

// Generic DELETE
const createDeleteRoute = (collectionName) => {
    app.delete(`/api/${collectionName}/:id`, [verifyToken, isHostOrCoHost], (req, res) => {
        const success = db.remove(collectionName, req.params.id);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    });
};

// Create routes for all collections
['research', 'collaborations', 'academicCentres', 'researchers', 'users'].forEach(collection => {
    createGetAllRoute(collection);
    createPostRoute(collection);
    createPutRoute(collection);
    createDeleteRoute(collection);
});


// --- FALLBACK FOR CLIENT-SIDE ROUTING ---
// This serves the React app for any routes that don't match an API endpoint
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
