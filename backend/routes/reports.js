
const express = require('express');
const router = express.Router();

const db = require('../database/database');
const multer = require('multer');
const path = require('path');

// Configure image storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' +
            Math.round(Math.random() * 1E9);

        const extension = path.extname(file.originalname);

        cb(null, uniqueName + extension);
    }

});

// Allow only image files
const fileFilter = (req, file, cb) => {

    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }

};

// Set upload limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// POST: Submit a new lost/found report
router.post('/', upload.single('image'), (req, res) => {
if (!req.body) {
        return res.status(400).json({
            message: 'No form data received.',
            status: 'error'
        });
    }
    const {
        type,
        name,
        category,
        date,
        place,
        floor,
        spot,
        description,
        contact
    } = req.body;

    // Validate required fields
    if (
        !type ||
        !name ||
        !category ||
        !date ||
        !place ||
        !description ||
        !contact
    ) {
        return res.status(400).json({
            message: 'Please fill in all required fields.',
            status: 'error'
        });
    }

    // Validate report type
    if (!['lost', 'found'].includes(type.toLowerCase())) {
        return res.status(400).json({
            message: 'Report type must be Lost or Found.',
            status: 'error'
        });
    }

    // Get uploaded image path
    const imagePath = req.file
        ? `/uploads/${req.file.filename}`
        : null;

    // SQL query
    const sql = `
        INSERT INTO reports (
            type,
            name,
            category,
            date,
            place,
            floor,
            spot,
            description,
            contact,
            image_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        type.toLowerCase(),
        name,
        category,
        date,
        place,
        floor || null,
        spot || null,
        description,
        contact,
        imagePath
    ];

    // Save report in database
    db.run(sql, values, function (err) {

        if (err) {
            console.error('Error saving report:', err.message);

            return res.status(500).json({
                message: 'Failed to save report.',
                status: 'error'
            });
        }

        res.status(201).json({
            message: 'Report submitted successfully!',
            status: 'success',
            reportId: this.lastID,
            imagePath: imagePath
        });

    });

});

module.exports = router;
