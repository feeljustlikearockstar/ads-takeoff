const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;

const bg = new Image();
bg.src = "bg.png";

const birdImg = new Image();
birdImg.src = "bird.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

const groundImg = new Image();
groundImg.src = "ground.png";

const GAME_STATE = {
  READY: "ready",
  PLAYING: "playing",
  OVER: "over"
};

const bird = {
  x: 56,
  y: 180,
  width: 34,
  height: 24,
  gravity: 0.42,
  jumpImpulse: -7.3,
  velocity: 0,
  rotation: 0
};

const pipeSettings = {
  width: 52,
  gap: 128,
  speed: 2.15,
  spawnDistance: 180,
  minTop: -220,
  maxTop: -40
};

const world = {
  floorHeight: 112,
  floorOffset: 0
};

let state = GAME_STATE.READY;
let score = 0;
let bestScore = Number(localStorage.getItem("flappy_best_score") || 0);
let pipes = [];

function resetGame() {
  bird.y = 180;
  bird.velocity = 0;
  bird.rotation = 0;
  score = 0;
  pipes = [];
  world.floorOffset = 0;
  state = GAME_STATE.READY;
}

function startGame() {
  if (state === GAME_STATE.READY) {
    state = GAME_STATE.PLAYING;
    flap();
  }
}

function flap() {
  bird.velocity = bird.jumpImpulse;
}

function handleInput() {
  if (state === GAME_STATE.READY) {
    startGame();
    return;
  }

  if (state === GAME_STATE.PLAYING) {
    flap();
    return;
  }

  if (state === GAME_STATE.OVER) {
    resetGame();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space") return;
  event.preventDefault();
  handleInput();
});

canvas.addEventListener("pointerdown", () => {
  handleInput();
});

function getRandomPipeY() {
  const { minTop, maxTop } = pipeSettings;
  return Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
}

function spawnPipeIfNeeded() {
  if (!pipes.length) {
    pipes.push({ x: canvas.width + 60, y: getRandomPipeY(), passed: false });
    return;
  }

  const lastPipe = pipes[pipes.length - 1];
  if (lastPipe.x <= canvas.width - pipeSettings.spawnDistance) {
    pipes.push({ x: canvas.width + 60, y: getRandomPipeY(), passed: false });
  }
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.velocity < 0) {
    bird.rotation = -0.25;
  } else {
    bird.rotation = Math.min(1.2, bird.rotation + 0.06);
  }

  const floorY = canvas.height - world.floorHeight;
  if (bird.y + bird.height >= floorY) {
    bird.y = floorY - bird.height;
    triggerGameOver();
  }

  if (bird.y <= 0) {
    bird.y = 0;
    bird.velocity = Math.max(0, bird.velocity);
  }
}

function updatePipes() {
  spawnPipeIfNeeded();

  for (const pipe of pipes) {
    pipe.x -= pipeSettings.speed;

    const topPipe = {
      x: pipe.x,
      y: pipe.y,
      width: pipeSettings.width,
      height: pipeImg.height
    };

    const bottomPipe = {
      x: pipe.x,
      y: pipe.y + pipeImg.height + pipeSettings.gap,
      width: pipeSettings.width,
      height: pipeImg.height
    };

    if (
      intersects(bird, topPipe) ||
      intersects(bird, bottomPipe)
    ) {
      triggerGameOver();
    }

    if (!pipe.passed && pipe.x + pipeSettings.width < bird.x) {
      pipe.passed = true;
      score += 1;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("flappy_best_score", String(bestScore));
      }
    }
  }

  pipes = pipes.filter((pipe) => pipe.x + pipeSettings.width > -20);
}

function updateFloor() {
  world.floorOffset = (world.floorOffset - pipeSettings.speed) % canvas.width;
}

function triggerGameOver() {
  if (state !== GAME_STATE.OVER) {
    state = GAME_STATE.OVER;
  }
}

function update() {
  if (state === GAME_STATE.PLAYING) {
    updateBird();
    updatePipes();
    updateFloor();
  }
}

function drawBackground() {
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
}

function drawPipes() {
  for (const pipe of pipes) {
    ctx.drawImage(pipeImg, pipe.x, pipe.y);
    ctx.drawImage(
      pipeImg,
      pipe.x,
      pipe.y + pipeImg.height + pipeSettings.gap
    );
  }
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(bird.rotation);
  ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();
}

function drawFloor() {
  const floorY = canvas.height - world.floorHeight;

  ctx.drawImage(groundImg, world.floorOffset, floorY, canvas.width, world.floorHeight);
  ctx.drawImage(groundImg, world.floorOffset + canvas.width, floorY, canvas.width, world.floorHeight);
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 4;
  ctx.textAlign = "left";
  ctx.font = "bold 26px Arial";
  ctx.strokeText(String(score), 16, 42);
  ctx.fillText(String(score), 16, 42);

  ctx.font = "14px Arial";
  ctx.strokeText(`Best: ${bestScore}`, 16, 64);
  ctx.fillText(`Best: ${bestScore}`, 16, 64);
}

function drawOverlay(text, hint) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(22, canvas.height / 2 - 74, canvas.width - 44, 148);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 28px Arial";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 18);

  ctx.font = "16px Arial";
  ctx.fillText(hint, canvas.width / 2, canvas.height / 2 + 18);
}

function render() {
  drawBackground();
  drawPipes();
  drawFloor();
  drawBird();
  drawScore();

  if (state === GAME_STATE.READY) {
    drawOverlay("Flappy Bird", "Нажми SPACE или тапни, чтобы начать");
  }

  if (state === GAME_STATE.OVER) {
    drawOverlay("Игра окончена", "Нажми SPACE или тапни для рестарта");
  }
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
