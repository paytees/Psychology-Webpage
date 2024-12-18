// server.js - Backend code to handle API requests
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Set up CORS to allow the frontend (React) to interact with the backend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all origins (consider using a more restrictive URL in production)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Methods allowed
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Headers allowed
  next();
});

const corsOptions = {
  origin: 'http://localhost:3000',  // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow cookies and credentials to be sent
};

app.use(cors(corsOptions));

app.options('*', cors());
app.use(express.json());

const SECRET_KEY = process.env.OPENAI_API_KEY;

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "adminpassword";

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error("Error opening database", err.message);
  else console.log("Connected to SQLite database.");
});

// Database setup for users and roles
function initializeTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS role (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      role TEXT CHECK(role IN ('registered', 'approved', 'master')),
      approval_status TEXT CHECK(approval_status IN ('pending', 'approved', 'reverted')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS UserRequest (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  chatGPTResponse TEXT,
  adminResponse TEXT,
  createdAt TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,
  tag TEXT NOT NULL
);
`);

    console.log('Tables initialized.');
  });
}

// Utility functions
const generateToken = (user, expiresIn = '1h') => jwt.sign(user, SECRET_KEY, { expiresIn });
const verifyToken = (token) => jwt.verify(token, SECRET_KEY);

// User registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
    if (err) {
      console.error('Error inserting into users table:', err);
      return res.status(400).json({ error: 'Username already exists or other database error' });
    }

    db.run(
      `INSERT INTO role (user_id, role, approval_status) VALUES (?, 'registered', 'pending')`,
      [this.lastID],
      (err) => {
        if (err) {
          console.error('Error assigning role:', err);
          return res.status(500).json({ error: 'Error assigning role' });
        }
        res.json({ message: 'Registration successful, awaiting approval' });
      }
    );
  });
});

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({ id: user.id, username: user.username });
    res.json({ message: 'Login successful', token });
  });
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = generateToken({ role: 'master' });
    res.json({ message: 'Admin login successful', token });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// Fetch all registered users with their statuses
app.get('/admin/users', (req, res) => {
  db.all(`SELECT u.id, u.username, r.approval_status FROM users u JOIN role r ON u.id = r.user_id`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error fetching users' });
    res.json({ users: rows });
  });
});

// Admin approves or reverts user access
app.post('/admin/approve-revert', (req, res) => {
  const { userId, action } = req.body;
  const status = action === 'approve' ? 'approved' : 'reverted';

  db.run(
    `UPDATE role SET approval_status = ? WHERE user_id = ? AND role = 'registered'`,
    [status, userId],
    function (err) {
      if (err || this.changes === 0) return res.status(500).json({ error: 'Action failed' });
      res.json({ message: `User ${action === 'approve' ? 'approved' : 'reverted'} successfully` });
    }
  );
});

// Check Chatbot Access for Users
app.get('/chatbot-access', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const userId = decoded.id;

    db.get(
      `SELECT * FROM role WHERE user_id = ? AND approval_status = 'approved'`,
      [userId],
      (err, row) => {
        if (err || !row) return res.status(403).json({ error: 'Access denied' });
        res.json({ message: 'Access granted' });
      }
    );
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Chatbot Interaction
app.post('/chat', async (req, res) => {
  const { message, username } = req.body;
  if (!message || !username) return res.status(400).json({ error: 'Message and username are required' });

  try {
    // Generate the response using the ChatGPT model
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECRET_KEY}`, // Replace with your OpenAI API key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    // Handle OpenAI response
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error.message}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Insert the response into the database
    const createdAt = new Date().toISOString();
    const insertQuery = `INSERT INTO UserRequest (username, chatGPTResponse, adminResponse, createdAt) VALUES (?, ?, ?, ?)`;

    db.run(insertQuery, [username, reply, '', createdAt], function (err) {
      if (err) {
        console.error('Error inserting new user request:', err.message);
        return res.status(500).json({ error: 'Failed to insert new user request' });
      }
      console.log('User request inserted successfully with ID:', this.lastID);
      res.json({ reply });  // Send back the ChatGPT response
    });

  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
    res.status(500).json({ error: 'Failed to get response from the chatbot' });
  }
});


// Endpoint to fetch all user requests
app.post('/update-user-request', (req, res) => {
  const { userId, question, chatGPTResponse, username } = req.body;

  if (!username || !question || !chatGPTResponse) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `UPDATE UserRequest SET username = ?, question = ?, chatGPTResponse = ? WHERE id = ?`,
    [username, question, chatGPTResponse, userId],
    function (err) {
      if (err) {
        console.error('Error updating user request:', err.message);
        return res.status(500).json({ error: 'Failed to update user request' });
      }
      res.json({ message: 'User request updated successfully' });
    }
  );
});

// Endpoint to update ChatGPT response
app.put('/user-requests/:id/chatgpt-response', (req, res) => {
  const { id } = req.params;
  const { chatGPTResponse } = req.body;

  if (!chatGPTResponse) {
    return res.status(400).json({ error: 'ChatGPT response is required' });
  }

  db.run(
    `UPDATE UserRequest SET chatGPTResponse = ? WHERE id = ?`,
    [chatGPTResponse, id],
    function (err) {
      if (err || this.changes === 0) {
        console.error('Error updating ChatGPT response:', err ? err.message : 'No changes made');
        return res.status(500).json({ error: 'Failed to update ChatGPT response' });
      }
      res.json({ message: 'ChatGPT response updated successfully' });
    }
  );
});


// Fetch adminResponse
app.put('/user-requests/:id/admin-response', (req, res) => {
  const { id } = req.params;
  const { adminResponse } = req.body;

  if (!adminResponse) {
    return res.status(400).json({ error: 'Admin response is required' });
  }

  db.run(
    `UPDATE UserRequest SET adminResponse = ? WHERE id = ?`,
    [adminResponse, id],
    function (err) {
      if (err || this.changes === 0) {
        console.error('Error updating admin response:', err.message);
        return res.status(500).json({ error: 'Failed to update admin response' });
      }
      res.json({ message: 'Admin response updated successfully' });
    }
  );
});

app.get('/user-requests', (req, res) => {
  db.all(`SELECT username, chatGPTResponse, adminResponse, createdAt FROM UserRequest ORDER BY createdAt DESC`, (err, rows) => {
    if (err) {
      console.error('Error fetching user requests:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user requests' });
    }
    res.json({ userRequests: rows });
  });
});


// Fetch Admin Prompts
app.get('/prompts', (req, res) => {
  db.all(
      `SELECT id, tag, prompt FROM prompts`,
      (err, rows) => {
          if (err) {
              console.error('Error fetching prompts:', err.message);
              return res.status(500).json({ error: 'Failed to fetch prompts.' });
          }

          if (!rows || rows.length === 0) {
              return res.status(404).json({ error: 'No prompts found.' });
          }

          res.json({ prompts: rows });
      }
  );
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
