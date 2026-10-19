// Foolproof Quiz Generator
  function generateQuizFromNotes(text) {
    const cleanText = (text || '').trim();
    
    // Agar notes khali bhi hon, tab bhi default questions load honge
    if (cleanText.length < 3) {
      return [
        {
          q: "What is the primary objective of MindPilot AI?",
          options: ["Smart interactive learning & quizzes", "Playing online video games", "Streaming movies", "Weather forecasting"],
          answer: 0,
          explanation: "MindPilot AI is designed to make studying interactive and fun through smart quizzes."
        },
        {
          q: "Why is active note-taking and revision effective?",
          options: ["Enhances long-term memory & concept retention", "Wastes time", "Creates confusion", "No impact"],
          answer: 0,
          explanation: "Active revision strengthens memory and deepens understanding."
        }
      ];
    }

    let sentences = cleanText.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 3);
    if (sentences.length === 0) sentences = [cleanText];

    return sentences.map((sentence) => {
      return {
        q: `Based on your notes: "${sentence.length > 50 ? sentence.slice(0, 50) + '...' : sentence}"`,
        options: [
          `Accurate key concept: ${sentence.length > 30 ? sentence.slice(0, 30) + '...' : sentence}`,
          `An unrelated distractor concept`,
          `Secondary background reference`,
          `None of the above options`
        ],
        answer: 0, // Option 0 hamesha correct rahega
        explanation: `Reference detail: "${sentence}"`
      };
    }).slice(0, 5);
  }