# Technical Specification (Spec): MindPilot AI

## 1. Architecture & Tech Stack
- **Frontend:** HTML5, CSS3 (with CSS Custom Properties / Variables for theming), Vanilla JavaScript (ES6+).
- **Persistence Layer:** Browser `localStorage` API for notes auto-saving and user theme preferences.
- **Deployment / Hosting:** Static hosting via GitHub Pages or local development server (`npx serve`).

## 2. Component Structure
- `index.html`: Semantic layout divided into a study notes input panel and an interactive stage/analytics dashboard container.
- `style.css`: Modern stylesheet utilizing CSS variables for dynamic root color switching (`data-theme="dark"`).
- `app.js`: State manager handling quiz progression, event listeners, local storage integration, and score calculation logic.

## 3. Data Flow
1. User enters notes -> Event listener triggers `localStorage.setItem`.
2. User clicks "Start Quiz" -> State initializes `currentQIndex = 0` and `userScore = 0`.
3. Question options clicked -> Answer evaluated against dataset index -> Score incremented -> Delayed transition to next question or Analytics View.
4. Analytics View calculates percentage: `(userScore / totalQuestions) * 100` and renders visual breakdown.