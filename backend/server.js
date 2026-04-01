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

// Database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Database initialization
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
        user_id INTEGER REFERENCES users(id),
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

    // Login attempts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        attempts INTEGER DEFAULT 1,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)');

    await client.query('COMMIT');
    console.log('✅ Database tables initialized');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization error:', error);
  } finally {
    client.release();
  }
};

// Seed admin and sample charities
const seedData = async () => {
  const client = await pool.connect();
  try {
    // Check if admin exists
    const adminCheck = await client.query('SELECT * FROM users WHERE email = $1', [process.env.ADMIN_EMAIL]);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await client.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        [process.env.ADMIN_EMAIL, hashedPassword, 'Admin User', 'admin']
      );
      console.log('✅ Admin user created');
    }

    // Seed sample charities if none exist
    const charityCheck = await client.query('SELECT COUNT(*) FROM charities');
    if (parseInt(charityCheck.rows[0].count) === 0) {
      const charities = [
        ['Save the Children', 'Helping children worldwide', 'Children', 'https://www.savethechildren.org'],
        ['Red Cross', 'Humanitarian aid organization', 'Health', 'https://www.redcross.org'],
        ['WWF', 'Wildlife conservation', 'Environment', 'https://www.worldwildlife.org'],
        ['Doctors Without Borders', 'Medical humanitarian organization', 'Health', 'https://www.doctorswithoutborders.org'],
        ['Water.org', 'Safe water and sanitation', 'Water', 'https://water.org'],
      ];
      
      for (const charity of charities) {
        await client.query(
          'INSERT INTO charities (name, description, category, website) VALUES ($1, $2, $3, $4)',
          charity
        );
      }
      console.log('✅ Sample charities seeded');
    }

    // Write test credentials
    const fs = require('fs');
    const credentialsPath = '/app/memory/test_credentials.md';
    const content = `# Test Credentials\n\n## Admin Account\n- Email: ${process.env.ADMIN_EMAIL}\n- Password: ${process.env.ADMIN_PASSWORD}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n- POST /api/auth/forgot-password\n- POST /api/auth/reset-password\n`;
    
    if (!fs.existsSync('/app/memory')) {
      fs.mkdirSync('/app/memory', { recursive: true });
    }
    fs.writeFileSync(credentialsPath, content);
    console.log('✅ Test credentials written');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    client.release();
  }
};

// Auth middleware
const authenticateToken = async (req, res, next) => {
  let token = req.cookies.access_token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ detail: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type !== 'access') {
      return res.status(401).json({ detail: 'Invalid token type' });
    }

    const result = await pool.query('SELECT id, email, name, role, charity_id, charity_percentage, subscription_status FROM users WHERE id = $1', [payload.sub]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ detail: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token expired' });
    }
    return res.status(401).json({ detail: 'Invalid token' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
};

// Helper functions
const createAccessToken = (userId, email) => {
  return jwt.sign(
    { sub: userId, email, type: 'access' },
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
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/'
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, charity_id, charity_percentage } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ detail: 'Email, password, and name are required' });
    }

    const emailLower = email.toLowerCase();
    
    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, charity_id, charity_percentage) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name, role, charity_id, charity_percentage, subscription_status, created_at`,
      [emailLower, passwordHash, name, charity_id || null, charity_percentage || 10]
    );

    const user = result.rows[0];
    const accessToken = createAccessToken(user.id, user.email);
    const refreshToken = createRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);
    res.json(user);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase();
    const ipAddress = req.ip || 'unknown';
    const identifier = `${ipAddress}:${emailLower}`;

    // Check brute force lockout
    const attemptCheck = await pool.query(
      'SELECT attempts, locked_until FROM login_attempts WHERE identifier = $1',
      [identifier]
    );

    if (attemptCheck.rows.length > 0) {
      const { attempts, locked_until } = attemptCheck.rows[0];
      if (locked_until && new Date(locked_until) > new Date()) {
        const remainingTime = Math.ceil((new Date(locked_until) - new Date()) / 1000 / 60);
        return res.status(429).json({ detail: `Too many failed attempts. Try again in ${remainingTime} minutes` });
      }
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [emailLower]);
    
    if (result.rows.length === 0) {
      // Increment failed attempts
      await pool.query(
        `INSERT INTO login_attempts (identifier, attempts, updated_at) 
         VALUES ($1, 1, CURRENT_TIMESTAMP) 
         ON CONFLICT (identifier) DO UPDATE SET 
         attempts = login_attempts.attempts + 1, 
         updated_at = CURRENT_TIMESTAMP`,
        [identifier]
      );
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      // Increment attempts
      const currentAttempts = attemptCheck.rows.length > 0 ? attemptCheck.rows[0].attempts : 0;
      const newAttempts = currentAttempts + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await pool.query(
        `INSERT INTO login_attempts (identifier, attempts, locked_until, updated_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
         ON CONFLICT (identifier) DO UPDATE SET 
         attempts = $2, 
         locked_until = $3, 
         updated_at = CURRENT_TIMESTAMP`,
        [identifier, newAttempts, lockedUntil]
      );

      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    // Clear failed attempts
    await pool.query('DELETE FROM login_attempts WHERE identifier = $1', [identifier]);

    // Create tokens
    const accessToken = createAccessToken(user.id, user.email);
    const refreshToken = createRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);

    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out successfully' });
});

// Refresh token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ detail: 'No refresh token' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (payload.type !== 'refresh') {
      return res.status(401).json({ detail: 'Invalid token type' });
    }

    const result = await pool.query('SELECT email FROM users WHERE id = $1', [payload.sub]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ detail: 'User not found' });
    }

    const newAccessToken = createAccessToken(payload.sub, result.rows[0].email);
    
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(401).json({ detail: 'Invalid refresh token' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase();

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    
    if (result.rows.length === 0) {
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    const userId = result.rows[0].id;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );

    console.log(`\n🔐 Password Reset Link: ${process.env.FRONTEND_URL}/reset-password?token=${token}\n`);

    res.json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ detail: 'Failed to process request' });
  }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;

    const result = await pool.query(
      'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ detail: 'Invalid or expired token' });
    }

    const { user_id, expires_at, used } = result.rows[0];

    if (used) {
      return res.status(400).json({ detail: 'Token already used' });
    }

    if (new Date(expires_at) < new Date()) {
      return res.status(400).json({ detail: 'Token expired' });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = $1', [token]);

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ detail: 'Failed to reset password' });
  }
});

// ==================== USER ROUTES ====================

// Get user scores
app.get('/api/users/scores', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, value, date_played, created_at FROM scores WHERE user_id = $1 ORDER BY date_played DESC, created_at DESC LIMIT 5',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ detail: 'Failed to fetch scores' });
  }
});

// Add score
app.post('/api/users/scores', authenticateToken, async (req, res) => {
  try {
    const { value, date_played } = req.body;

    if (!value || !date_played) {
      return res.status(400).json({ detail: 'Score value and date are required' });
    }

    if (value < 1 || value > 45) {
      return res.status(400).json({ detail: 'Score must be between 1 and 45' });
    }

    // Insert new score
    await pool.query(
      'INSERT INTO scores (user_id, value, date_played) VALUES ($1, $2, $3)',
      [req.user.id, value, date_played]
    );

    // Keep only latest 5 scores
    await pool.query(
      `DELETE FROM scores WHERE id IN (
        SELECT id FROM scores WHERE user_id = $1 
        ORDER BY date_played DESC, created_at DESC 
        OFFSET 5
      )`,
      [req.user.id]
    );

    // Return updated scores
    const result = await pool.query(
      'SELECT id, value, date_played, created_at FROM scores WHERE user_id = $1 ORDER BY date_played DESC, created_at DESC LIMIT 5',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Add score error:', error);
    res.status(500).json({ detail: 'Failed to add score' });
  }
});

// Delete score
app.delete('/api/users/scores/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM scores WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Score not found' });
    }

    res.json({ message: 'Score deleted' });
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({ detail: 'Failed to delete score' });
  }
});

// Update charity selection
app.put('/api/users/charity', authenticateToken, async (req, res) => {
  try {
    const { charity_id, charity_percentage } = req.body;

    if (!charity_id) {
      return res.status(400).json({ detail: 'Charity ID is required' });
    }

    const percentage = charity_percentage || 10;
    if (percentage < 10 || percentage > 100) {
      return res.status(400).json({ detail: 'Percentage must be between 10 and 100' });
    }

    await pool.query(
      'UPDATE users SET charity_id = $1, charity_percentage = $2 WHERE id = $3',
      [charity_id, percentage, req.user.id]
    );

    res.json({ message: 'Charity selection updated' });
  } catch (error) {
    console.error('Update charity error:', error);
    res.status(500).json({ detail: 'Failed to update charity' });
  }
});

// Get user's subscription
app.get('/api/users/subscription', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ detail: 'Failed to fetch subscription' });
  }
});

// Get user's winnings
app.get('/api/users/winnings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dr.*, d.draw_date, d.winning_numbers 
       FROM draw_results dr 
       JOIN draws d ON dr.draw_id = d.id 
       WHERE dr.user_id = $1 
       ORDER BY d.draw_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get winnings error:', error);
    res.status(500).json({ detail: 'Failed to fetch winnings' });
  }
});

// ==================== CHARITY ROUTES ====================

// Get all charities
app.get('/api/charities', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM charities WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get charities error:', error);
    res.status(500).json({ detail: 'Failed to fetch charities' });
  }
});

// Get charity by ID
app.get('/api/charities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM charities WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Charity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get charity error:', error);
    res.status(500).json({ detail: 'Failed to fetch charity' });
  }
});

// ==================== PAYMENT ROUTES ====================

// Payment webhook (placeholder - will be implemented with Stripe integration)
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  // Stripe webhook handling will be implemented
  res.json({ received: true });
});

// ==================== ADMIN ROUTES ====================

// Get all users
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, subscription_status, charity_id, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ detail: 'Failed to fetch users' });
  }
});

// Get analytics
app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']);
    const activeSubscriptions = await pool.query('SELECT COUNT(*) FROM subscriptions WHERE status = $1', ['active']);
    const totalRevenue = await pool.query('SELECT SUM(amount) FROM subscriptions WHERE status = $1', ['active']);
    const recentDraws = await pool.query('SELECT COUNT(*) FROM draws WHERE draw_date >= CURRENT_DATE - INTERVAL \'30 days\'');

    res.json({
      total_users: parseInt(totalUsers.rows[0].count),
      active_subscriptions: parseInt(activeSubscriptions.rows[0].count),
      total_revenue: parseFloat(totalRevenue.rows[0].sum || 0),
      recent_draws: parseInt(recentDraws.rows[0].count)
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ detail: 'Failed to fetch analytics' });
  }
});

// Manage charities
app.post('/api/admin/charities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, website, logo_url } = req.body;

    const result = await pool.query(
      'INSERT INTO charities (name, description, category, website, logo_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, category, website, logo_url || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create charity error:', error);
    res.status(500).json({ detail: 'Failed to create charity' });
  }
});

// Get all draws
app.get('/api/admin/draws', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM draws ORDER BY draw_date DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    console.error('Get draws error:', error);
    res.status(500).json({ detail: 'Failed to fetch draws' });
  }
});

// Verify winner
app.put('/api/admin/winners/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified, proof_url } = req.body;

    await pool.query(
      'UPDATE draw_results SET verified = $1, proof_url = $2 WHERE id = $3',
      [verified, proof_url || null, id]
    );

    res.json({ message: 'Winner verification updated' });
  } catch (error) {
    console.error('Verify winner error:', error);
    res.status(500).json({ detail: 'Failed to verify winner' });
  }
});

// ==================== BASIC ROUTES ====================

app.get('/api/', (req, res) => {
  res.json({ message: 'Golf Charity Platform API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    await seedData();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Database: PostgreSQL`);
      console.log(`🔐 Admin: ${process.env.ADMIN_EMAIL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();