document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const authModal = document.getElementById('auth-modal');
  const authClose = document.getElementById('auth-close');
  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-title');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authToggleText = document.getElementById('auth-toggle-text');
  const authToggleLink = document.getElementById('auth-toggle-link');
  const authError = document.getElementById('auth-error');

  let isLogin = true;

  function openModal() {
    authModal.style.display = 'block';
    authError.textContent = '';
  }

  function closeModal() {
    authModal.style.display = 'none';
    authForm.reset();
    authError.textContent = '';
  }

  loginBtn.addEventListener('click', () => {
    isLogin = true;
    authTitle.textContent = 'Login';
    authSubmitBtn.textContent = 'Login';
    authToggleText.innerHTML = `Don't have an account? <a href="#" id="auth-toggle-link">Register here</a>`;
    openModal();
  });

  registerBtn.addEventListener('click', () => {
    isLogin = false;
    authTitle.textContent = 'Register';
    authSubmitBtn.textContent = 'Register';
    authToggleText.innerHTML = `Already have an account? <a href="#" id="auth-toggle-link">Login here</a>`;
    openModal();
  });

  authClose.addEventListener('click', closeModal);

  window.addEventListener('click', (e) => {
    if (e.target === authModal) {
      closeModal();
    }
  });

  authToggleText.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'auth-toggle-link') {
      e.preventDefault();
      isLogin = !isLogin;
      if (isLogin) {
        authTitle.textContent = 'Login';
        authSubmitBtn.textContent = 'Login';
        authToggleText.innerHTML = `Don't have an account? <a href="#" id="auth-toggle-link">Register here</a>`;
      } else {
        authTitle.textContent = 'Register';
        authSubmitBtn.textContent = 'Register';
        authToggleText.innerHTML = `Already have an account? <a href="#" id="auth-toggle-link">Login here</a>`;
      }
      authError.textContent = '';
    }
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    if (!username || !password) {
      authError.textContent = 'Please enter username and password.';
      return;
    }
    const url = isLogin ? '/login' : '/register';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
      });
      const data = await response.json();
      if (response.ok) {
        closeModal();
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        alert(isLogin ? 'Login successful!' : 'Registration successful!');
      } else {
        authError.textContent = data.error || 'An error occurred.';
      }
    } catch (err) {
      authError.textContent = 'Network error.';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/logout');
      const data = await response.json();
      if (response.ok) {
        loginBtn.style.display = 'inline-block';
        registerBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        alert('Logged out successfully.');
      } else {
        alert('Logout failed.');
      }
    } catch (err) {
      alert('Network error.');
    }
  });

  // On page load, check if user is logged in (optional enhancement)
  // This requires backend support to provide session info via an endpoint
});
