# Complaint Management System

ระบบแบบฟอร์มรับเรื่องร้องทุกข์ด้วย Node.js, Express, และ SQLite

## ✨ Features

- 📝 ฟอร์มแจ้งเรื่องร้องทุกข์ (ชื่อตัวเลือก)
- 🔐 หน้าผู้ดูแลระบบ (ป้องกันด้วยรหัสผ่าน)
- 📊 ดูรายการเรื่องทั้งหมด
- 💾 เก็บข้อมูลใน SQLite
- 🎨 ดีไซน์เรียบง่าย - สีขาว

## 📋 Requirements

- Node.js 14+ 
- npm

## 🚀 Installation

```bash
# Install dependencies
npm install

# Run the server
npm start

# For development (with auto-reload)
npm run dev
```

## 📍 URLs

- **Main Page**: http://localhost:5001
- **Admin Panel**: http://localhost:5001/admin
- **Default Admin Password**: `admin123`

## 📁 Project Structure

```
first_flask_web/
├── app/
│   ├── index.html      # Main form page
│   ├── admin.html      # Admin panel
│   ├── app.js          # Frontend JS
│   ├── admin.js        # Admin JS
│   └── style.css       # Styling
├── server.js           # Express server
├── package.json        # Dependencies
└── complaints.db       # SQLite database (created on first run)
```

## 🔧 API Endpoints

### POST /api/complaints
Submit a new complaint
```json
{
  "name": "Your Name",
  "content": "Complaint details..."
}
```

### GET /api/admin-complaints?pw=PASSWORD
Get all complaints (requires password)

## 🔐 Change Admin Password

Edit `server.js` line 67:
```javascript
const adminPassword = process.env.ADMIN_PASSWORD || 'your-new-password';
```

Or set environment variable:
```bash
set ADMIN_PASSWORD=your-new-password
npm start
```

## 📝 Notes

- All HTML content is escaped to prevent XSS
- Uses Helmet for security headers
- CORS enabled for development
- SQLite database auto-creates on first run

## 📜 License

MIT
