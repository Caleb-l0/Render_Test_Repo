const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Connect to Render Postgres database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // must be set in Render Environment Variables
  ssl: { rejectUnauthorized: false }
});

// Create users table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )
`).catch(console.error);

// Insert test user if not exists
(async () => {
  const hashedPassword = await bcrypt.hash('pass', 10);
  await pool.query(
    `INSERT INTO users (username, password_hash)
     SELECT $1, $2 WHERE NOT EXISTS (
       SELECT 1 FROM users WHERE username = $1
     )`,
    ['user', hashedPassword]
  );
})();

// Serve login page
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// Handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);

    if (result.rows.length === 0) return res.send('Login failed. <a href="/">Back</a>');

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) res.send('Login successful!');
    else res.send('Login failed. <a href="/">Back</a>');
  } catch (err) {
    console.error(err);
    res.send('An error occurred. <a href="/">Back</a>');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
