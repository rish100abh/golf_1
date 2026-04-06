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

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
//   max: 10,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 15000,
//   allowExitOnIdle: false,
// });

// // Test database connection on startup
// pool.on('connect', () => {
//   console.log('✅ Database connected');
// });

// pool.on('error', (err) => {
//   console.error('❌ Unexpected error on idle client', err);
// });

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Health check endpoint
// app.get('/api/health', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT 1');
//     res.json({ 
//       status: 'healthy', 
//       database: 'connected',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
//   }
// });
// // Database initialization
// const initDatabase = async () => {
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     // Users table
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

//     // Charities table
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS charities (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         description TEXT,
//         category VARCHAR(100),
//         website VARCHAR(255),
//         logo_url TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Subscriptions table
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS subscriptions (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         plan_type VARCHAR(50) NOT NULL,
//         status VARCHAR(50) DEFAULT 'active',
//         stripe_customer_id VARCHAR(255),
//         stripe_subscription_id VARCHAR(255),
//         start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         end_date TIMESTAMP,
//         amount DECIMAL(10, 2) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Scores table
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS scores (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         value INTEGER NOT NULL CHECK (value >= 1 AND value <= 45),
//         date_played DATE NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Draws table
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS draws (
//         id SERIAL PRIMARY KEY,
//         draw_date DATE NOT NULL,
//         winning_numbers INTEGER[] NOT NULL,
//         prize_pool DECIMAL(10, 2) NOT NULL,
//         jackpot_amount DECIMAL(10, 2) NOT NULL,
//         status VARCHAR(50) DEFAULT 'completed',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Draw results table
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS draw_results (
//         id SERIAL PRIMARY KEY,
//         draw_id INTEGER REFERENCES draws(id) ON DELETE CASCADE,
//         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         matched_count INTEGER NOT NULL,
//         prize_amount DECIMAL(10, 2) NOT NULL,
//         verified BOOLEAN DEFAULT FALSE,
//         proof_url TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Payment transactions table
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS payment_transactions (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
//         session_id VARCHAR(255) UNIQUE,
//         amount DECIMAL(10, 2),
//         currency VARCHAR(10),
//         status VARCHAR(50),
//         payment_status VARCHAR(50),
//         metadata JSONB,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Password reset tokens table
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS password_reset_tokens (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         token VARCHAR(255) UNIQUE NOT NULL,
//         expires_at TIMESTAMP NOT NULL,
//         used BOOLEAN DEFAULT FALSE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Login attempts table
//     await client.query(`
//       CREATE TABLE IF NOT EXISTS login_attempts (
//         id SERIAL PRIMARY KEY,
//         identifier VARCHAR(255) UNIQUE NOT NULL,
//         attempts INTEGER DEFAULT 1,
//         locked_until TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     // Indexes
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id)`);
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_date_played ON scores(date_played)`);
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`);
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_draw_results_user_id ON draw_results(user_id)`);
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_draw_results_draw_id ON draw_results(draw_id)`);
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)`);
//     await client.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier)`);

//     await client.query('COMMIT');
//     console.log('✅ Database tables initialized');
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Database initialization error:', error);
//     throw error;
//   } finally {
//     client.release();
//   }
// };


// // Seed admin and sample charities
// const seedData = async () => {
//   const client = await pool.connect();

//   try {
//     await client.query('BEGIN');

//     const adminEmail = process.env.ADMIN_EMAIL || 'admin@golfcharity.com';
//     const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

//     // Check if admin exists
//     const adminCheck = await client.query(
//       'SELECT id FROM users WHERE email = $1',
//       [adminEmail]
//     );

//     if (adminCheck.rows.length === 0) {
//       const hashedPassword = await bcrypt.hash(adminPassword, 12);

//       await client.query(
//         `INSERT INTO users (email, password_hash, name, role)
//          VALUES ($1, $2, $3, $4)`,
//         [adminEmail, hashedPassword, 'Admin User', 'admin']
//       );

//       console.log('✅ Admin user created');
//     } else {
//       console.log('ℹ️ Admin user already exists');
//     }

//     // Make charity names unique if not already unique
//     await client.query(`
//       DO $$
//       BEGIN
//         IF NOT EXISTS (
//           SELECT 1
//           FROM pg_constraint
//           WHERE conname = 'charities_name_key'
//         ) THEN
//           ALTER TABLE charities
//           ADD CONSTRAINT charities_name_key UNIQUE (name);
//         END IF;
//       END $$;
//     `);

//     const charities = [
//       ['Save the Children', 'Helping children worldwide', 'Children', 'https://www.savethechildren.org'],
//       ['Red Cross', 'Humanitarian aid organization', 'Health', 'https://www.redcross.org'],
//       ['WWF', 'Wildlife conservation', 'Environment', 'https://www.worldwildlife.org'],
//       ['Doctors Without Borders', 'Medical humanitarian organization', 'Health', 'https://www.doctorswithoutborders.org'],
//       ['Water.org', 'Safe water and sanitation', 'Water', 'https://water.org']
//     ];

//     for (const charity of charities) {
//       await client.query(
//         `INSERT INTO charities (name, description, category, website)
//          VALUES ($1, $2, $3, $4)
//          ON CONFLICT (name) DO NOTHING`,
//         charity
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Sample charities seeded');
//     console.log('✅ Test Credentials:');
//     console.log(`   Admin Email: ${adminEmail}`);
//     console.log(`   Admin Password: ${adminPassword}`);
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Seeding error:', error);
//     throw error;
//   } finally {
//     client.release();
//   }
// };

// // ✅ PRODUCTION-READY Auth middleware
// const authenticateToken = async (req, res, next) => {
//   // Extract token from cookies first (preferred)
//   let token = req.cookies?.access_token;
  
//   // Fallback to Authorization header
//   if (!token) {
//     const authHeader = req.headers.authorization;
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       token = authHeader.substring(7).trim();
//     }
//   }

//   // No token found
//   if (!token) {
//     return res.status(401).json({ 
//       detail: 'Access token required',
//       required: ['access_token cookie', 'Authorization: Bearer <token>']
//     });
//   }

//   // Verify JWT token
//   try {
//     // Validate JWT_SECRET exists
//     if (!process.env.JWT_SECRET) {
//       console.error('❌ JWT_SECRET not configured');
//       return res.status(500).json({ detail: 'Server configuration error' });
//     }

//     const payload = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Validate token type
//     if (payload.type !== 'access') {
//       return res.status(401).json({ 
//         detail: 'Invalid token type', 
//         expected: 'access' 
//       });
//     }

//     // Validate user exists and fetch fresh data
//     const result = await pool.query(
//       `SELECT 
//          id, 
//          email, 
//          name, 
//          role, 
//          charity_id, 
//          charity_percentage, 
//          subscription_status,
//          created_at,
//          updated_at
//        FROM users 
//        WHERE id = $1`,
//       [payload.sub]
//     );
    
//     if (result.rows.length === 0) {
//       console.warn(`⚠️ Token user not found: ${payload.sub}`);
//       return res.status(401).json({ detail: 'User not found' });
//     }

//     // Attach user to request
//     req.user = {
//       id: result.rows[0].id,
//       email: result.rows[0].email,
//       name: result.rows[0].name,
//       role: result.rows[0].role,
//       charity_id: result.rows[0].charity_id,
//       charity_percentage: result.rows[0].charity_percentage,
//       subscription_status: result.rows[0].subscription_status,
//       created_at: result.rows[0].created_at,
//       updated_at: result.rows[0].updated_at
//     };

//     // Add token metadata
//     req.token = {
//       sub: payload.sub,
//       email: payload.email,
//       iat: payload.iat,
//       exp: payload.exp
//     };

//     next();
    
//   } catch (error) {
//     // Handle specific JWT errors
//     if (error.name === 'TokenExpiredError') {
//       console.warn(`🕐 Token expired: ${token.slice(0, 20)}...`);
//       return res.status(401).json({ 
//         detail: 'Token expired',
//         solution: 'Refresh token or login again'
//       });
//     }
    
//     if (error.name === 'JsonWebTokenError') {
//       console.warn(`🔒 Invalid JWT signature: ${token.slice(0, 20)}...`);
//       return res.status(401).json({ detail: 'Invalid token signature' });
//     }
    
//     if (error.name === 'NotBeforeError') {
//       return res.status(401).json({ detail: 'Token not active yet' });
//     }

//     // Database or other errors
//     console.error('Auth middleware error:', error);
//     return res.status(500).json({ detail: 'Authentication service unavailable' });
//   }
// };

// // Admin middleware - Enhanced for golf charity roles
// const requireAdmin = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ detail: 'Authentication required' });
//   }

//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ 
//       detail: 'Admin access required',
//       requiredRole: 'admin',
//       currentRole: req.user.role
//     });
//   }

//   next();
// };

// // Helper functions - Production ready for Golf Charity
// const createAccessToken = (userId, email, role) => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error('JWT_SECRET not configured');
//   }

//   return jwt.sign(
//     { 
//       sub: userId, 
//       email, 
//       role,
//       type: 'access' 
//     },
//     process.env.JWT_SECRET,
//     { 
//       expiresIn: '15m' 
//     }
//   );
// };

// const createRefreshToken = (userId) => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error('JWT_SECRET not configured');
//   }

//   return jwt.sign(
//     { 
//       sub: userId, 
//       type: 'refresh' 
//     },
//     process.env.JWT_SECRET,
//     { 
//       expiresIn: '7d' 
//     }
//   );
// };

// const setAuthCookies = (res, accessToken, refreshToken) => {
//   // Access token - short lived
//   res.cookie('access_token', accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//     maxAge: 15 * 60 * 1000, // 15 minutes
//     path: '/',
//     overwrite: true
//   });

//   // Refresh token - long lived
//   res.cookie('refresh_token', refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     path: '/',
//     overwrite: true
//   });
// };

// // Optional: Clear auth cookies helper
// const clearAuthCookies = (res) => {
//   res.clearCookie('access_token', { 
//     httpOnly: true, 
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax',
//     path: '/' 
//   });
//   res.clearCookie('refresh_token', { 
//     httpOnly: true, 
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax',
//     path: '/' 
//   });
// };

// // Optional: Admin + Super admin middleware (future proof)
// const requireAdminOrSuperAdmin = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ detail: 'Authentication required' });
//   }

//   if (!['admin', 'superadmin'].includes(req.user.role)) {
//     return res.status(403).json({ 
//       detail: 'Admin or Super Admin access required',
//       requiredRoles: ['admin', 'superadmin'],
//       currentRole: req.user.role
//     });
//   }

//   next();
// };


// // ==================== AUTH ROUTES ====================

// // Register - Updated for Golf Charity with validation
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { email, password, name, charity_id, charity_percentage } = req.body;
    
//     // Required fields validation
//     if (!email || !password || !name) {
//       return res.status(400).json({ 
//         detail: 'Email, password, and name are required',
//         required: ['email', 'password', 'name']
//       });
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ detail: 'Invalid email format' });
//     }

//     // Password validation
//     if (password.length < 6) {
//       return res.status(400).json({ detail: 'Password must be at least 6 characters' });
//     }

//     // Charity percentage validation (1-100)
//     const percentage = parseInt(charity_percentage);
//     if (charity_id && (isNaN(percentage) || percentage < 1 || percentage > 100)) {
//       return res.status(400).json({ 
//         detail: 'Charity percentage must be between 1-100',
//         value: charity_percentage
//       });
//     }

//     // Charity exists validation
//     if (charity_id) {
//       const charityCheck = await pool.query(
//         'SELECT id FROM charities WHERE id = $1', 
//         [charity_id]
//       );
//       if (charityCheck.rows.length === 0) {
//         return res.status(400).json({ 
//           detail: 'Selected charity does not exist',
//           charity_id 
//         });
//       }
//     }

//     const emailLower = email.toLowerCase();
    
//     // Check if user exists (with better error message)
//     const existingUser = await pool.query(
//       'SELECT id, email FROM users WHERE email = $1', 
//       [emailLower]
//     );
    
//     if (existingUser.rows.length > 0) {
//       return res.status(400).json({ 
//         detail: 'Email already registered',
//         email: emailLower
//       });
//     }

//     // Hash password
//     const passwordHash = await bcrypt.hash(password, 12);

//     // Create user with default role 'user'
//     const result = await pool.query(
//       `INSERT INTO users (
//         email, 
//         password_hash, 
//         name, 
//         charity_id, 
//         charity_percentage,
//         role
//       ) VALUES ($1, $2, $3, $4, $5, $6) 
//       RETURNING id, email, name, role, charity_id, charity_percentage, subscription_status, created_at`,
//       [
//         emailLower, 
//         passwordHash, 
//         name, 
//         charity_id || null, 
//         charity_id ? percentage : null,
//         'user' // Default role
//       ]
//     );

//     const user = result.rows[0];
    
//     // **FIX**: Use updated createAccessToken with role parameter
//     const accessToken = createAccessToken(user.id, user.email, user.role);
//     const refreshToken = createRefreshToken(user.id);

//     setAuthCookies(res, accessToken, refreshToken);
    
//     // Return user without sensitive data
//     const { password_hash, ...userWithoutPassword } = user;
//     res.status(201).json({
//       message: 'User registered successfully',
//       user: userWithoutPassword,
//       tokens: {
//         access: true,
//         refresh: true
//       }
//     });

//   } catch (error) {
//     console.error('❌ Register error:', error);
    
//     // Handle specific database constraint errors
//     if (error.code === '23505') { // Unique violation
//       return res.status(400).json({ 
//         detail: 'Email already exists. Please use a different email.' 
//       });
//     }
    
//     if (error.code === '23503') { // Foreign key violation
//       return res.status(400).json({ 
//         detail: 'Invalid charity ID. Charity does not exist.' 
//       });
//     }

//     // Generic server error
//     res.status(500).json({ detail: 'Registration failed. Please try again.' });
//   }
// });


// // ✅ COMPLETE FIXED LOGIN - Production ready
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Basic validation
//     if (!email || !password) {
//       return res.status(400).json({ 
//         detail: 'Email and password are required',
//         required: ['email', 'password']
//       });
//     }

//     const emailLower = email.toLowerCase();
//     const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
//     const identifier = `${ipAddress}:${emailLower}`;

//     // Brute force protection - Check login attempts
//     const attemptCheck = await pool.query(
//       'SELECT attempts, locked_until FROM login_attempts WHERE identifier = $1',
//       [identifier]
//     );

//     if (attemptCheck.rows.length > 0) {
//       const { attempts, locked_until } = attemptCheck.rows[0];
      
//       if (locked_until && new Date(locked_until) > new Date()) {
//         const remainingTime = Math.ceil((new Date(locked_until) - new Date()) / 1000 / 60);
//         return res.status(429).json({ 
//           detail: `Too many failed attempts. Try again in ${remainingTime} minutes`,
//           retry_after: remainingTime
//         });
//       }
//     }

//     // Fetch user (never return password_hash in SELECT)
//     const userResult = await pool.query(
//       `SELECT 
//         id, email, name, role, charity_id, charity_percentage, 
//         subscription_status, created_at, updated_at
//        FROM users 
//        WHERE email = $1`,
//       [emailLower]
//     );

//     if (userResult.rows.length === 0) {
//       // Don't reveal if user exists - security best practice
//       // Still increment login attempts for non-existent users
//       await recordLoginAttempt(identifier, false);
//       return res.status(401).json({ detail: 'Invalid credentials' });
//     }

//     const user = userResult.rows[0];

//     // Verify password
//     const storedHash = await pool.query('SELECT password_hash FROM users WHERE id = $1', [user.id]);
//     const isPasswordValid = await bcrypt.compare(password, storedHash.rows[0].password_hash);

//     if (!isPasswordValid) {
//       await recordLoginAttempt(identifier, false);
//       return res.status(401).json({ detail: 'Invalid credentials' });
//     }

//     // Clear previous login attempts on success
//     await pool.query('DELETE FROM login_attempts WHERE identifier = $1', [identifier]);

//     // Generate tokens
//     const accessToken = createAccessToken(user.id, user.email, user.role);
//     const refreshToken = createRefreshToken(user.id);

//     // Set secure cookies
//     setAuthCookies(res, accessToken, refreshToken);

//     // Return user data (password already excluded)
//     res.json({
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         charity_id: user.charity_id,
//         charity_percentage: user.charity_percentage,
//         subscription_status: user.subscription_status
//       },
//       tokens: {
//         access: true,
//         refresh: true
//       }
//     });

//   } catch (error) {
//     console.error('❌ Login error:', error);
    
//     // Handle specific PostgreSQL errors
//     if (error.code === '23505') {
//       return res.status(400).json({ detail: 'Database constraint violation' });
//     }
    
//     res.status(500).json({ detail: 'Login service unavailable' });
//   }
// });

// // Helper function for login attempts
// const recordLoginAttempt = async (identifier, ipAddress, success) => {
//   const now = new Date();
//   const maxAttempts = 5;
//   const lockTime = 15; // minutes

//   if (success) {
//     await pool.query(
//       'DELETE FROM login_attempts WHERE identifier = $1',
//       [identifier]
//     );
//     return;
//   }

//   const existing = await pool.query(
//     'SELECT attempts, locked_until FROM login_attempts WHERE identifier = $1',
//     [identifier]
//   );

//   if (existing.rows.length > 0) {
//     const { attempts, locked_until } = existing.rows[0];

//     if (locked_until && new Date(locked_until) > now) {
//       return;
//     }

//     if (attempts >= maxAttempts - 1) {
//       await pool.query(
//         `UPDATE login_attempts
//          SET attempts = $1, locked_until = $2, updated_at = CURRENT_TIMESTAMP
//          WHERE identifier = $3`,
//         [
//           maxAttempts,
//           new Date(now.getTime() + lockTime * 60 * 1000),
//           identifier
//         ]
//       );
//       return;
//     }

//     await pool.query(
//       `UPDATE login_attempts
//        SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP
//        WHERE identifier = $1`,
//       [identifier]
//     );
//   } else {
//     await pool.query(
//       `INSERT INTO login_attempts (identifier, attempts, ip_address, created_at, updated_at)
//        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
//       [identifier, 1, ipAddress]
//     );
//   }
// };

// // ✅ COMPLETE CLEAN LOGIN ENDPOINT
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     if (!email || !password) {
//       return res.status(400).json({ 
//         detail: 'Email and password are required',
//         required: ['email', 'password']
//       });
//     }

//     const emailLower = email.toLowerCase();
//     const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
//     const identifier = `${ipAddress}:${emailLower}`;

//     // Check brute force lockout FIRST
//     const attemptCheck = await pool.query(
//       'SELECT attempts, locked_until FROM login_attempts WHERE identifier = $1',
//       [identifier]
//     );

//     if (attemptCheck.rows.length > 0) {
//       const { attempts, locked_until } = attemptCheck.rows[0];
//       if (locked_until && new Date(locked_until) > new Date()) {
//         const remainingTime = Math.ceil((new Date(locked_until) - new Date()) / 1000 / 60);
//         return res.status(429).json({ 
//           detail: `Too many failed attempts. Try again in ${remainingTime} minutes`,
//           retry_after: remainingTime
//         });
//       }
//     }

//     // **FIX 1**: Single query gets user + password_hash together
//     const result = await pool.query(
//       'SELECT id, email, password_hash, name, role, charity_id, charity_percentage, subscription_status FROM users WHERE email = $1', 
//       [emailLower]
//     );
    
//     if (result.rows.length === 0) {
//       // Always increment attempts (security - hides user existence)
//       await updateLoginAttempts(identifier, false);
//       return res.status(401).json({ detail: 'Invalid email or password' });
//     }

//     const user = result.rows[0];

//     // **FIX 2**: Verify password
//     const validPassword = await bcrypt.compare(password, user.password_hash);
    
//     if (!validPassword) {
//       await updateLoginAttempts(identifier, false);
//       return res.status(401).json({ detail: 'Invalid email or password' });
//     }

//     // **FIX 3**: Clear attempts on success
//     await pool.query('DELETE FROM login_attempts WHERE identifier = $1', [identifier]);

//     // **FIX 4**: Use updated createAccessToken with role
//     const accessToken = createAccessToken(user.id, user.email, user.role);
//     const refreshToken = createRefreshToken(user.id);

//     setAuthCookies(res, accessToken, refreshToken);

//     // **FIX 5**: Clean response (no password_hash)
//     const { password_hash, ...safeUser } = user;
    
//     res.json({
//       message: 'Login successful',
//       user: safeUser,
//       tokens: { access: true, refresh: true }
//     });

//   } catch (error) {
//     console.error('❌ Login error:', error);
//     res.status(500).json({ detail: 'Login failed. Please try again.' });
//   }
// });

// // **FIXED**: Single helper function for login attempts
// const updateLoginAttempts = async (identifier, success) => {
//   const now = new Date();
//   const maxAttempts = 5;
//   const lockMinutes = 15;

//   if (success) {
//     await pool.query('DELETE FROM login_attempts WHERE identifier = $1', [identifier]);
//     return;
//   }

//   // UPSERT pattern - much cleaner than your duplicate code
//   const existing = await pool.query(
//     'SELECT attempts, locked_until FROM login_attempts WHERE identifier = $1',
//     [identifier]
//   );

//   let newAttempts, lockedUntil;
  
//   if (existing.rows.length === 0) {
//     newAttempts = 1;
//     lockedUntil = null;
//   } else {
//     newAttempts = existing.rows[0].attempts + 1;
//     lockedUntil = newAttempts >= maxAttempts ? 
//       new Date(now.getTime() + lockMinutes * 60 * 1000) : null;
//   }

//   await pool.query(
//     `INSERT INTO login_attempts (identifier, attempts, locked_until, created_at, updated_at) 
//      VALUES ($1, $2, $3, $4, $4)
//      ON CONFLICT (identifier) DO UPDATE SET
//      attempts = $2, 
//      locked_until = $3, 
//      updated_at = $4`,
//     [identifier, newAttempts, lockedUntil, now]
//   );
// };

// // ✅ FIXED /me endpoint
// app.get('/api/auth/me', authenticateToken, async (req, res) => {
//   try {
//     // req.user already has fresh data from authenticateToken middleware
//     const { password_hash, ...safeUser } = req.user;
//     res.json({
//       user: safeUser,
//       token: {
//         valid: true,
//         expires_at: new Date(req.token.exp * 1000).toISOString()
//       }
//     });
//   } catch (error) {
//     console.error('Get me error:', error);
//     res.status(500).json({ detail: 'Failed to fetch user data' });
//   }
// });

// // ✅ FIXED logout with proper cookie clearing
// app.post('/api/auth/logout', (req, res) => {
//   clearAuthCookies(res); // Use the helper we created earlier
//   res.json({ message: 'Logged out successfully' });
// });

// // ✅ Refresh token endpoint (bonus)
// app.post('/api/auth/refresh', async (req, res) => {
//   try {
//     let refreshToken = req.cookies.refresh_token;
    
//     if (!refreshToken) {
//       return res.status(401).json({ detail: 'Refresh token required' });
//     }

//     const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
//     if (payload.type !== 'refresh') {
//       return res.status(401).json({ detail: 'Invalid refresh token' });
//     }

//     const userResult = await pool.query(
//       'SELECT id, email, role FROM users WHERE id = $1',
//       [payload.sub]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(401).json({ detail: 'User not found' });
//     }

//     const user = userResult.rows[0];
//     const newAccessToken = createAccessToken(user.id, user.email, user.role);
//     const newRefreshToken = createRefreshToken(user.id);

//     setAuthCookies(res, newAccessToken, newRefreshToken);
//     res.json({ message: 'Token refreshed', tokens: { access: true, refresh: true } });

//   } catch (error) {
//     console.error('Refresh token error:', error);
//     res.status(401).json({ detail: 'Invalid refresh token' });
//   }
// });
// // ... (rest of your routes remain the same - user scores, charities, admin routes, etc.)

// // Basic route
// app.get('/api/', (req, res) => {
//   res.json({
//     message: 'Golf Charity Platform API ✅',
//     version: '2.0-fixed',
//     endpoints: {
//       auth: '/api/auth/*',
//       users: '/api/users/*',
//       charities: '/api/charities/*',
//       health: '/api/health'
//     }
//   });
// });

// // 404 handler - Express 5 compatible named wildcard
// app.all('/*splat', (req, res) => {
//   res.status(404).json({ detail: 'Endpoint not found' });
// });

// // Global error handler - must keep 4 args
// app.use((error, req, res, next) => {
//   console.error('Global error:', error);

//   if (res.headersSent) {
//     return next(error);
//   }

//   res.status(error.status || 500).json({
//     detail: error.message || 'Internal server error'
//   });
// });

// let server;

// // Graceful shutdown
// const shutdown = async (signal) => {
//   try {
//     console.log(`${signal} received, shutting down gracefully...`);

//     if (server) {
//       await new Promise((resolve, reject) => {
//         server.close((err) => {
//           if (err) return reject(err);
//           resolve();
//         });
//       });
//       console.log('✅ HTTP server closed');
//     }

//     await pool.end();
//     console.log('✅ Database pool closed');

//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Shutdown error:', error);
//     process.exit(1);
//   }
// };

// process.on('SIGTERM', () => shutdown('SIGTERM'));
// process.on('SIGINT', () => shutdown('SIGINT'));

// // Start server
// const startServer = async () => {
//   try {
//     await pool.query('SELECT 1');
//     console.log('✅ Neon PostgreSQL connected successfully');

//     await initDatabase();
//     await seedData();

//     server = app.listen(PORT, '0.0.0.0', () => {
//       console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
//       console.log(`📊 Database: Neon PostgreSQL`);
//       console.log(`🔐 Admin: ${process.env.ADMIN_EMAIL || 'admin@golfcharity.com'}`);
//       console.log(`✅ Test login: POST /api/auth/login`);
//       console.log(`✅ Health check: GET /api/health`);
//     });
//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     await pool.end().catch(() => {});
//     process.exit(1);
//   }
// };

// startServer();

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8001;

// ✅ FIXED DATABASE POOL - Neon PostgreSQL optimized
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  allowExitOnIdle: false,
});

// Database events
pool.on('connect', () => console.log('✅ Database connected'));
pool.on('error', (err) => console.error('❌ Database pool error:', err));

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : [];

app.use(cors({
  origin: function (origin, callback) {
    console.log("Origin:", origin);

    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==================== DATABASE INITIALIZATION ====================
const initDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        charity_id INTEGER,
        charity_percentage INTEGER DEFAULT 10,
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Charities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS charities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        website VARCHAR(255),
        logo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Login attempts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) UNIQUE NOT NULL,
        ip_address TEXT,
        attempts INTEGER DEFAULT 1,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Scores table
    await client.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        value INTEGER NOT NULL CHECK (value >= 1 AND value <= 45),
        date_played DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Winnings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS winnings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tournament_name VARCHAR(255) NOT NULL,
        prize_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Draws table
    await client.query(`
      CREATE TABLE IF NOT EXISTS draws (
        id SERIAL PRIMARY KEY,
        draw_date DATE NOT NULL,
        winning_numbers INTEGER[] NOT NULL,
        prize_pool DECIMAL(10, 2) NOT NULL,
        jackpot_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Draw results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS draw_results (
        id SERIAL PRIMARY KEY,
        draw_id INTEGER REFERENCES draws(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        matched_count INTEGER NOT NULL,
        prize_amount DECIMAL(10, 2) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        proof_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_id VARCHAR(255) UNIQUE,
        amount DECIMAL(10, 2),
        currency VARCHAR(10),
        status VARCHAR(50),
        payment_status VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Password reset tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Safety migration for login_attempts
    await client.query(`
      ALTER TABLE login_attempts
      ADD COLUMN IF NOT EXISTS ip_address TEXT
    `);

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_scores_date_played ON scores(date_played)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_winnings_user_id ON winnings(user_id)`);

    await client.query('COMMIT');
    console.log('✅ Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database init error:', error);
    throw error;
  } finally {
    client.release();
  }
};
// ==================== SEED DATA ====================
const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@golfcharity.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'change-this-now';

    // Create admin user
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await client.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)`,
        [adminEmail, hashedPassword, 'Golf Charity Admin', 'admin']
      );
      console.log('✅ Admin user created:', adminEmail);
    }

    // Seed charities
    const charities = [
      ['Save the Children', 'Helping children worldwide', 'Children', 'https://www.savethechildren.org'],
      ['Red Cross', 'Humanitarian aid organization', 'Health', 'https://www.redcross.org'],
      ['WWF', 'Wildlife conservation', 'Environment', 'https://www.worldwildlife.org'],
      ['Doctors Without Borders', 'Medical humanitarian organization', 'Health', 'https://www.doctorswithoutborders.org'],
      ['Water.org', 'Safe water and sanitation', 'Water', 'https://water.org']
    ];

    for (const charity of charities) {
      await client.query(
        `INSERT INTO charities (name, description, category, website)
         VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
        charity
      );
    }

    await client.query('COMMIT');
    console.log('✅ Sample data seeded');
    console.log(`🔐 Admin: ${adminEmail} / ${adminPassword}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ==================== AUTH MIDDLEWARE ====================
const authenticateToken = async (req, res, next) => {
  let token = req.cookies?.access_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({ detail: 'Access token required' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ detail: 'Server configuration error' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== 'access') {
      return res.status(401).json({ detail: 'Invalid token type' });
    }

    const result = await pool.query(
      `SELECT id, email, name, role, charity_id, charity_percentage, subscription_status
       FROM users WHERE id = $1`,
      [payload.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ detail: 'User not found' });
    }

    req.user = result.rows[0];
    req.token = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token expired' });
    }
    return res.status(401).json({ detail: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
};

// ==================== TOKEN HELPERS ====================
const createAccessToken = (userId, email, role) => {
  return jwt.sign(
    { sub: userId, email, role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const createRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  };

  res.cookie('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const clearAuthCookies = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };
  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
};

// ==================== FIXED LOGIN ATTEMPTS HELPER ====================
const updateLoginAttempts = async (identifier, success) => {
  const now = new Date();
  const maxAttempts = 5;
  const lockMinutes = 15;

  if (success) {
    await pool.query('DELETE FROM login_attempts WHERE identifier = $1', [identifier]);
    return;
  }

  const existing = await pool.query(
    'SELECT attempts, locked_until FROM login_attempts WHERE identifier = $1',
    [identifier]
  );

  let newAttempts, lockedUntil;
  if (existing.rows.length === 0) {
    newAttempts = 1;
    lockedUntil = null;
  } else {
    newAttempts = existing.rows[0].attempts + 1;
    lockedUntil = newAttempts >= maxAttempts 
      ? new Date(now.getTime() + lockMinutes * 60 * 1000) 
      : null;
  }

  await pool.query(
    `INSERT INTO login_attempts (identifier, attempts, locked_until, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $4)
     ON CONFLICT (identifier) DO UPDATE SET
     attempts = $2, locked_until = $3, updated_at = $4`,
    [identifier, newAttempts, lockedUntil, now]
  );
};

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// API root
app.get('/api/', (req, res) => {
  res.json({
    message: 'Golf Charity Platform API ✅',
    version: '2.0-fixed',
    endpoints: {
      auth: '/api/auth/*',
      charities: '/api/charities/*',
      health: '/api/health'
    },
    testLogin: {
      email: process.env.ADMIN_EMAIL || 'admin@golfcharity.com',
      password: process.env.ADMIN_PASSWORD || 'change-this-now'
    }
  });
});

// ✅ FIXED REGISTER ROUTE
app.post('/api/auth/register', async (req, res) => {
  try {
   const body = req.body || {};
   const { email, password, name, charity_id, charity_percentage } = body;

    if (!email || !password || !name) {
      return res.status(400).json({ detail: 'Email, password, and name required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ detail: 'Password must be at least 6 characters' });
    }

    const emailLower = email.toLowerCase();
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const charityIdNum = charity_id ? Number(charity_id) : null;

if (charityIdNum) {
  const charityCheck = await pool.query(
    'SELECT id FROM charities WHERE id = $1',
    [charityIdNum]
  );

  if (charityCheck.rows.length === 0) {
    return res.status(400).json({ detail: 'Charity does not exist' });
  }
}
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, charity_id, charity_percentage)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, charity_id, charity_percentage, subscription_status`,
      [emailLower, passwordHash, name, 'user', charity_id || null, charity_percentage || null]
    );

    const user = result.rows[0];
    const accessToken = createAccessToken(user.id, user.email, user.role);
    const refreshToken = createRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'Registration successful',
      user,
      tokens: { access: true, refresh: true }
    });
  } catch (error) {
  console.error("❌ Register error FULL:", error); // 👈 ADD THIS
  res.status(500).json({ detail: error.message }); // 👈 TEMP CHANGE
}
});

// ✅ FIXED LOGIN ROUTE - SINGLE SOURCE OF TRUTH
app.post('/api/auth/login', async (req, res) => {
  try {
    const body = req.body || {};
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password required' });
    }

    const emailLower = email.toLowerCase();
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const identifier = `${ipAddress}:${emailLower}`;

    // Check lockout
    const attemptCheck = await pool.query(
      'SELECT attempts, locked_until FROM login_attempts WHERE identifier = $1',
      [identifier]
    );

    if (attemptCheck.rows.length > 0) {
      const { locked_until } = attemptCheck.rows[0];
      if (locked_until && new Date(locked_until) > new Date()) {
        const remaining = Math.ceil((new Date(locked_until) - new Date()) / 60000);
        return res.status(429).json({ 
          detail: `Too many attempts. Try again in ${remaining} minutes` 
        });
      }
    }

    // Single query gets everything
    const result = await pool.query(
      `SELECT id, email, password_hash, name, role, charity_id, charity_percentage, subscription_status
       FROM users WHERE email = $1`,
      [emailLower]
    );

    if (result.rows.length === 0) {
      await updateLoginAttempts(identifier, false);
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
  return res.status(500).json({ detail: "User password missing" });
}
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!user.password_hash) {
  console.error("❌ Missing password_hash for user:", user);
  return res.status(500).json({ detail: "User password not found" });
}

    if (!validPassword) {
      await updateLoginAttempts(identifier, false);
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    // Success - clear attempts and create tokens
    await updateLoginAttempts(identifier, true);
    const accessToken = createAccessToken(user.id, user.email, user.role);
    const refreshToken = createRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);
    const { password_hash, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      user: safeUser,
      tokens: { access: true, refresh: true }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({
    user: req.user,
    token: { valid: true, expires_at: new Date(req.token.exp * 1000).toISOString() }
  });
});

// Refresh token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ detail: 'Refresh token required' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (payload.type !== 'refresh') {
      return res.status(401).json({ detail: 'Invalid refresh token' });
    }

    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [payload.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ detail: 'User not found' });
    }

    const user = userResult.rows[0];
    const newAccessToken = createAccessToken(user.id, user.email, user.role);
    const newRefreshToken = createRefreshToken(user.id);

    setAuthCookies(res, newAccessToken, newRefreshToken);
    res.json({ message: 'Token refreshed', tokens: { access: true, refresh: true } });
  } catch (error) {
    res.status(401).json({ detail: 'Invalid refresh token' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ message: 'Logged out successfully' });
});

// ==================== USER SCORE ROUTES ====================

// Get current user scores
app.get('/api/users/scores', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, value, date_played, created_at
       FROM scores
       WHERE user_id = $1
       ORDER BY date_played DESC, created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ detail: 'Failed to fetch scores' });
  }
});

// Add new score
app.post('/api/users/scores', authenticateToken, async (req, res) => {
  try {
    const { value, date_played } = req.body || {};

    if (!value || !date_played) {
      return res.status(400).json({ detail: 'Score value and date are required' });
    }

    if (Number(value) < 1 || Number(value) > 45) {
      return res.status(400).json({ detail: 'Score must be between 1 and 45' });
    }

    const result = await pool.query(
      `INSERT INTO scores (user_id, value, date_played)
       VALUES ($1, $2, $3)
       RETURNING id, value, date_played, created_at`,
      [req.user.id, Number(value), date_played]
    );

    res.status(201).json({
      message: 'Score added successfully',
      score: result.rows[0],
    });
  } catch (error) {
    console.error('Add score error:', error);
    res.status(500).json({ detail: 'Failed to add score' });
  }
});

// Delete score
app.delete('/api/users/scores/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM scores
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Score not found' });
    }

    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({ detail: 'Failed to delete score' });
  }
});

// Get user winnings
app.get('/api/users/winnings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, tournament_name, prize_amount, created_at
       FROM winnings
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get winnings error:', error);
    res.status(500).json({ detail: 'Failed to fetch winnings' });
  }
});

// ==================== CHARITIES ROUTES ====================
app.get('/api/charities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, category, website, logo_url 
      FROM charities 
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Charities fetch error:', error);
    res.status(500).json({ detail: 'Failed to fetch charities' });
  }
});

app.get('/api/charities/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, category, website, logo_url 
      FROM charities 
      WHERE id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Charity not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Charity fetch error:', error);
    res.status(500).json({ detail: 'Failed to fetch charity' });
  }
});

// Admin routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, charity_id, charity_percentage, 
              subscription_status, created_at, updated_at 
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ detail: 'Failed to fetch users' });
  }
});



// ==================== 404 & ERROR HANDLERS ====================
app.all('/{*splat}', (req, res) => {
  res.status(404).json({ detail: 'Endpoint not found' });
});

app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ detail: 'Internal server error' });
});

// ==================== GRACEFUL SHUTDOWN ====================
let server;
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down...`);
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
      pool.end(() => {
        console.log('✅ Database pool closed');
        process.exit(0);
      });
    });
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Neon PostgreSQL connected');

    await initDatabase();
    await seedData();

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Golf Charity API running on http://localhost:${PORT}`);
      console.log(`📊 Database: Neon PostgreSQL`);
      console.log(`🔐 Test Login:`);
      console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@golfcharity.com'}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'change-this-now'}`);
      console.log(`✅ Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Server start failed:', error);
    process.exit(1);
  }
};

startServer();