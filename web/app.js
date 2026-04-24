const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreNode = document.getElementById("score");
const bestScoreNode = document.getElementById("best-score");
const statusNode = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const difficultySelect = document.getElementById("difficulty");
const topScoresNode = document.getElementById("top-scores");

const gridSize = 24;
const tileCount = canvas.width / gridSize;
const storageKey = "snake_best_score";
const topScoresStorageKey = "snake_top_scores";
const speedByDifficulty = {
  easy: 170,
  normal: 120,
  hard: 85,
};

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 15, y: 10 };
let score = 0;
let bestScore = Number(localStorage.getItem(storageKey) || 0);
let topScores = loadTopScores();
let gameLoopId = null;
let isRunning = false;
let isPaused = false;
let touchStartX = 0;
let touchStartY = 0;

bestScoreNode.textContent = String(bestScore);
renderTopScores();

function getTickMs() {
  return speedByDifficulty[difficultySelect.value] || speedByDifficulty.normal;
}

function randomCell() {
  return Math.floor(Math.random() * tileCount);
}

function spawnFood() {
  let valid = false;
  while (!valid) {
    const newFood = { x: randomCell(), y: randomCell() };
    valid = !snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    if (valid) food = newFood;
  }
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * gridSize, y * gridSize, gridSize - 2, gridSize - 2);
}

function draw() {
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCell(food.x, food.y, "#ef4444");
  snake.forEach((segment, index) => {
    drawCell(segment.x, segment.y, index === 0 ? "#22c55e" : "#16a34a");
  });
}

function update() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
    gameOver();
    return;
  }

  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreNode.textContent = String(score);
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  stopLoop();
  isRunning = false;
  isPaused = false;
  statusNode.textContent = `Игра окончена. Ваш счет: ${score}. Нажмите "Рестарт".`;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(storageKey, String(bestScore));
    bestScoreNode.textContent = String(bestScore);
  }

  topScores.push(score);
  topScores = topScores
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b - a)
    .slice(0, 5);
  localStorage.setItem(topScoresStorageKey, JSON.stringify(topScores));
  renderTopScores();
}

function stopLoop() {
  if (gameLoopId) {
    clearInterval(gameLoopId);
    gameLoopId = null;
  }
}

function startGame() {
  if (isRunning && !isPaused) return;
  if (!isRunning) resetGame();

  isRunning = true;
  isPaused = false;
  statusNode.textContent = `Игра идет... (${difficultySelect.options[difficultySelect.selectedIndex].text})`;
  stopLoop();
  gameLoopId = setInterval(update, getTickMs());
}

function pauseGame() {
  if (!isRunning) return;
  if (isPaused) {
    isPaused = false;
    statusNode.textContent = "Игра идет...";
    gameLoopId = setInterval(update, getTickMs());
    return;
  }
  isPaused = true;
  statusNode.textContent = "Пауза";
  stopLoop();
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreNode.textContent = "0";
  spawnFood();
  draw();
}

function loadTopScores() {
  try {
    const raw = localStorage.getItem(topScoresStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value) => Number.isFinite(value) && value > 0).slice(0, 5);
  } catch (_) {
    return [];
  }
}

function renderTopScores() {
  topScoresNode.innerHTML = "";
  if (topScores.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Пока нет результатов";
    topScoresNode.appendChild(li);
    return;
  }
  topScores.forEach((value) => {
    const li = document.createElement("li");
    li.textContent = String(value);
    topScoresNode.appendChild(li);
  });
}

function setDirection(key) {
  if (key === "ArrowUp" || key === "w") {
    if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
  } else if (key === "ArrowDown" || key === "s") {
    if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
  } else if (key === "ArrowLeft" || key === "a") {
    if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
  } else if (key === "ArrowRight" || key === "d") {
    if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
  }
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  setDirection(key);
});

difficultySelect.addEventListener("change", () => {
  if (isRunning && !isPaused) {
    stopLoop();
    gameLoopId = setInterval(update, getTickMs());
    statusNode.textContent = `Сложность изменена: ${difficultySelect.options[difficultySelect.selectedIndex].text}`;
  }
});

canvas.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", (event) => {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    setDirection(dx > 0 ? "ArrowRight" : "ArrowLeft");
  } else {
    setDirection(dy > 0 ? "ArrowDown" : "ArrowUp");
  }
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

resetGame();
