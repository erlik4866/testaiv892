// Notification System for FiveM Lua AI Chat

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.statusIndicators = {
      connection: null,
      api: null
    };
    this.init();
  }

  init() {
    this.createContainer();
    this.setupStatusIndicators();
    this.startStatusPolling();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'notification-container';
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  }

  setupStatusIndicators() {
    this.statusIndicators.connection = document.getElementById('connection-status');
    this.statusIndicators.api = document.getElementById('api-status');
  }

  show(type, message, duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${this.getIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.remove()" aria-label="Bildirimi kapat">&times;</button>
    `;

    this.container.appendChild(notification);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, duration);
    }

    // Accessibility announcement
    this.announceToScreenReader(message);

    return notification;
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || 'ℹ';
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  updateStatus(type, status, message = '') {
    const indicator = this.statusIndicators[type];
    if (!indicator) return;

    const dot = indicator.querySelector('.status-dot');
    const text = indicator.querySelector('.status-text');

    // Remove all status classes
    dot.classList.remove('connected', 'disconnected', 'available', 'unavailable');

    // Add appropriate class
    if (status === 'online' || status === 'connected' || status === 'available') {
      dot.classList.add(status === 'connected' ? 'connected' : 'available');
      text.textContent = message || (status === 'connected' ? 'Çevrimiçi' : 'Hazır');
    } else {
      dot.classList.add(status === 'disconnected' ? 'disconnected' : 'unavailable');
      text.textContent = message || (status === 'disconnected' ? 'Çevrimdışı' : 'Kullanılamıyor');
    }
  }

  startStatusPolling() {
    // Check connection status
    this.checkConnectionStatus();

    // Check API status
    this.checkAPIStatus();

    // Poll every 30 seconds
    setInterval(() => {
      this.checkConnectionStatus();
      this.checkAPIStatus();
    }, 30000);
  }

  checkConnectionStatus() {
    // Simple online check
    if (navigator.onLine) {
      this.updateStatus('connection', 'connected');
    } else {
      this.updateStatus('connection', 'disconnected');
    }
  }

  async checkAPIStatus() {
    try {
      const response = await fetch('/get_maintenance_status', {
        method: 'GET',
        timeout: 5000
      });

      if (response.ok) {
        const data = await response.json();
        if (data.maintenance) {
          this.updateStatus('api', 'unavailable', 'Bakımda');
          this.show('warning', 'Sistem şu anda bakımda. Kısa süre sonra hizmete döneceğiz.');
        } else {
          this.updateStatus('api', 'available');
        }
      } else {
        this.updateStatus('api', 'unavailable', 'API Hatası');
        this.show('error', 'API bağlantısında sorun var. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      this.updateStatus('api', 'unavailable', 'Bağlantı Hatası');
      this.show('error', 'API\'ye bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
    }
  }

  // Real-time notification methods
  notifyNewMessage(chatId, message) {
    if (document.hidden) {
      this.show('info', `Yeni mesaj: ${message.substring(0, 50)}...`);
    }
  }

  notifyTyping(chatId, user) {
    // Could show typing indicator
    this.show('info', `${user} yazıyor...`, 2000);
  }

  notifyError(message) {
    this.show('error', message);
  }

  notifySuccess(message) {
    this.show('success', message);
  }

  notifyWarning(message) {
    this.show('warning', message);
  }
}

// Global notification manager instance
const notificationManager = new NotificationManager();

// Export for use in other scripts
window.NotificationManager = NotificationManager;
window.notificationManager = notificationManager;
