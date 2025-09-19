async function loadUserInfo() {
  try {
    const response = await fetch('keys.json');
    const users = await response.json();
    // Basit olarak ilk kullanıcıyı al, gerçekte oturum bilgisine göre
    const user = users.find(u => u.role === 'admin') || users[0];
    const userInfoDiv = document.getElementById('user-info');
    if (user) {
      userInfoDiv.innerHTML = `<span>Hoşgeldin, ${user.discord_name} ${user.role ? `(${user.role})` : ''}</span>`;
    }
  } catch (error) {
    console.error('Kullanıcı bilgisi yüklenirken hata:', error);
  }
}

async function loadForumSidebar() {
  try {
    const response = await fetch('konular.json');
    const data = await response.json();
    const sidebar = document.getElementById('forum-sidebar');
    sidebar.innerHTML = '';
    data.categories.forEach(category => {
      const catDiv = document.createElement('div');
      catDiv.className = 'chat-item';
      catDiv.innerHTML = `<span>${category.icon} ${category.name}</span>`;
      catDiv.onclick = () => loadCategory(category.id);
      sidebar.appendChild(catDiv);
    });
  } catch (error) {
    console.error('Sidebar yüklenirken hata:', error);
  }
}

async function loadForum() {
  try {
    const response = await fetch('konular.json');
    const data = await response.json();
    const container = document.getElementById('forum-categories');
    container.innerHTML = '';

    data.categories.forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'forum-category';
      categoryDiv.innerHTML = `
        <h2>${category.icon} ${category.name}</h2>
        <p>${category.description}</p>
        <div class="forums-list">
          ${category.forums.map(forum => `
            <div class="forum-item">
              <h3>${forum.icon} ${forum.name}</h3>
              <p>${forum.description}</p>
              <div class="topics-list">
                ${forum.topics.map(topic => `
                  <div class="topic-item">
                    <h4>${topic.title}</h4>
                    <p>${topic.content.substring(0, 100)}...</p>
                    <small>Yazar: ${topic.author} | Cevaplar: ${topic.replies_count} | Görüntüleme: ${topic.views}</small>
                    <button class="favorite-btn" data-topic-id="${topic.id}">Favori Ekle</button>
                    <div class="replies">
                      ${topic.replies.map(reply => `
                        <div class="reply">
                          <p>${reply.content}</p>
                          <small>Yazar: ${reply.author} | ${reply.timestamp}</small>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      container.appendChild(categoryDiv);
    });
  } catch (error) {
    console.error('Forum yüklenirken hata:', error);
  }
}

function loadCategory(categoryId) {
  // Kategori yükleme fonksiyonu, şimdilik basit
  alert('Kategori ' + categoryId + ' yüklendi');
}

async function loadStats() {
  try {
    const response = await fetch('konular.json');
    const data = await response.json();
    const statsDiv = document.getElementById('stats-display');
    statsDiv.innerHTML = `
      <p>Toplam Konu: ${data.stats.total_topics}</p>
      <p>Toplam Cevap: ${data.stats.total_replies}</p>
      <p>Toplam Kullanıcı: ${data.stats.total_users}</p>
      <p>Çevrimiçi Kullanıcı: ${data.stats.online_users}</p>
    `;
  } catch (error) {
    console.error('İstatistik yüklenirken hata:', error);
  }
}

function searchForum(query) {
  const resultsDiv = document.getElementById('search-results');
  resultsDiv.innerHTML = '';
  if (!query) return;

  // Basit arama, gerçekte backend gerekli
  const allTopics = [];
  // konular.json'dan konular çek
  fetch('konular.json')
    .then(response => response.json())
    .then(data => {
      data.categories.forEach(category => {
        category.forums.forEach(forum => {
          forum.topics.forEach(topic => {
            if (topic.title.toLowerCase().includes(query.toLowerCase()) ||
                topic.content.toLowerCase().includes(query.toLowerCase())) {
              allTopics.push(topic);
            }
          });
        });
      });
      if (allTopics.length > 0) {
        resultsDiv.innerHTML = allTopics.map(topic => `<div class="search-result">${topic.title}</div>`).join('');
      } else {
        resultsDiv.innerHTML = '<p>Sonuç bulunamadı.</p>';
      }
    });
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('light-theme');
  const theme = body.classList.contains('light-theme') ? 'light' : 'dark';
  localStorage.setItem('theme', theme);
}

function loadTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  }
}

function addToFavorites(topicId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(topicId)) {
    favorites.push(topicId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Konu favorilere eklendi!');
  } else {
    alert('Konu zaten favorilerde.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadUserInfo();
  loadForumSidebar();
  loadForum();
  loadStats();
  loadFavorites();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('forum-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('forum-title').value;
    const content = document.getElementById('forum-content').value;
    // Yeni konuyu konular.json'a ekleme (gerçekte backend gerekli)
    alert('Yeni konu oluşturuldu: ' + title);
    // Formu temizle
    document.getElementById('forum-title').value = '';
    document.getElementById('forum-content').value = '';
    // Forumu yeniden yükle
    loadForum();
  });
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('search-input').value;
    searchForum(query);
  });
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('favorite-btn')) {
      const topicId = e.target.dataset.topicId;
      addToFavorites(topicId);
      loadFavorites();
    }
  });
});

function loadFavorites() {
  const favoritesList = document.getElementById('favorites-list');
  favoritesList.innerHTML = '';
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p>Favori konu bulunmamaktadır.</p>';
    return;
  }
  fetch('konular.json')
    .then(response => response.json())
    .then(data => {
      let favoriteTopics = [];
      data.categories.forEach(category => {
        category.forums.forEach(forum => {
          forum.topics.forEach(topic => {
            if (favorites.includes(topic.id)) {
              favoriteTopics.push(topic);
            }
          });
        });
      });
      if (favoriteTopics.length > 0) {
        favoriteTopics.forEach(topic => {
          const div = document.createElement('div');
          div.className = 'favorite-topic';
          div.textContent = topic.title;
          favoritesList.appendChild(div);
        });
      } else {
        favoritesList.innerHTML = '<p>Favori konu bulunmamaktadır.</p>';
      }
    });
}
