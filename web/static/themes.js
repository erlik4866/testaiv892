// Theme Management System for FiveM Lua AI Chat

class ThemeManager {
  constructor() {
    this.themes = {
      dark: {
        '--bg-color': '#121212',
        '--text-color': '#e0e0e0',
        '--primary-color': '#00d4ff',
        '--secondary-color': '#1f1f1f',
        '--accent-color': '#00d4ff',
        '--border-color': '#333',
        '--hover-color': '#008bb3',
        '--message-user-bg': '#007bff',
        '--message-bot-bg': '#333',
        '--header-bg': '#1f1f1f',
        '--sidebar-bg': '#1f1f1f'
      },
      light: {
        '--bg-color': '#f5f5f5',
        '--text-color': '#333',
        '--primary-color': '#005f99',
        '--secondary-color': '#e0e0e0',
        '--accent-color': '#005f99',
        '--border-color': '#ccc',
        '--hover-color': '#00d4ff',
        '--message-user-bg': '#007bff',
        '--message-bot-bg': '#f0f0f0',
        '--header-bg': '#e0e0e0',
        '--sidebar-bg': '#e0e0e0'
      },
      blue: {
        '--bg-color': '#1a237e',
        '--text-color': '#e0e0e0',
        '--primary-color': '#3949ab',
        '--secondary-color': '#283593',
        '--accent-color': '#00d4ff',
        '--border-color': '#5c6bc0',
        '--hover-color': '#008bb3',
        '--message-user-bg': '#007bff',
        '--message-bot-bg': '#283593',
        '--header-bg': '#283593',
        '--sidebar-bg': '#283593'
      },
      green: {
        '--bg-color': '#1b5e20',
        '--text-color': '#e0e0e0',
        '--primary-color': '#388e3c',
        '--secondary-color': '#2e7d32',
        '--accent-color': '#00d4ff',
        '--border-color': '#4caf50',
        '--hover-color': '#008bb3',
        '--message-user-bg': '#007bff',
        '--message-bot-bg': '#2e7d32',
        '--header-bg': '#2e7d32',
        '--sidebar-bg': '#2e7d32'
      },
      purple: {
        '--bg-color': '#4a148c',
        '--text-color': '#e0e0e0',
        '--primary-color': '#7b1fa2',
        '--secondary-color': '#6a1b9a',
        '--accent-color': '#00d4ff',
        '--border-color': '#9c27b0',
        '--hover-color': '#008bb3',
        '--message-user-bg': '#007bff',
        '--message-bot-bg': '#6a1b9a',
        '--header-bg': '#6a1b9a',
        '--sidebar-bg': '#6a1b9a'
      }
    };

    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.customTheme = JSON.parse(localStorage.getItem('customTheme')) || null;

    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupCustomTheme();
  }

  applyTheme(themeName) {
    const theme = this.themes[themeName] || this.themes.dark;
    const root = document.documentElement;

    // Apply CSS custom properties
    Object.keys(theme).forEach(property => {
      root.style.setProperty(property, theme[property]);
    });

    // Update body classes
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${themeName}`);

    // Update current theme
    this.currentTheme = themeName;
    localStorage.setItem('theme', themeName);

    // Update theme selector UI
    this.updateThemeSelector(themeName);
  }

  updateThemeSelector(selectedTheme) {
    document.querySelectorAll('.theme-option').forEach(option => {
      option.classList.remove('selected');
      if (option.dataset.theme === selectedTheme) {
        option.classList.add('selected');
      }
    });
  }

  setCustomTheme(colors) {
    this.customTheme = colors;
    localStorage.setItem('customTheme', JSON.stringify(colors));

    // Update themes object
    this.themes.custom = {
      '--bg-color': colors.background || '#121212',
      '--text-color': '#e0e0e0',
      '--primary-color': colors.primary || '#00d4ff',
      '--secondary-color': colors.secondary || '#1f1f1f',
      '--accent-color': colors.primary || '#00d4ff',
      '--border-color': '#333',
      '--hover-color': '#008bb3',
      '--message-user-bg': '#007bff',
      '--message-bot-bg': '#333',
      '--header-bg': colors.secondary || '#1f1f1f',
      '--sidebar-bg': colors.secondary || '#1f1f1f'
    };

    if (this.currentTheme === 'custom') {
      this.applyTheme('custom');
    }
  }

  setupCustomTheme() {
    if (this.customTheme) {
      this.setCustomTheme(this.customTheme);
    }

    // Set up color picker inputs
    const primaryInput = document.getElementById('primary-color');
    const secondaryInput = document.getElementById('secondary-color');
    const backgroundInput = document.getElementById('background-color');

    if (primaryInput && this.customTheme) {
      primaryInput.value = this.customTheme.primary || '#00d4ff';
    }
    if (secondaryInput && this.customTheme) {
      secondaryInput.value = this.customTheme.secondary || '#333';
    }
    if (backgroundInput && this.customTheme) {
      backgroundInput.value = this.customTheme.background || '#121212';
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  toggleTheme() {
    const themes = this.getAvailableThemes();
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.applyTheme(nextTheme);
  }

  // Utility method to get theme colors
  getThemeColors(themeName) {
    return this.themes[themeName] || this.themes.dark;
  }
}

// Global theme manager instance
const themeManager = new ThemeManager();

// Export for use in other scripts
window.ThemeManager = ThemeManager;
window.themeManager = themeManager;
