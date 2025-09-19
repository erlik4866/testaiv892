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

export { CONFIG, INITIAL_STATE };
