const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Auth backend is running.' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
