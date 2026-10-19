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

  // Focus Timer
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

  // Tabs
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

  // Text-To-Speech
  function speakText(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.log("TTS Error:", e);
      }
    }
  }

  // Quiz Generator from Notes
  function generateQuizFromNotes(text) {
    const cleanText = (text || '').trim();
    if (cleanText.length < 5) {
      return [
        {
          q: "What is the primary focus of your study notes?",
          options: ["Core Fundamentals & Key Concepts", "Unrelated Detail", "Secondary Information", "General Overview"],
          answer: 0,
          explanation: "Notes highlight core fundamentals and key concepts."
        },
        {
          q: "Why is regular practice important in learning?",
          options: ["Enhances long-term memory & retention", "Wastes valuable time", "Creates confusion", "No impact"],
          answer: 0,
          explanation: "Regular practice strengthens neural connections and improves retention."
        }
      ];
    }

    let sentences = cleanText.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 5);
    if (sentences.length === 0) sentences = [cleanText];

    return sentences.map((sentence, idx) => {
      let options = [
        `Core concept from: ${sentence.slice(0, 35)}...`,
        `An unrelated distractor topic`,
        `Minor background reference`,
        `None of the above options`
      ];
      const correctIdx = idx % 4;
      const temp = options[0];
      options[0] = options[correctIdx];
      options[correctIdx] = temp;

      return {
        q: `Based on your notes: "${sentence.slice(0, 55)}..."`,
        options: options,
        answer: correctIdx,
        explanation: `Reference detail: "${sentence}"`
      };
    }).slice(0, 6);
  }

  // Flashcard Logic
  const flashcard = document.getElementById('flashcard');
  flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));

  function renderFlashcard() {
    if (!dynamicQuiz.length) dynamicQuiz = generateQuizFromNotes(notesField.value);
    const cardData = dynamicQuiz[currentCardIndex];
    document.getElementById('cardQuestion').textContent = cardData.q;
    document.getElementById('cardAnswer').textContent = cardData.explanation;
    document.getElementById('cardCounter').textContent = `${currentCardIndex + 1} / ${dynamicQuiz.length}`;
    flashcard.classList.remove('flipped');
  }

  document.getElementById('nextCard').addEventListener('click', () => {
    if (currentCardIndex < dynamicQuiz.length - 1) { currentCardIndex++; renderFlashcard(); }
  });
  document.getElementById('prevCard').addEventListener('click', () => {
    if (currentCardIndex > 0) { currentCardIndex--; renderFlashcard(); }
  });

  // Quiz Engine
  startBtn.addEventListener('click', startQuiz);
  document.getElementById('retryBtn').addEventListener('click', startQuiz);

  function startQuiz() {
    dynamicQuiz = generateQuizFromNotes(notesField.value);
    currentQIndex = 0;
    userScore = 0;
    analytics.style.display = 'none';
    flashcardContent.style.display = 'none';
    quizContent.style.display = 'block';
    renderQuestion();
  }

  function renderQuestion() {
    if (currentQIndex >= dynamicQuiz.length) {
      showAnalytics();
      return;
    }

    const q = dynamicQuiz[currentQIndex];
    quizContent.innerHTML = `
      <div style="margin-bottom:16px; overflow:hidden;">
        <span class="icon-chip">Question ${currentQIndex + 1} of ${dynamicQuiz.length}</span>
        <button class="speak-btn" id="speakQ" type="button">🔊 Listen</button>
        <h3 style="margin: 10px 0 0; font-family: var(--font-heading); font-size: 1.15rem; line-height: 1.4;">${q.q}</h3>
      </div>
      <div id="optionsList">
        ${q.options.map((opt, i) => `
          <button class="opt-btn" type="button" data-id="\${i}">
            <b>${String.fromCharCode(65 + i)}.</b>${opt}
          </button>
        `).join('')}
      </div>
    `;

    document.getElementById('speakQ').addEventListener('click', () => speakText(q.q));

    // Bulletproof Event Delegation for Options
    const optionsContainer = document.getElementById('optionsList');
    optionsContainer.addEventListener('click', function handleOptionClick(e) {
      const btn = e.target.closest('.opt-btn');
      if (!btn) return;

      // Remove listener to prevent double clicks
      optionsContainer.removeEventListener('click', handleOptionClick);

      const selected = parseInt(btn.getAttribute('data-id'), 10);
      const allButtons = optionsContainer.querySelectorAll('.opt-btn');

      allButtons.forEach(b => b.disabled = true);

      if (selected === q.answer) {
        btn.classList.add('correct');
        userScore++;
        speakText("Correct!");
      } else {
        btn.classList.add('wrong');
        if (allButtons[q.answer]) {
          allButtons[q.answer].classList.add('correct');
        }
        speakText("Incorrect!");
      }

      setTimeout(() => {
        currentQIndex++;
        renderQuestion();
      }, 1200);
    });
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

    document.getElementById('scoreMessage').textContent = pct >= 80 ? "🏆 Excellent! You've mastered this topic." : "📚 Good effort! Review flashcards to improve.";
  }

  genBtn.addEventListener('click', () => {
    if (!notesField.value.trim()) {
      alert("Please paste some notes first!");
      return;
    }
    startQuiz();
    alert("✨ Quiz & Flashcards generated successfully!");
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