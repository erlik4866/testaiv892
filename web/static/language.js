document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.createElement('select');
  languageSelect.id = 'language-select';
  languageSelect.innerHTML = `
    <option value="en">English</option>
    <option value="tr">Türkçe</option>
  `;
  languageSelect.style.marginLeft = '10px';
  document.querySelector('.top-controls').appendChild(languageSelect);

  const translations = {
    en: {
      'new-chat': 'New Chat',
      'clear-chat': 'Clear Chat',
      'download-all': 'Download All Code',
      'forum': 'Forum',
      'education': 'Learn',
      'placeholder': 'Ask me to generate FiveM Lua code...'
    },
    tr: {
      'new-chat': 'Yeni Sohbet',
      'clear-chat': 'Sohbeti Temizle',
      'download-all': 'Tüm Kodu İndir',
      'forum': 'Forum',
      'education': 'Öğren',
      'placeholder': 'Bana FiveM Lua kodu üretmemi söyle...'
    }
  };

  function updateLanguage(lang) {
    document.getElementById('new-chat-btn').textContent = translations[lang]['new-chat'];
    document.getElementById('clear-chat-btn').textContent = translations[lang]['clear-chat'];
    document.getElementById('download-all-btn').textContent = translations[lang]['download-all'];
    document.getElementById('forum-btn').textContent = translations[lang]['forum'];
    document.getElementById('education-btn').textContent = translations[lang]['education'];
    document.getElementById('chat-input').placeholder = translations[lang]['placeholder'];
  }

  languageSelect.addEventListener('change', () => {
    updateLanguage(languageSelect.value);
    localStorage.setItem('language', languageSelect.value);
  });

  // Load saved language
  const savedLang = localStorage.getItem('language') || 'en';
  languageSelect.value = savedLang;
  updateLanguage(savedLang);
});
