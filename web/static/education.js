// Eğitim Modülü JavaScript

const tutorials = [
    {
        title: "FiveM Lua Temelleri",
        content: `
            <h3>Lua Diline Giriş</h3>
            <p>FiveM'de Lua scripting kullanırız. Temel syntax:</p>
            <pre><code>-- Değişken tanımlama
local playerName = "Oyuncu"
local playerId = GetPlayerServerId(PlayerId())

-- Fonksiyon tanımlama
function MerhabaDunya()
    print("Merhaba Dünya!")
end

-- Event kullanımı
RegisterNetEvent('merhaba:event')
AddEventHandler('merhaba:event', function()
    MerhabaDunya()
end)</code></pre>
        `,
        quiz: [
            {
                question: "FiveM'de Lua'da değişken tanımlamak için hangi anahtar kelime kullanılır?",
                options: ["var", "let", "local", "const"],
                correct: 2
            },
            {
                question: "Aşağıdakilerden hangisi FiveM'de event dinlemek için kullanılır?",
                options: ["AddEventHandler", "RegisterCommand", "CreateThread", "TriggerEvent"],
                correct: 0
            }
        ]
    },
    {
        title: "Events ve Threads",
        content: `
            <h3>Events</h3>
            <p>FiveM'de olay tabanlı programlama önemlidir:</p>
            <pre><code>-- Client-side event
RegisterNetEvent('oyuncu:spawn')
AddEventHandler('oyuncu:spawn', function()
    -- Oyuncu spawn olduğunda çalışacak kod
    SetEntityCoords(PlayerPedId(), 0.0, 0.0, 0.0)
end)

-- Server-side event
RegisterServerCallback('getPlayerData', function(source, cb)
    local playerData = GetPlayerData(source)
    cb(playerData)
end)</code></pre>

            <h3>Threads</h3>
            <p>Sürekli çalışan kodlar için thread kullanırız:</p>
            <pre><code>Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000) -- 1 saniye bekle
        -- Her saniye çalışacak kod
        local playerCoords = GetEntityCoords(PlayerPedId())
        -- Koordinatları işle
    end
end)</code></pre>
        `,
        quiz: [
            {
                question: "Citizen.CreateThread ne için kullanılır?",
                options: ["Event oluşturmak", "Sürekli çalışan kod bloğu", "Komut kaydetmek", "Veritabanı bağlantısı"],
                correct: 1
            }
        ]
    }
];

let currentTutorial = 0;
let currentQuestion = 0;

function loadTutorials() {
    const tutorialList = document.getElementById('tutorial-list');
    tutorials.forEach((tutorial, index) => {
        const tutorialDiv = document.createElement('div');
        tutorialDiv.className = 'tutorial-item';
        tutorialDiv.innerHTML = `
            <h3>${tutorial.title}</h3>
            <div class="tutorial-content">${tutorial.content}</div>
            <button onclick="startQuiz(${index})">Quiz Başlat</button>
        `;
        tutorialList.appendChild(tutorialDiv);
    });
}

function startQuiz(tutorialIndex) {
    currentTutorial = tutorialIndex;
    currentQuestion = 0;
    document.getElementById('tutorials').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    const quiz = tutorials[currentTutorial].quiz;
    if (currentQuestion >= quiz.length) {
        alert('Quiz tamamlandı!');
        document.getElementById('quiz').style.display = 'none';
        document.getElementById('tutorials').style.display = 'block';
        return;
    }

    const question = quiz[currentQuestion];
    document.getElementById('quiz-question').innerHTML = `<h3>${question.question}</h3>`;
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        optionsDiv.appendChild(button);
    });
}

function checkAnswer(selectedIndex) {
    const correctIndex = tutorials[currentTutorial].quiz[currentQuestion].correct;
    if (selectedIndex === correctIndex) {
        alert('Doğru!');
    } else {
        alert('Yanlış! Tekrar deneyin.');
        return;
    }
    currentQuestion++;
    showQuestion();
}

document.getElementById('next-question').addEventListener('click', () => {
    currentQuestion++;
    showQuestion();
});

// AI Soru-Cevap
document.getElementById('ask-ai').addEventListener('click', async () => {
    const question = document.getElementById('user-question').value;
    if (!question.trim()) return;

    const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'user', content: `FiveM Lua ile ilgili soru: ${question}` }
            ]
        })
    });

    const data = await response.json();
    document.getElementById('ai-answer').innerHTML = `<pre>${data.code}</pre>`;
});

// Sayfa yüklendiğinde eğitimleri yükle
document.addEventListener('DOMContentLoaded', loadTutorials);
