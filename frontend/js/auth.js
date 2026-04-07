// API_BASE in utils.js - no dupe

// Show loading
function showLoading(form, show = true) {
  const btn = form.querySelector('button');
  if (!btn) return;
  
  if (show) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Loading...';
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || 'Login';
    delete btn.dataset.originalText;
    btn.disabled = false;
  }
}

// Show message 
function showMessage(formId, message, isError = false) {
  let msg = document.getElementById(formId + 'Message');
  if (!msg) {
    const form = document.getElementById(formId);
    msg = document.createElement('div');
    msg.id = formId + 'Message';
    msg.style.cssText = `
      margin-bottom: 15px; padding: 12px; border-radius: 8px; 
      font-weight: 500; transition: all 0.3s; font-size: 14px;
    `;
    form.prepend(msg);
  }
  msg.textContent = message;
  msg.style.background = isError ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,74,0.1)';
  msg.style.color = isError ? '#dc2626' : '#16a34a';
  msg.style.border = `1px solid ${isError ? '#dc2626' : '#16a34a'}`;
}

// Register - uses utils.apiFetch for consistency
async function register() {
  const form = document.getElementById('registerForm');
  if (!form) return;
  
  const name = document.getElementById('name')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;

  if (!name || !email || !password) {
    showMessage('registerForm', 'Please fill all fields', true);
    return;
  }
  if (password !== confirmPassword) {
    showMessage('registerForm', 'Passwords do not match', true);
    return;
  }
  if (password.length < 6) {
    showMessage('registerForm', 'Password must be at least 6 characters', true);
    return;
  }

  showLoading(form, true);
  showMessage('registerForm', 'Creating account...');

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    
    showMessage('registerForm', data.msg || 'Registration successful!');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    
  } catch (err) {
    showMessage('registerForm', err.message || 'Server error. Start backend: cd backend && npm start', true);
  } finally {
    showLoading(form, false);
  }
}

// Login
async function login() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value;

  if (!email || !password) {
    showMessage('loginForm', 'Please enter email and password', true);
    return;
  }

  showLoading(form, true);
  showMessage('loginForm', 'Signing in...');

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showMessage('loginForm', 'Login successful! Redirecting...');
    setTimeout(() => {
      window.location.href = 'catalog.html';
    }, 1000);
    
  } catch (err) {
    showMessage('loginForm', err.message || 'Server error. Start backend: cd backend && npm start', true);
    document.getElementById('password').value = '';
  } finally {
    showLoading(form, false);
  }
}

// Global
window.register = register;
window.login = login;

