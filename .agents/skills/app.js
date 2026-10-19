document.addEventListener('DOMContentLoaded', () => {
  const notesField = document.getElementById('notesField');
  const genBtn = document.getElementById('genBtn');
  const startBtn = document.getElementById('startBtn');
  const retryBtn = document.getElementById('retryBtn');
  const quizContent = document.getElementById('quizContent');
  const flashcardContent = document.getElementById('flashcardContent');
  const analytics = document.getElementById('analytics');
  const tabQuiz = document.getElementById('tabQuiz');
  const tabCards = document.getElementById('tabCards');
  const themeToggle = document.getElementById('themeToggle');

  let questions = [
    {
      q: "What is MindPilot AI designed for?",
      options: ["Smart interactive learning & quizzes", "Video editing", "Photo sharing", "Weather tracking"],
      answer: 0
    },
    {
      q: "Why is active recall effective?",
      options: ["Improves memory retention", "Wastes time", "Has no effect", "Creates confusion"],
      answer: 0
    }
  ];

  let currentQ = 0;
  let score = 0;
  let cardIdx = 0;

  // Tabs
  tabQuiz.addEventListener('click', () => {
    tabQuiz.classList.add('active');
    tabCards.classList.remove('active');
    flashcardContent.style.display = 'none';
    if(analytics.style.display !== 'block') quizContent.style.display = 'block';
  });

  tabCards.addEventListener('click', () => {
    tabCards.classList.add('active');
    tabQuiz.classList.remove('active');
    quizContent.style.display = 'none';
    analytics.style.display = 'none';
    flashcardContent.style.display = 'block';
    renderCard();
  });

  // Generate / Start
  genBtn.addEventListener('click', startQuizSession);
  startBtn.addEventListener('click', startQuizSession);
  retryBtn.addEventListener('click', startQuizSession);

  function startQuizSession() {
    const text = notesField.value.trim();
    if(text.length > 5) {
      // Simple custom dynamic question from notes
      questions = [
        {
          q: "Based on your notes: " + text.slice(0, 40) + "...",
          options: ["Core concept described in notes", "Unrelated topic", "Minor detail", "None"],
          answer: 0
        }
      ];
    }
    currentQ = 0;
    score = 0;
    analytics.style.display = 'none';
    flashcardContent.style.display = 'none';
    quizContent.style.display = 'block';
    renderQuestion();
  }

  function renderQuestion() {
    if (currentQ >= questions.length) {
      quizContent.style.display = 'none';
      analytics.style.display = 'block';
      document.getElementById('scorePct').textContent = Math.round((score / questions.length) * 100) + '%';
      return;
    }

    const qData = questions[currentQ];
    quizContent.innerHTML = `
      <h4>Question ${currentQ + 1} of ${questions.length}</h4>
      <p><b>${qData.q}</b></p>
      <div id="opts">
        ${qData.options.map((opt, i) => `<button class="opt-btn" data-idx="${i}">${opt}</button>`).join('')}
      </div>
    `;

    const optsDiv = document.getElementById('opts');
    optsDiv.addEventListener('click', (e) => {
      const btn = e.target.closest('.opt-btn');
      if(!btn) return;

      const selected = parseInt(btn.getAttribute('data-idx'));
      const allBtns = optsDiv.querySelectorAll('.opt-btn');
      allBtns.forEach(b => b.disabled = true);

      if(selected === qData.answer) {
        btn.classList.add('correct');
        score++;
      } else {
        btn.classList.add('wrong');
        allBtns[qData.answer].classList.add('correct');
      }

      setTimeout(() => {
        currentQ++;
        renderQuestion();
      }, 1000);
    });
  }

  // Flashcards
  function renderCard() {
    document.getElementById('cardQuestion').textContent = questions[cardIdx].q;
    document.getElementById('cardAnswer').textContent = "Correct Answer: " + questions[cardIdx].options[questions[cardIdx].answer];
    document.getElementById('cardCounter').textContent = `${cardIdx + 1} / ${questions.length}`;
  }

  document.getElementById('nextCard').addEventListener('click', () => {
    if(cardIdx < questions.length - 1) { cardIdx++; renderCard(); }
  });
  document.getElementById('prevCard').addEventListener('click', () => {
    if(cardIdx > 0) { cardIdx--; renderCard(); }
  });

  const flashcard = document.getElementById('flashcard');
  flashcard.addEventListener('click', () => {
    const back = flashcard.querySelector('.card-back');
    back.style.display = back.style.display === 'none' ? 'block' : 'none';
  });

  // Theme
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
  });
});