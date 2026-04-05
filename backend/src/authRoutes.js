const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { sendOtpEmail } = require('./email');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const generateToken = (email, role, id) => {
    return jwt.sign({ email, role, sub: id }, JWT_SECRET, { expiresIn: '7d' });
};

const findUserByEmailAndRole = async (email, role) => {
    const table = role === 'admin' ? 'admins' : 'users';
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    return rows[0];
};

router.post(
    '/register',
    body('fullName').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['user', 'admin']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const { fullName, email, password, role } = req.body;
        const existing = await findUserByEmailAndRole(email, role);
        if (existing) {
            return res.status(409).json({ message: 'Email is already registered for this role.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        if (role === 'admin') {
            await pool.query(
                'INSERT INTO admins (full_name, email, password, account_status) VALUES (?, ?, ?, ?)',
                [fullName, email, hashedPassword, 'ACTIVE']
            );
        } else {
            await pool.query(
                'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
                [fullName, email, hashedPassword]
            );
        }

        return res.status(201).json({ message: 'Registration successful. Please sign in.' });
    }
);

router.post(
    '/login',
    body('email').isEmail(),
    body('password').notEmpty(),
    body('role').isIn(['user', 'admin']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const { email, password, role } = req.body;
        const user = await findUserByEmailAndRole(email, role);
        if (!user) {
            return res.status(401).json({ message: `${role} not found.` });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (role === 'user' && user.disabled_at) {
            return res.status(403).json({ message: 'Your account has been disabled.' });
        }

        if (role === 'admin') {
            const status = user.account_status || 'PENDING';
            if (status === 'DISABLED') {
                return res.status(403).json({ message: 'Your account has been temporarily disabled by Admin.' });
            }
            if (status !== 'ACTIVE') {
                return res.status(403).json({ message: 'Account pending admin approval.' });
            }
        }

        const token = generateToken(user.email, role, user.id);
        return res.json({
            token,
            role,
            name: user.full_name,
            id: user.id,
            profileImageUrl: user.profile_image_url || null,
        });
    }
);

router.post(
    '/request-otp',
    body('email').isEmail(),
    body('role').isIn(['user', 'admin']),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const { email, role } = req.body;
        const user = await findUserByEmailAndRole(email, role);
        if (!user) {
            return res.status(404).json({ message: `${role} not found.` });
        }

        if (role === 'user' && user.disabled_at) {
            return res.status(403).json({ message: 'Your account has been disabled.' });
        }

        if (role === 'admin') {
            const status = user.account_status || 'PENDING';
            if (status === 'DISABLED') {
                return res.status(403).json({ message: 'Your account has been temporarily disabled by Admin.' });
            }
            if (status !== 'ACTIVE') {
                return res.status(403).json({ message: 'Account pending admin approval.' });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpHash = bcrypt.hashSync(otp, 10);

        await pool.query('DELETE FROM login_otps WHERE email = ? AND role = ?', [email, role]);
        await pool.query(
            'INSERT INTO login_otps (email, role, otp_hash, expires_at) VALUES (?, ?, ?, ?)',
            [email, role, otpHash, expiresAt]
        );

        await sendOtpEmail(email, otp);
        return res.json({ message: 'OTP sent successfully.', demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined });
    }
);

router.post(
    '/verify-otp',
    body('email').isEmail(),
    body('role').isIn(['user', 'admin']),
    body('otp').isLength({ min: 6, max: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const { email, role, otp } = req.body;
        const [rows] = await pool.query('SELECT * FROM login_otps WHERE email = ? AND role = ?', [email, role]);
        const record = rows[0];
        if (!record) {
            return res.status(404).json({ message: 'OTP not found or expired.' });
        }

        if (new Date(record.expires_at) < new Date()) {
            await pool.query('DELETE FROM login_otps WHERE id = ?', [record.id]);
            return res.status(410).json({ message: 'OTP expired. Please request a new one.' });
        }

        if (!bcrypt.compareSync(otp, record.otp_hash)) {
            return res.status(401).json({ message: 'Invalid OTP.' });
        }

        await pool.query('DELETE FROM login_otps WHERE id = ?', [record.id]);
        const user = await findUserByEmailAndRole(email, role);
        if (!user) {
            return res.status(404).json({ message: `${role} not found.` });
        }

        if (role === 'user' && user.disabled_at) {
            return res.status(403).json({ message: 'Your account has been disabled.' });
        }

        if (role === 'admin') {
            const status = user.account_status || 'PENDING';
            if (status === 'DISABLED') {
                return res.status(403).json({ message: 'Your account has been temporarily disabled by Admin.' });
            }
            if (status !== 'ACTIVE') {
                return res.status(403).json({ message: 'Account pending admin approval.' });
            }
        }

        const token = generateToken(user.email, role, user.id);
        return res.json({
            token,
            role,
            name: user.full_name,
            id: user.id,
            profileImageUrl: user.profile_image_url || null,
        });
    }
);

module.exports = router;
