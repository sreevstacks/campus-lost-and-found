
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or connect to the database
const dbPath = path.join(__dirname, 'campusfind.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to CampusFind database!');
    }
});

// Create reports table
db.run(`
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        state TEXT DEFAULT 'Open',
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        place TEXT NOT NULL,
        floor TEXT,
        spot TEXT,
        description TEXT NOT NULL,
        contact TEXT NOT NULL,
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('Error creating reports table:', err.message);
    } else {
        console.log('Reports table ready!');
    }
});

module.exports = db;
