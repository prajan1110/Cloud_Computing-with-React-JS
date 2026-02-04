const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'student_results.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    roll_number TEXT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    semester INTEGER NOT NULL,
    subject TEXT NOT NULL,
    marks INTEGER NOT NULL,
    grade TEXT,
    cgpa REAL,
    FOREIGN KEY (student_id) REFERENCES students (id)
  );
`);

// Insert sample data
const insertSampleData = () => {
  try {
    // Check if data already exists
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userCount.count === 0) {
      // Insert sample user
      const hashedPassword = bcrypt.hashSync('password123', 10);
      const insertUser = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
      const userResult = insertUser.run('student1', 'student1@example.com', hashedPassword, 'student');

      // Insert sample student
      const insertStudent = db.prepare('INSERT INTO students (user_id, name, roll_number) VALUES (?, ?, ?)');
      const studentResult = insertStudent.run(userResult.lastInsertRowid, 'John Doe', '2024001');

      // Insert sample results
      const insertResult = db.prepare('INSERT INTO results (student_id, semester, subject, marks, grade, cgpa) VALUES (?, ?, ?, ?, ?, ?)');

      // Semester 1
      insertResult.run(studentResult.lastInsertRowid, 1, 'ITC', 85, 'A', 8.5);
      insertResult.run(studentResult.lastInsertRowid, 1, 'FPC', 88, 'A', 8.5);
      insertResult.run(studentResult.lastInsertRowid, 1, 'IWT', 82, 'A', 8.5);
      insertResult.run(studentResult.lastInsertRowid, 1, 'BMC', 87, 'A', 8.5);

      // Semester 2
      insertResult.run(studentResult.lastInsertRowid, 2, 'IFSD', 90, 'A', 8.8);
      insertResult.run(studentResult.lastInsertRowid, 2, 'FPP', 85, 'A', 8.8);
      insertResult.run(studentResult.lastInsertRowid, 2, 'DBMS', 88, 'A', 8.8);
      insertResult.run(studentResult.lastInsertRowid, 2, 'PROBS', 86, 'A', 8.8);

      console.log('Sample data inserted successfully');
    }
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

insertSampleData();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUser = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const result = insertUser.run(username, email, hashedPassword);

    // Create student record
    const insertStudent = db.prepare('INSERT INTO students (user_id, name, roll_number) VALUES (?, ?, ?)');
    insertStudent.run(result.lastInsertRowid, username, `2024${result.lastInsertRowid.toString().padStart(3, '0')}`);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/results', authenticateToken, (req, res) => {
  try {
    const results = db.prepare(`
      SELECT r.*, s.name as student_name, s.roll_number
      FROM results r
      JOIN students s ON r.student_id = s.id
      WHERE s.user_id = ?
      ORDER BY r.semester, r.subject
    `).all(req.user.id);

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/results/summary', authenticateToken, (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT semester, AVG(cgpa) as cgpa, COUNT(*) as subjects
      FROM results
      WHERE student_id IN (SELECT id FROM students WHERE user_id = ?)
      GROUP BY semester
      ORDER BY semester
    `).all(req.user.id);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});