const express = require('express');
const router = express.Router();

const db = require('../database/database');

// GET: Fetch all reports with optional filters
router.get('/', (req, res) => {

    const { type, category, place } = req.query;

    let sql = `SELECT * FROM reports WHERE 1=1`;
    const params = [];

    // Filter by lost or found
    if (type) {
        if (!['lost', 'found'].includes(type.toLowerCase())) {
            return res.status(400).json({
                status: 'error',
                message: 'Type must be lost or found.'
            });
        }

        sql += ` AND LOWER(type) = LOWER(?)`;
        params.push(type.trim());
    }

    // Filter by category
    if (category && category.trim()) {
        sql += ` AND LOWER(category) LIKE LOWER(?)`;
        params.push(`%${category.trim()}%`);
    }

    // Filter by place
    if (place && place.trim()) {
        sql += ` AND LOWER(place) LIKE LOWER(?)`;
        params.push(`%${place.trim()}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    db.all(sql, params, (err, rows) => {

        if (err) {
            console.error('Error fetching reports:', err.message);

            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch reports.'
            });
        }

        res.status(200).json({
            status: 'success',
            count: rows.length,
            data: rows
        });

    });

});
// GET: Search reports by item name or description
router.get('/search', (req, res) => {

    const search = req.query.search;

    if (!search || !search.trim()) {
        return res.status(400).json({
            status: 'error',
            message: 'Please provide a search keyword.'
        });
    }

    const keyword = `%${search.trim()}%`;

    const sql = `
        SELECT *
        FROM reports
        WHERE name LIKE ? OR description LIKE ?
        ORDER BY created_at DESC
    `;

    db.all(sql, [keyword, keyword], (err, rows) => {

        if (err) {
            console.error('Search error:', err.message);

            return res.status(500).json({
                status: 'error',
                message: 'Failed to search reports.'
            });
        }

        res.status(200).json({
            status: 'success',
            count: rows.length,
            data: rows
        });

    });

});
// GET: Homepage statistics
router.get('/stats', (req, res) => {

    const sql = `
        SELECT
            COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN LOWER(type) = 'lost' THEN 1 ELSE 0 END), 0) AS lost,
            COALESCE(SUM(CASE WHEN LOWER(type) = 'found' THEN 1 ELSE 0 END), 0) AS found,
            COALESCE(SUM(CASE WHEN LOWER(state) = 'claimed' THEN 1 ELSE 0 END), 0) AS claimed,
            COALESCE(SUM(CASE WHEN LOWER(state) = 'returned' THEN 1 ELSE 0 END), 0) AS returned
        FROM reports
    `;

    db.get(sql, [], (err, row) => {

        if (err) {
            console.error('Statistics error:', err.message);

            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch statistics.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                total: row.total,
                lost: row.lost,
                found: row.found,
                claimed: row.claimed,
                returned: row.returned
            }
        });

    });

});
// GET: Fetch recent reports
router.get('/recent', (req, res) => {

    const sql = `
        SELECT *
        FROM reports
        ORDER BY created_at DESC
        LIMIT 6
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error('Recent reports error:', err.message);

            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch recent reports.'
            });
        }

        res.status(200).json({
            status: 'success',
            count: rows.length,
            data: rows
        });

    });

});
// PATCH: Update report status
router.patch('/:id/status', (req, res) => {

    const { id } = req.params;
    const state = req.body?.state;

    // Validate report ID
    if (!/^\d+$/.test(id) || Number(id) < 1) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid report ID.'
        });
    }

    // Validate state
    const allowedStates = ['Open', 'Claimed', 'Returned'];

    if (!allowedStates.includes(state)) {
        return res.status(400).json({
            status: 'error',
            message: 'State must be Open, Claimed, or Returned.'
        });
    }

    const sql = `UPDATE reports SET state = ? WHERE id = ?`;

    db.run(sql, [state, id], function (err) {

        if (err) {
            console.error('Status update error:', err.message);

            return res.status(500).json({
                status: 'error',
                message: 'Failed to update report status.'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Report not found.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Report status updated successfully.',
            data: {
                id: Number(id),
                state: state
            }
        });

    });

});
// GET: Fetch a single report by ID
router.get('/:id', (req, res) => {

    const { id } = req.params;

    // Validate report ID
    if (!/^\d+$/.test(id) || Number(id) < 1) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid report ID.'
        });
    }

    const sql = `
        SELECT *
        FROM reports
        WHERE id = ?
    `;

    db.get(sql, [id], (err, row) => {

        if (err) {
            console.error('Error fetching report:', err.message);

            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch report.'
            });
        }

        if (!row) {
            return res.status(404).json({
                status: 'error',
                message: 'Report not found.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: row
        });

    });

});
// DELETE: Delete a report by ID
router.delete('/:id', (req, res) => {

    const { id } = req.params;

    // Validate report ID
    if (!/^\d+$/.test(id) || Number(id) < 1) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid report ID.'
        });
    }

    const sql = `DELETE FROM reports WHERE id = ?`;

    db.run(sql, [id], function (err) {

        if (err) {
            console.error('Delete error:', err.message);

            return res.status(500).json({
                status: 'error',
                message: 'Failed to delete report.'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Report not found.'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Report deleted successfully.',
            deletedId: Number(id)
        });

    });

});
module.exports = router;