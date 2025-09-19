document.addEventListener('DOMContentLoaded', () => {
  const metricsBtn = document.createElement('button');
  metricsBtn.textContent = 'Performance Metrics';
  metricsBtn.className = 'metrics-btn';
  metricsBtn.style.marginLeft = '10px';

  const chatForm = document.getElementById('chat-form');
  chatForm.appendChild(metricsBtn);

  metricsBtn.addEventListener('click', () => {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;

    const lastBotMessage = [...chat.messages].reverse().find(m => m.role === 'bot');
    if (!lastBotMessage) {
      alert('No code snippet to analyze.');
      return;
    }

    const code = lastBotMessage.content;
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const events = (code.match(/RegisterNetEvent|AddEventHandler/g) || []).length;
    const threads = (code.match(/Citizen\.CreateThread/g) || []).length;

    alert(`Code Metrics:
Lines: ${lines}
Functions: ${functions}
Events: ${events}
Threads: ${threads}`);
  });
});
