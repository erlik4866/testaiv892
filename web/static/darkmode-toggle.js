document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkmode-toggle');
  const body = document.body;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.classList.remove('light', 'dark');
  body.classList.add(savedTheme);
  toggle.checked = savedTheme === 'dark';

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      body.classList.remove('light');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark');
      body.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  });
});
