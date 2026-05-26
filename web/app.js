const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreNode = document.getElementById("score");
const bestScoreNode = document.getElementById("best-score");
const levelNode = document.getElementById("level");
const speedNode = document.getElementById("speed");
const statusNode = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const difficultySelect = document.getElementById("difficulty");
const snakeThemeSelect = document.getElementById("snake-theme");
const topScoresNode = document.getElementById("top-scores");
const mobileControlButtons = document.querySelectorAll("[data-direction]");

const gridSize = 24;
const tileCount = canvas.width / gridSize;
const storageKey = "snake_best_score";
const topScoresStorageKey = "snake_top_scores";
const snakeThemeStorageKey = "snake_theme";
const foodsPerLevel = 4;
const bonusEveryFoods = 5;
const bonusLifetimeMs = 7000;
const speedByDifficulty = {
  easy: 165,
  normal: 120,
  hard: 88,
};
const snakePalettes = {
  neon: {
    headStart: "#a7f3d0",
    headEnd: "#22d3ee",
    bodyRgb: "52, 211, 153",
    tailRgb: "14, 165, 233",
    glow: "rgba(34, 211, 238, 0.65)",
    eye: "#03111a",
  },
  emerald: {
    headStart: "#bbf7d0",
    headEnd: "#22c55e",
    bodyRgb: "34, 197, 94",
    tailRgb: "20, 184, 166",
    glow: "rgba(34, 197, 94, 0.68)",
    eye: "#052e16",
  },
  cyber: {
    headStart: "#fbcfe8",
    headEnd: "#e879f9",
    bodyRgb: "236, 72, 153",
    tailRgb: "168, 85, 247",
    glow: "rgba(232, 121, 249, 0.7)",
    eye: "#2e0038",
  },
  arctic: {
    headStart: "#e0f2fe",
    headEnd: "#38bdf8",
    bodyRgb: "125, 211, 252",
    tailRgb: "129, 140, 248",
    glow: "rgba(125, 211, 252, 0.72)",
    eye: "#082f49",
  },
  gold: {
    headStart: "#fef3c7",
    headEnd: "#f59e0b",
    bodyRgb: "251, 191, 36",
    tailRgb: "249, 115, 22",
    glow: "rgba(251, 191, 36, 0.72)",
    eye: "#451a03",
  },
};

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 15, y: 10 };
let bonusFood = null;
let bonusExpiresAt = 0;
let score = 0;
let level = 1;
let foodEaten = 0;
let bestScore = Number(localStorage.getItem(storageKey) || 0);
let topScores = loadTopScores();
let gameLoopId = null;
let isRunning = false;
let isPaused = false;
let touchStartX = 0;
let touchStartY = 0;
let particles = [];

const savedSnakeTheme = localStorage.getItem(snakeThemeStorageKey);
if (savedSnakeTheme && snakePalettes[savedSnakeTheme]) {
  snakeThemeSelect.value = savedSnakeTheme;
}

renderTopScores();
updateHud();

function getTickMs() {
  const baseSpeed = speedByDifficulty[difficultySelect.value] || speedByDifficulty.normal;
  return Math.max(52, baseSpeed - (level - 1) * 8);
}

function getDifficultyName() {
  return difficultySelect.options[difficultySelect.selectedIndex].text;
}

function getSnakePalette() {
  return snakePalettes[snakeThemeSelect.value] || snakePalettes.neon;
}

function updateHud() {
  scoreNode.textContent = String(score);
  bestScoreNode.textContent = String(bestScore);
  levelNode.textContent = String(level);
  speedNode.textContent = `${getTickMs()}ms`;
}

function randomCell() {
  return Math.floor(Math.random() * tileCount);
}

function isSameCell(a, b) {
  return Boolean(a && b && a.x === b.x && a.y === b.y);
}

function isOccupied(cell, extraCells = []) {
  return (
    snake.some((segment) => isSameCell(segment, cell)) ||
    isSameCell(food, cell) ||
    extraCells.some((extraCell) => isSameCell(extraCell, cell))
  );
}

function createFreeCell(extraCells = []) {
  for (let attempt = 0; attempt < tileCount * tileCount * 2; attempt += 1) {
    const candidate = { x: randomCell(), y: randomCell() };
    if (!isOccupied(candidate, extraCells)) return candidate;
  }

  for (let y = 0; y < tileCount; y += 1) {
    for (let x = 0; x < tileCount; x += 1) {
      const candidate = { x, y };
      if (!isOccupied(candidate, extraCells)) return candidate;
    }
  }

  return null;
}

function spawnFood() {
  const newFood = createFreeCell(bonusFood ? [bonusFood] : []);
  if (!newFood) {
    gameOver("Вы заполнили все поле. Идеальная партия!");
    return;
  }
  food = newFood;
}

function spawnBonusFood() {
  const newBonus = createFreeCell([food]);
  if (!newBonus) return;

  bonusFood = newBonus;
  bonusExpiresAt = Date.now() + bonusLifetimeMs;
  statusNode.textContent = "На поле появился золотой бонус. Успейте забрать!";
}

function updateLevel() {
  const nextLevel = Math.floor(foodEaten / foodsPerLevel) + 1;
  if (nextLevel === level) return false;

  level = nextLevel;
  updateHud();
  return true;
}

function restartLoop() {
  if (!isRunning || isPaused) return;

  stopLoop();
  gameLoopId = setInterval(update, getTickMs());
}

function roundedRect(x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function drawRoundedCell(x, y, fillStyle, glowColor, inset = 3) {
  const px = x * gridSize + inset;
  const py = y * gridSize + inset;
  const size = gridSize - inset * 2;

  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 14;
  ctx.fillStyle = fillStyle;
  roundedRect(px, py, size, size, 7);
  ctx.fill();
  ctx.restore();
}

function drawBoardBackground() {
  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, "#06111f");
  background.addColorStop(0.5, "#071827");
  background.addColorStop(1, "#111022");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
  ctx.lineWidth = 1;
  for (let position = gridSize; position < canvas.width; position += gridSize) {
    ctx.beginPath();
    ctx.moveTo(position + 0.5, 0);
    ctx.lineTo(position + 0.5, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, position + 0.5);
    ctx.lineTo(canvas.width, position + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFood(cell, isBonus = false) {
  if (!cell) return;

  const centerX = cell.x * gridSize + gridSize / 2;
  const centerY = cell.y * gridSize + gridSize / 2;
  const radius = isBonus ? 10 : 8;
  const gradient = ctx.createRadialGradient(centerX - 3, centerY - 4, 2, centerX, centerY, radius + 6);

  if (isBonus) {
    gradient.addColorStop(0, "#fff7ad");
    gradient.addColorStop(0.45, "#fbbf24");
    gradient.addColorStop(1, "#f97316");
  } else {
    gradient.addColorStop(0, "#fecdd3");
    gradient.addColorStop(0.48, "#fb7185");
    gradient.addColorStop(1, "#be123c");
  }

  ctx.save();
  ctx.shadowColor = isBonus ? "rgba(251, 191, 36, 0.9)" : "rgba(244, 63, 94, 0.85)";
  ctx.shadowBlur = isBonus ? 22 : 16;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  if (isBonus) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 14);
    ctx.lineTo(centerX, centerY + 14);
    ctx.moveTo(centerX - 14, centerY);
    ctx.lineTo(centerX + 14, centerY);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSnake() {
  const palette = getSnakePalette();

  snake.forEach((segment, index) => {
    const intensity = Math.max(0.35, 1 - index / Math.max(snake.length, 1));
    const bodyGradient = ctx.createLinearGradient(
      segment.x * gridSize,
      segment.y * gridSize,
      segment.x * gridSize + gridSize,
      segment.y * gridSize + gridSize,
    );
    bodyGradient.addColorStop(0, index === 0 ? palette.headStart : `rgba(${palette.bodyRgb}, ${intensity})`);
    bodyGradient.addColorStop(1, index === 0 ? palette.headEnd : `rgba(${palette.tailRgb}, ${intensity})`);

    drawRoundedCell(segment.x, segment.y, bodyGradient, palette.glow, index === 0 ? 2 : 4);
  });

  drawSnakeEyes(palette.eye);
}

function drawSnakeEyes(eyeColor) {
  const head = snake[0];
  if (!head) return;

  const centerX = head.x * gridSize + gridSize / 2;
  const centerY = head.y * gridSize + gridSize / 2;
  const sideOffset = 5;
  const frontOffset = 5;
  const eyePositions =
    direction.x !== 0
      ? [
          { x: centerX + direction.x * frontOffset, y: centerY - sideOffset },
          { x: centerX + direction.x * frontOffset, y: centerY + sideOffset },
        ]
      : [
          { x: centerX - sideOffset, y: centerY + direction.y * frontOffset },
          { x: centerX + sideOffset, y: centerY + direction.y * frontOffset },
        ];

  ctx.save();
  ctx.fillStyle = eyeColor;
  eyePositions.forEach((eye) => {
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function createBurst(cell, color) {
  const centerX = cell.x * gridSize + gridSize / 2;
  const centerY = cell.y * gridSize + gridSize / 2;

  for (let index = 0; index < 14; index += 1) {
    const angle = (Math.PI * 2 * index) / 14;
    const speed = 1.2 + Math.random() * 1.8;
    particles.push({
      x: centerX,
      y: centerY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 2,
      life: 18,
      maxLife: 18,
      color,
    });
  }
}

function drawParticles() {
  particles = particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.dx,
      y: particle.y + particle.dy,
      dy: particle.dy + 0.03,
      life: particle.life - 1,
    }))
    .filter((particle) => particle.life > 0);

  particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = particle.life / particle.maxLife;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function draw() {
  drawBoardBackground();
  drawFood(food);
  drawFood(bonusFood, true);
  drawSnake();
  drawParticles();
}

function update() {
  if (bonusFood && Date.now() > bonusExpiresAt) {
    bonusFood = null;
  }

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount) {
    gameOver();
    return;
  }

  const eatsFood = isSameCell(head, food);
  const eatsBonus = isSameCell(head, bonusFood);
  const bodyToCheck = eatsFood || eatsBonus ? snake : snake.slice(0, -1);

  if (bodyToCheck.some((segment) => isSameCell(segment, head))) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (eatsFood || eatsBonus) {
    if (eatsFood) {
      score += 10 * level;
      foodEaten += 1;
      createBurst(food, "#fb7185");
      spawnFood();
    }

    if (eatsBonus) {
      score += 35 * level;
      createBurst(bonusFood, "#fbbf24");
      bonusFood = null;
    }

    const leveledUp = updateLevel();
    updateHud();

    if (foodEaten > 0 && foodEaten % bonusEveryFoods === 0 && !bonusFood) {
      spawnBonusFood();
    } else if (leveledUp) {
      statusNode.textContent = `Уровень ${level}. Скорость выросла до ${getTickMs()}ms.`;
    }

    if (leveledUp) restartLoop();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver(message) {
  stopLoop();
  isRunning = false;
  isPaused = false;
  statusNode.textContent = message || `Игра окончена. Ваш счет: ${score}. Нажмите "Рестарт".`;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(storageKey, String(bestScore));
  }

  topScores.push(score);
  topScores = topScores
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b - a)
    .slice(0, 5);
  localStorage.setItem(topScoresStorageKey, JSON.stringify(topScores));
  updateHud();
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
  statusNode.textContent = `Игра идет: ${getDifficultyName()}, уровень ${level}.`;
  restartLoop();
}

function pauseGame() {
  if (!isRunning) return;
  if (isPaused) {
    isPaused = false;
    statusNode.textContent = `Игра идет: ${getDifficultyName()}, уровень ${level}.`;
    restartLoop();
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
  food = { x: 15, y: 10 };
  bonusFood = null;
  bonusExpiresAt = 0;
  particles = [];
  score = 0;
  level = 1;
  foodEaten = 0;
  spawnFood();
  updateHud();
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

  topScores.forEach((value, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${value}`;
    topScoresNode.appendChild(li);
  });
}

function setDirection(key) {
  if (key === "ArrowUp" || key === "w") {
    if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
    return true;
  }
  if (key === "ArrowDown" || key === "s") {
    if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
    return true;
  }
  if (key === "ArrowLeft" || key === "a") {
    if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
    return true;
  }
  if (key === "ArrowRight" || key === "d") {
    if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
    return true;
  }
  return false;
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (setDirection(key)) event.preventDefault();
});

mobileControlButtons.forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    setDirection(button.dataset.direction);
    button.blur();
  });
});

difficultySelect.addEventListener("change", () => {
  updateHud();
  if (isRunning && !isPaused) {
    restartLoop();
    statusNode.textContent = `Сложность изменена: ${getDifficultyName()}.`;
  }
});

snakeThemeSelect.addEventListener("change", () => {
  localStorage.setItem(snakeThemeStorageKey, snakeThemeSelect.value);
  draw();
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
