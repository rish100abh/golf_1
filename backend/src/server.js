// api/index.js (create this file)
import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';

// Create pool INSIDE handler (critical for serverless)
export default async function handler(req, res) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Your login logic
    if (req.method === 'POST') {
      const { email, password } = req.body;
      
      // Query users table
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length > 0) {
        res.status(200).json({ success: true, user: result.rows[0] });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    
    res.status(200).json({ message: 'Backend working!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    // Close pool
    await pool.end();
  }
}