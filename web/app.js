const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreNode = document.getElementById("score");
const bestScoreNode = document.getElementById("best-score");
const levelNode = document.getElementById("level");
const speedNode = document.getElementById("speed");
const levelProgressNode = document.getElementById("level-progress");
const statusNode = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const soundBtn = document.getElementById("sound-btn");
const resetStatsBtn = document.getElementById("reset-stats-btn");
const snakeThemeSelect = document.getElementById("snake-theme");
const topScoresNode = document.getElementById("top-scores");
const screenControlButtons = document.querySelectorAll("[data-direction]");
const recordModal = document.getElementById("record-modal");
const recordForm = document.getElementById("record-form");
const recordScoreNode = document.getElementById("record-score");
const playerNameInput = document.getElementById("player-name");
const victoryModal = document.getElementById("victory-modal");
const victoryScoreNode = document.getElementById("victory-score");
const victoryRestartBtn = document.getElementById("victory-restart-btn");

const gridSize = 24;
const tileCount = canvas.width / gridSize;
const storageKey = "snake_best_score";
const topScoresStorageKey = "snake_top_scores";
const snakeThemeStorageKey = "snake_theme";
const soundStorageKey = "snake_sound_enabled";
const playerNameStorageKey = "snake_player_name";
const resetStatsPassword = "2026";
const maxLevel = 10;
const pointsPerLevel = 100;
const bonusEveryFoods = 5;
const bonusLifetimeMs = 7000;
const levelSpeeds = [320, 280, 245, 215, 185, 160, 135, 112, 92, 74];
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
const noteFrequencies = {
  G3: 196,
  A3: 220,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};
const odeToJoyMelody = [
  ["E4", 1],
  ["E4", 1],
  ["F4", 1],
  ["G4", 1],
  ["G4", 1],
  ["F4", 1],
  ["E4", 1],
  ["D4", 1],
  ["C4", 1],
  ["C4", 1],
  ["D4", 1],
  ["E4", 1],
  ["E4", 1.5],
  ["D4", 0.5],
  ["D4", 2],
  ["E4", 1],
  ["E4", 1],
  ["F4", 1],
  ["G4", 1],
  ["G4", 1],
  ["F4", 1],
  ["E4", 1],
  ["D4", 1],
  ["C4", 1],
  ["C4", 1],
  ["D4", 1],
  ["E4", 1],
  ["D4", 1.5],
  ["C4", 0.5],
  ["C4", 2],
  ["D4", 1],
  ["D4", 1],
  ["E4", 1],
  ["C4", 1],
  ["D4", 1],
  ["E4", 0.5],
  ["F4", 0.5],
  ["E4", 1],
  ["C4", 1],
  ["D4", 1],
  ["E4", 0.5],
  ["F4", 0.5],
  ["E4", 1],
  ["D4", 1],
  ["C4", 1],
  ["D4", 1],
  ["G3", 2],
  ["E4", 1],
  ["E4", 1],
  ["F4", 1],
  ["G4", 1],
  ["G4", 1],
  ["F4", 1],
  ["E4", 1],
  ["D4", 1],
  ["C4", 1],
  ["C4", 1],
  ["D4", 1],
  ["E4", 1],
  ["D4", 1.5],
  ["C4", 0.5],
  ["C4", 2],
  ["G4", 1],
  ["G4", 1],
  ["A4", 1],
  ["B4", 1],
  ["C5", 1],
  ["B4", 1],
  ["A4", 1],
  ["G4", 1],
  ["F4", 1],
  ["E4", 1],
  ["D4", 1],
  ["C4", 1],
  ["D4", 2],
  ["E4", 2],
  ["E4", 1],
  ["E4", 1],
  ["F4", 1],
  ["G4", 1],
  ["G4", 1],
  ["F4", 1],
  ["E4", 1],
  ["D4", 1],
  ["C4", 1],
  ["C4", 1],
  ["D4", 1],
  ["E4", 1],
  ["E4", 1.5],
  ["D4", 0.5],
  ["D4", 2],
  ["E4", 1],
  ["E4", 1],
  ["F4", 1],
  ["G4", 1],
  ["G4", 1],
  ["F4", 1],
  ["E4", 1],
  ["D4", 1],
  ["C4", 1],
  ["C4", 1],
  ["D4", 1],
  ["E4", 1],
  ["D4", 1.5],
  ["C4", 0.5],
  ["C4", 2],
];
const musicBeatMs = 360;
const holdBoostDelayMs = 2000;
const holdBoostMultiplier = 0.55;

let snake = [{ x: 10, y: 10 }];
let previousSnake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 15, y: 10 };
let bonusFood = null;
let bonusExpiresAt = 0;
let score = 0;
let level = 1;
let levelScore = 0;
let foodEaten = 0;
let bestScore = Number(localStorage.getItem(storageKey) || 0);
let topScores = loadTopScores();
let gameLoopId = null;
let renderLoopId = null;
let lastStepAt = performance.now();
let isRunning = false;
let isPaused = false;
let touchStartX = 0;
let touchStartY = 0;
let particles = [];
let lastScreenControlPressAt = 0;
let audioContext = null;
let musicTimerId = null;
let musicNoteIndex = 0;
let isSoundEnabled = localStorage.getItem(soundStorageKey) !== "false";
let lastMoveSoundAt = 0;
let pendingRecordScore = null;
let isVictory = false;
let heldDirectionKey = null;
let holdBoostTimerId = null;
let isHoldBoostActive = false;

const savedSnakeTheme = localStorage.getItem(snakeThemeStorageKey);
if (savedSnakeTheme && snakePalettes[savedSnakeTheme]) {
  snakeThemeSelect.value = savedSnakeTheme;
}

renderTopScores();
updateHud();
updateSoundButton();

function getTickMs() {
  const baseSpeed = levelSpeeds[Math.min(level - 1, levelSpeeds.length - 1)] || levelSpeeds[0];
  if (!isHoldBoostActive) return baseSpeed;

  return Math.max(40, Math.round(baseSpeed * holdBoostMultiplier));
}

function getSnakePalette() {
  return snakePalettes[snakeThemeSelect.value] || snakePalettes.neon;
}

function updateHud() {
  scoreNode.textContent = String(score);
  bestScoreNode.textContent = String(bestScore);
  levelNode.textContent = String(level);
  speedNode.textContent = `${getTickMs()}ms${isHoldBoostActive ? " x2" : ""}`;
  levelProgressNode.textContent = `${Math.min(levelScore, pointsPerLevel)}/${pointsPerLevel}`;
}

function randomCell() {
  return Math.floor(Math.random() * tileCount);
}

function isSameCell(a, b) {
  return Boolean(a && b && a.x === b.x && a.y === b.y);
}

function cloneSnake() {
  return snake.map((segment) => ({ ...segment }));
}

function wrapCell(cell) {
  return {
    x: (cell.x + tileCount) % tileCount,
    y: (cell.y + tileCount) % tileCount,
  };
}

function wrapCoordinate(value) {
  return (value + tileCount) % tileCount;
}

function getInterpolatedCell(fromCell, toCell, progress) {
  if (!fromCell) return toCell;

  let dx = toCell.x - fromCell.x;
  let dy = toCell.y - fromCell.y;

  if (dx > tileCount / 2) dx -= tileCount;
  if (dx < -tileCount / 2) dx += tileCount;
  if (dy > tileCount / 2) dy -= tileCount;
  if (dy < -tileCount / 2) dy += tileCount;

  return {
    x: wrapCoordinate(fromCell.x + dx * progress),
    y: wrapCoordinate(fromCell.y + dy * progress),
  };
}

function getAnimationProgress() {
  if (!isRunning || isPaused) return 1;
  return Math.min(1, (performance.now() - lastStepAt) / getTickMs());
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
    gameOver({ message: "Вы заполнили все поле. Идеальная партия!" });
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

function addScore(points) {
  score += points;
  levelScore += points;
}

function updateLevelProgress() {
  if (levelScore < pointsPerLevel) return false;

  if (level >= maxLevel) {
    levelScore = pointsPerLevel;
    updateHud();
    showVictory();
    return true;
  }

  level += 1;
  levelScore = 0;
  statusNode.textContent = `Набрано ${pointsPerLevel} очков! Переход на уровень ${level}.`;
  updateHud();
  restartLoop();
  return true;
}

function restartLoop() {
  if (!isRunning || isPaused) return;

  stopLoop();
  lastStepAt = performance.now();
  gameLoopId = setInterval(update, getTickMs());
  startRenderLoop();
}

function clearHoldBoost(message) {
  if (holdBoostTimerId) {
    clearTimeout(holdBoostTimerId);
    holdBoostTimerId = null;
  }

  heldDirectionKey = null;

  if (!isHoldBoostActive) return;

  isHoldBoostActive = false;
  updateHud();
  restartLoop();
  if (message) statusNode.textContent = message;
}

function beginDirectionHold(directionKey) {
  if (!isRunning || isPaused) return;
  if (!directionKey || heldDirectionKey === directionKey) return;

  clearHoldBoost();
  heldDirectionKey = directionKey;
  holdBoostTimerId = setTimeout(() => {
    if (heldDirectionKey !== directionKey) return;

    isHoldBoostActive = true;
    holdBoostTimerId = null;
    updateHud();
    restartLoop();
    statusNode.textContent = "Ускорение включено: стрелка удерживается больше 2 секунд.";
  }, holdBoostDelayMs);
}

function endDirectionHold(directionKey) {
  if (directionKey && heldDirectionKey !== directionKey) return;
  clearHoldBoost(isRunning && !isPaused ? `Игра идет: уровень ${level}.` : "");
}

function updateSoundButton() {
  soundBtn.textContent = isSoundEnabled ? "Звук: вкл" : "Звук: выкл";
  soundBtn.classList.toggle("sound-off", !isSoundEnabled);
}

function getAudioContext() {
  if (!isSoundEnabled) return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(frequency, durationSeconds, type = "sine", volume = 0.04, startDelaySeconds = 0) {
  const context = getAudioContext();
  if (!context) return;

  const startTime = context.currentTime + startDelaySeconds;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + durationSeconds + 0.02);
}

function playMoveSound() {
  const now = Date.now();
  if (now - lastMoveSoundAt < 45) return;

  lastMoveSoundAt = now;
  playTone(440 + level * 14, 0.035, "triangle", 0.018);
}

function playSelfCollisionWarning() {
  playTone(196, 0.12, "sawtooth", 0.045);
  playTone(146.83, 0.18, "sawtooth", 0.038, 0.11);
}

function playVictorySound() {
  playTone(523.25, 0.16, "triangle", 0.045);
  playTone(659.25, 0.18, "triangle", 0.045, 0.14);
  playTone(783.99, 0.24, "triangle", 0.05, 0.3);
}

function stopBackgroundMusic() {
  if (musicTimerId) {
    clearTimeout(musicTimerId);
    musicTimerId = null;
  }
}

function scheduleBackgroundMusic() {
  if (!isSoundEnabled || !isRunning || isPaused) {
    stopBackgroundMusic();
    return;
  }

  const [noteName, beats] = odeToJoyMelody[musicNoteIndex];
  const durationMs = musicBeatMs * beats;
  const frequency = noteFrequencies[noteName];

  if (frequency) {
    playTone(frequency, Math.max(0.12, durationMs / 1000 - 0.05), "sine", 0.015);
    playTone(frequency / 2, Math.max(0.12, durationMs / 1000 - 0.05), "triangle", 0.008);
  }

  musicNoteIndex = (musicNoteIndex + 1) % odeToJoyMelody.length;
  musicTimerId = setTimeout(scheduleBackgroundMusic, durationMs);
}

function startBackgroundMusic() {
  if (!isSoundEnabled || musicTimerId) return;

  getAudioContext();
  scheduleBackgroundMusic();
}

function setSoundEnabled(enabled) {
  isSoundEnabled = enabled;
  localStorage.setItem(soundStorageKey, String(isSoundEnabled));
  updateSoundButton();

  if (isSoundEnabled && isRunning && !isPaused) {
    startBackgroundMusic();
    return;
  }

  stopBackgroundMusic();
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
  const progress = getAnimationProgress();

  snake.forEach((segment, index) => {
    const drawSegment = getInterpolatedCell(previousSnake[index], segment, progress);
    const intensity = Math.max(0.35, 1 - index / Math.max(snake.length, 1));
    const bodyGradient = ctx.createLinearGradient(
      drawSegment.x * gridSize,
      drawSegment.y * gridSize,
      drawSegment.x * gridSize + gridSize,
      drawSegment.y * gridSize + gridSize,
    );
    bodyGradient.addColorStop(0, index === 0 ? palette.headStart : `rgba(${palette.bodyRgb}, ${intensity})`);
    bodyGradient.addColorStop(1, index === 0 ? palette.headEnd : `rgba(${palette.tailRgb}, ${intensity})`);

    drawRoundedCell(drawSegment.x, drawSegment.y, bodyGradient, palette.glow, index === 0 ? 2 : 4);
  });

  drawSnakeEyes(palette.eye, getInterpolatedCell(previousSnake[0], snake[0], progress));
}

function drawSnakeEyes(eyeColor, head = snake[0]) {
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

function createVictoryFireworks() {
  const colors = ["#fbbf24", "#22d3ee", "#f472b6", "#34d399", "#e879f9"];

  for (let burst = 0; burst < 6; burst += 1) {
    const cell = {
      x: 3 + Math.floor(Math.random() * (tileCount - 6)),
      y: 3 + Math.floor(Math.random() * (tileCount - 6)),
    };
    createBurst(cell, colors[burst % colors.length]);
  }
}

function draw() {
  drawBoardBackground();
  drawFood(food);
  drawFood(bonusFood, true);
  drawSnake();
  drawParticles();
}

function startRenderLoop() {
  if (renderLoopId) return;

  const renderFrame = () => {
    draw();
    renderLoopId = requestAnimationFrame(renderFrame);
  };

  renderLoopId = requestAnimationFrame(renderFrame);
}

function stopRenderLoop() {
  if (!renderLoopId) return;

  cancelAnimationFrame(renderLoopId);
  renderLoopId = null;
}

function update() {
  if (bonusFood && Date.now() > bonusExpiresAt) {
    bonusFood = null;
  }

  previousSnake = cloneSnake();
  direction = nextDirection;
  const head = wrapCell({ x: snake[0].x + direction.x, y: snake[0].y + direction.y });

  const eatsFood = isSameCell(head, food);
  const eatsBonus = isSameCell(head, bonusFood);
  const bodyToCheck = eatsFood || eatsBonus ? snake : snake.slice(0, -1);

  if (bodyToCheck.some((segment) => isSameCell(segment, head))) {
    playSelfCollisionWarning();
    gameOver({ reason: "self" });
    return;
  }

  snake.unshift(head);
  lastStepAt = performance.now();
  playMoveSound();

  if (eatsFood || eatsBonus) {
    if (eatsFood) {
      addScore(10);
      foodEaten += 1;
      createBurst(food, "#fb7185");
      spawnFood();
    }

    if (eatsBonus) {
      addScore(25);
      createBurst(bonusFood, "#fbbf24");
      bonusFood = null;
    }

    const progressCompleted = updateLevelProgress();
    updateHud();

    if (isVictory) {
      draw();
      return;
    }

    if (foodEaten > 0 && foodEaten % bonusEveryFoods === 0 && !bonusFood) {
      spawnBonusFood();
    }

    if (progressCompleted) {
      draw();
      return;
    }
  } else {
    snake.pop();
  }

  draw();
}

function gameOver(options = {}) {
  const details = typeof options === "string" ? { message: options } : options;
  clearHoldBoost();
  stopLoop();
  stopRenderLoop();
  stopBackgroundMusic();
  isRunning = false;
  isPaused = false;
  statusNode.textContent = details.message || `Игра окончена. Ваш счет: ${score}. Нажмите "Рестарт".`;

  const isNewBest = score > bestScore;
  if (isNewBest) {
    bestScore = score;
    localStorage.setItem(storageKey, String(bestScore));
  }

  if (score > 0) {
    if (isNewBest && details.reason === "self") {
      showRecordModal(score);
    } else {
      saveScoreEntry({ score, name: "Игрок" });
    }
  }

  updateHud();
  renderTopScores();
}

function showVictory() {
  clearHoldBoost();
  stopLoop();
  stopRenderLoop();
  stopBackgroundMusic();
  isRunning = false;
  isPaused = false;
  isVictory = true;
  bonusFood = null;
  createVictoryFireworks();
  playVictorySound();
  statusNode.textContent = "Ты победил! Молодец!!!";
  victoryScoreNode.textContent = `Итоговый счет: ${score}`;
  victoryModal.hidden = false;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem(storageKey, String(bestScore));
    updateHud();
  }

  if (score > 0) {
    saveScoreEntry({ score, name: "Победитель" });
  }

  draw();
}

function hideVictoryModal() {
  victoryModal.hidden = true;
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
  statusNode.textContent = `Игра идет: уровень ${level}.`;
  restartLoop();
  startBackgroundMusic();
}

function pauseGame() {
  if (!isRunning) return;
  if (isPaused) {
    isPaused = false;
    statusNode.textContent = `Игра идет: уровень ${level}.`;
    restartLoop();
    startBackgroundMusic();
    return;
  }

  isPaused = true;
  clearHoldBoost();
  statusNode.textContent = "Пауза";
  stopLoop();
  stopRenderLoop();
  stopBackgroundMusic();
}

function resetGame() {
  hideRecordModal();
  hideVictoryModal();
  clearHoldBoost();
  stopLoop();
  stopRenderLoop();
  isRunning = false;
  isPaused = false;
  snake = [{ x: 10, y: 10 }];
  previousSnake = cloneSnake();
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  food = { x: 15, y: 10 };
  bonusFood = null;
  bonusExpiresAt = 0;
  particles = [];
  score = 0;
  level = 1;
  levelScore = 0;
  foodEaten = 0;
  pendingRecordScore = null;
  isVictory = false;
  lastStepAt = performance.now();
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
    return parsed
      .map(normalizeScoreEntry)
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch (_) {
    return [];
  }
}

function normalizeScoreEntry(entry) {
  if (Number.isFinite(entry)) {
    return { score: entry, name: "Игрок" };
  }

  if (!entry || typeof entry !== "object") {
    return { score: 0, name: "Игрок" };
  }

  return {
    score: Number.isFinite(entry.score) ? entry.score : 0,
    name: sanitizePlayerName(entry.name),
  };
}

function sanitizePlayerName(name) {
  const normalizedName = String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 20);

  return normalizedName || "Игрок";
}

function saveScoreEntry(entry) {
  const normalizedEntry = normalizeScoreEntry(entry);
  if (normalizedEntry.score <= 0) return;

  topScores.push(normalizedEntry);
  topScores = topScores
    .map(normalizeScoreEntry)
    .filter((value) => value.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  localStorage.setItem(topScoresStorageKey, JSON.stringify(topScores));
  renderTopScores();
}

function resetStatistics() {
  localStorage.removeItem(storageKey);
  localStorage.removeItem(topScoresStorageKey);
  localStorage.removeItem(playerNameStorageKey);
  bestScore = 0;
  topScores = [];
  pendingRecordScore = null;
  hideRecordModal();
  updateHud();
  renderTopScores();
  statusNode.textContent = "Статистика сброшена: рекорд, топ результатов и имя игрока очищены.";
}

function showRecordModal(recordScore) {
  pendingRecordScore = recordScore;
  recordScoreNode.textContent = `Результат: ${recordScore}`;
  playerNameInput.value = localStorage.getItem(playerNameStorageKey) || "";
  recordModal.hidden = false;
  statusNode.textContent = `Новый рекорд: ${recordScore}! Введите имя игрока.`;
  setTimeout(() => playerNameInput.focus(), 0);
}

function hideRecordModal() {
  recordModal.hidden = true;
}

function renderTopScores() {
  topScoresNode.innerHTML = "";
  if (topScores.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Пока нет результатов";
    topScoresNode.appendChild(li);
    return;
  }

  topScores.forEach((entry) => {
    const normalizedEntry = normalizeScoreEntry(entry);
    const li = document.createElement("li");
    li.textContent = `${normalizedEntry.name}: ${normalizedEntry.score}`;
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

function getDirectionHoldKey(key) {
  if (key === "ArrowUp" || key === "w") return "ArrowUp";
  if (key === "ArrowDown" || key === "s") return "ArrowDown";
  if (key === "ArrowLeft" || key === "a") return "ArrowLeft";
  if (key === "ArrowRight" || key === "d") return "ArrowRight";
  return null;
}

document.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (setDirection(key)) {
    event.preventDefault();
    if (!event.repeat) beginDirectionHold(getDirectionHoldKey(key));
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  endDirectionHold(getDirectionHoldKey(key));
});

function handleScreenControlPress(event, button) {
  event.preventDefault();
  event.stopPropagation();

  const now = Date.now();
  if (event.type === "click" && now - lastScreenControlPressAt < 350) {
    return;
  }

  lastScreenControlPressAt = now;
  setDirection(button.dataset.direction);
  button.blur();
}

function beginScreenControlHold(event, button) {
  handleScreenControlPress(event, button);
  beginDirectionHold(button.dataset.direction);
}

function endScreenControlHold(event, button) {
  event.preventDefault();
  event.stopPropagation();
  endDirectionHold(button.dataset.direction);
}

screenControlButtons.forEach((button) => {
  if (window.PointerEvent) {
    button.addEventListener("pointerdown", (event) => {
      beginScreenControlHold(event, button);
      if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointerup", (event) => endScreenControlHold(event, button));
    button.addEventListener("pointercancel", (event) => endScreenControlHold(event, button));
    button.addEventListener("pointerleave", (event) => endScreenControlHold(event, button));
  } else {
    button.addEventListener("touchstart", (event) => beginScreenControlHold(event, button), { passive: false });
    button.addEventListener("touchend", (event) => endScreenControlHold(event, button), { passive: false });
    button.addEventListener("touchcancel", (event) => endScreenControlHold(event, button), { passive: false });
  }

  button.addEventListener("click", (event) => handleScreenControlPress(event, button));
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

recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (pendingRecordScore === null) return;

  const playerName = sanitizePlayerName(playerNameInput.value);
  localStorage.setItem(playerNameStorageKey, playerName);
  saveScoreEntry({ score: pendingRecordScore, name: playerName });
  statusNode.textContent = `Новый рекорд ${pendingRecordScore} сохранен для игрока ${playerName}.`;
  pendingRecordScore = null;
  hideRecordModal();
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

victoryRestartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

soundBtn.addEventListener("click", () => {
  setSoundEnabled(!isSoundEnabled);
});

resetStatsBtn.addEventListener("click", () => {
  const enteredPassword = window.prompt("Введите пароль для сброса статистики:");
  if (enteredPassword === null) return;

  if (enteredPassword !== resetStatsPassword) {
    statusNode.textContent = "Неверный пароль. Статистика не сброшена.";
    return;
  }

  if (window.confirm("Сбросить рекорд, топ результатов и сохраненное имя игрока?")) {
    resetStatistics();
  }
});

resetGame();
