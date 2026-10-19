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
      q: "What is MindPilot AI primarily designed for?",
      options: ["Smart interactive learning & quizzes", "Video game streaming", "Weather forecasting", "Photo editing"],
      answer: 0
    },
    {
      q: "Why is active recall and testing beneficial?",
      options: ["Enhances long-term memory & retention", "Wastes time", "Causes confusion", "No impact"],
      answer: 0
    },
    {
      q: "What format does MindPilot AI use for study flashcards?",
      options: ["Interactive 3D flipped flashcards", "Static text lists", "Audio-only tapes", "Spreadsheets"],
      answer: 0
    }
  ];

  let currentQ = 0;
  let score = 0;
  let cardIdx = 0;

  // Tabs Switching
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

  // Dynamic Generator from Notes
  function buildQuestionsFromNotes() {
    const text = notesField.value.trim();
    if (text.length > 5) {
      let sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 5);
      if (sentences.length > 0) {
        questions = sentences.map((sentence, idx) => ({
          q: `Based on your notes: "${sentence.slice(0, 50)}..."`,
          options: [
            `Core concept: ${sentence.slice(0, 30)}...`,
            `Unrelated distractor point`,
            `Secondary background info`,
            `None of the above`
          ],
          answer: 0
        }));
      }
    }
  }

  genBtn.addEventListener('click', () => {
    buildQuestionsFromNotes();
    startQuizSession();
    alert("✨ Quiz & Flashcards generated successfully from your notes!");
  });

  startBtn.addEventListener('click', startQuizSession);
  retryBtn.addEventListener('click', startQuizSession);

  function startQuizSession() {
    buildQuestionsFromNotes();
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
      <div style="margin-bottom: 12px; font-weight: bold; color: var(--muted); font-size: 0.85rem;">QUESTION ${currentQ + 1} OF ${questions.length}</div>
      <p style="font-size: 1.05rem; font-weight: bold; margin-bottom: 15px; line-height: 1.4;">${qData.q}</p>
      <div id="opts">
        ${qData.options.map((opt, i) => `<button class="opt-btn" data-idx="\${i}"><b>${String.fromCharCode(65 + i)}.</b>${opt}</button>`).join('')}
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
      }, 1100);
    });
  }

  // Flashcards Logic
  function renderCard() {
    buildQuestionsFromNotes();
    if(cardIdx >= questions.length) cardIdx = 0;
    document.getElementById('cardQuestion').textContent = questions[cardIdx].q;
    document.getElementById('cardAnswer').textContent = questions[cardIdx].options[questions[cardIdx].answer];
    document.getElementById('cardCounter').textContent = `${cardIdx + 1} / ${questions.length}`;
    
    // Reset view
    document.querySelector('.card-front').style.display = 'flex';
    document.querySelector('.card-back').style.display = 'none';
  }

  document.getElementById('nextCard').addEventListener('click', () => {
    if(cardIdx < questions.length - 1) { cardIdx++; renderCard(); }
  });
  document.getElementById('prevCard').addEventListener('click', () => {
    if(cardIdx > 0) { cardIdx--; renderCard(); }
  });

  const flashcard = document.getElementById('flashcard');
  flashcard.addEventListener('click', () => {
    const front = flashcard.querySelector('.card-front');
    const back = flashcard.querySelector('.card-back');
    if(front.style.display !== 'none') {
      front.style.display = 'none';
      back.style.display = 'block';
    } else {
      front.style.display = 'block';
      back.style.display = 'none';
    }
  });

  // Dark Mode Toggle
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
  });
});