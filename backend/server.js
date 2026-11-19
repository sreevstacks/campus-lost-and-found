
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Database connection
const db = require('./database/database');

// Import reports route
const reportsRouter = require('./routes/reports');
const itemsRouter = require('./routes/items');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Connect reports route
app.use('/api/reports', reportsRouter);
app.use('/api/items', itemsRouter);
// Test route
app.get('/api/health', (req, res) => {
    res.json({
        message: 'CampusFind backend is running!',
        status: 'success'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
