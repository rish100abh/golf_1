require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const charityRoutes = require('./routes/charity.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api', (req, res) => {
  res.json({ message: 'Golf Charity Platform API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);

module.exports = app;