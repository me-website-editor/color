const AUTH_TOKEN_KEY = 'pixelcraft_token';
const authModal = document.getElementById('authModal');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const userWelcome = document.getElementById('userWelcome');

const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const switchToSignupBtn = document.getElementById('switchToSignupBtn');
const switchToLoginBtn = document.getElementById('switchToLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');

function switchToSignup() {
  loginForm.classList.remove('active');
  signupForm.classList.add('active');
}

function switchToLogin() {
  signupForm.classList.remove('active');
  loginForm.classList.add('active');
}

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const resp = await fetch(path, { ...options, headers });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function showAuthScreen() {
  authModal.classList.remove('hidden');
  authModal.classList.add('active');
  mainApp.classList.add('hidden');
}

function showMainApp(user) {
  authModal.classList.add('hidden');
  authModal.classList.remove('active');
  mainApp.classList.remove('hidden');
  if (user && user.name) userWelcome.textContent = `مرحبًا، ${user.name}`;
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

async function initializeSession() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    showAuthScreen();
    return;
  }
  try {
    const data = await apiRequest('/api/me');
    showMainApp(data.user);
  } catch {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    showAuthScreen();
  }
}

async function handleSignup(e) {
  e.preventDefault();
  setError('signupError', '');
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  if (!name || !email || !password) { setError('signupError', 'املأ كل الحقول'); return; }
  if (password !== confirm) { setError('signupError', 'كلمتا المرور غير متطابقتين'); return; }
  try {
    const data = await apiRequest('/api/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    showMainApp(data.user);
  } catch (err) {
    setError('signupError', err.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  setError('loginError', '');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { setError('loginError', 'الرجاء إدخال البريد وكلمة المرور'); return; }
  try {
    const data = await apiRequest('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    showMainApp(data.user);
  } catch (err) {
    setError('loginError', err.message);
  }
}

function handleLogout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  showAuthScreen();
  if (loginFormElement) loginFormElement.reset();
  if (signupFormElement) signupFormElement.reset();
  setError('loginError', '');
  setError('signupError', '');
}

if (loginFormElement) loginFormElement.addEventListener('submit', handleLogin);
if (signupFormElement) signupFormElement.addEventListener('submit', handleSignup);
if (switchToSignupBtn) switchToSignupBtn.addEventListener('click', switchToSignup);
if (switchToLoginBtn) switchToLoginBtn.addEventListener('click', switchToLogin);
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

window.addEventListener('DOMContentLoaded', initializeSession);