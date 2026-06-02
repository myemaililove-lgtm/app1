// Character counter
const contentTextarea = document.getElementById('content');
const charCount = document.getElementById('charCount');

if (contentTextarea) {
  contentTextarea.addEventListener('input', () => {
    charCount.textContent = contentTextarea.value.length;
  });
}

// Form submission
document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const content = document.getElementById('content').value.trim();
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('submitBtn');

  // Validation
  if (!content) {
    showMessage('กรุณาใส่รายละเอียด', 'error');
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'กำลังส่ง...';

  try {
    console.log('Submitting complaint:', { name, content: content.substring(0, 50) + '...' });
    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name || 'ผู้ไม่ออกนาม',
        content: content,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Server returned invalid JSON: ' + responseText);
    }

    console.log('Response data:', data);

    if (data.success) {
      showMessage(data.message, 'success');
      document.getElementById('complaintForm').reset();
      charCount.textContent = '0';
    } else {
      showMessage(data.message || 'เกิดข้อผิดพลาด', 'error');
    }
  } catch (error) {
    console.error('Submission error:', error);
    showMessage('❌ เกิดข้อผิดพลาด: ' + error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'ส่งข้อมูล';
  }
});

function showMessage(message, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
  messageDiv.className = `alert alert-${type}`;
  messageDiv.classList.remove('hidden');

  // Auto hide success message
  if (type === 'success') {
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 4000);
  }
}
