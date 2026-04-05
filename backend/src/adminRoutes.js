const express = require('express');
const pool = require('./db');

const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token missing.' });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');

        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required.' });
        }

        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

// GET /admin/users - List all regular users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC'
        );
        return res.json({ users: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching users.' });
    }
});

// GET /admin/pending-admins - List pending admin requests
router.get('/pending-admins', verifyAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, full_name, email, account_status, created_at FROM admins WHERE account_status = ? ORDER BY created_at DESC',
            ['PENDING']
        );
        return res.json({ pendingAdmins: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching pending admins.' });
    }
});

// GET /admin/all-admins - List all approved admins
router.get('/all-admins', verifyAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, full_name, email, account_status, created_at FROM admins ORDER BY account_status ASC, created_at DESC'
        );
        return res.json({ admins: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching admins.' });
    }
});

// POST /admin/approve-admin/:id - Approve a pending admin
router.post('/approve-admin/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [admin] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
        if (!admin[0]) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        if (admin[0].account_status === 'ACTIVE') {
            return res.status(400).json({ message: 'Admin is already approved.' });
        }

        await pool.query('UPDATE admins SET account_status = ? WHERE id = ?', ['ACTIVE', id]);
        return res.json({ message: 'Admin approved successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error approving admin.' });
    }
});

// POST /admin/deny-admin/:id - Deny a pending admin
router.post('/deny-admin/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [admin] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
        if (!admin[0]) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        await pool.query('DELETE FROM admins WHERE id = ?', [id]);
        return res.json({ message: 'Admin request denied and removed.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error denying admin.' });
    }
});

// POST /admin/disable-user/:id - Disable a user
router.post('/disable-user/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (!user[0]) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Add disabled_at timestamp to track when user was disabled
        await pool.query('UPDATE users SET disabled_at = NOW() WHERE id = ?', [id]);
        return res.json({ message: 'User disabled successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error disabling user.' });
    }
});

// POST /admin/enable-user/:id - Enable a user
router.post('/enable-user/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (!user[0]) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await pool.query('UPDATE users SET disabled_at = NULL WHERE id = ?', [id]);
        return res.json({ message: 'User enabled successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error enabling user.' });
    }
});

// POST /admin/disable-admin/:id - Disable an admin account
router.post('/disable-admin/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (id == req.admin.sub) {
            return res.status(400).json({ message: 'Cannot disable your own account.' });
        }

        const [admin] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
        if (!admin[0]) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        await pool.query('UPDATE admins SET account_status = ? WHERE id = ?', ['DISABLED', id]);
        return res.json({ message: 'Admin disabled successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error disabling admin.' });
    }
});

module.exports = router;
