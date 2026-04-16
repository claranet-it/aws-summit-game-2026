const STORAGE_KEY = 'dino-gb-highscores-v4';
const MAX_ENTRIES = 5;

export function getHighScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function isHighScore(score) {
  const scores = getHighScores();
  if (scores.length < MAX_ENTRIES) return true;
  return score > scores[scores.length - 1].score;
}

export function saveHighScore(email, score, config = null) {
  const scores = getHighScores();
  scores.push({ name: email.toLowerCase(), score, config });
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > MAX_ENTRIES) {
    scores.length = MAX_ENTRIES;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  return scores;
}
