// Enhanced FiveM Lua AI Chat Script
// Version 2.0 - With Advanced Features

class FiveMChatApp {
  constructor() {
    this.currentChatId = null;
    this.chatHistory = [];
    this.isTyping = false;
    this.emojiData = this.getEmojiData();
    this.recentEmojis = [];
    this.uploadedFiles = [];
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.notifications = [];
    this.searchResults = [];

    this.initializeApp();
  }

  initializeApp() {
    this.setupEventListeners();
    this.loadChatHistory();
    this.initializeStatusIndicators();
    this.initializeTheme();
    this.initializeNotifications();
    this.setupAccessibility();
    this.initializeFileUpload();
    this.initializeEmojiPicker();
    this.initializeSearch();
    this.initializeThemeSelector();
  }

  setupEventListeners() {
    // Chat form
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const emojiBtn = document.getElementById('emoji-btn');
    const searchBtn = document.getElementById('search-btn');
    const themeBtn = document.getElementById('theme-selector-btn');

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
      chatInput.addEventListener('input', () => this.handleInput());
    }

    if (emojiBtn) {
      emojiBtn.addEventListener('click', () => this.openEmojiPicker());
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.openSearchModal());
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.openThemeSelector());
    }

    // Modal close buttons
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    // Theme options
    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', (e) => this.selectTheme(e));
    });

    // Custom theme controls
    const saveCustomBtn = document.getElementById('save-custom-theme');
    if (saveCustomBtn) {
      saveCustomBtn.addEventListener('click', () => this.saveCustomTheme());
    }

    // Enhanced search
    const performSearchBtn = document.getElementById('perform-enhanced-search');
    if (performSearchBtn) {
      performSearchBtn.addEventListener('click', () => this.performEnhancedSearch());
    }

    // File upload
    const photoUpload = document.getElementById('photo-upload');
    const fileUpload = document.getElementById('file-upload');

    if (photoUpload) {
      photoUpload.addEventListener('change', (e) => this.handleFileUpload(e.target.files, 'image'));
    }

    if (fileUpload) {
      fileUpload.addEventListener('change', (e) => this.handleFileUpload(e.target.files, 'file'));
    }

    // Additional buttons
    const newChatBtn = document.getElementById('new-chat-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');

    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => this.createNewChat());
    }

    if (clearChatBtn) {
      clearChatBtn.addEventListener('click', () => this.clearChat());
    }

    // Window events
    window.addEventListener('beforeunload', () => this.saveChatHistory());
    window.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
  }

  // Placeholder methods for the new features to be implemented
  handleChatSubmit(e) {
    e.preventDefault();
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    this.addMessage('user', message);

    // Clear input
    chatInput.value = '';

    // Reset typing indicator
    this.isTyping = false;
    this.updateTypingIndicator();

    // Process message (simulate AI response)
    this.processMessage(message);

    // Save to history
    this.saveChatHistory();
  }

  handleKeyDown(e) {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleChatSubmit(e);
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Allow new line with Shift+Enter
      return;
    }

    // Update typing indicator
    if (!this.isTyping) {
      this.isTyping = true;
      this.updateTypingIndicator();
    }

    // Clear typing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set typing timeout
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.updateTypingIndicator();
    }, 1000);
  }

  handleInput() {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    // Auto-resize textarea
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';

    // Update character count if exists
    const charCount = document.getElementById('char-count');
    if (charCount) {
      const remaining = 2000 - chatInput.value.length;
      charCount.textContent = remaining;
      charCount.className = remaining < 100 ? 'char-count warning' : 'char-count';
    }
  }

  openEmojiPicker() {
    const modal = document.getElementById('emoji-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    // Render emoji picker content
    this.renderEmojiPicker();

    // Focus on first emoji
    const firstEmoji = modal.querySelector('.emoji-item');
    if (firstEmoji) {
      firstEmoji.focus();
    }

    // Add event listener for emoji selection (fix missing handlers)
    const emojiButtons = modal.querySelectorAll('.emoji-item');
    emojiButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.insertEmoji(e.target.dataset.emoji);
      });
    });
  }

  openSearchModal() {
    const modal = document.getElementById('enhanced-search-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      // Focus on search input
      const searchInput = modal.querySelector('#enhanced-search-input');
      if (searchInput) {
        searchInput.focus();
      }

      // Add event listener for search input enter key
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.performEnhancedSearch();
        }
      });
    }
  }

  openThemeSelector() {
    const modal = document.getElementById('theme-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      // Focus on first theme option
      const firstOption = modal.querySelector('.theme-option');
      if (firstOption) {
        firstOption.focus();
      }
    }
  }

  closeModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  selectTheme(e) {
    const themeName = e.currentTarget.dataset.theme;
    if (window.themeManager && themeName) {
      window.themeManager.applyTheme(themeName);
      this.currentTheme = themeName;

      // Show custom theme controls if custom theme is selected
      const customControls = document.getElementById('custom-theme-controls');
      if (customControls) {
        customControls.style.display = themeName === 'custom' ? 'block' : 'none';
      }

      // Close modal after selection
      this.closeModals();

      // Save selected theme to localStorage
      localStorage.setItem('theme', themeName);
    }
  }

  saveCustomTheme() {
    const primaryColor = document.getElementById('primary-color')?.value;
    const secondaryColor = document.getElementById('secondary-color')?.value;
    const backgroundColor = document.getElementById('background-color')?.value;

    if (window.themeManager && primaryColor && secondaryColor && backgroundColor) {
      const customColors = {
        primary: primaryColor,
        secondary: secondaryColor,
        background: backgroundColor
      };

      window.themeManager.setCustomTheme(customColors);
      window.themeManager.applyTheme('custom');
      this.currentTheme = 'custom';

      // Show success notification
      if (window.notificationManager) {
        window.notificationManager.notifySuccess('Özel tema kaydedildi!');
      }

      // Close modal
      this.closeModals();
    }
  }

  performEnhancedSearch() {
    const searchInput = document.getElementById('enhanced-search-input');
    const searchScope = document.getElementById('search-scope');
    const searchType = document.getElementById('search-type');
    const dateFrom = document.getElementById('search-date-from');
    const dateTo = document.getElementById('search-date-to');
    const resultsContainer = document.getElementById('enhanced-search-results');

    if (!searchInput || !resultsContainer) return;

    const query = searchInput.value.trim();
    if (!query) {
      if (window.notificationManager) {
        window.notificationManager.notifyError('Lütfen arama terimi girin.');
      }
      return;
    }

    const scope = searchScope ? searchScope.value : 'all';
    const type = searchType ? searchType.value : 'all';
    const fromDate = dateFrom ? dateFrom.value : null;
    const toDate = dateTo ? dateTo.value : null;

    // Clear previous results
    resultsContainer.innerHTML = '<div class="search-loading">Aranıyor...</div>';

    // Perform search
    const results = this.searchChatHistory(query, {
      scope: scope,
      type: type,
      fromDate: fromDate,
      toDate: toDate
    });

    // Display results
    this.displaySearchResults(results, resultsContainer);
  }

  searchChatHistory(query, filters) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    // Get chat history from localStorage or current session
    let chatData = [];
    if (filters.scope === 'all') {
      // Load all chat sessions from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_')) {
          try {
            const sessionData = JSON.parse(localStorage.getItem(key));
            if (sessionData && sessionData.messages) {
              chatData = chatData.concat(sessionData.messages.map(msg => ({
                ...msg,
                chatId: sessionData.id,
                chatTitle: sessionData.title || 'İsimsiz Sohbet'
              })));
            }
          } catch (e) {
            console.warn('Error parsing chat data:', e);
          }
        }
      }
    } else {
      // Search current chat only
      chatData = this.chatHistory.map(msg => ({
        ...msg,
        chatId: this.currentChatId,
        chatTitle: 'Mevcut Sohbet'
      }));
    }

    // Filter by date range if specified
    if (filters.fromDate || filters.toDate) {
      const fromTimestamp = filters.fromDate ? new Date(filters.fromDate).getTime() : 0;
      const toTimestamp = filters.toDate ? new Date(filters.toDate).getTime() : Date.now();

      chatData = chatData.filter(msg => {
        const msgTimestamp = new Date(msg.timestamp || msg.time).getTime();
        return msgTimestamp >= fromTimestamp && msgTimestamp <= toTimestamp;
      });
    }

    // Search through messages
    chatData.forEach((message, index) => {
      let matches = false;
      let matchType = '';

      if (filters.type === 'all' || filters.type === 'messages') {
        if (message.content && message.content.toLowerCase().includes(lowerQuery)) {
          matches = true;
          matchType = 'message';
        }
      }

      if (filters.type === 'all' || filters.type === 'code') {
        if (message.code && message.code.toLowerCase().includes(lowerQuery)) {
          matches = true;
          matchType = 'code';
        }
      }

      if (filters.type === 'all' || filters.type === 'names') {
        if (message.name && message.name.toLowerCase().includes(lowerQuery)) {
          matches = true;
          matchType = 'name';
        }
      }

      if (matches) {
        results.push({
          ...message,
          matchType: matchType,
          chatTitle: message.chatTitle,
          index: index
        });
      }
    });

    return results.slice(0, 100); // Limit results
  }

  displaySearchResults(results, container) {
    if (results.length === 0) {
      container.innerHTML = '<div class="no-results">Sonuç bulunamadı.</div>';
      return;
    }

    let html = `<div class="search-results-header">${results.length} sonuç bulundu</div>`;

    results.forEach(result => {
      const timestamp = new Date(result.timestamp || result.time).toLocaleString('tr-TR');
      const preview = this.getSearchPreview(result.content || result.code || '', result.matchType);

      html += `
        <div class="search-result-item" data-chat-id="${result.chatId}" data-message-index="${result.index}">
          <div class="search-result-header">
            <span class="search-result-chat">${result.chatTitle}</span>
            <span class="search-result-time">${timestamp}</span>
            <span class="search-result-type">${this.getMatchTypeLabel(result.matchType)}</span>
          </div>
          <div class="search-result-preview">${preview}</div>
          <div class="search-result-actions">
            <button class="search-result-btn" onclick="app.goToMessage('${result.chatId}', ${result.index})">
              Mesaja Git
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  getSearchPreview(content, matchType) {
    if (!content) return '';

    // Simple preview - could be enhanced with highlighting
    const maxLength = 150;
    if (content.length <= maxLength) {
      return content;
    }

    return content.substring(0, maxLength) + '...';
  }

  getMatchTypeLabel(type) {
    const labels = {
      message: 'Mesaj',
      code: 'Kod',
      name: 'İsim'
    };
    return labels[type] || type;
  }

  goToMessage(chatId, messageIndex) {
    // Switch to the chat if different
    if (chatId !== this.currentChatId) {
      this.loadChatSession(chatId);
    }

    // Scroll to message
    const messages = document.querySelectorAll('.message');
    if (messages[messageIndex]) {
      messages[messageIndex].scrollIntoView({ behavior: 'smooth' });
    }

    // Close search modal
    this.closeModals();
  }

  handleFileUpload(files, type) {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      this.processFile(file, type);
    });
  }

  processFile(file, type) {
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for images, 5MB for files

    if (file.size > maxSize) {
      if (window.notificationManager) {
        window.notificationManager.notifyError(`${file.name} dosyası çok büyük. Maksimum boyut: ${maxSize / (1024 * 1024)}MB`);
      }
      return;
    }

    const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const fileData = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadType: type,
      status: 'uploading'
    };

    this.uploadedFiles.push(fileData);
    this.showFilePreview(fileData, file);

    // Simulate upload process
    this.uploadFile(file, fileData);
  }

  uploadFile(file, fileData) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileData.uploadType);

    // Simulate upload with progress
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        this.updateFileProgress(fileData.id, percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          this.completeFileUpload(fileData.id, response.url);
        } catch (e) {
          this.failFileUpload(fileData.id, 'Yükleme hatası');
        }
      } else {
        this.failFileUpload(fileData.id, 'Yükleme başarısız');
      }
    });

    xhr.addEventListener('error', () => {
      this.failFileUpload(fileData.id, 'Ağ hatası');
    });

    xhr.open('POST', '/upload');
    xhr.send(formData);
  }

  updateFileProgress(fileId, progress) {
    const previewElement = document.querySelector(`[data-file-id="${fileId}"] .file-progress`);
    if (previewElement) {
      previewElement.style.width = progress + '%';
    }
  }

  completeFileUpload(fileId, url) {
    const fileData = this.uploadedFiles.find(f => f.id === fileId);
    if (fileData) {
      fileData.status = 'completed';
      fileData.url = url;
      this.updateFilePreview(fileId, 'completed', url);
    }
  }

  failFileUpload(fileId, error) {
    const fileData = this.uploadedFiles.find(f => f.id === fileId);
    if (fileData) {
      fileData.status = 'failed';
      fileData.error = error;
      this.updateFilePreview(fileId, 'failed');
    }

    if (window.notificationManager) {
      window.notificationManager.notifyError(`Dosya yükleme hatası: ${error}`);
    }
  }

  showFilePreview(fileData, file) {
    const previewContainer = document.getElementById('file-preview');
    if (!previewContainer) return;

    previewContainer.style.display = 'block';

    const fileElement = document.createElement('div');
    fileElement.className = 'file-preview-item';
    fileElement.setAttribute('data-file-id', fileData.id);

    let previewContent = '';

    if (fileData.uploadType === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgElement = fileElement.querySelector('.file-thumbnail img');
        if (imgElement) {
          imgElement.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);

      previewContent = `
        <div class="file-thumbnail">
          <img src="" alt="${fileData.name}" />
        </div>
        <div class="file-info">
          <div class="file-name">${fileData.name}</div>
          <div class="file-size">${this.formatFileSize(fileData.size)}</div>
          <div class="file-progress-bar">
            <div class="file-progress" style="width: 0%"></div>
          </div>
          <div class="file-status">Yükleniyor...</div>
        </div>
        <button class="file-remove-btn" onclick="app.removeFile('${fileData.id}')">&times;</button>
      `;
    } else {
      const icon = this.getFileIcon(file.type);
      previewContent = `
        <div class="file-thumbnail">
          <span class="file-icon">${icon}</span>
        </div>
        <div class="file-info">
          <div class="file-name">${fileData.name}</div>
          <div class="file-size">${this.formatFileSize(fileData.size)}</div>
          <div class="file-progress-bar">
            <div class="file-progress" style="width: 0%"></div>
          </div>
          <div class="file-status">Yükleniyor...</div>
        </div>
        <button class="file-remove-btn" onclick="app.removeFile('${fileData.id}')">&times;</button>
      `;
    }

    fileElement.innerHTML = previewContent;
    previewContainer.appendChild(fileElement);
  }

  updateFilePreview(fileId, status, url = null) {
    const fileElement = document.querySelector(`[data-file-id="${fileId}"]`);
    if (!fileElement) return;

    const statusElement = fileElement.querySelector('.file-status');
    const progressBar = fileElement.querySelector('.file-progress-bar');

    if (status === 'completed') {
      if (statusElement) statusElement.textContent = 'Tamamlandı';
      if (progressBar) progressBar.style.display = 'none';
      fileElement.classList.add('completed');
    } else if (status === 'failed') {
      if (statusElement) statusElement.textContent = 'Başarısız';
      if (progressBar) progressBar.style.display = 'none';
      fileElement.classList.add('failed');
    }
  }

  removeFile(fileId) {
    // Remove from uploaded files array
    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);

    // Remove from DOM
    const fileElement = document.querySelector(`[data-file-id="${fileId}"]`);
    if (fileElement) {
      fileElement.remove();
    }

    // Hide preview container if no files left
    const previewContainer = document.getElementById('file-preview');
    if (previewContainer && previewContainer.children.length === 0) {
      previewContainer.style.display = 'none';
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType) {
    if (mimeType.startsWith('text/') || mimeType.includes('lua') || mimeType.includes('json') || mimeType.includes('xml')) {
      return '📄';
    } else if (mimeType.startsWith('application/pdf')) {
      return '📕';
    } else if (mimeType.startsWith('application/zip') || mimeType.includes('rar')) {
      return '📦';
    } else {
      return '📎';
    }
  }

  saveChatHistory() {
    if (!this.currentChatId) {
      this.currentChatId = Date.now().toString();
    }

    const chatData = {
      id: this.currentChatId,
      title: this.getChatTitle(),
      messages: this.chatHistory,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(`chat_${this.currentChatId}`, JSON.stringify(chatData));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
      if (window.notificationManager) {
        window.notificationManager.notifyError('Sohbet geçmişi kaydedilemedi.');
      }
    }
  }

  loadChatHistory() {
    // Load last chat session or create new one
    const lastChatId = localStorage.getItem('lastChatId');
    if (lastChatId) {
      this.loadChatSession(lastChatId);
    } else {
      this.createNewChat();
    }
  }

  loadChatSession(chatId) {
    try {
      const chatData = JSON.parse(localStorage.getItem(`chat_${chatId}`));
      if (chatData) {
        this.currentChatId = chatId;
        this.chatHistory = chatData.messages || [];
        this.renderChatHistory();
        localStorage.setItem('lastChatId', chatId);
      }
    } catch (e) {
      console.warn('Failed to load chat session:', e);
    }
  }

  createNewChat() {
    this.currentChatId = Date.now().toString();
    this.chatHistory = [];
    localStorage.setItem('lastChatId', this.currentChatId);
  }

  getChatTitle() {
    if (this.chatHistory.length === 0) return 'Yeni Sohbet';

    const firstMessage = this.chatHistory[0];
    if (firstMessage.content) {
      return firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '');
    }

    return 'İsimsiz Sohbet';
  }

  addMessage(type, content, code = null) {
    const message = {
      type: type,
      content: content,
      code: code,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };

    this.chatHistory.push(message);
    this.renderMessage(message);
    this.saveChatHistory();
  }

  renderMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.type}-message`;
    messageElement.setAttribute('data-message-id', message.id);

    let messageContent = '';

    if (message.code) {
      messageContent = `
        <div class="message-content">${message.content}</div>
        <div class="message-code">
          <pre><code>${this.escapeHtml(message.code)}</code></pre>
        </div>
      `;
    } else {
      messageContent = `<div class="message-content">${this.escapeHtml(message.content)}</div>`;
    }

    messageElement.innerHTML = `
      <div class="message-header">
        <span class="message-sender">${message.type === 'user' ? 'Sen' : 'AI'}</span>
        <span class="message-time">${new Date(message.timestamp).toLocaleTimeString('tr-TR')}</span>
      </div>
      ${messageContent}
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  renderChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    chatMessages.innerHTML = '';
    this.chatHistory.forEach(message => {
      this.renderMessage(message);
    });
  }

  processMessage(message) {
    // Simulate AI response
    setTimeout(() => {
      const response = this.generateAIResponse(message);
      this.addMessage('ai', response);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  generateAIResponse(message) {
    // Simple response generation - in real app this would call an API
    const responses = [
      'Bu konuda size yardımcı olabilirim.',
      'FiveM Lua scripti hakkında daha fazla bilgi verir misiniz?',
      'Kodunuzu kontrol edeyim...',
      'Bu özellik için şu şekilde bir yaklaşım deneyebilirsiniz:',
      'Sorunuzu anladım. İşte cevabım:'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  updateTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (!typingIndicator) return;

    if (this.isTyping) {
      typingIndicator.style.display = 'block';
    } else {
      typingIndicator.style.display = 'none';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  handleGlobalKeyDown(e) {
    // Global keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          this.openSearchModal();
          break;
        case 'n':
          e.preventDefault();
          this.createNewChat();
          break;
        case '/':
          e.preventDefault();
          const chatInput = document.getElementById('chat-input');
          if (chatInput) chatInput.focus();
          break;
      }
    }

    // Close modals with Escape
    if (e.key === 'Escape') {
      this.closeModals();
    }
  }

  initializeStatusIndicators() {
    // Initialize connection status
    this.updateConnectionStatus('connected');

    // Initialize typing indicator
    this.updateTypingIndicator();

    // Set up periodic status updates
    setInterval(() => {
      this.updateConnectionStatus('connected'); // In real app, check actual connection
    }, 30000); // Update every 30 seconds
  }

  updateConnectionStatus(status) {
    const statusIndicator = document.getElementById('connection-status');
    if (!statusIndicator) return;

    statusIndicator.className = `status-indicator ${status}`;
    statusIndicator.title = status === 'connected' ? 'Bağlı' : 'Bağlantı yok';
  }

  initializeTheme() {
    // Theme is initialized in themes.js
    // Here we can add any app-specific theme setup
    this.currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : 'dark';
  }

  initializeNotifications() {
    // Notification system is initialized in notifications.js
    // Here we can add any app-specific notification setup
    this.setupNotificationListeners();
  }

  setupNotificationListeners() {
    // Listen for app-specific events that should trigger notifications
    document.addEventListener('chatMessageReceived', (e) => {
      if (window.notificationManager) {
        window.notificationManager.notifyNewMessage(e.detail.chatId, e.detail.message);
      }
    });

    document.addEventListener('typingIndicator', (e) => {
      if (window.notificationManager) {
        window.notificationManager.notifyTyping(e.detail.chatId, e.detail.user);
      }
    });

    document.addEventListener('apiError', (e) => {
      if (window.notificationManager) {
        window.notificationManager.notifyError(e.detail.message);
      }
    });
  }

  setupAccessibility() {
    // Set up ARIA labels and roles
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.setAttribute('aria-label', 'Mesaj yazın');
      chatInput.setAttribute('role', 'textbox');
      chatInput.setAttribute('aria-multiline', 'true');
    }

    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.setAttribute('role', 'log');
      chatMessages.setAttribute('aria-label', 'Sohbet mesajları');
      chatMessages.setAttribute('aria-live', 'polite');
    }

    // Set up keyboard navigation for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label')) {
        const text = button.textContent.trim();
        if (text) {
          button.setAttribute('aria-label', text);
        }
      }
    });

    // Announce new messages for screen readers
    this.setupMessageAnnouncements();
  }

  setupMessageAnnouncements() {
    // Create a live region for screen reader announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('id', 'sr-live-region');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';

    document.body.appendChild(liveRegion);
    this.liveRegion = liveRegion;
  }

  announceToScreenReader(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        this.liveRegion.textContent = '';
      }, 1000);
    }
  }

  initializeFileUpload() {
    // Set up drag and drop for file upload
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        chatContainer.classList.add('drag-over');
      });

      chatContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        chatContainer.classList.remove('drag-over');
      });

      chatContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        chatContainer.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.handleFileUpload(files, 'file');
        }
      });
    }

    // Set up paste for images
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            this.handleFileUpload([file], 'image');
          }
        }
      }
    });
  }

  initializeEmojiPicker() {
    // Load emoji data if not already loaded
    if (this.emojiData.length === 0) {
      this.loadEmojiData();
    }

    // Set up emoji picker modal
    const emojiModal = document.getElementById('emoji-modal');
    if (emojiModal) {
      emojiModal.addEventListener('click', (e) => {
        if (e.target === emojiModal) {
          this.closeModals();
        }
      });
    }
  }

  loadEmojiData() {
    // Load emoji data from external source or use built-in data
    if (window.emojiData) {
      this.emojiData = window.emojiData;
    } else {
      // Fallback emoji data
      this.emojiData = [
        { emoji: '😀', name: 'grin' },
        { emoji: '😂', name: 'joy' },
        { emoji: '😊', name: 'blush' },
        { emoji: '😍', name: 'heart_eyes' },
        { emoji: '🤔', name: 'thinking' },
        { emoji: '👍', name: 'thumbsup' },
        { emoji: '👎', name: 'thumbsdown' },
        { emoji: '❤️', name: 'heart' },
        { emoji: '🔥', name: 'fire' },
        { emoji: '⭐', name: 'star' }
      ];
    }
  }

  openEmojiPicker() {
    const modal = document.getElementById('emoji-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    // Render emoji picker content
    this.renderEmojiPicker();

    // Focus on first emoji
    const firstEmoji = modal.querySelector('.emoji-item');
    if (firstEmoji) {
      firstEmoji.focus();
    }
  }

  renderEmojiPicker() {
    const container = document.getElementById('emoji-grid');
    if (!container) return;

    let html = '';

    // Use emoji data from emoji-data.js if available
    const emojiData = window.emojiData || this.emojiData;

    // Recent emojis section
    if (emojiData.recent && emojiData.recent.length > 0) {
      html += '<div class="emoji-section"><h4>Son Kullanılan</h4><div class="emoji-row">';
      emojiData.recent.slice(0, 10).forEach(emoji => {
        html += `<button class="emoji-item" data-emoji="${emoji}" aria-label="${emoji}">${emoji}</button>`;
      });
      html += '</div></div>';
    }

    // Categories from emoji-data.js
    const categories = ['smileys', 'animals', 'food', 'activities', 'travel', 'objects', 'symbols'];
    categories.forEach(category => {
      if (emojiData[category] && emojiData[category].length > 0) {
        const categoryName = this.getCategoryName(category);
        html += `<div class="emoji-section"><h4>${categoryName}</h4><div class="emoji-row">`;
        emojiData[category].slice(0, 20).forEach(emoji => {
          html += `<button class="emoji-item" data-emoji="${emoji}" aria-label="${emoji}">${emoji}</button>`;
        });
        html += '</div></div>';
      }
    });

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('.emoji-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.insertEmoji(e.target.dataset.emoji);
      });
    });
  }

  getCategoryName(category) {
    const names = {
      smileys: 'Yüz İfadeleri',
      animals: 'Hayvanlar',
      food: 'Yiyecek',
      activities: 'Aktiviteler',
      travel: 'Seyahat',
      objects: 'Nesneler',
      symbols: 'Semboller'
    };
    return names[category] || category;
  }

  insertEmoji(emoji) {
    const chatInput = document.getElementById('chat-input');
    if (!chatInput) return;

    const start = chatInput.selectionStart;
    const end = chatInput.selectionEnd;
    const text = chatInput.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    chatInput.value = before + emoji + after;
    chatInput.selectionStart = chatInput.selectionEnd = start + emoji.length;
    chatInput.focus();

    // Add to recent emojis
    this.addToRecentEmojis(emoji);

    // Close emoji picker
    this.closeModals();
  }

  addToRecentEmojis(emoji) {
    // Remove if already exists
    this.recentEmojis = this.recentEmojis.filter(e => e !== emoji);

    // Add to beginning
    this.recentEmojis.unshift(emoji);

    // Keep only last 20
    this.recentEmojis = this.recentEmojis.slice(0, 20);

    // Save to localStorage
    try {
      localStorage.setItem('recentEmojis', JSON.stringify(this.recentEmojis));
    } catch (e) {
      console.warn('Failed to save recent emojis:', e);
    }
  }

  initializeSearch() {
    // Load recent emojis from localStorage
    try {
      const saved = localStorage.getItem('recentEmojis');
      if (saved) {
        this.recentEmojis = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load recent emojis:', e);
    }

    // Set up search modal keyboard navigation
    const searchModal = document.getElementById('enhanced-search-modal');
    if (searchModal) {
      searchModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModals();
        }
      });
    }
  }

  initializeThemeSelector() {
    // Set up theme selector modal
    const modal = document.getElementById('theme-modal');
    if (modal) {
      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModals();
        }
      });

      // Handle escape key
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModals();
        }
      });
    }

    // Set up custom theme controls visibility
    const customOption = document.querySelector('.theme-option[data-theme="custom"]');
    if (customOption) {
      customOption.addEventListener('click', () => {
        const customControls = document.getElementById('custom-theme-controls');
        if (customControls) {
          customControls.style.display = 'block';
        }
      });
    }

    // Initialize theme selector with current theme
    if (window.themeManager) {
      const currentTheme = window.themeManager.getCurrentTheme();
      const currentOption = document.querySelector(`.theme-option[data-theme="${currentTheme}"]`);
      if (currentOption) {
        currentOption.classList.add('selected');
      }
    }
  }

  getEmojiData() {
    // Return emoji data here
    return [];
  }
}

const app = new FiveMChatApp();
