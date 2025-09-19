document.addEventListener('DOMContentLoaded', function() {
  const editorContainer = document.getElementById('code-editor');
  const languageSelect = document.getElementById('language-select');
  const themeSelect = document.getElementById('theme-select');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeModal = document.querySelector('.close');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const fontSizeSelect = document.getElementById('font-size-select');
  const tabSizeSelect = document.getElementById('tab-size-select');
  const wordWrapToggle = document.getElementById('word-wrap-toggle');
  const saveFileBtn = document.getElementById('save-file-btn');
  const loadFileBtn = document.getElementById('load-file-btn');
  const loadFileInput = document.getElementById('load-file-input');
  const runCodeBtn = document.getElementById('run-code-btn');
  const tabBar = document.querySelector('.tab-bar');
  const addTabBtn = document.querySelector('.add-tab-btn');
  const codeHistoryTimeline = document.getElementById('code-history-timeline');
  const lineCountEl = document.getElementById('line-count');
  const functionCountEl = document.getElementById('function-count');
  const charCountEl = document.getElementById('char-count');

  let editor;
  let currentTab = 'main.lua';
  let tabs = { 'main.lua': { model: null, history: [] } };
  let tabCounter = 1;
  let currentLanguage = 'lua';

  // Theme selector
  themeSelect.addEventListener('change', function() {
    const selectedTheme = this.value;
    document.body.className = selectedTheme === 'light' ? 'theme-light' : selectedTheme === 'dark' ? 'theme-dark' : selectedTheme === 'blue' ? 'theme-blue' : 'theme-green';
    localStorage.setItem('selectedTheme', selectedTheme);
    if (editor) {
      editor.updateOptions({ theme: selectedTheme === 'dark' ? 'vs-dark' : 'vs' });
    }
  });

  // Load saved theme
  const savedTheme = localStorage.getItem('selectedTheme') || 'light';
  themeSelect.value = savedTheme;
  document.body.className = savedTheme === 'light' ? 'theme-light' : savedTheme === 'dark' ? 'theme-dark' : savedTheme === 'blue' ? 'theme-blue' : 'theme-green';

  // Settings modal
  settingsBtn.addEventListener('click', function() {
    settingsModal.style.display = 'block';
  });

  closeModal.addEventListener('click', function() {
    settingsModal.style.display = 'none';
  });

  window.addEventListener('click', function(event) {
    if (event.target == settingsModal) {
      settingsModal.style.display = 'none';
    }
  });

  // Save settings
  saveSettingsBtn.addEventListener('click', function() {
    const fontSize = fontSizeSelect.value;
    const tabSize = tabSizeSelect.value;
    const wordWrap = wordWrapToggle.checked;

    if (editor) {
      editor.updateOptions({
        fontSize: parseInt(fontSize),
        tabSize: parseInt(tabSize),
        wordWrap: wordWrap ? 'on' : 'off'
      });
    }

    localStorage.setItem('editorFontSize', fontSize);
    localStorage.setItem('editorTabSize', tabSize);
    localStorage.setItem('editorWordWrap', wordWrap);

    settingsModal.style.display = 'none';
  });

  // Load saved settings
  const savedFontSize = localStorage.getItem('editorFontSize') || '16';
  const savedTabSize = localStorage.getItem('editorTabSize') || '2';
  const savedWordWrap = localStorage.getItem('editorWordWrap') === 'true';

  fontSizeSelect.value = savedFontSize;
  tabSizeSelect.value = savedTabSize;
  wordWrapToggle.checked = savedWordWrap;



  // Language selector
  languageSelect.addEventListener('change', function() {
    currentLanguage = this.value;
    if (editor) {
      const model = editor.getModel();
      monaco.editor.setModelLanguage(model, currentLanguage);
    }
  });

  // File save
  saveFileBtn.addEventListener('click', function() {
    if (!editor) return;
    const code = editor.getValue();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentTab;
    a.click();
    URL.revokeObjectURL(url);
  });

  // File load
  loadFileBtn.addEventListener('click', function() {
    loadFileInput.click();
  });
  loadFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const code = e.target.result;
        if (editor) {
          editor.setValue(code);
          updateCodeStats();
          addToHistory(code);
        }
      };
      reader.readAsText(file);
    }
  });

  // Run code (Lua simulation with Fengari)
  runCodeBtn.addEventListener('click', function() {
    if (!editor) return;
    const code = editor.getValue();
    if (currentLanguage === 'lua') {
      try {
        // Assuming Fengari is loaded
        if (typeof fengari !== 'undefined') {
          const L = fengari.lua.luaL_newstate();
          fengari.lua.luaL_openlibs(L);
          const result = fengari.lua.luaL_dostring(L, fengari.to_luastring(code));
          if (result === 0) {
            alert('Kod başarıyla çalıştırıldı (simülasyon).');
          } else {
            const error = fengari.lua.lua_tojsstring(L, -1);
            alert('Hata: ' + error);
          }
          fengari.lua.lua_close(L);
        } else {
          alert('Fengari Lua VM yüklü değil.');
        }
      } catch (e) {
        alert('Çalıştırma hatası: ' + e.message);
      }
    } else {
      alert('Çalıştırma sadece Lua için destekleniyor.');
    }
  });

  // Multi-tab support
  addTabBtn.addEventListener('click', function() {
    const tabName = `untitled${tabCounter++}.lua`;
    createTab(tabName);
    switchToTab(tabName);
  });

  function createTab(tabName) {
    const tabBtn = document.createElement('button');
    tabBtn.className = 'tab-btn';
    tabBtn.textContent = tabName;
    tabBtn.dataset.tab = tabName;
    tabBtn.addEventListener('click', function() {
      switchToTab(tabName);
    });
    // Add close button
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.marginLeft = '5px';
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeTab(tabName);
    });
    tabBtn.appendChild(closeBtn);
    tabBar.insertBefore(tabBtn, addTabBtn);
    tabs[tabName] = { model: null, history: [] };
  }

  function switchToTab(tabName) {
    // Save current tab
    if (editor && currentTab) {
      tabs[currentTab].model = editor.getModel();
    }
    // Switch to new tab
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    if (tabs[tabName].model) {
      editor.setModel(tabs[tabName].model);
    } else {
      const model = monaco.editor.createModel(localStorage.getItem(`fivem-code-${tabName}`) || '-- Buraya kodunuzu yazın...', currentLanguage);
      tabs[tabName].model = model;
      editor.setModel(model);
    }
    updateCodeStats();
  }

  function closeTab(tabName) {
    if (Object.keys(tabs).length === 1) return; // Don't close last tab
    delete tabs[tabName];
    document.querySelector(`[data-tab="${tabName}"]`).remove();
    if (currentTab === tabName) {
      const remainingTabs = Object.keys(tabs);
      switchToTab(remainingTabs[0]);
    }
  }

  // Code history timeline
  function addToHistory(code) {
    const timestamp = new Date().toLocaleTimeString();
    tabs[currentTab].history.push({ code, timestamp });
    updateHistoryTimeline();
  }

  function updateHistoryTimeline() {
    codeHistoryTimeline.innerHTML = '';
    tabs[currentTab].history.forEach((entry, index) => {
      const span = document.createElement('span');
      span.textContent = `${entry.timestamp} `;
      span.style.cursor = 'pointer';
      span.addEventListener('click', function() {
        editor.setValue(entry.code);
      });
      codeHistoryTimeline.appendChild(span);
    });
  }

  // Code statistics
  function updateCodeStats() {
    if (!editor) return;
    const code = editor.getValue();
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const chars = code.length;
    lineCountEl.textContent = `Satır: ${lines}`;
    functionCountEl.textContent = `Fonksiyon: ${functions}`;
    charCountEl.textContent = `Karakter: ${chars}`;
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          saveFileBtn.click();
          break;
        case 'o':
          e.preventDefault();
          loadFileBtn.click();
          break;
        case 'Enter':
          if (e.shiftKey) {
            e.preventDefault();
            runCodeBtn.click();
          }
          break;
        case 't':
          e.preventDefault();
          addTabBtn.click();
          break;
      }
    }
  });

  // Load Monaco Editor from CDN
  const monacoLoaderScript = document.createElement('script');
  monacoLoaderScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs/loader.js';
  monacoLoaderScript.onload = () => {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {
      editor = monaco.editor.create(editorContainer, {
        value: localStorage.getItem('fivem-code-main.lua') || '-- Buraya FiveM için Lua kodunuzu yazın...',
        language: currentLanguage,
        theme: savedTheme === 'dark' ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 16,
        wordWrap: 'on',
        tabSize: 2,
      });

      // Set initial model for main tab
      tabs['main.lua'].model = editor.getModel();

      // Save code on change
      editor.onDidChangeModelContent(() => {
        const code = editor.getValue();
        localStorage.setItem(`fivem-code-${currentTab}`, code);
        updateCodeStats();
        addToHistory(code);
        // Basic syntax checking
        const model = editor.getModel();
        const markers = [];
        if (currentLanguage === 'lua') {
          // Lua syntax check
          let openParens = 0;
          for (let i = 0; i < code.length; i++) {
            if (code[i] === '(') openParens++;
            else if (code[i] === ')') openParens--;
            if (openParens < 0) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: 'Fazladan kapatma parantezi',
                startLineNumber: model.getPositionAt(i).lineNumber,
                startColumn: model.getPositionAt(i).column,
                endLineNumber: model.getPositionAt(i).lineNumber,
                endColumn: model.getPositionAt(i).column + 1,
              });
              openParens = 0;
            }
          }
          if (openParens > 0) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              message: 'Eksik kapatma parantezi',
              startLineNumber: model.getLineCount(),
              startColumn: model.getLineMaxColumn(model.getLineCount()),
              endLineNumber: model.getLineCount(),
              endColumn: model.getLineMaxColumn(model.getLineCount()),
            });
          }
        }
        monaco.editor.setModelMarkers(model, 'owner', markers);
      });

      // Load natives.json for autocomplete suggestions
      fetch('/natives')
        .then(res => res.json())
        .then(data => {
          const natives = data.natives || [];
          monaco.languages.registerCompletionItemProvider('lua', {
            provideCompletionItems: (model, position) => {
              const word = model.getWordUntilPosition(position);
              const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
              };
              const suggestions = natives.map(native => ({
                label: native.name,
                kind: monaco.languages.CompletionItemKind.Function,
                documentation: native.description,
                insertText: native.name + '()',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range,
                detail: 'FiveM Native',
              }));
              // Add context-based suggestions
              const contextSuggestions = getContextSuggestions(model, position);
              suggestions.push(...contextSuggestions);
              return { suggestions: suggestions };
            }
          });
        });

      // Template loading functions
      window.loadTemplate = function(type) {
        const templates = {
          client: `-- Client Script Template
ESX = nil
Citizen.CreateThread(function()
    while ESX == nil do
        TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
        Citizen.Wait(0)
    end
end)

-- Your client-side code here
RegisterNetEvent('your:event')
AddEventHandler('your:event', function(arg1, arg2)
    -- Event handler code
end)`,
          server: `-- Server Script Template
ESX = nil
TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

-- Your server-side code here
RegisterServerCallback('your:callback', function(source, cb)
    -- Callback code
    cb(result)
end)`,
          shared: `-- Shared Script Template
Config = {
    -- Your configuration here
    Debug = true,
    Version = '1.0.0'
}

-- Shared functions
function DebugPrint(message)
    if Config.Debug then
        print('[DEBUG] ' .. message)
    end
end`,
          command: `-- Command Example
RegisterCommand('testcmd', function(source, args, raw)
    if source == 0 then
        print('This command can only be used in-game!')
        return
    end

    local playerId = source
    local playerName = GetPlayerName(playerId)

    TriggerClientEvent('chat:addMessage', playerId, {
        color: {255, 0, 0},
        multiline: true,
        args: {'Server', 'Test command executed by ' .. playerName}
    })
end, false)`,
          event: `-- Event Example
-- Client-side event
RegisterNetEvent('showNotification')
AddEventHandler('showNotification', function(message, type)
    ESX.ShowNotification(message)
end)

-- Server-side event trigger
RegisterCommand('notify', function(source, args, raw)
    local message = table.concat(args, ' ')
    if message == '' then
        TriggerClientEvent('chat:addMessage', source, {
            args: {'Server', 'Usage: /notify <message>'}
        })
        return
    end

    TriggerClientEvent('showNotification', source, message, 'info')
end, false)`,
          mysql: `-- MySQL Connection Example
-- Using mysql-async
MySQL.ready(function()
    print('MySQL connection established!')
end)

-- Example query
function GetPlayerData(identifier)
    MySQL.Async.fetchAll('SELECT * FROM users WHERE identifier = @identifier', {
        ['@identifier'] = identifier
    }, function(result)
        if result[1] then
            -- Player data found
            print('Player data loaded for ' .. identifier)
        else
            -- Player not found
            print('No data found for ' .. identifier)
        end
    end)
end

-- Example insert
function SavePlayerData(identifier, data)
    MySQL.Async.execute('INSERT INTO player_data (identifier, data) VALUES (@identifier, @data) ON DUPLICATE KEY UPDATE data = @data', {
        ['@identifier'] = identifier,
        ['@data'] = json.encode(data)
    })
end`
        };

        editor.setValue(templates[type] || '-- Template not found');
        localStorage.setItem(`fivem-code-${currentTab}`, editor.getValue());
        updateCodeStats();
        addToHistory(editor.getValue());
      };

      // Idea loading functions
      window.loadIdea = function(type) {
        const ideas = {
          vehicle: `-- Araç Sistemi Fikri
-- Özellikler:
-- - Araç spawn sistemi
-- - Yakıt sistemi
-- - Araç kilitleme/açma
-- - Araç tamiri
-- - Araç rengi değiştirme
-- - Araç modifikasyonları

-- Örnek kullanım:
-- /spawncar [model] - Araç spawn et
-- /lockcar - Araç kilitle/aç
-- /repaircar - Araç tamir et
-- /fuelcar - Yakıt doldur`,
          inventory: `-- Envanter Sistemi Fikri
-- Özellikler:
-- - Eşya ekleme/çıkarma
-- - Eşya kullanma
-- - Eşya verme
-- - Envanter kapasitesi
-- - Eşya kategorileri
-- - Hotbar sistemi

-- Örnek kullanım:
-- /inventory - Envanteri aç
-- /giveitem [player] [item] [amount] - Eşya ver
-- /useitem [item] - Eşya kullan`,
          housing: `-- Ev Sistemi Fikri
-- Özellikler:
-- - Ev satın alma/kiralama
-- - Ev içi dekorasyon
-- - Ev kilitleme sistemi
-- - Ev giriş/çıkış
-- - Mobilya yerleştirme
-- - Ev fiyatlandırma

-- Örnek kullanım:
-- /buyhouse - Ev satın al
-- /sellhouse - Ev sat
-- /lockhouse - Ev kilitle/aç
-- /decorate - Dekorasyon modu`,
          job: `-- Meslek Sistemi Fikri
-- Özellikler:
-- - Meslek seçimi
-- - Maaş sistemi
-- - Görev sistemi
-- - Terfi sistemi
-- - Meslek araçları
-- - Çalışma saatleri

-- Örnek meslekler:
-- Polis, Doktor, Mekanik, Taksi, Çöpçü, Madenci

-- Örnek kullanım:
-- /jobcenter - Meslek merkezi
-- /duty - Göreve başla/bitir
-- /salary - Maaş al`,
          gang: `-- Çete Sistemi Fikri
-- Özellikler:
-- - Çete oluşturma/katılma
-- - Çete seviyesi
-- - Çete üyeleri yönetimi
-- - Çete bölgeleri
-- - Çete savaşları
-- - Çete ekonomisi

-- Örnek kullanım:
-- /creategang [name] - Çete oluştur
-- /joingang [id] - Çeteye katıl
-- /gangmenu - Çete menüsü
-- /gangwar - Çete savaşı başlat`,
          shop: `-- Mağaza Sistemi Fikri
-- Özellikler:
-- - Mağaza oluşturma
-- - Ürün ekleme/çıkarma
-- - Fiyat ayarlama
-- - Satış istatistikleri
-- - Mağaza dekorasyonu
-- - Çalışan yönetimi

-- Örnek kullanım:
-- /createshop - Mağaza oluştur
-- /addproduct [name] [price] - Ürün ekle
-- /shopstats - Satış istatistikleri
-- /manageemployees - Çalışanları yönet`
        };

        editor.setValue(ideas[type] || 'Fikir bulunamadı');
      };

      // Context-based suggestions function
      function getContextSuggestions(model, position) {
        const code = model.getValue();
        const lines = code.split('\n');
        const currentLine = lines[position.lineNumber - 1] || '';
        const suggestions = [];
        // Simple context: if line contains 'ESX.', suggest ESX methods
        if (currentLine.includes('ESX.')) {
          suggestions.push({
            label: 'ShowNotification',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'ShowNotification("${1:message}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'ESX Notification'
          });
        }
        // Add more context-based logic as needed
        return suggestions;
      }
    });
  };
  document.head.appendChild(monacoLoaderScript);
});
