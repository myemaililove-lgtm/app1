const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'app')));

// Database initialization
const db = new sqlite3.Database(path.join(__dirname, 'complaints.db'), (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('✓ Connected to SQLite database');
  }
});

// Create complaints table
db.run(`
  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    date_posted DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Table creation error:', err.message);
  } else {
    console.log('✓ Complaints table ready');
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'admin.html'));
});

// API: Submit complaint
app.post('/api/complaints', (req, res) => {
  console.log('POST /api/complaints - Request received');
  console.log('Request body:', req.body);
  
  const { name, content } = req.body;

  // Validation
  if (!content || !content.trim()) {
    console.warn('Validation failed: No content');
    return res.json({ success: false, message: 'กรุณาใส่รายละเอียด' });
  }

  const finalName = name ? name.trim() : 'ผู้ไม่ออกนาม';
  
  // Get Thailand time (UTC+7)
  const now = new Date();
  const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const datePosted = thaiTime.toISOString().replace('T', ' ').split('.')[0];
  
  console.log('Inserting complaint:', { finalName, contentLength: content.length, datePosted });

  db.run(
    'INSERT INTO complaints (name, content, date_posted) VALUES (?, ?, ?)',
    [finalName, content, datePosted],
    function(err) {
      if (err) {
        console.error('Database insert error:', err.message);
        return res.json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
      }
      console.log('Complaint inserted successfully, ID:', this.lastID);
      res.json({
        success: true,
        message: 'ส่งเรื่องเรียบร้อย! ขอบคุณที่ช่วยให้เรารู้ 😊'
      });
    }
  );
});

// API: Get all complaints (admin only)
app.get('/api/admin-complaints', (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const pw = req.query.pw;

  if (!pw || pw !== adminPassword) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.all(
    'SELECT * FROM complaints ORDER BY date_posted DESC',
    (err, rows) => {
      if (err) {
        console.error('Query error:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ complaints: rows || [] });
    }
  );
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Main page: http://localhost:${PORT}`);
  console.log(`🔐 Admin page: http://localhost:${PORT}/admin`);
  console.log(`\n💡 Default admin password: admin123\n`);
});
