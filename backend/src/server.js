// // src/server.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const { Pool } = require('pg');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

// const app = express();
// const PORT = process.env.PORT || 8001;

// // ✅ FIXED: Neon SSL + Pool settings
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL?.includes('sslmode') 
//     ? process.env.DATABASE_URL 
//     : process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'sslmode=require',
//   connectionTimeoutMillis: 30000,
//   max: 20,
//   idleTimeoutMillis: 30000,
// });

// // ✅ FIXED: Pool error handling
// pool.on('error', (err) => {
//   console.error('❌ Pool error:', err.message);
//   process.exit(1);
// });

// // ✅ FIXED: Health check with DB test
// app.get('/api/health', async (req, res) => {
//   try {
//     const client = await pool.connect();
//     await client.query('SELECT 1');
//     client.release();
//     res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
//   } catch (err) {
//     console.error('Health check failed:', err.message);
//     res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: err.message });
//   }
// });

// // Middleware - ✅ FIXED: Default localhost fallback
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(cookieParser());

// // ✅ ALL YOUR DATABASE TABLES + ROUTES HERE (copy from your backend/server.js)
// // ... [paste ALL the initDatabase(), seedData(), authenticateToken, routes, etc. from your backend/server.js]

// const initDatabase = async () => {
//   try {
//     const client = await pool.connect();
//     await client.query('BEGIN');
    
//     // ALL your table creation queries here (users, charities, etc.)
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password_hash VARCHAR(255) NOT NULL,
//         name VARCHAR(255) NOT NULL,
//         role VARCHAR(50) DEFAULT 'user',
//         charity_id INTEGER,
//         charity_percentage INTEGER DEFAULT 10,
//         subscription_status VARCHAR(50) DEFAULT 'inactive',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);
//     // ... ALL other tables (copy exactly from your backend/server.js)
    
//     await client.query('COMMIT');
//     console.log('✅ Database tables initialized');
//     client.release();
//   } catch (error) {
//     console.error('❌ Database init failed:', error);
//     process.exit(1);
//   }
// };

// // ... ALL your other functions + routes (copy exactly)

// module.exports = app; // ✅ EXPORT app for backend/server.js