// Yapılandırma sabitleri
const CONFIG = {
  // Admin anahtarları
  ADMIN_KEYS: ['umut2024', 'admin2024'],

  // Zaman aşımı ayarları (milisaniye)
  SAVE_TIMEOUT: 10000,
  KEY_VALIDATION_INTERVAL: 30000,
  MAINTENANCE_CHECK_INTERVAL: 30000,

  // Bildirim ayarları
  NOTIFICATION_DURATION: 5000,

  // Arama ayarları
  SEARCH_DEBOUNCE_DELAY: 300,

  // API endpoint'leri
  ENDPOINTS: {
    GET_CHATS: '/get_chats',
    SAVE_CHATS: '/save_chats',
    CHECK_KEY: '/check_key',
    GET_USER_KEY_SUFFIX: '/get_user_key_suffix',
    GET_MAINTENANCE_STATUS: '/get_maintenance_status',
    GENERATE: '/generate',
    PACKAGE_SCRIPT: '/package_script',
    GENERATE_IMAGE: '/generate_image'
  },

  // CSS sınıfları
  CSS_CLASSES: {
    SEARCH_MODAL: 'search-modal',
    SEARCH_MODAL_CONTENT: 'search-modal-content',
    SEARCH_RESULT_ITEM: 'search-result-item',
    SEARCH_RESULT_HIGHLIGHT: 'search-result-highlight',
    NOTIFICATION: 'notification',
    NOTIFICATION_ERROR: 'error',
    NOTIFICATION_INFO: 'info',
    CHAT_ITEM: 'chat-item',
    CHAT_ITEM_ACTIVE: 'active',
    MESSAGE: 'message',
    MESSAGE_BOT: 'bot',
    MESSAGE_USER: 'user',
    SNIPPET_HEADER: 'snippet-header',
    SNIPPET_BUTTONS: 'snippet-buttons'
  },

  // Hata mesajları
  MESSAGES: {
    NO_RESULTS: 'Sonuç bulunamadı.',
    ENTER_SEARCH_TERM: 'Lütfen arama terimi girin.',
    COPY_SUCCESS: 'Panoya kopyalandı!',
    DELETE_CONFIRM: 'Bu snippet\'i silmek istediğinizden emin misiniz?',
    GENERATING_IMAGE: 'Resim oluşturuluyor...',
    ERROR_GENERATING_IMAGE: 'Resim oluşturma hatası.',
    NO_CODE_TO_DOWNLOAD: 'İndirilecek kod yok.',
    SCRIPT_PACKAGED_SUCCESS: 'Script başarıyla paketlenip indirildi!',
    SCRIPT_PACKAGING_ERROR: 'Paketleme hatası!',
    INVALID_KEY: 'Geçersiz anahtar',
    ACCESS_DENIED: 'Erişim reddedildi',
    MAINTENANCE_MODE: 'Bakım modu aktif'
  }
};

// Global değişkenler için başlangıç değerleri
const INITIAL_STATE = {
  chats: [],
  currentChatId: null,
  hasAccess: localStorage.getItem('siteAccess') === 'granted',
  keyValidationInterval: null
};

let chats = [];
let currentChatId = null;

// Key system variables
let hasAccess = localStorage.getItem('siteAccess') === 'granted';
let keyValidationInterval;

async function loadChats() {
  try {
    const response = await fetch(CONFIG.ENDPOINTS.GET_CHATS, {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      chats = data.chats || [];
      if (chats.length > 0 && !currentChatId) {
        currentChatId = chats[0].id;
      }
      renderChatList();
      renderChatWindow();
    } else {
      console.error('Failed to load chats');
    }
  } catch (error) {
    console.error('Error loading chats:', error);
  }
}

async function saveChats() {
  try {
    const response = await fetch(CONFIG.ENDPOINTS.SAVE_CHATS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ chats })
    });
    if (!response.ok) {
      console.error('Failed to save chats');
    }
  } catch (error) {
    console.error('Error saving chats:', error);
  }
}

let saveTimeout = null;

// Save chats every 10 seconds, but debounce to avoid overlapping saves
function scheduleSaveChats() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (hasAccess) {
      saveChats();
    }
  }, 10000);
}

// --- New code for advanced search modal ---

let searchModal = null;
let searchInput = null;
let searchResultsContainer = null;

function createSearchModal() {
  if (searchModal) return;

  searchModal = document.createElement('div');
  searchModal.className = 'search-modal';
  searchModal.style.display = 'none';

  searchModal.innerHTML = `
    <div class="search-modal-content">
      <button class="close-search-btn" title="Close Search">&times;</button>
      <h2>Gelişmiş Arama</h2>
      <div class="search-input-container">
        <input type="text" id="search-input" placeholder="Arama terimini girin..." autofocus />
        <span class="search-icon">&#128269;</span>
      </div>
      <div class="search-results" id="search-results"></div>
    </div>
  `;

  document.body.appendChild(searchModal);

  searchInput = searchModal.querySelector('#search-input');
  searchResultsContainer = searchModal.querySelector('#search-results');

  searchModal.querySelector('.close-search-btn').onclick = () => {
    searchModal.classList.remove('show');
  };

  searchInput.addEventListener('input', () => {
    performSearch(searchInput.value.trim());
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('show')) {
      searchModal.classList.remove('show');
    }
  });
}

function highlightText(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="search-result-highlight">$1</span>');
}

function performSearch(term) {
  if (!term) {
    searchResultsContainer.innerHTML = '<div class="no-results">Lütfen arama terimi girin.</div>';
    return;
  }

  const results = [];

  // Search in chats and snippets
  chats.forEach((chat) => {
    chat.messages.forEach((msg, index) => {
      if (msg.role === 'bot' && msg.content.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          chatName: chat.name,
          snippetName: msg.name || `Snippet ${index + 1}`,
          snippetContent: msg.content,
          chatId: chat.id,
          messageIndex: index,
        });
      }
    });
  });

  if (results.length === 0) {
    searchResultsContainer.innerHTML = '<div class="no-results">Sonuç bulunamadı.</div>';
    return;
  }

  // Render results
  searchResultsContainer.innerHTML = '';
  results.forEach((res) => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.innerHTML = `
      <h4>${highlightText(res.snippetName, term)}</h4>
      <p>${highlightText(res.snippetContent.substring(0, 200), term)}...</p>
      <small>Chat: ${highlightText(res.chatName, term)}</small>
    `;
    item.onclick = () => {
      searchModal.classList.remove('show');
      switchChat(res.chatId);
      // Scroll to snippet message
      setTimeout(() => {
        const chatWindow = document.getElementById('chat-window');
        const messages = chatWindow.querySelectorAll('.message.bot');
        if (messages[res.messageIndex]) {
          messages[res.messageIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          messages[res.messageIndex].classList.add('highlighted');
          setTimeout(() => {
            messages[res.messageIndex].classList.remove('highlighted');
          }, 3000);
        }
      }, 300);
    };
    searchResultsContainer.appendChild(item);
  });
}

// Add search button to header
function addSearchButton() {
  const headerButtons = document.querySelector('.header-buttons');
  if (!headerButtons) return;

  const searchBtn = document.createElement('button');
  searchBtn.id = 'search-btn';
  searchBtn.title = 'Gelişmiş Arama';
  searchBtn.textContent = 'Ara';
  searchBtn.style.background = 'var(--button-bg)';
  searchBtn.style.color = 'var(--button-text)';
  searchBtn.style.border = 'none';
  searchBtn.style.padding = '10px 20px';
  searchBtn.style.borderRadius = 'var(--border-radius)';
  searchBtn.style.cursor = 'pointer';
  searchBtn.style.fontWeight = '600';
  searchBtn.style.marginLeft = '10px';
  searchBtn.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.4)';
  searchBtn.onmouseover = () => {
    searchBtn.style.transform = 'translateY(-2px)';
    searchBtn.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.6)';
  };
  searchBtn.onmouseout = () => {
    searchBtn.style.transform = 'translateY(0)';
    searchBtn.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.4)';
  };

  searchBtn.onclick = () => {
    openSearchModal();
  };

  headerButtons.appendChild(searchBtn);
}

// Initialize search button on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  addSearchButton();
});

// Web arama kutusu toggle fonksiyonu
function toggleWebSearchInput(isEnabled) {
  // Bu fonksiyon web arama özelliği için arama kutusu göster/gizle işlemini yapacak
  // Şimdilik sadece console.log ile çalışıp çalışmadığını kontrol edelim
  console.log('Web search toggle:', isEnabled);
}

// Yeni: Web arama modu seçici dropdown ekle
function createWebSearchModeSelector() {
  const chatControls = document.querySelector('.chat-controls');
  if (!chatControls) return;

  // Container for the selector
  const container = document.createElement('div');
  container.style.display = 'inline-block';
  container.style.marginLeft = '10px';
  container.style.verticalAlign = 'middle';

  // Label
  const label = document.createElement('label');
  label.textContent = 'Web Arama Modu: ';
  label.style.marginRight = '5px';
  label.htmlFor = 'web-search-mode-select';

  // Select element
  const select = document.createElement('select');
  select.id = 'web-search-mode-select';
  select.title = 'Web Arama Modu Seçin';
  select.setAttribute('aria-label', 'Web arama modu seçici');

  // Options
  const modes = window.advancedAIManager.getSearchModes();
  modes.forEach(mode => {
    const option = document.createElement('option');
    option.value = mode;
    option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    select.appendChild(option);
  });

  // Set default value
  select.value = window.advancedAIManager.getCurrentSearchMode();

  // On change, update the advancedAIManager currentSearchMode
  select.addEventListener('change', (e) => {
    const selectedMode = e.target.value;
    window.advancedAIManager.setSearchMode(selectedMode);
    console.log('Selected web search mode:', selectedMode);
  });

  container.appendChild(label);
  container.appendChild(select);

  chatControls.appendChild(container);
}

// Initialize web search mode selector on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  createWebSearchModeSelector();
});

// Arama modalını açmak için fonksiyon
function openSearchModal() {
  createSearchModal();
  if (searchModal) {
    searchModal.classList.add('show');
    if (searchInput) {
      searchInput.focus();
    }
  }
}

// Save chats on every message sent and schedule periodic save
const originalSendMessage = sendMessage;
sendMessage = async function(prompt) {
  await originalSendMessage(prompt);
  if (hasAccess) {
    saveChats();
    scheduleSaveChats();
  }
};

// Also schedule periodic save on chat changes like create, delete, rename
const originalCreateNewChat = createNewChat;
createNewChat = function() {
  originalCreateNewChat();
  scheduleSaveChats();
};

const originalDeleteChat = deleteChat;
deleteChat = function(chatId) {
  originalDeleteChat(chatId);
  scheduleSaveChats();
};

const originalRenameChat = renameChat;
renameChat = function(chatId, newName) {
  originalRenameChat(chatId, newName);
  scheduleSaveChats();
};

function checkAccess() {
  if (!hasAccess) {
    document.getElementById('key-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  } else {
    document.getElementById('key-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

async function validateKey() {
  const input = document.getElementById('site-key-input');
  const errorMsg = document.getElementById('key-error-msg');
  const key = input.value.trim();

  try {
    const response = await fetch(CONFIG.ENDPOINTS.CHECK_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      hasAccess = true;
      localStorage.setItem('siteAccess', 'granted');
      localStorage.setItem('userKey', data.key);
      localStorage.setItem('discordName', data.discordName);
      document.getElementById('key-modal').style.display = 'none';
      document.body.style.overflow = 'auto';
      errorMsg.style.display = 'none';
      input.value = '';
      showWelcomeMessage(data.key, data.discordName);
      // Start periodic key validation
      startKeyValidation();
    } else {
      errorMsg.textContent = data.error || 'Invalid key';
      errorMsg.style.display = 'block';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
    }
  } catch (error) {
    console.error('Error validating key:', error);
    errorMsg.style.display = 'block';
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
  }
}

function showWelcomeMessage(key, discordName) {
    const suffix = key.slice(-3);

  // keys.json'dan Discord bilgilerini çekmek için API çağrısı yap
  fetch('/get_user_key_suffix')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'welcome-message';
        welcomeDiv.style.position = 'fixed';
        welcomeDiv.style.top = '10px';
        welcomeDiv.style.right = '10px';
        welcomeDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        welcomeDiv.style.color = 'white';
        welcomeDiv.style.padding = '8px 15px';
        welcomeDiv.style.borderRadius = '8px';
        welcomeDiv.style.fontFamily = 'Arial, sans-serif';
        welcomeDiv.style.fontSize = '12x';
        welcomeDiv.style.fontWeight = 'bold';
        welcomeDiv.style.zIndex = '1000';
        welcomeDiv.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        welcomeDiv.style.border = '2px solid rgba(255, 255, 255, 0.2)';
        welcomeDiv.style.display = 'flex';
        welcomeDiv.style.alignItems = 'center';
        welcomeDiv.style.gap = '8px';

        // Discord icon ekle
        const discordIcon = document.createElement('span');
        discordIcon.textContent = '👤';
        discordIcon.style.fontSize = '12px';

        const textSpan = document.createElement('span');
        // API'den gelen Discord adını kullan
        const displayName = data.discord_name || discordName || 'Unknown';
        textSpan.textContent = `Discord: ${displayName} | Key: ${data.key_suffix || suffix}`;

        welcomeDiv.appendChild(discordIcon);
        welcomeDiv.appendChild(textSpan);

        // Hover efekti
        welcomeDiv.onmouseover = () => {
          welcomeDiv.style.transform = 'translateY(-2px)';
          welcomeDiv.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
        };
        welcomeDiv.onmouseout = () => {
          welcomeDiv.style.transform = 'translateY(0)';
          welcomeDiv.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        };

        document.body.appendChild(welcomeDiv);

        // 10 saniye sonra otomatik gizle
        setTimeout(() => {
          if (welcomeDiv.parentNode) {
            welcomeDiv.style.opacity = '0';
            welcomeDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
              if (welcomeDiv.parentNode) {
                welcomeDiv.remove();
              }
            }, 500);
          }
        }, 10000);
      }
    })
    .catch(error => {
      console.error('Discord bilgilerini çekerken hata:', error);
      // Fallback olarak basit mesaj göster
      const welcomeDiv = document.createElement('div');
      welcomeDiv.id = 'welcome-message';
      welcomeDiv.style.position = 'fixed';
      welcomeDiv.style.top = '10px';
      welcomeDiv.style.right = '10px';
      welcomeDiv.style.backgroundColor = '#105cc0ff';
      welcomeDiv.style.color = 'white';
      welcomeDiv.style.padding = '5px 10px';
      welcomeDiv.style.borderRadius = '3px';
      welcomeDiv.style.fontFamily = 'Arial, sans-serif';
      welcomeDiv.style.fontSize = '12px';
      welcomeDiv.style.zIndex = '1000';
      welcomeDiv.textContent = `Hoşgeldiniz: ${discordName} - ${suffix}`;
      document.body.appendChild(welcomeDiv);
    });
}

function validateAdminKey() {
  const input = document.getElementById('admin-key-input');
  const errorMsg = document.getElementById('admin-key-error-msg');
  const key = input.value.trim();

  if (CONFIG.ADMIN_KEYS.includes(key)) {
    document.getElementById('admin-key-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    errorMsg.style.display = 'none';
    input.value = '';
    window.location.href = 'admin';
  } else {
    errorMsg.style.display = 'block';
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 500);
  }
}

// Key validation and auto-logout functions
async function validateCurrentKey() {
  if (!hasAccess) return;

  const storedKey = localStorage.getItem('userKey');
  if (!storedKey) {
    forceLogout(CONFIG.MESSAGES.INVALID_KEY);
    return;
  }

  try {
    const response = await fetch(CONFIG.ENDPOINTS.CHECK_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: storedKey })
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      forceLogout(data.error || CONFIG.MESSAGES.INVALID_KEY);
    }
  } catch (error) {
    console.error('Key validation error:', error);
    // Don't logout on network errors, just log
  }
}

function forceLogout(reason) {
  hasAccess = false;
  localStorage.removeItem('siteAccess');
  localStorage.removeItem('userKey');

  // Remove welcome message
  const welcomeMsg = document.getElementById('welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }

  // Clear key validation interval
  if (keyValidationInterval) {
    clearInterval(keyValidationInterval);
  }

  // Show notification
  showNotification(reason || 'Hesabınızın kullanım süresi dolmuştur.', 'error');

  // Show key modal after a short delay
  setTimeout(() => {
    document.getElementById('key-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }, 2000);
}

// Admin page key validation
function checkAdminAccess() {
  const adminKeyModal = document.getElementById('admin-key-modal');
  const adminContent = document.getElementById('admin-content');
  const storedAdminAccess = localStorage.getItem('adminAccess');

  if (storedAdminAccess === 'granted') {
    adminKeyModal.style.display = 'none';
    adminContent.style.display = 'block';
  } else {
    adminKeyModal.style.display = 'flex';
    adminContent.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();

  const submitAdminKeyBtn = document.getElementById('submit-admin-key-btn');
  submitAdminKeyBtn.addEventListener('click', () => {
    const input = document.getElementById('admin-key-input');
    const errorMsg = document.getElementById('admin-key-error-msg');
    const key = input.value.trim();

    if (CONFIG.ADMIN_KEYS.includes(key)) {
      localStorage.setItem('adminAccess', 'granted');
      errorMsg.style.display = 'none';
      input.value = '';
      checkAdminAccess();
    } else {
      errorMsg.style.display = 'block';
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
      // Redirect to homepage after wrong key
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1000);
    }
  });
});

function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = type === 'error' ? '#dc3545' : '#007bff';
  notification.style.color = 'white';
  notification.style.padding = '15px 20px';
  notification.style.borderRadius = '5px';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.fontSize = '16px';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  notification.style.maxWidth = '400px';
  notification.style.textAlign = 'center';

  notification.textContent = message;
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

function startKeyValidation() {
  if (hasAccess) {
    // Validate immediately
    validateCurrentKey();

    // Then validate every 30 seconds
    keyValidationInterval = setInterval(validateCurrentKey, 30000);
  }
}

function generateChatId() {
  return Date.now().toString();
}

function createNewChat() {
  const chatId = generateChatId();
  const chat = { id: chatId, name: `Chat ${chats.length + 1}`, messages: [] };
  chats.push(chat);
  currentChatId = chatId;
  saveChats();
  renderChatList();
  renderChatWindow();
}

function renameChat(chatId, newName) {
  const chat = chats.find(c => c.id === chatId);
  if (chat) {
    chat.name = newName;
    saveChats();
    renderChatList();
  }
}

function promptRenameChat(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  const newName = prompt("Enter new chat name:", chat.name);
  if (newName && newName.trim() !== "") {
    renameChat(chatId, newName.trim());
  }
}

function renderChatList() {
  const chatList = document.getElementById('chat-list');
  chatList.innerHTML = '';
  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = `chat-item ${chat.id === currentChatId ? 'active' : ''}`;
    chatItem.innerHTML = `
      <span>${chat.name}</span>
      <button class="close-btn" onclick="deleteChat('${chat.id}')">&times;</button>
      <button class="rename-btn" title="Rename Chat" onclick="promptRenameChat('${chat.id}')">&#9998;</button>
    `;
    chatItem.onclick = () => switchChat(chat.id);
    chatList.appendChild(chatItem);
  });
}

function deleteChat(chatId) {
  chats = chats.filter(chat => chat.id !== chatId);
  if (currentChatId === chatId) {
    currentChatId = chats.length > 0 ? chats[0].id : null;
  }
  saveChats();
  renderChatList();
  renderChatWindow();
}

function switchChat(chatId) {
  currentChatId = chatId;
  renderChatList();
  renderChatWindow();
}

function renderChatWindow() {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML = '';
  if (!currentChatId) return;
  const chat = chats.find(c => c.id === currentChatId);
  chat.messages.forEach((message, index) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.role}`;
    if (message.role === 'bot') {
      if (message.isThinking) {
        // Thinking message - just show text without snippet header
        messageDiv.innerHTML = `<div style="font-style: italic; color: #666;">${message.content}</div>`;
      } else {
        // Normal bot message with snippet header
        let packageButton = '';
        if (message.hasPackageButton) {
          packageButton = `<button class="package-btn" title="Tek bir dosya haline getir" onclick="packageScript(${index})">📦</button>`;
        }
        messageDiv.innerHTML = `
          <div class="snippet-header">
            <span class="snippet-name">${message.name || 'Unnamed Snippet'}</span>
            <div class="snippet-buttons">
              <button class="rename-snippet-btn" title="Rename Snippet" onclick="renameSnippet(${index})">&#9998;</button>
              <button class="edit-snippet-btn" title="Edit Snippet" onclick="editSnippet(${index})">&#9999;</button>
              <button class="delete-snippet-btn" title="Delete Snippet" onclick="deleteSnippet(${index})">&times;</button>
              <button class="copy-btn" onclick="copyToClipboard(this.parentElement.parentElement.nextElementSibling.textContent)">Copy</button>
              ${packageButton}
            </div>
          </div>
          <pre><code class="language-lua">${message.content.replace(/</g, '<').replace(/>/g, '>')}</code></pre>
        `;
      }
    } else {
      // User message
      messageDiv.innerHTML = `<div>${message.content}</div>`;
      if (message.image) {
        const img = document.createElement('img');
        img.src = `data:image/jpeg;base64,${message.image}`;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '150px';
        img.style.display = 'block';
        img.style.marginTop = '10px';
        img.style.borderRadius = '5px';
        messageDiv.appendChild(img);
      }
    }
    chatWindow.appendChild(messageDiv);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
  Prism.highlightAll();
}

async function sendMessage(prompt) {
  if (!currentChatId) createNewChat();
  const chat = chats.find(c => c.id === currentChatId);

  // Check for /rar command
  if (prompt.startsWith('/rar ')) {
    const actualPrompt = prompt.slice(5).trim();
    if (!actualPrompt) {
      // Error message
      chat.messages.push({ role: 'user', content: prompt });
      const errorMessage = { role: 'bot', content: 'Hata: /rar komutundan sonra bir açıklama girin.', name: 'Error' };
      chat.messages.push(errorMessage);
      saveChats();
      renderChatWindow();
      return;
    }

    chat.messages.push({ role: 'user', content: prompt });
    saveChats();
    renderChatWindow();

    // Add thinking message
    const thinkingMessage = { role: 'bot', content: 'Script oluşturuluyor...', name: 'Generating', isThinking: true };
    chat.messages.push(thinkingMessage);
    renderChatWindow();

    try {
      // First generate the code
      const messages = [{ role: 'user', content: actualPrompt }];
      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      const data = await response.json();
      const code = data.code;

      // Replace thinking message with code snippet and package button
      const botMessagesCount = chat.messages.filter(m => m.role === 'bot').length;
      chat.messages[chat.messages.length - 1] = { role: 'bot', content: code, name: `Code Snippet ${botMessagesCount}`, hasPackageButton: true };
      saveChats();
      renderChatWindow();
    } catch (error) {
      console.error('Error:', error);
      chat.messages[chat.messages.length - 1] = { role: 'bot', content: 'Hata: ' + error.message, name: 'Error' };
      saveChats();
      renderChatWindow();
    }
    return;
  }

  // Check for photo upload
  const photoInput = document.getElementById('photo-upload');
  let image = null;
  if (photoInput.files && photoInput.files[0]) {
    const file = photoInput.files[0];
    const reader = new FileReader();
    image = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 part
      reader.readAsDataURL(file);
    });
    photoInput.value = ''; // Reset input
  }

  chat.messages.push({ role: 'user', content: prompt, image });
  saveChats();
  renderChatWindow();

  // Add temporary "düşünüyor..." message
  const botMessagesCount = chat.messages.filter(m => m.role === 'bot').length + 1;

  // Yeni checkbox id'leri
  const webSearch = document.getElementById('custom-web-search-toggle').checked;
  const longerThinking = document.getElementById('custom-longer-thinking-toggle').checked;

  // Web arama kutusu kontrolü
  toggleWebSearchInput(webSearch);

  // Mesaj içeriğini toggle durumuna göre ayarla
  let thinkingMessage = 'düşünüyor...';
  if (longerThinking) {
    thinkingMessage = 'uzun düşünüyor...';
  } else if (webSearch) {
    thinkingMessage = 'araştırıyor...';
  }

  const tempMessage = { role: 'bot', content: thinkingMessage, name: `Code Snippet ${botMessagesCount}`, isThinking: true };
  chat.messages.push(tempMessage);
  renderChatWindow();

  try {
    // Get toggles
    // const webSearch = document.getElementById('web-search-toggle').checked;
    // const longerThinking = true; // Her zaman uzun düşünme modu aktif

    // Send all chat messages for context, map 'bot' to 'assistant'
    const messages = chat.messages.filter(m => !m.isThinking).map(m => {
      const msg = { role: m.role === 'bot' ? 'assistant' : m.role, content: m.content };
      if (m.image) msg.image = m.image;
      return msg;
    });
    const searchMode = window.advancedAIManager ? window.advancedAIManager.getCurrentSearchMode() : 'duckduckgo';
    const response = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, web_search: webSearch, longer_thinking: longerThinking, search_mode: searchMode })
    });
    const data = await response.json();
    const code = data.code;

    // Replace temporary message with actual response
    chat.messages[chat.messages.length - 1] = { role: 'bot', content: code, name: `Code Snippet ${botMessagesCount}` };
    saveChats();
    renderChatWindow();
  } catch (error) {
    console.error('Error:', error);
    // Replace temporary message with error message
    chat.messages[chat.messages.length - 1] = { role: 'bot', content: 'Error generating code.', name: `Code Snippet ${botMessagesCount}` };
    saveChats();
    renderChatWindow();
  }
}

function clearChat() {
  if (!currentChatId) return;
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.messages = [];
    saveChats();
    renderChatWindow();
  }
}

async function downloadAllCode() {
  if (!currentChatId) return;
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat || chat.messages.length === 0) return;

  const format = document.getElementById('export-format').value;

  if (format === 'zip') {
    const zip = new JSZip();
    let codeCount = 0;
    chat.messages.forEach((message, index) => {
      if (message.role === 'bot') {
        codeCount++;
        const filename = (message.name || `Code Snippet ${codeCount}`).replace(/[^a-zA-Z0-9]/g, '_') + '.lua';
        zip.file(filename, message.content);
      }
    });

    if (codeCount === 0) {
      alert('No code to download.');
      return;
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.name}_all_code.zip`;
    a.click();
    window.URL.revokeObjectURL(url);
  } else if (format === 'json') {
    const data = {
      chatName: chat.name,
      messages: chat.messages.filter(m => m.role === 'bot').map(m => ({
        name: m.name,
        content: m.content
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.name}_code.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  } else if (format === 'xml') {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<chat name="${chat.name}">\n`;
    chat.messages.forEach((message, index) => {
      if (message.role === 'bot') {
        xml += `  <snippet name="${message.name || `Code Snippet ${index + 1}`}" index="${index + 1}">\n`;
        xml += `    <content><![CDATA[${message.content}]]></content>\n`;
        xml += `  </snippet>\n`;
      }
    });
    xml += '</chat>';
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.name}_code.xml`;
    a.click();
    window.URL.revokeObjectURL(url);
  } else if (format === 'md') {
    let md = `# ${chat.name} Code Snippets\n\n`;
    chat.messages.forEach((message, index) => {
      if (message.role === 'bot') {
        md += `## ${message.name || `Code Snippet ${index + 1}`}\n\n`;
        md += '```lua\n';
        md += message.content;
        md += '\n```\n\n';
      }
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.name}_code.md`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

function renameSnippet(index) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat || !chat.messages[index] || chat.messages[index].role !== 'bot') return;
  const newName = prompt("Enter new snippet name:", chat.messages[index].name);
  if (newName && newName.trim() !== "") {
    chat.messages[index].name = newName.trim();
    saveChats();
    renderChatWindow();
  }
}

function editSnippet(index) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat || !chat.messages[index] || chat.messages[index].role !== 'bot') return;
  const messageDiv = document.querySelectorAll('.message.bot')[index];
  const pre = messageDiv.querySelector('pre');
  const code = pre.querySelector('code');
  const textarea = document.createElement('textarea');
  textarea.value = chat.messages[index].content;
  textarea.style.width = '100%';
  textarea.style.height = pre.offsetHeight + 'px';
  textarea.style.fontFamily = 'monospace';
  pre.replaceWith(textarea);
  textarea.focus();

  const saveEdit = () => {
    chat.messages[index].content = textarea.value;
    saveChats();
    renderChatWindow();
  };

  textarea.onblur = saveEdit;
  textarea.onkeydown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveEdit();
    } else if (e.key === 'Escape') {
      renderChatWindow();
    }
  };
}

function deleteSnippet(index) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat || !chat.messages[index] || chat.messages[index].role !== 'bot') return;
  if (confirm('Are you sure you want to delete this snippet?')) {
    chat.messages.splice(index, 1);
    saveChats();
    renderChatWindow();
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  });
}

async function packageScript(index) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat || !chat.messages[index] || chat.messages[index].role !== 'bot') return;

  const code = chat.messages[index].content;
  try {
    const response = await fetch('/package_script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await response.json();

    if (response.ok && data.download_url) {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = 'fivem_script.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('Script başarıyla paketlenip indirildi!', 'info');
    } else {
      const errorMsg = data.error || 'Paketleme hatası!';
      showNotification(errorMsg, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Paketleme hatası: ' + error.message, 'error');
  }
}

document.getElementById('new-chat-btn').onclick = createNewChat;
document.getElementById('clear-chat-btn').onclick = clearChat;
document.getElementById('download-all-btn').onclick = downloadAllCode;

document.getElementById('chat-form').onsubmit = function(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const prompt = input.value.trim();
  if (prompt) {
    sendMessage(prompt);
    input.value = '';
  }
};

document.getElementById('image-gen-form').onsubmit = async function(e) {
  e.preventDefault();
  const prompt = document.getElementById('image-prompt').value.trim();
  if (!prompt) return;
  const resultDiv = document.getElementById('image-result');
  resultDiv.innerHTML = '<p>Generating image...</p>';
  try {
    const response = await fetch('/generate_image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    if (data.image_url) {
      resultDiv.innerHTML = `<img src="${data.image_url}" alt="Generated Image" style="max-width: 100%; height: auto;" />`;
    } else {
      resultDiv.innerHTML = '<p>Error generating image.</p>';
    }
  } catch (error) {
    console.error('Error:', error);
    resultDiv.innerHTML = '<p>Error generating image.</p>';
  }
};

// Initialize
loadChats().then(() => {
  if (chats.length === 0) createNewChat();
});

// Key system initialization
document.addEventListener('DOMContentLoaded', function() {
  // Maintenance mode check first
  const maintenanceWarning = document.getElementById('maintenance-warning');
  const container = document.querySelector('.container');
  const chatInput = document.getElementById('chat-input');
  let isMaintenanceMode = false;

  async function checkMaintenanceStatus() {
    try {
      console.log('Checking maintenance status...');
      const response = await fetch('/get_maintenance_status');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Maintenance data:', data);
        isMaintenanceMode = data.maintenance;
        if (data.maintenance) {
          console.log('Maintenance mode active, showing warning');
          if (maintenanceWarning) maintenanceWarning.style.display = 'flex';
          if (container) container.style.display = 'none';
          if (chatInput) chatInput.disabled = true;
        } else {
          console.log('Maintenance mode inactive, hiding warning');
          if (maintenanceWarning) maintenanceWarning.style.display = 'none';
          if (container) container.style.display = 'grid';
          if (chatInput) chatInput.disabled = false;
        }
      } else {
        console.error('Failed to fetch maintenance status');
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
    }
  }

  // Check maintenance first
  checkMaintenanceStatus().then(() => {
    // Only proceed with access check if not in maintenance mode
    if (!isMaintenanceMode) {
      checkAccess();

      // Show welcome message if access granted
      if (hasAccess) {
        const storedKey = localStorage.getItem('userKey');
        if (storedKey) {
          const discordName = localStorage.getItem('discordName') || '';
          showWelcomeMessage(storedKey, discordName);
        }
        // Start periodic key validation
        startKeyValidation();
      }
    }
  });

  setInterval(checkMaintenanceStatus, 30000); // Check every 30 seconds

  // Key modal event listeners
  document.getElementById('submit-key-btn').addEventListener('click', validateKey);
  document.getElementById('site-key-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      validateKey();
    }
  });

  // Coding button navigation
  const codingBtn = document.getElementById('coding-btn');
  if (codingBtn) {
    codingBtn.addEventListener('click', function() {
      window.location.href = 'coding';
    });
  }

  // Image generation button navigation
  const imageGenBtn = document.getElementById('image-gen-btn');
  if (imageGenBtn) {
    imageGenBtn.addEventListener('click', function() {
      window.location.href = 'whisper';
    });
  }

  // Admin button navigation
  const adminBtn = document.getElementById('admin-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', function() {
      document.getElementById('admin-key-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  }

  // Admin key modal event listeners
  document.getElementById('submit-admin-key-btn').addEventListener('click', validateAdminKey);
  document.getElementById('admin-key-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      validateAdminKey();
    }
  });
});
