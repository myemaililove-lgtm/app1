let currentAdminPassword = null;

// Check if already logged in when page loads
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pw = urlParams.get('pw');

  if (pw) {
    currentAdminPassword = pw;
    loadComplaints();
  } else {
    showLoginForm();
  }

  // Setup event listeners
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const sortOrder = document.getElementById('sortOrder');
  const adminPassword = document.getElementById('adminPassword');

  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  if (sortOrder) {
    sortOrder.addEventListener('change', loadComplaints);
  }
  if (adminPassword) {
    adminPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
});

function showLoginForm() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('adminSection').classList.add('hidden');
}

function showAdminPanel() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('adminSection').classList.remove('hidden');
}

async function handleLogin() {
  const password = document.getElementById('adminPassword').value.trim();
  const messageDiv = document.getElementById('loginMessage');

  if (!password) {
    showLoginMessage('กรุณาใส่รหัสผ่าน', 'error');
    return;
  }

  try {
    console.log('Attempting login with password length:', password.length);
    const response = await fetch(
      `/api/admin-complaints?pw=${encodeURIComponent(password)}`
    );

    console.log('Response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Login successful, data:', data);
      currentAdminPassword = password;
      // Update URL with password
      window.history.replaceState(
        {},
        '',
        `?pw=${encodeURIComponent(password)}`
      );
      showAdminPanel();
      loadComplaints();
    } else {
      const errorData = await response.json();
      console.log('Login failed:', errorData);
      showLoginMessage('❌ รหัสผ่านไม่ถูกต้อง (ลองใช้ admin123)', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showLoginMessage('⚠️ เกิดข้อผิดพลาด: ' + error.message, 'error');
  }
}

async function loadComplaints() {
  if (!currentAdminPassword) {
    console.warn('No admin password set');
    return;
  }

  try {
    console.log('Loading complaints...');
    const response = await fetch(
      `/api/admin-complaints?pw=${encodeURIComponent(currentAdminPassword)}`
    );

    console.log('Load response status:', response.status);

    if (!response.ok) {
      console.error('Failed to load complaints:', response.status);
      if (response.status === 403) {
        console.log('Access denied, logging out');
        handleLogout();
      }
      return;
    }

    const data = await response.json();
    console.log('Complaints loaded:', data);
    
    const tbody = document.querySelector('#complaintTable tbody');
    tbody.innerHTML = '';

    let complaints = data.complaints || [];
    console.log('Total complaints:', complaints.length);
    document.getElementById('complaintCount').textContent = `รวม ${complaints.length} เรื่อง`;

    // Sort by date
    const sortOrder = document.getElementById('sortOrder').value;
    complaints = complaints.sort((a, b) => {
      const dateA = new Date(a.date_posted);
      const dateB = new Date(b.date_posted);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    if (complaints.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="loading">ยังไม่มีเรื่องร้องทุกข์</td>
        </tr>
      `;
    } else {
      complaints.forEach((complaint) => {
        const row = document.createElement('tr');
        const date = new Date(complaint.date_posted);
        
        // Display as formatted Thai date/time
        const fullDateTime = new Date(complaint.date_posted).toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        const relativeTime = getRelativeTime(date);

        row.innerHTML = `
          <td><small>${escapeHtml(fullDateTime)}</small></td>
          <td><small class="relative-time">${escapeHtml(relativeTime)}</small></td>
          <td><strong>${escapeHtml(complaint.name)}</strong></td>
          <td>${escapeHtml(complaint.content.substring(0, 80))}${complaint.content.length > 80 ? '...' : ''}</td>
        `;

        tbody.appendChild(row);
      });
    }

  } catch (error) {
    console.error('Load complaints error:', error);
    const tbody = document.querySelector('#complaintTable tbody');
    tbody.innerHTML = `<tr><td colspan="4" class="loading">❌ เกิดข้อผิดพลาด: ${error.message}</td></tr>`;
  }
}

function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'เมื่อสักครู่';
  if (diffMins < 60) return `เมื่อ ${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `เมื่อ ${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `เมื่อ ${diffDays} วันที่แล้ว`;
  
  return 'มากกว่า 1 สัปดาห์ที่แล้ว';
}

function handleLogout() {
  currentAdminPassword = null;
  window.history.replaceState({}, '', '/admin');
  document.getElementById('adminPassword').value = '';
  showLoginForm();
}

function showLoginMessage(message, type) {
  const messageDiv = document.getElementById('loginMessage');
  messageDiv.textContent = message;
  messageDiv.className = `alert alert-${type}`;
  messageDiv.classList.remove('hidden');
}


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
