document.addEventListener('DOMContentLoaded', () => {
  const notesField = document.getElementById('notesField');
  const genBtn = document.getElementById('genBtn');
  const clearBtn = document.getElementById('clearBtn');
  const startBtn = document.getElementById('startBtn');
  const themeToggle = document.getElementById('themeToggle');
  const quizContent = document.getElementById('quizContent');
  const flashcardContent = document.getElementById('flashcardContent');
  const analytics = document.getElementById('analytics');
  const tabQuiz = document.getElementById('tabQuiz');
  const tabCards = document.getElementById('tabCards');

  let dynamicQuiz = [];
  let currentQIndex = 0;
  let userScore = 0;
  let currentCardIndex = 0;

  // 1. Focus Timer
  let timerTime = 25 * 60;
  let timerInterval = null;
  const timerDisplay = document.getElementById('timerDisplay');
  const timerBtn = document.getElementById('timerBtn');

  timerBtn.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerBtn.textContent = '▶️';
    } else {
      timerBtn.textContent = '⏸️';
      timerInterval = setInterval(() => {
        timerTime--;
        const mins = Math.floor(timerTime / 60).toString().padStart(2, '0');
        const secs = (timerTime % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
        if (timerTime <= 0) {
          clearInterval(timerInterval);
          alert("🎉 Focus session completed!");
        }
      }, 1000);
    }
  });

  // 2. Mode Switching
  tabQuiz.addEventListener('click', () => {
    tabQuiz.classList.add('active');
    tabCards.classList.remove('active');
    flashcardContent.style.display = 'none';
    if (analytics.style.display !== 'block') quizContent.style.display = 'block';
  });

  tabCards.addEventListener('click', () => {
    tabCards.classList.add('active');
    tabQuiz.classList.remove('active');
    quizContent.style.display = 'none';
    analytics.style.display = 'none';
    flashcardContent.style.display = 'block';
    renderFlashcard();
  });

  // 3. Audio Text-To-Speech
  function speakText(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.log("Speech error:", e);
      }
    }
  }

  // 4. Dynamic Generator with Randomized Correct Answers
  function generateQuizFromNotes(text) {
    const cleanText = (text || '').trim();
    if (!cleanText || cleanText.length < 5) {
      return [
        {
          q: "What is the main takeaway from your study notes?",
          options: ["Core Fundamentals & Key Concepts", "Unrelated Detail", "Secondary Information", "General Overview"],
          answer: 0,
          explanation: "Notes highlight core fundamentals and key concepts."
        }
      ];
    }

    let sentences = cleanText.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 6);
    if (sentences.length === 0) sentences = [cleanText];

    return sentences.map((sentence, idx) => {
      const words = sentence.split(' ');
      const keyWord = words.find(w => w.length > 4) || words[0] || 'Topic';

      let options = [
        `Focuses heavily on ${keyWord}`,
        `An unrelated minor detail`,
        `Secondary background context`,
        `None of the above points`
      ];

      // Randomize correct answer position (0 to 3)
      const correctIndex = idx % 4;
      const temp = options[0];
      options[0] = options[correctIndex];
      options[correctIndex] = temp;

      return {
        q: `Based on your notes: "${sentence.slice(0, 60)}${sentence.length > 60 ? '...' : ''}", what is the key point?`,
        options: options,
        answer: correctIndex,
        explanation: `Full detail: "${sentence}"`
      };
    }).slice(0, 6);
  }

  // Flashcards Logic
  const flashcard = document.getElementById('flashcard');
  flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });

  function renderFlashcard() {
    if (!dynamicQuiz.length) dynamicQuiz = generateQuizFromNotes(notesField.value);
    const cardData = dynamicQuiz[currentCardIndex];
    document.getElementById('cardQuestion').textContent = cardData.q;
    document.getElementById('cardAnswer').textContent = cardData.explanation;
    document.getElementById('cardCounter').textContent = `${currentCardIndex + 1} / ${dynamicQuiz.length}`;
    flashcard.classList.remove('flipped');
  }

  document.getElementById('nextCard').addEventListener('click', () => {
    if (currentCardIndex < dynamicQuiz.length - 1) {
      currentCardIndex++;
      renderFlashcard();
    }
  });

  document.getElementById('prevCard').addEventListener('click', () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      renderFlashcard();
    }
  });

  // Quiz Execution Logic
  startBtn.addEventListener('click', prepareAndStartQuiz);
  document.getElementById('retryBtn').addEventListener('click', prepareAndStartQuiz);

  function prepareAndStartQuiz() {
    const notes = notesField.value.trim();
    dynamicQuiz = generateQuizFromNotes(notes);
    currentQIndex = 0;
    userScore = 0;
    analytics.style.display = 'none';
    flashcardContent.style.display = 'none';
    quizContent.style.display = 'block';
    showQuestion();
  }

  function showQuestion() {
    if (currentQIndex >= dynamicQuiz.length) {
      showAnalytics();
      return;
    }

    const qData = dynamicQuiz[currentQIndex];
    quizContent.innerHTML = `
      <div style="margin-bottom:16px;">
        <span class="icon-chip">Question ${currentQIndex + 1} of ${dynamicQuiz.length}</span>
        <button class="speak-btn" id="listenQBtn" type="button">🔊 Listen</button>
        <h3 style="margin: 10px 0 0; font-family: var(--font-heading); font-size: 1.15rem; line-height: 1.4;">${qData.q}</h3>
      </div>
      <div id="optionsContainer">
        ${qData.options.map((opt, i) => `
          <button class="opt-btn" type="button" data-index="\${i}">
            <span><b>${String.fromCharCode(65 + i)}.</b>${opt}</span>
          </button>
        `).join('')}
      </div>
    `;

    const listenBtn = document.getElementById('listenQBtn');
    if (listenBtn) {
      listenBtn.addEventListener('click', () => speakText(qData.q));
    }

    const optButtons = quizContent.querySelectorAll('.opt-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnClicked = e.currentTarget;
        const selected = parseInt(btnClicked.getAttribute('data-index'), 10);
        checkAnswer(selected, qData.answer, optButtons);
      });
    });
  }

  function checkAnswer(selected, correct, buttons) {
    buttons.forEach(b => b.disabled = true);
    if (selected === correct) {
      buttons[selected].classList.add('correct');
      userScore++;
      speakText("Correct!");
    } else {
      buttons[selected].classList.add('wrong');
      if (buttons[correct]) {
        buttons[correct].classList.add('correct');
      }
      speakText("Incorrect!");
    }

    setTimeout(() => {
      currentQIndex++;
      showQuestion();
    }, 1200);
  }

  function showAnalytics() {
    quizContent.style.display = 'none';
    analytics.style.display = 'block';

    const pct = Math.round((userScore / dynamicQuiz.length) * 100);
    document.getElementById('scorePct').textContent = `${pct}%`;
    document.getElementById('totalQs').textContent = dynamicQuiz.length;
    document.getElementById('correctAnswers').textContent = userScore;

    const scoreRing = document.querySelector('.score-ring');
    if (scoreRing) {
      scoreRing.style.background = `conic-gradient(var(--primary) ${pct}%, var(--line) ${pct}%)`;
    }

    document.getElementById('scoreMessage').textContent = pct >= 80 ? "🏆 Mastered! Excellent understanding." : "📚 Good try! Review flashcards to ace it.";
  }

  genBtn.addEventListener('click', () => {
    const notes = notesField.value.trim();
    if (!notes) { alert("Please paste some notes first!"); return; }
    dynamicQuiz = generateQuizFromNotes(notes);
    currentCardIndex = 0;
    alert("✨ Quiz & Flashcards generated successfully!");
    prepareAndStartQuiz();
  });

  // Local Storage & Theme
  notesField.value = localStorage.getItem('mindpilot_notes') || '';
  notesField.addEventListener('input', () => localStorage.setItem('mindpilot_notes', notesField.value));
  clearBtn.addEventListener('click', () => { notesField.value = ''; localStorage.removeItem('mindpilot_notes'); });

  if (localStorage.getItem('mindpilot_theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️ Light Mode';
  }
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
    localStorage.setItem('mindpilot_theme', isDark ? 'light' : 'dark');
  });
});