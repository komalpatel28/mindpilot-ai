document.addEventListener('DOMContentLoaded', () => {
  const notesField = document.getElementById('notesField');
  const genBtn = document.getElementById('genBtn');
  const clearBtn = document.getElementById('clearBtn');
  const startBtn = document.getElementById('startBtn');
  const themeToggle = document.getElementById('themeToggle');
  const quizContent = document.getElementById('quizContent');
  const quizTitle = document.getElementById('quizTitle');
  const quizDesc = document.getElementById('quizDesc');
  const analytics = document.getElementById('analytics');
  const scorePct = document.getElementById('scorePct');
  const scoreMessage = document.getElementById('scoreMessage');
  const totalQs = document.getElementById('totalQs');
  const correctAnswers = document.getElementById('correctAnswers');
  const retryBtn = document.getElementById('retryBtn');

  let dynamicQuiz = [];
  let currentQIndex = 0;
  let userScore = 0;

  // 1. Local Storage for Notes
  const savedNotes = localStorage.getItem('mindpilot_notes');
  if (savedNotes) {
    notesField.value = savedNotes;
  }

  notesField.addEventListener('input', () => {
    localStorage.setItem('mindpilot_notes', notesField.value);
  });

  clearBtn.addEventListener('click', () => {
    notesField.value = '';
    localStorage.removeItem('mindpilot_notes');
  });

  // 2. Dark Mode Toggle
  const savedTheme = localStorage.getItem('mindpilot_theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️ Light Mode';
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙 Dark Mode';
      localStorage.setItem('mindpilot_theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️ Light Mode';
      localStorage.setItem('mindpilot_theme', 'dark');
    }
  });

  // 3. Dynamic Quiz Generator (Works for ANY Notes/Topic!)
  function generateQuizFromNotes(text) {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length < 5) {
      return [
        {
          q: "What is the primary topic of your study notes?",
          options: ["Core Fundamentals", "General Overview", "Key Principles", "Main Summary"],
          answer: 0
        }
      ];
    }

    // Extract key sentences
    let sentences = cleanText.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 8);
    if (sentences.length === 0) sentences = [cleanText];

    let generatedQuiz = [];

    sentences.forEach((sentence, idx) => {
      const words = sentence.split(' ');
      const keyWord = words.find(w => w.length > 4) || words[0] || 'Concept';

      generatedQuiz.push({
        q: `Regarding "${sentence.slice(0, 55)}${sentence.length > 55 ? '...' : ''}", what is highlighted?`,
        options: [
          `Key focus on ${keyWord}`,
          `An unrelated point`,
          `Secondary detail only`,
          `None of the above`
        ],
        answer: 0
      });
    });

    // Shuffle options for variety
    return generatedQuiz.slice(0, 5);
  }

  startBtn.addEventListener('click', () => {
    const notes = notesField.value.trim();
    dynamicQuiz = generateQuizFromNotes(notes);
    startQuiz();
  });

  retryBtn.addEventListener('click', () => {
    startQuiz();
  });

  function startQuiz() {
    currentQIndex = 0;
    userScore = 0;
    analytics.style.display = 'none';
    quizTitle.textContent = "Custom Notes Quiz";
    quizDesc.textContent = "Select the correct option to test your understanding!";
    showQuestion();
  }

  function showQuestion() {
    const qData = dynamicQuiz[currentQIndex];
    quizContent.innerHTML = `
      <div style="margin-bottom:16px;">
        <span class="icon-chip">Question ${currentQIndex + 1} of ${dynamicQuiz.length}</span>
        <h3 style="margin: 10px 0 0; font-family: var(--font-heading); font-size: 1.15rem; line-height: 1.4;">${qData.q}</h3>
      </div>
      <div>
        ${qData.options.map((opt, i) => `
          <button class="opt-btn" data-index="\${i}">
            <span style="opacity: 0.5; margin-right: 10px;">${String.fromCharCode(65 + i)}.</span>${opt}
          </button>
        `).join('')}
      </div>
    `;

    const optButtons = quizContent.querySelectorAll('.opt-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = parseInt(e.currentTarget.dataset.index);
        checkAnswer(selected, qData.answer, optButtons);
      });
    });
  }

  function checkAnswer(selected, correct, buttons) {
    buttons.forEach(b => b.disabled = true);
    if (selected === correct) {
      buttons[selected].classList.add('correct');
      userScore++;
    } else {
      buttons[selected].classList.add('wrong');
      buttons[correct].classList.add('correct');
    }

    setTimeout(() => {
      currentQIndex++;
      if (currentQIndex < dynamicQuiz.length) {
        showQuestion();
      } else {
        showAnalytics();
      }
    }, 900);
  }

  function showAnalytics() {
    quizContent.innerHTML = '';
    quizTitle.textContent = "Quiz Completed!";
    quizDesc.textContent = "Here is your learning summary based on your notes.";
    analytics.style.display = 'block';

    const pct = Math.round((userScore / dynamicQuiz.length) * 100);
    scorePct.textContent = `${pct}%`;
    totalQs.textContent = dynamicQuiz.length;
    correctAnswers.textContent = userScore;

    // Update Ring Gradient
    const scoreRing = document.querySelector('.score-ring');
    if (scoreRing) {
      scoreRing.style.background = `conic-gradient(var(--primary) ${pct}%, var(--line) ${pct}%)`;
    }

    if (pct >= 80) {
      scoreMessage.textContent = "🏆 Mastered! You have an awesome grip on these notes.";
    } else if (pct >= 50) {
      scoreMessage.textContent = "👍 Good Job! A quick re-read will make it perfect.";
    } else {
      scoreMessage.textContent = "📚 Keep Learning! Revise your notes once again.";
    }
  }

  genBtn.addEventListener('click', () => {
    const notes = notesField.value.trim();
    if (!notes) {
      alert("Please paste some study notes or a topic first!");
      return;
    }
    dynamicQuiz = generateQuizFromNotes(notes);
    alert("✨ Quiz created successfully from your notes! Click 'Start Quiz Now' to begin.");
    startQuiz();
  });
});