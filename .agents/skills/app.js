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

  // Sample Quiz Data
  const sampleQuiz = [
    {
      q: "What is the primary power house of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Body"],
      answer: 1
    },
    {
      q: "Which process creates ATP in cytoplasm without oxygen?",
      options: ["Glycolysis", "Krebs Cycle", "Electron Transport", "Photosynthesis"],
      answer: 0
    },
    {
      q: "What is the end product of aerobic respiration?",
      options: ["Lactic Acid", "Glucose", "Water & CO2", "Pyruvate"],
      answer: 2
    }
  ];

  let currentQIndex = 0;
  let userScore = 0;

  // 1. FEATURE: Local Storage (Auto-Save Notes & Theme Preference)
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

  // 2. FEATURE: Dark Mode Toggle
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

  // 3. FEATURE: Interactive Quiz Flow & Analytics
  startBtn.addEventListener('click', startQuiz);
  retryBtn.addEventListener('click', startQuiz);

  function startQuiz() {
    currentQIndex = 0;
    userScore = 0;
    analytics.style.display = 'none';
    quizTitle.textContent = "Cellular Biology Quiz";
    quizDesc.textContent = "Select the correct option for each question.";
    showQuestion();
  }

  function showQuestion() {
    const qData = sampleQuiz[currentQIndex];
    quizContent.innerHTML = `
      <div style="margin-bottom:15px;">
        <span class="lab">Question ${currentQIndex + 1} of ${sampleQuiz.length}</span>
        <h3 style="margin: 8px 0;">${qData.q}</h3>
      </div>
      <div>
        ${qData.options.map((opt, i) => `
          <button class="opt-btn" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
    `;

    const optButtons = quizContent.querySelectorAll('.opt-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = parseInt(e.target.dataset.index);
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
      if (currentQIndex < sampleQuiz.length) {
        showQuestion();
      } else {
        showAnalytics();
      }
    }, 1200);
  }

  // 4. FEATURE: Score Tracker / Analytics Display
  function showAnalytics() {
    quizContent.innerHTML = '';
    quizTitle.textContent = "Quiz Completed!";
    quizDesc.textContent = "Here is your detailed performance analysis.";
    analytics.style.display = 'block';

    const pct = Math.round((userScore / sampleQuiz.length) * 100);
    scorePct.textContent = `${pct}%`;
    totalQs.textContent = sampleQuiz.length;
    correctAnswers.textContent = userScore;

    if (pct >= 80) {
      scoreMessage.textContent = "🏆 Excellent! You have a great grasp of these notes.";
    } else if (pct >= 50) {
      scoreMessage.textContent = "👍 Good job! Review the missed topics to improve.";
    } else {
      scoreMessage.textContent = "📚 Needs review. Try re-reading your notes and retake.";
    }
  }

  genBtn.addEventListener('click', () => {
    if (!notesField.value.trim()) {
      alert("Please enter some study notes or a topic first!");
      return;
    }
    alert("✨ Quiz generated from your notes! Click 'Start Quiz' to begin.");
    startQuiz();
  });
});